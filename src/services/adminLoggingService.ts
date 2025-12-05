/**
 * Admin Logging Service - Firebase Implementation
 * 
 * Migrated from Supabase to Firebase Firestore
 * Tracks all administrative actions and modifications for audit trail purposes.
 * Logs are immutable once created to maintain integrity.
 */

import { collection, addDoc, Timestamp } from 'firebase/firestore';
import { db, auth } from '@/integrations/firebase/client';
import { COLLECTIONS } from '@/integrations/firebase/types';
import { OFFLINE_MODE } from '@/config/app';

export interface AdminLogEntry {
  admin_id: string;
  action: string;
  entity_type: 'provider' | 'medical_ad' | 'verification' | 'profile_claim';
  entity_id: string;
  changes?: {
    before?: any;
    after?: any;
    reason?: string;
    [key: string]: any;
  };
}

/**
 * Log an admin action to the adminLogs collection
 * 
 * @param logEntry - The log entry containing action details
 * @returns Promise that resolves when log is created
 */
export async function logAdminAction(logEntry: AdminLogEntry): Promise<void> {
  if (OFFLINE_MODE) return;

  try {
    const adminLogsRef = collection(db, COLLECTIONS.adminLogs);
    await addDoc(adminLogsRef, {
      adminId: logEntry.admin_id,
      action: logEntry.action,
      entityType: logEntry.entity_type,
      entityId: logEntry.entity_id,
      changes: logEntry.changes || null,
      createdAt: Timestamp.now(),
    });
  } catch (error) {
    console.error('Error logging admin action:', error);
    // Don't throw - logging failures shouldn't break the main action
  }
}

/**
 * Get the current admin user ID from Firebase auth
 * 
 * @returns The admin user ID or null
 */
export function getCurrentAdminId(): string | null {
  try {
    return auth.currentUser?.uid || null;
  } catch (error) {
    console.error('Error getting current admin ID:', error);
    return null;
  }
}

/**
 * Log provider verification approval
 */
export async function logProviderApproval(providerId: string, providerName: string): Promise<void> {
  const adminId = getCurrentAdminId();
  if (!adminId) return;

  await logAdminAction({
    admin_id: adminId,
    action: 'approve_verification',
    entity_type: 'provider',
    entity_id: providerId,
    changes: {
      before: { verification_status: 'pending' },
      after: { verification_status: 'approved' },
      provider_name: providerName,
    },
  });
}

/**
 * Log provider verification rejection
 */
export async function logProviderRejection(providerId: string, providerName: string, reason?: string): Promise<void> {
  const adminId = getCurrentAdminId();
  if (!adminId) return;

  await logAdminAction({
    admin_id: adminId,
    action: 'reject_verification',
    entity_type: 'provider',
    entity_id: providerId,
    changes: {
      before: { verification_status: 'pending' },
      after: { verification_status: 'rejected' },
      provider_name: providerName,
      reason: reason || 'No reason provided',
    },
  });
}

/**
 * Log medical ad approval
 */
export async function logMedicalAdApproval(adId: string, adTitle: string, providerId: string): Promise<void> {
  const adminId = getCurrentAdminId();
  if (!adminId) return;

  await logAdminAction({
    admin_id: adminId,
    action: 'approve_medical_ad',
    entity_type: 'medical_ad',
    entity_id: adId,
    changes: {
      before: { status: 'pending' },
      after: { status: 'approved' },
      ad_title: adTitle,
      provider_id: providerId,
    },
  });
}

/**
 * Log medical ad rejection
 */
export async function logMedicalAdRejection(adId: string, adTitle: string, providerId: string): Promise<void> {
  const adminId = getCurrentAdminId();
  if (!adminId) return;

  await logAdminAction({
    admin_id: adminId,
    action: 'reject_medical_ad',
    entity_type: 'medical_ad',
    entity_id: adId,
    changes: {
      before: { status: 'pending' },
      after: { status: 'rejected' },
      ad_title: adTitle,
      provider_id: providerId,
    },
  });
}

/**
 * Log medical ad deletion
 */
export async function logMedicalAdDeletion(adId: string, adTitle: string, providerId: string, currentStatus: string): Promise<void> {
  const adminId = getCurrentAdminId();
  if (!adminId) return;

  await logAdminAction({
    admin_id: adminId,
    action: 'delete_medical_ad',
    entity_type: 'medical_ad',
    entity_id: adId,
    changes: {
      before: { status: currentStatus },
      after: { deleted: true },
      ad_title: adTitle,
      provider_id: providerId,
    },
  });
}

/**
 * Log profile claim approval
 */
export async function logProfileClaimApproval(
  claimId: string,
  providerId: string,
  providerName: string,
  claimantId: string,
  claimantName: string
): Promise<void> {
  const adminId = getCurrentAdminId();
  if (!adminId) return;

  await logAdminAction({
    admin_id: adminId,
    action: 'approve_profile_claim',
    entity_type: 'profile_claim',
    entity_id: claimId,
    changes: {
      before: { status: 'pending', is_claimed: false, is_preloaded: true },
      after: { status: 'approved', is_claimed: true, is_preloaded: false },
      provider_id: providerId,
      provider_name: providerName,
      claimant_id: claimantId,
      claimant_name: claimantName,
    },
  });
}

/**
 * Log profile claim rejection
 */
export async function logProfileClaimRejection(
  claimId: string,
  providerId: string,
  providerName: string,
  claimantId: string,
  claimantName: string,
  reason?: string
): Promise<void> {
  const adminId = getCurrentAdminId();
  if (!adminId) return;

  await logAdminAction({
    admin_id: adminId,
    action: 'reject_profile_claim',
    entity_type: 'profile_claim',
    entity_id: claimId,
    changes: {
      before: { status: 'pending' },
      after: { status: 'rejected' },
      provider_id: providerId,
      provider_name: providerName,
      claimant_id: claimantId,
      claimant_name: claimantName,
      reason: reason || 'No reason provided',
    },
  });
}

/**
 * Log provider profile modification by admin
 */
export async function logProviderModification(
  providerId: string,
  providerName: string,
  changes: { before: any; after: any }
): Promise<void> {
  const adminId = getCurrentAdminId();
  if (!adminId) return;

  await logAdminAction({
    admin_id: adminId,
    action: 'modify_provider',
    entity_type: 'provider',
    entity_id: providerId,
    changes: {
      ...changes,
      provider_name: providerName,
    },
  });
}
