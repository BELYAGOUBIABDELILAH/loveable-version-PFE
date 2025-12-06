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
  getSearchResultCount,
  createProvider,
  updateProvider,
  deleteProvider,
} from './providerService';

export type { SearchFilters } from './providerService';

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
  sendVerificationEmailToUser,
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

// Appointment Service
export {
  createAppointment,
  getAppointmentById,
  getAppointmentsByUser,
  getAppointmentsByProvider,
  updateAppointmentStatus,
  cancelAppointment,
} from './appointmentService';

// Account Service
export {
  deleteAccount,
  reauthenticateUser,
} from './accountService';

// Verification Service
export {
  createVerificationRequest,
  getVerificationStatus,
  getVerificationByProvider,
  getAllVerificationsByProvider,
  updateVerificationStatus,
} from './verificationService';

export type {
  VerificationRequest,
  CreateVerificationRequestData,
} from './verificationService';
