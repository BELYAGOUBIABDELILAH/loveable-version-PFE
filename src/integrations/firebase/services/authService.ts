/**
 * Auth Service - Firebase Implementation
 * 
 * Replaces Supabase Auth with Firebase Auth:
 * - supabase.auth.signInWithPassword → signInWithEmailAndPassword
 * - supabase.auth.signUp → createUserWithEmailAndPassword
 * - supabase.auth.signInWithOAuth → signInWithPopup
 * - supabase.auth.signOut → signOut
 */

import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  User,
  updateProfile,
  sendEmailVerification,
  sendPasswordResetEmail,
} from 'firebase/auth';
import { doc, setDoc, getDoc, Timestamp } from 'firebase/firestore';
import { auth, db } from '../client';
import { Profile, UserRoleDoc, COLLECTIONS, UserRole } from '../types';
import { OFFLINE_MODE } from '@/config/app';

const googleProvider = new GoogleAuthProvider();

/**
 * Sign in with email and password
 * Supabase: supabase.auth.signInWithPassword({ email, password })
 * Firebase: signInWithEmailAndPassword(auth, email, password)
 */
export async function signIn(email: string, password: string): Promise<User> {
  if (OFFLINE_MODE) {
    throw new Error('Authentication not available in offline mode');
  }

  try {
    const result = await signInWithEmailAndPassword(auth, email, password);
    return result.user;
  } catch (error: any) {
    console.error('Sign in error:', error);
    throw new Error(getAuthErrorMessage(error.code));
  }
}

/**
 * Sign up with email and password
 * Supabase: supabase.auth.signUp({ email, password, options: { data: { name, role } } })
 * Firebase: createUserWithEmailAndPassword + setDoc for profile
 */
export async function signUp(
  email: string,
  password: string,
  name: string,
  role: UserRole = 'citizen'
): Promise<User> {
  if (OFFLINE_MODE) {
    throw new Error('Authentication not available in offline mode');
  }

  try {
    // Create user
    const result = await createUserWithEmailAndPassword(auth, email, password);
    const user = result.user;

    // Update display name
    await updateProfile(user, { displayName: name });

    // Create profile document
    const profileRef = doc(db, COLLECTIONS.profiles, user.uid);
    await setDoc(profileRef, {
      fullName: name,
      language: 'fr',
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    });

    // Create user role document
    const roleRef = doc(db, COLLECTIONS.userRoles, user.uid);
    await setDoc(roleRef, {
      userId: user.uid,
      role,
      createdAt: Timestamp.now(),
    });

    // Send verification email
    await sendEmailVerification(user);

    return user;
  } catch (error: any) {
    console.error('Sign up error:', error);
    throw new Error(getAuthErrorMessage(error.code));
  }
}

/**
 * Sign in with Google
 * Supabase: supabase.auth.signInWithOAuth({ provider: 'google' })
 * Firebase: signInWithPopup(auth, googleProvider)
 */
export async function signInWithGoogle(): Promise<User> {
  if (OFFLINE_MODE) {
    throw new Error('Authentication not available in offline mode');
  }

  try {
    const result = await signInWithPopup(auth, googleProvider);
    const user = result.user;

    // Check if profile exists, create if not
    const profileRef = doc(db, COLLECTIONS.profiles, user.uid);
    const profileSnap = await getDoc(profileRef);

    if (!profileSnap.exists()) {
      await setDoc(profileRef, {
        fullName: user.displayName || 'User',
        avatarUrl: user.photoURL,
        language: 'fr',
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
      });

      // Create default citizen role
      const roleRef = doc(db, COLLECTIONS.userRoles, user.uid);
      await setDoc(roleRef, {
        userId: user.uid,
        role: 'citizen',
        createdAt: Timestamp.now(),
      });
    }

    return user;
  } catch (error: any) {
    console.error('Google sign in error:', error);
    throw new Error(getAuthErrorMessage(error.code));
  }
}

/**
 * Sign out
 * Supabase: supabase.auth.signOut()
 * Firebase: signOut(auth)
 */
export async function signOut(): Promise<void> {
  if (OFFLINE_MODE) {
    return;
  }

  try {
    await firebaseSignOut(auth);
  } catch (error) {
    console.error('Sign out error:', error);
    throw error;
  }
}

/**
 * Get current user
 * Supabase: supabase.auth.getUser()
 * Firebase: auth.currentUser
 */
export function getCurrentUser(): User | null {
  if (OFFLINE_MODE) {
    return null;
  }
  return auth.currentUser;
}

/**
 * Listen to auth state changes
 * Supabase: supabase.auth.onAuthStateChange()
 * Firebase: onAuthStateChanged(auth, callback)
 */
export function onAuthChange(callback: (user: User | null) => void): () => void {
  if (OFFLINE_MODE) {
    callback(null);
    return () => {};
  }
  return onAuthStateChanged(auth, callback);
}

/**
 * Get user profile
 * Supabase: SELECT * FROM profiles WHERE id = ?
 * Firebase: getDoc(doc(db, 'profiles', userId))
 */
export async function getUserProfile(userId: string): Promise<Profile | null> {
  if (OFFLINE_MODE) {
    return null;
  }

  try {
    const profileRef = doc(db, COLLECTIONS.profiles, userId);
    const snapshot = await getDoc(profileRef);

    if (!snapshot.exists()) {
      return null;
    }

    return {
      id: snapshot.id,
      ...snapshot.data(),
    } as Profile;
  } catch (error) {
    console.error('Error fetching profile:', error);
    return null;
  }
}

/**
 * Get user role
 * Supabase: SELECT role FROM user_roles WHERE user_id = ?
 * Firebase: getDoc(doc(db, 'userRoles', userId))
 */
export async function getUserRole(userId: string): Promise<UserRole | null> {
  if (OFFLINE_MODE) {
    return null;
  }

  try {
    const roleRef = doc(db, COLLECTIONS.userRoles, userId);
    const snapshot = await getDoc(roleRef);

    if (!snapshot.exists()) {
      return 'citizen'; // Default role
    }

    return snapshot.data().role as UserRole;
  } catch (error) {
    console.error('Error fetching user role:', error);
    return 'citizen';
  }
}

/**
 * Update user profile
 * Supabase: UPDATE profiles SET ... WHERE id = ?
 * Firebase: updateDoc or setDoc with merge
 */
export async function updateUserProfile(userId: string, data: Partial<Profile>): Promise<void> {
  if (OFFLINE_MODE) {
    throw new Error('Cannot update profile in offline mode');
  }

  try {
    const profileRef = doc(db, COLLECTIONS.profiles, userId);
    await setDoc(profileRef, {
      ...data,
      updatedAt: Timestamp.now(),
    }, { merge: true });
  } catch (error) {
    console.error('Error updating profile:', error);
    throw error;
  }
}

/**
 * Send password reset email
 * Supabase: supabase.auth.resetPasswordForEmail(email)
 * Firebase: sendPasswordResetEmail(auth, email)
 */
export async function resetPassword(email: string): Promise<void> {
  if (OFFLINE_MODE) {
    throw new Error('Password reset not available in offline mode');
  }

  try {
    await sendPasswordResetEmail(auth, email);
  } catch (error: any) {
    console.error('Password reset error:', error);
    throw new Error(getAuthErrorMessage(error.code));
  }
}

/**
 * Convert Firebase auth error codes to user-friendly messages
 */
function getAuthErrorMessage(code: string): string {
  const messages: Record<string, string> = {
    'auth/email-already-in-use': 'Cette adresse email est déjà utilisée',
    'auth/invalid-email': 'Adresse email invalide',
    'auth/operation-not-allowed': 'Opération non autorisée',
    'auth/weak-password': 'Le mot de passe est trop faible',
    'auth/user-disabled': 'Ce compte a été désactivé',
    'auth/user-not-found': 'Aucun compte trouvé avec cette adresse email',
    'auth/wrong-password': 'Mot de passe incorrect',
    'auth/too-many-requests': 'Trop de tentatives. Veuillez réessayer plus tard',
    'auth/popup-closed-by-user': 'La fenêtre de connexion a été fermée',
    'auth/network-request-failed': 'Erreur de connexion réseau',
  };

  return messages[code] || 'Une erreur est survenue. Veuillez réessayer.';
}
