/**
 * Verification Service - Firebase Implementation
 * 
 * Handles provider verification requests:
 * - Create verification requests
 * - Get verification status
 * - Get verification by provider
 * 
 * Requirements: 6.1, 6.2, 6.3, 6.4
 */

import {
  collection,
  doc,
  getDocs,
  addDoc,
  updateDoc,
  query,
  where,
  orderBy,
  limit,
  Timestamp,
  deleteField,
} from 'firebase/firestore';
import { db } from '../client';
import { COLLECTIONS, VerificationStatus } from '../types';
import { OFFLINE_MODE } from '@/config/app';

/**
 * Sentinel timestamp for legacy documents missing createdAt
 * Uses Unix epoch (0) to clearly indicate missing/unknown creation time
 * Callers should check for this value and handle accordingly
 */
export const MISSING_CREATED_AT = Timestamp.fromMillis(0);

/**
 * Check if a timestamp is the missing sentinel value
 */
export function isMissingCreatedAt(timestamp: Timestamp): boolean {
  return timestamp.toMillis() === 0;
}

/**
 * Verification Request Interface
 * Note: createdAt may be MISSING_CREATED_AT sentinel for legacy documents
 */
export interface VerificationRequest {
  id: string;
  providerId: string;
  userId: string;
  documentType: string;
  documentUrls: string[];
  status: VerificationStatus;
  rejectionReason?: string;
  reviewedBy?: string;
  reviewedAt?: Timestamp;
  createdAt: Timestamp; // May be MISSING_CREATED_AT for legacy docs
}

/**
 * Create Verification Request Data Interface
 */
export interface CreateVerificationRequestData {
  providerId: string;
  userId: string;
  documentType: string;
  documentUrls: string[];
}

/**
 * Create a verification request
 * Creates a new verification request document in Firestore
 * 
 * Requirements: 6.3
 */
export async function createVerificationRequest(
  data: CreateVerificationRequestData
): Promise<string> {
  if (OFFLINE_MODE) {
    throw new Error('Verification requests not available in offline mode');
  }

  try {
    const verificationsRef = collection(db, COLLECTIONS.verifications);
    const now = Timestamp.now();
    
    const docRef = await addDoc(verificationsRef, {
      providerId: data.providerId,
      userId: data.userId,
      documentType: data.documentType,
      documentUrls: data.documentUrls,
      status: 'pending' as VerificationStatus,
      createdAt: now,
    });
    
    return docRef.id;
  } catch (error) {
    console.error('Error creating verification request:', error);
    throw error;
  }
}

/**
 * Get verification status for a provider
 * Returns the current verification status
 * 
 * Requirements: 6.4
 */
export async function getVerificationStatus(
  providerId: string
): Promise<VerificationStatus | null> {
  if (OFFLINE_MODE) {
    return null;
  }

  try {
    const verification = await getVerificationByProvider(providerId);
    return verification?.status || null;
  } catch (error) {
    console.error('Error getting verification status:', error);
    return null;
  }
}

/**
 * Get verification request by provider ID
 * Returns the most recent verification request for a provider
 * 
 * Note: Legacy documents without createdAt will have MISSING_CREATED_AT sentinel.
 * Callers should use isMissingCreatedAt() to check and handle accordingly.
 * 
 * Requirements: 6.3, 6.4
 */
export async function getVerificationByProvider(
  providerId: string
): Promise<VerificationRequest | null> {
  if (OFFLINE_MODE) {
    return null;
  }

  try {
    const verificationsRef = collection(db, COLLECTIONS.verifications);
    const q = query(
      verificationsRef,
      where('providerId', '==', providerId),
      orderBy('createdAt', 'desc'),
      limit(1)
    );

    const snapshot = await getDocs(q);

    if (snapshot.empty) {
      return null;
    }

    const docSnapshot = snapshot.docs[0];
    const data = docSnapshot.data();

    // Use sentinel for missing createdAt instead of misleading Timestamp.now()
    const createdAt = data.createdAt || MISSING_CREATED_AT;

    return {
      id: docSnapshot.id,
      providerId: data.providerId,
      userId: data.userId,
      documentType: data.documentType || 'license',
      documentUrls: data.documentUrls || [],
      status: data.status || 'pending',
      rejectionReason: data.rejectionReason,
      reviewedBy: data.reviewedBy,
      reviewedAt: data.reviewedAt,
      createdAt,
    };
  } catch (error) {
    console.error('Error getting verification by provider:', error);
    return null;
  }
}

/**
 * Get all verification requests for a provider
 * Returns all verification requests (for history)
 * 
 * Note: Legacy documents without createdAt will have MISSING_CREATED_AT sentinel.
 * Callers should use isMissingCreatedAt() to check and handle accordingly.
 */
export async function getAllVerificationsByProvider(
  providerId: string
): Promise<VerificationRequest[]> {
  if (OFFLINE_MODE) {
    return [];
  }

  try {
    const verificationsRef = collection(db, COLLECTIONS.verifications);
    const q = query(
      verificationsRef,
      where('providerId', '==', providerId),
      orderBy('createdAt', 'desc')
    );

    const snapshot = await getDocs(q);

    return snapshot.docs.map((docSnapshot) => {
      const data = docSnapshot.data();
      // Use sentinel for missing createdAt instead of misleading Timestamp.now()
      const createdAt = data.createdAt || MISSING_CREATED_AT;

      return {
        id: docSnapshot.id,
        providerId: data.providerId,
        userId: data.userId,
        documentType: data.documentType || 'license',
        documentUrls: data.documentUrls || [],
        status: data.status || 'pending',
        rejectionReason: data.rejectionReason,
        reviewedBy: data.reviewedBy,
        reviewedAt: data.reviewedAt,
        createdAt,
      };
    });
  } catch (error) {
    console.error('Error getting all verifications by provider:', error);
    return [];
  }
}

/**
 * Update verification request status (admin only)
 * 
 * When status is 'rejected', sets the rejectionReason if provided.
 * When status is NOT 'rejected', explicitly clears any existing rejectionReason
 * to prevent stale rejection reasons from persisting.
 */
export async function updateVerificationStatus(
  verificationId: string,
  status: VerificationStatus,
  rejectionReason?: string,
  reviewedBy?: string
): Promise<void> {
  if (OFFLINE_MODE) {
    throw new Error('Verification updates not available in offline mode');
  }

  try {
    const verificationRef = doc(db, COLLECTIONS.verifications, verificationId);
    const updateData: Record<string, any> = {
      status,
      reviewedAt: Timestamp.now(),
    };

    // Handle rejectionReason based on status
    if (status === 'rejected') {
      // Set rejectionReason if provided for rejected status
      if (rejectionReason) {
        updateData.rejectionReason = rejectionReason;
      }
    } else {
      // Clear rejectionReason when status is not 'rejected'
      // This prevents stale rejection reasons from persisting
      updateData.rejectionReason = deleteField();
    }

    if (reviewedBy) {
      updateData.reviewedBy = reviewedBy;
    }

    await updateDoc(verificationRef, updateData);
  } catch (error) {
    console.error('Error updating verification status:', error);
    throw error;
  }
}
