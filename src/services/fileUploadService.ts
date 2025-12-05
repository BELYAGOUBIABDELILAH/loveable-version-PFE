/**
 * File Upload Service - Firebase Implementation
 * 
 * Migrated from Supabase Storage to Firebase Storage
 * Uses the Firebase Storage service from integrations
 */

import { 
  uploadProviderDocument as firebaseUploadProviderDocument,
  uploadMultipleFiles as firebaseUploadMultipleFiles,
  deleteFile as firebaseDeleteFile,
  validateFile as firebaseValidateFile,
  UploadFileResult
} from '@/integrations/firebase/services/storageService';

export interface UploadResult {
  path: string;
  url: string;
}

export class FileUploadService {
  async uploadProviderDocument(
    file: File,
    providerId: string,
    documentType: 'license' | 'photo' | 'certificate'
  ): Promise<UploadResult> {
    return firebaseUploadProviderDocument(file, providerId, documentType);
  }

  async uploadMultipleFiles(
    files: File[],
    providerId: string,
    documentType: 'license' | 'photo' | 'certificate'
  ): Promise<UploadResult[]> {
    return firebaseUploadMultipleFiles(files, providerId, documentType);
  }

  async deleteFile(path: string): Promise<void> {
    return firebaseDeleteFile(path);
  }

  validateFile(file: File, maxSizeMB: number = 5): { valid: boolean; error?: string } {
    return firebaseValidateFile(file, { maxSizeMB });
  }
}

export const fileUploadService = new FileUploadService();
