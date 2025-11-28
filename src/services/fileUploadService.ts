import { supabase } from '@/integrations/supabase/client';

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
    const fileExt = file.name.split('.').pop();
    const fileName = `${providerId}/${documentType}-${Date.now()}.${fileExt}`;

    const { data, error } = await supabase.storage
      .from('provider-documents')
      .upload(fileName, file, {
        cacheControl: '3600',
        upsert: false,
      });

    if (error) {
      throw new Error(`Erreur lors du téléchargement: ${error.message}`);
    }

    const { data: urlData } = supabase.storage
      .from('provider-documents')
      .getPublicUrl(data.path);

    return {
      path: data.path,
      url: urlData.publicUrl,
    };
  }

  async uploadMultipleFiles(
    files: File[],
    providerId: string,
    documentType: 'license' | 'photo' | 'certificate'
  ): Promise<UploadResult[]> {
    const uploads = files.map((file) =>
      this.uploadProviderDocument(file, providerId, documentType)
    );

    return Promise.all(uploads);
  }

  async deleteFile(path: string): Promise<void> {
    const { error } = await supabase.storage
      .from('provider-documents')
      .remove([path]);

    if (error) {
      throw new Error(`Erreur lors de la suppression: ${error.message}`);
    }
  }

  validateFile(file: File, maxSizeMB: number = 5): { valid: boolean; error?: string } {
    const maxSizeBytes = maxSizeMB * 1024 * 1024;

    if (file.size > maxSizeBytes) {
      return {
        valid: false,
        error: `Le fichier est trop volumineux. Taille maximale: ${maxSizeMB}MB`,
      };
    }

    const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg', 'application/pdf'];
    if (!allowedTypes.includes(file.type)) {
      return {
        valid: false,
        error: 'Type de fichier non autorisé. Utilisez JPG, PNG ou PDF.',
      };
    }

    return { valid: true };
  }
}

export const fileUploadService = new FileUploadService();
