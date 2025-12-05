/**
 * Firebase Types for CityHealth
 * 
 * Mapping from Supabase tables to Firestore collections
 * 
 * SQL Tables → Firestore Collections:
 * - providers → providers
 * - profiles → profiles
 * - user_roles → userRoles
 * - specialties → specialties
 * - services → services
 * - schedules → schedules
 * - verifications → verifications
 * - medical_ads → medicalAds
 * - favorites → favorites
 * - chat_sessions → chatSessions
 * - chat_messages → chatMessages
 * - analytics_events → analyticsEvents
 * - profile_claims → profileClaims
 * - admin_logs → adminLogs
 * - notifications → notifications
 */

import { Timestamp } from 'firebase/firestore';

// Provider Types
export type ProviderType = 'doctor' | 'clinic' | 'hospital' | 'pharmacy' | 'laboratory';
export type VerificationStatus = 'pending' | 'verified' | 'rejected';
export type UserRole = 'citizen' | 'provider' | 'admin';

// Provider Interface (Firestore: providers collection)
export interface Provider {
  id: string;
  userId: string;
  businessName: string;
  providerType: ProviderType;
  specialtyId?: string;
  phone: string;
  email?: string;
  address: string;
  city?: string;
  latitude?: number;
  longitude?: number;
  description?: string;
  avatarUrl?: string;
  coverImageUrl?: string;
  website?: string;
  verificationStatus: VerificationStatus;
  isEmergency: boolean;
  isPreloaded: boolean;
  isClaimed: boolean;
  accessibilityFeatures: string[];
  homeVisitAvailable: boolean;
  photos?: string[];
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

// Profile Interface (Firestore: profiles collection)
export interface Profile {
  id: string;
  fullName: string;
  avatarUrl?: string;
  phone?: string;
  language: 'fr' | 'ar' | 'en';
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

// User Role Interface (Firestore: userRoles collection)
export interface UserRoleDoc {
  id: string;
  userId: string;
  role: UserRole;
  createdAt: Timestamp;
}

// Specialty Interface (Firestore: specialties collection)
export interface Specialty {
  id: string;
  nameFr: string;
  nameAr?: string;
  nameEn?: string;
  icon?: string;
  createdAt: Timestamp;
}

// Service Interface (Firestore: services collection)
export interface Service {
  id: string;
  providerId: string;
  nameFr: string;
  nameAr?: string;
  nameEn?: string;
  description?: string;
  price?: number;
  durationMinutes?: number;
  createdAt: Timestamp;
}

// Schedule Interface (Firestore: schedules collection)
export interface Schedule {
  id: string;
  providerId: string;
  dayOfWeek: number; // 0-6 (Sunday-Saturday)
  startTime: string; // HH:MM format
  endTime: string;
  isActive: boolean;
  createdAt: Timestamp;
}

// Verification Interface (Firestore: verifications collection)
export interface Verification {
  id: string;
  providerId: string;
  documentType: string;
  documentUrl: string;
  status: VerificationStatus;
  notes?: string;
  reviewedBy?: string;
  reviewedAt?: Timestamp;
  createdAt: Timestamp;
}

// Medical Ad Interface (Firestore: medicalAds collection)
export interface MedicalAd {
  id: string;
  providerId: string;
  title: string;
  content: string;
  imageUrl?: string;
  status: 'pending' | 'approved' | 'rejected';
  displayPriority: number;
  startDate: Timestamp;
  endDate?: Timestamp;
  createdAt: Timestamp;
}

// Favorite Interface (Firestore: favorites collection)
export interface Favorite {
  id: string;
  userId: string;
  providerId: string;
  createdAt: Timestamp;
}

// Chat Session Interface (Firestore: chatSessions collection)
export interface ChatSession {
  id: string;
  userId?: string;
  language: 'fr' | 'ar' | 'en';
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

// Chat Message Interface (Firestore: chatMessages collection)
export interface ChatMessage {
  id: string;
  sessionId: string;
  role: 'user' | 'assistant';
  content: string;
  createdAt: Timestamp;
}

// Analytics Event Interface (Firestore: analyticsEvents collection)
export interface AnalyticsEvent {
  id: string;
  eventType: string;
  eventData: Record<string, any>;
  userId?: string;
  sessionId: string;
  pageUrl: string;
  ipAddress?: string;
  userAgent?: string;
  createdAt: Timestamp;
}

// Profile Claim Interface (Firestore: profileClaims collection)
export interface ProfileClaim {
  id: string;
  providerId: string;
  userId: string;
  status: 'pending' | 'approved' | 'rejected';
  documentation: string[];
  notes?: string;
  reviewedBy?: string;
  reviewedAt?: Timestamp;
  createdAt: Timestamp;
}

// Admin Log Interface (Firestore: adminLogs collection)
export interface AdminLog {
  id: string;
  adminId: string;
  action: string;
  entityType: string;
  entityId: string;
  changes: Record<string, any>;
  createdAt: Timestamp;
}

// Notification Interface (Firestore: notifications collection)
export interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  read: boolean;
  link?: string;
  createdAt: Timestamp;
}

// Rating Interface (Firestore: ratings subcollection under providers)
export interface Rating {
  id: string;
  providerId: string;
  userId: string;
  rating: number;
  comment?: string;
  createdAt: Timestamp;
}

// Appointment Types
export type AppointmentStatus = 'pending' | 'confirmed' | 'cancelled' | 'completed';

// Appointment Interface (Firestore: appointments collection)
export interface Appointment {
  id: string;
  providerId: string;
  userId: string;
  datetime: Timestamp;
  status: AppointmentStatus;
  contactInfo: {
    name: string;
    phone: string;
    email?: string;
  };
  notes?: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

// Create Appointment Data Interface (for creating new appointments)
export interface CreateAppointmentData {
  providerId: string;
  userId: string;
  datetime: Date;
  contactInfo: {
    name: string;
    phone: string;
    email?: string;
  };
  notes?: string;
}

// Collection names mapping
export const COLLECTIONS = {
  providers: 'providers',
  profiles: 'profiles',
  userRoles: 'userRoles',
  specialties: 'specialties',
  services: 'services',
  schedules: 'schedules',
  verifications: 'verifications',
  medicalAds: 'medicalAds',
  favorites: 'favorites',
  chatSessions: 'chatSessions',
  chatMessages: 'chatMessages',
  analyticsEvents: 'analyticsEvents',
  profileClaims: 'profileClaims',
  adminLogs: 'adminLogs',
  notifications: 'notifications',
  ratings: 'ratings',
  appointments: 'appointments',
} as const;
