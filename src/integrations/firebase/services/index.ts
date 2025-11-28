/**
 * Firebase Services - Index
 * 
 * Central export for all Firebase services
 * Use these instead of direct Supabase calls
 */

// Provider Service
export {
  getAllProviders,
  getProviderById,
  getVerifiedProviders,
  getEmergencyProviders,
  searchProviders,
  createProvider,
  updateProvider,
  deleteProvider,
} from './providerService';

// Auth Service
export {
  signIn,
  signUp,
  signInWithGoogle,
  signOut,
  getCurrentUser,
  onAuthChange,
  getUserProfile,
  getUserRole,
  updateUserProfile,
  resetPassword,
} from './authService';

// Storage Service
export {
  uploadFile,
  uploadProviderDocument,
  uploadMultipleFiles,
  getFileUrl,
  deleteFile,
  deleteMultipleFiles,
  listFiles,
  validateFile,
} from './storageService';
