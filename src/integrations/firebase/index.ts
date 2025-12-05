/**
 * Firebase Integration - Main Export
 * 
 * This module provides a unified API for accessing Firebase services.
 * 
 * Usage:
 * import { getAllProviders } from '@/integrations/firebase';
 * const providers = await getAllProviders();
 * 
 * OR use the unified API:
 * import { api } from '@/integrations/firebase';
 * const providers = await api.providers.getAll();
 */

// Export Firebase instances
export { app, db, auth, storage } from './client';

// Export types
export * from './types';

// Export services
export * from './services';

// Unified API wrapper
import * as providerService from './services/providerService';
import * as authService from './services/authService';
import * as storageService from './services/storageService';

/**
 * Unified API object for easy access to all Firebase services
 * 
 * Usage:
 * import { api } from '@/integrations/firebase';
 * 
 * // Providers
 * const providers = await api.providers.getAll();
 * const provider = await api.providers.getById('123');
 * 
 * // Auth
 * await api.auth.signIn(email, password);
 * await api.auth.signOut();
 * 
 * // Storage
 * const result = await api.storage.upload(file, 'path/to/file');
 */
export const api = {
  providers: {
    getAll: providerService.getAllProviders,
    getById: providerService.getProviderById,
    getVerified: providerService.getVerifiedProviders,
    getEmergency: providerService.getEmergencyProviders,
    search: providerService.searchProviders,
    create: providerService.createProvider,
    update: providerService.updateProvider,
    delete: providerService.deleteProvider,
  },
  auth: {
    signIn: authService.signIn,
    signUp: authService.signUp,
    signInWithGoogle: authService.signInWithGoogle,
    signOut: authService.signOut,
    getCurrentUser: authService.getCurrentUser,
    onAuthChange: authService.onAuthChange,
    getProfile: authService.getUserProfile,
    getRole: authService.getUserRole,
    updateProfile: authService.updateUserProfile,
    resetPassword: authService.resetPassword,
    sendVerificationEmail: authService.sendVerificationEmailToUser,
  },
  storage: {
    upload: storageService.uploadFile,
    uploadProviderDoc: storageService.uploadProviderDocument,
    uploadMultiple: storageService.uploadMultipleFiles,
    getUrl: storageService.getFileUrl,
    delete: storageService.deleteFile,
    deleteMultiple: storageService.deleteMultipleFiles,
    list: storageService.listFiles,
    validate: storageService.validateFile,
  },
};

export default api;
