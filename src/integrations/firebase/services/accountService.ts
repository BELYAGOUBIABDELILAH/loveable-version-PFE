/**
 * Account Service - Firebase Implementation
 * 
 * Handles account deletion with complete data cleanup:
 * - Delete Firebase Auth account
 * - Delete user profile from Firestore
 * - Delete user favorites
 * - Anonymize or delete appointments
 * 
 * Requirements: 4.3, 4.4
 */

import {
  deleteUser,
  reauthenticateWithCredential,
  EmailAuthProvider,
} from 'firebase/auth';
import {
  doc,
  deleteDoc,
  collection,
  query,
  where,
  getDocs,
  writeBatch,
  Timestamp,
  DocumentReference,
} from 'firebase/firestore';
import { auth, db } from '../client';
import { COLLECTIONS } from '../types';
import { OFFLINE_MODE } from '@/config/app';

/**
 * Re-authenticate user before sensitive operations
 * Required by Firebase for account deletion
 * 
 * @param email - User's email
 * @param password - User's current password
 */
export async function reauthenticateUser(email: string, password: string): Promise<void> {
  if (OFFLINE_MODE) {
    throw new Error('Re-authentication not available in offline mode');
  }

  const user = auth.currentUser;
  if (!user) {
    throw new Error('No authenticated user');
  }

  try {
    const credential = EmailAuthProvider.credential(email, password);
    await reauthenticateWithCredential(user, credential);
  } catch (error: any) {
    console.error('Re-authentication error:', error);
    throw new Error(getAccountErrorMessage(error.code));
  }
}

/**
 * Delete user's favorites from Firestore
 * 
 * @param userId - The user ID
 */
async function deleteUserFavorites(userId: string): Promise<void> {
  const favoritesRef = collection(db, COLLECTIONS.favorites);
  const q = query(favoritesRef, where('userId', '==', userId));
  const snapshot = await getDocs(q);
  
  if (snapshot.empty) return;
  
  const batch = writeBatch(db);
  snapshot.docs.forEach(doc => {
    batch.delete(doc.ref);
  });
  await batch.commit();
}

/**
 * Anonymize user's appointments in Firestore
 * Instead of deleting, we anonymize to preserve provider records
 * 
 * @param userId - The user ID
 */
async function anonymizeUserAppointments(userId: string): Promise<void> {
  const appointmentsRef = collection(db, COLLECTIONS.appointments);
  const q = query(appointmentsRef, where('userId', '==', userId));
  const snapshot = await getDocs(q);
  
  if (snapshot.empty) return;
  
  const batch = writeBatch(db);
  snapshot.docs.forEach(docSnapshot => {
    batch.update(docSnapshot.ref, {
      userId: 'deleted_user',
      contactInfo: {
        name: 'Utilisateur supprimé',
        phone: '',
        email: null,
      },
      updatedAt: Timestamp.now(),
    });
  });
  await batch.commit();
}

/**
 * Delete user profile from Firestore
 * 
 * @param userId - The user ID
 */
async function deleteUserProfile(userId: string): Promise<void> {
  const profileRef = doc(db, COLLECTIONS.profiles, userId);
  await deleteDoc(profileRef);
}

/**
 * Delete user role document from Firestore
 * 
 * @param userId - The user ID
 */
async function deleteUserRole(userId: string): Promise<void> {
  const roleRef = doc(db, COLLECTIONS.userRoles, userId);
  await deleteDoc(roleRef);
}

/**
 * Helper to chunk an array into smaller arrays of specified size
 */
function chunkArray<T>(array: T[], chunkSize: number): T[][] {
  const chunks: T[][] = [];
  for (let i = 0; i < array.length; i += chunkSize) {
    chunks.push(array.slice(i, i + chunkSize));
  }
  return chunks;
}

/**
 * Delete user's chat sessions and messages
 * 
 * Optimized implementation that:
 * 1. Fetches all session IDs first
 * 2. Bulk fetches messages using 'in' queries (chunked to 10 IDs per query - Firestore limit)
 * 3. Deletes in batches of 500 operations (Firestore batch limit)
 * 
 * @param userId - The user ID
 */
async function deleteUserChatData(userId: string): Promise<void> {
  // Step 1: Fetch all chat sessions for the user
  const sessionsRef = collection(db, COLLECTIONS.chatSessions);
  const sessionsQuery = query(sessionsRef, where('userId', '==', userId));
  const sessionsSnapshot = await getDocs(sessionsQuery);

  if (sessionsSnapshot.empty) return;

  // Collect all session IDs and session doc refs
  const sessionIds = sessionsSnapshot.docs.map((doc) => doc.id);
  const sessionDocRefs = sessionsSnapshot.docs.map((doc) => doc.ref);

  // Step 2: Bulk fetch all messages using 'in' queries
  // Firestore 'in' operator supports max 10 values, so chunk session IDs
  const sessionIdChunks = chunkArray(sessionIds, 10);
  const messagesRef = collection(db, COLLECTIONS.chatMessages);

  // Parallelize message queries for each chunk
  const messageQueryPromises = sessionIdChunks.map((chunk) => {
    const messagesQuery = query(messagesRef, where('sessionId', 'in', chunk));
    return getDocs(messagesQuery);
  });

  const messageSnapshots = await Promise.all(messageQueryPromises);

  // Flatten all message doc refs
  const messageDocRefs = messageSnapshots.flatMap((snapshot) =>
    snapshot.docs.map((doc) => doc.ref)
  );

  // Step 3: Combine all docs to delete (messages + sessions)
  const allDocsToDelete = [...messageDocRefs, ...sessionDocRefs];

  if (allDocsToDelete.length === 0) return;

  // Step 4: Delete in batches of 500 (Firestore batch limit)
  const deleteChunks = chunkArray(allDocsToDelete, 500);

  // Commit each batch sequentially to avoid overwhelming Firestore
  for (const chunk of deleteChunks) {
    const batch = writeBatch(db);
    chunk.forEach((docRef) => {
      batch.delete(docRef);
    });
    await batch.commit();
  }
}

/**
 * Delete user's notifications
 * 
 * @param userId - The user ID
 */
async function deleteUserNotifications(userId: string): Promise<void> {
  const notificationsRef = collection(db, COLLECTIONS.notifications);
  const q = query(notificationsRef, where('userId', '==', userId));
  const snapshot = await getDocs(q);
  
  if (snapshot.empty) return;
  
  // Process in chunks of 500 (Firestore batch limit)
  const chunks = [];
  for (let i = 0; i < snapshot.docs.length; i += 500) {
    chunks.push(snapshot.docs.slice(i, i + 500));
  }
  
  for (const chunk of chunks) {
    const batch = writeBatch(db);
    chunk.forEach(doc => {
      batch.delete(doc.ref);
    });
    await batch.commit();
  }
}
/**
 * Delete user account and all associated data
 * 
 * This function performs a complete account deletion:
 * 1. Delete Firebase Auth account
 * 2. Delete user profile from Firestore
 * 3. Delete user role document
 * 4. Delete user favorites
 * 5. Anonymize appointments (preserve for provider records)
 * 6. Delete chat sessions and messages
 * 7. Delete notifications
 * 
 * @param userId - The user ID to delete
 * Requirements: 4.3, 4.4
 */
export async function deleteAccount(userId: string): Promise<void> {
  if (OFFLINE_MODE) {
    throw new Error('Account deletion not available in offline mode');
  }

  const user = auth.currentUser;
  if (!user || user.uid !== userId) {
    throw new Error('Cannot delete account: user mismatch or not authenticated');
  }

  try {
    // Step 1: Delete Firestore data first (while still authenticated)
    // Delete favorites
    await deleteUserFavorites(userId);
    
    // Anonymize appointments (preserve for provider records)
    await anonymizeUserAppointments(userId);
    
    // Delete chat data
    await deleteUserChatData(userId);
    
    // Delete notifications
    await deleteUserNotifications(userId);
    
    // Delete user role
    await deleteUserRole(userId);
    
    // Delete profile
    await deleteUserProfile(userId);
    
    // Step 2: Delete Firebase Auth account (must be last)
    await deleteUser(user);
    
  } catch (error: any) {
    console.error('Account deletion error:', error);
    
    // Check if re-authentication is required
    if (error.code === 'auth/requires-recent-login') {
      throw new Error('Veuillez vous reconnecter avant de supprimer votre compte');
    }
    
    throw new Error(getAccountErrorMessage(error.code) || error.message);
  }
}

/**
 * Convert Firebase error codes to user-friendly messages
 */
function getAccountErrorMessage(code: string): string {
  const messages: Record<string, string> = {
    'auth/requires-recent-login': 'Veuillez vous reconnecter avant de supprimer votre compte',
    'auth/user-not-found': 'Compte utilisateur non trouvé',
    'auth/wrong-password': 'Mot de passe incorrect',
    'auth/too-many-requests': 'Trop de tentatives. Veuillez réessayer plus tard',
    'auth/network-request-failed': 'Erreur de connexion réseau',
  };

  return messages[code] || 'Une erreur est survenue lors de la suppression du compte';
}
