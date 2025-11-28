/**
 * Storage Service - Firebase Implementation
 * 
 * Replaces Supabase Storage with Firebase Storage:
 * - supabase.storage.from(bucket).upload() → uploadBytes()
 * - supabase.storage.from(bucket).getPublicUrl() → getDownloadURL()
 * - supabase.storage.from(bucket).remove() → deleteObject()
 */

import {
  ref,
  uploadBytes,
  getDownloadURL,
  deleteObject,
  listAll,
  UploadResult,
} from 'firebase/storage';
import { storage } from '../client';
import { OFFLINE_MODE } from '@/config/app';

export interface UploadFileResult {
  path: string;
  url: string;
}

/**
 * Upload a file
 * Supabase: supabase.storage.from(bucket).upload(path, file)
 * Firebase: uploadBytes(ref(storage, path), file)
 */
export async function uploadFile(
  path: string,
  file: File,
  metadata?: { contentType?: string }
): Promise<UploadFileResult> {
  if (OFFLINE_MODE) {
    throw new Error('File upload not available in offline mode');
  }

  try {
    const storageRef = ref(storage, path);
    const result = await uploadBytes(storageRef, file, metadata);
    const url = await getDownloadURL(result.ref);

    return {
      path: result.ref.fullPath,
      url,
    };
  } catch (error) {
    console.error('Error uploading file:', error);
    throw error;
  }
}

/**
 * Upload provider document
 * Supabase: supabase.storage.from('provider-documents').upload(...)
 * Firebase: uploadBytes to 'provider-documents/{providerId}/{type}-{timestamp}.{ext}'
 */
export async function uploadProviderDocument(
  file: File,
  providerId: string,
  documentType: 'license' | 'photo' | 'certificate'
): Promise<UploadFileResult> {
  if (OFFLINE_MODE) {
    throw new Error('File upload not available in offline mode');
  }

  const fileExt = file.name.split('.').pop();
  const fileName = `provider-documents/${providerId}/${documentType}-${Date.now()}.${fileExt}`;

  return uploadFile(fileName, file, { contentType: file.type });
}

/**
 * Upload multiple files
 */
export async function uploadMultipleFiles(
  files: File[],
  providerId: string,
  documentType: 'license' | 'photo' | 'certificate'
): Promise<UploadFileResult[]> {
  if (OFFLINE_MODE) {
    throw new Error('File upload not available in offline mode');
  }

  const uploads = files.map(file =>
    uploadProviderDocument(file, providerId, documentType)
  );

  return Promise.all(uploads);
}

/**
 * Get file download URL
 * Supabase: supabase.storage.from(bucket).getPublicUrl(path)
 * Firebase: getDownloadURL(ref(storage, path))
 */
export async function getFileUrl(path: string): Promise<string> {
  if (OFFLINE_MODE) {
    throw new Error('File access not available in offline mode');
  }

  try {
    const storageRef = ref(storage, path);
    return await getDownloadURL(storageRef);
  } catch (error) {
    console.error('Error getting file URL:', error);
    throw error;
  }
}

/**
 * Delete a file
 * Supabase: supabase.storage.from(bucket).remove([path])
 * Firebase: deleteObject(ref(storage, path))
 */
export async function deleteFile(path: string): Promise<void> {
  if (OFFLINE_MODE) {
    throw new Error('File deletion not available in offline mode');
  }

  try {
    const storageRef = ref(storage, path);
    await deleteObject(storageRef);
  } catch (error) {
    console.error('Error deleting file:', error);
    throw error;
  }
}

/**
 * Delete multiple files
 */
export async function deleteMultipleFiles(paths: string[]): Promise<void> {
  if (OFFLINE_MODE) {
    throw new Error('File deletion not available in offline mode');
  }

  const deletions = paths.map(path => deleteFile(path));
  await Promise.all(deletions);
}

/**
 * List files in a directory
 * Supabase: supabase.storage.from(bucket).list(path)
 * Firebase: listAll(ref(storage, path))
 */
export async function listFiles(path: string): Promise<string[]> {
  if (OFFLINE_MODE) {
    return [];
  }

  try {
    const storageRef = ref(storage, path);
    const result = await listAll(storageRef);
    return result.items.map(item => item.fullPath);
  } catch (error) {
    console.error('Error listing files:', error);
    return [];
  }
}

/**
 * Validate file before upload
 */
export function validateFile(
  file: File,
  options?: {
    maxSizeMB?: number;
    allowedTypes?: string[];
  }
): { valid: boolean; error?: string } {
  const maxSizeMB = options?.maxSizeMB || 5;
  const allowedTypes = options?.allowedTypes || [
    'image/jpeg',
    'image/png',
    'image/jpg',
    'application/pdf',
  ];

  const maxSizeBytes = maxSizeMB * 1024 * 1024;

  if (file.size > maxSizeBytes) {
    return {
      valid: false,
      error: `Le fichier est trop volumineux. Taille maximale: ${maxSizeMB}MB`,
    };
  }

  if (!allowedTypes.includes(file.type)) {
    return {
      valid: false,
      error: 'Type de fichier non autorisé. Utilisez JPG, PNG ou PDF.',
    };
  }

  return { valid: true };
}
