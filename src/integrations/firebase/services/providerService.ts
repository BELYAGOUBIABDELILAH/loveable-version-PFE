/**
 * Provider Service - Firebase Implementation
 * 
 * Replaces Supabase queries with Firestore equivalents:
 * - SELECT → getDocs, getDoc with queries
 * - INSERT → addDoc
 * - UPDATE → updateDoc, setDoc
 * - DELETE → deleteDoc
 */

import {
  collection,
  doc,
  getDocs,
  getDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  Timestamp,
  DocumentData,
  QueryConstraint,
} from 'firebase/firestore';
import { db } from '../client';
import { Provider, COLLECTIONS, VerificationStatus } from '../types';
import { OFFLINE_MODE } from '@/config/app';
import { getProviders as getMockProviders, getProviderById as getMockProviderById } from '@/data/providers';

/**
 * Convert Firestore document to Provider
 */
function docToProvider(doc: DocumentData, id: string): Provider {
  const data = doc;
  return {
    id,
    userId: data.userId || '',
    businessName: data.businessName || data.business_name || '',
    providerType: data.providerType || data.provider_type || 'doctor',
    specialtyId: data.specialtyId || data.specialty_id,
    phone: data.phone || '',
    email: data.email,
    address: data.address || '',
    city: data.city,
    latitude: data.latitude,
    longitude: data.longitude,
    description: data.description,
    avatarUrl: data.avatarUrl || data.avatar_url,
    coverImageUrl: data.coverImageUrl || data.cover_image_url,
    website: data.website,
    verificationStatus: data.verificationStatus || data.verification_status || 'pending',
    isEmergency: data.isEmergency || data.is_emergency || false,
    isPreloaded: data.isPreloaded || data.is_preloaded || false,
    isClaimed: data.isClaimed || data.is_claimed || false,
    accessibilityFeatures: data.accessibilityFeatures || data.accessibility_features || [],
    homeVisitAvailable: data.homeVisitAvailable || data.home_visit_available || false,
    createdAt: data.createdAt || Timestamp.now(),
    updatedAt: data.updatedAt || Timestamp.now(),
  };
}

/**
 * Convert mock provider to Firebase Provider format
 */
function mockToProvider(mock: any): Provider {
  return {
    id: mock.id,
    userId: '',
    businessName: mock.name,
    providerType: mock.type,
    specialtyId: undefined,
    phone: mock.phone,
    email: undefined,
    address: mock.address,
    city: mock.city,
    latitude: mock.lat,
    longitude: mock.lng,
    description: mock.description,
    avatarUrl: mock.image,
    coverImageUrl: undefined,
    website: undefined,
    verificationStatus: mock.verified ? 'verified' : 'pending',
    isEmergency: mock.emergency,
    isPreloaded: mock.is_preloaded,
    isClaimed: mock.is_claimed,
    accessibilityFeatures: mock.accessibility_features || [],
    homeVisitAvailable: mock.home_visit_available,
    createdAt: Timestamp.now(),
    updatedAt: Timestamp.now(),
  };
}

/**
 * Get all providers
 * Supabase: SELECT * FROM providers
 * Firebase: getDocs(collection(db, 'providers'))
 */
export async function getAllProviders(): Promise<Provider[]> {
  if (OFFLINE_MODE) {
    return getMockProviders().map(mockToProvider);
  }

  try {
    const providersRef = collection(db, COLLECTIONS.providers);
    const snapshot = await getDocs(providersRef);
    return snapshot.docs.map(doc => docToProvider(doc.data(), doc.id));
  } catch (error) {
    console.error('Error fetching providers:', error);
    return getMockProviders().map(mockToProvider);
  }
}

/**
 * Get provider by ID
 * Supabase: SELECT * FROM providers WHERE id = ?
 * Firebase: getDoc(doc(db, 'providers', id))
 */
export async function getProviderById(id: string): Promise<Provider | null> {
  if (OFFLINE_MODE) {
    const mock = getMockProviderById(id);
    return mock ? mockToProvider(mock) : null;
  }

  try {
    const providerRef = doc(db, COLLECTIONS.providers, id);
    const snapshot = await getDoc(providerRef);
    
    if (!snapshot.exists()) {
      return null;
    }
    
    return docToProvider(snapshot.data(), snapshot.id);
  } catch (error) {
    console.error('Error fetching provider:', error);
    const mock = getMockProviderById(id);
    return mock ? mockToProvider(mock) : null;
  }
}

/**
 * Get verified providers
 * Supabase: SELECT * FROM providers WHERE verification_status = 'verified'
 * Firebase: query with where clause
 */
export async function getVerifiedProviders(maxResults?: number): Promise<Provider[]> {
  if (OFFLINE_MODE) {
    const providers = getMockProviders()
      .filter(p => p.verified)
      .slice(0, maxResults);
    return providers.map(mockToProvider);
  }

  try {
    const constraints: QueryConstraint[] = [
      where('verificationStatus', '==', 'verified'),
      orderBy('businessName', 'asc'),
    ];
    
    if (maxResults) {
      constraints.push(limit(maxResults));
    }

    const providersRef = collection(db, COLLECTIONS.providers);
    const q = query(providersRef, ...constraints);
    const snapshot = await getDocs(q);
    
    return snapshot.docs.map(doc => docToProvider(doc.data(), doc.id));
  } catch (error) {
    console.error('Error fetching verified providers:', error);
    return getMockProviders().filter(p => p.verified).map(mockToProvider);
  }
}

/**
 * Get emergency providers
 * Supabase: SELECT * FROM providers WHERE is_emergency = true AND verification_status = 'verified'
 * Firebase: query with multiple where clauses
 */
export async function getEmergencyProviders(): Promise<Provider[]> {
  if (OFFLINE_MODE) {
    return getMockProviders()
      .filter(p => p.emergency && p.verified)
      .map(mockToProvider);
  }

  try {
    const providersRef = collection(db, COLLECTIONS.providers);
    const q = query(
      providersRef,
      where('isEmergency', '==', true),
      where('verificationStatus', '==', 'verified'),
      orderBy('businessName', 'asc')
    );
    const snapshot = await getDocs(q);
    
    return snapshot.docs.map(doc => docToProvider(doc.data(), doc.id));
  } catch (error) {
    console.error('Error fetching emergency providers:', error);
    return getMockProviders().filter(p => p.emergency).map(mockToProvider);
  }
}

/**
 * Multilingual search term mappings
 * Maps equivalent terms across Arabic, French, and English
 */
const MULTILINGUAL_TERMS: Record<string, string[]> = {
  // Provider types
  'doctor': ['doctor', 'médecin', 'طبيب', 'docteur', 'dr'],
  'clinic': ['clinic', 'clinique', 'عيادة', 'cabinet'],
  'hospital': ['hospital', 'hôpital', 'مستشفى', 'hopital'],
  'pharmacy': ['pharmacy', 'pharmacie', 'صيدلية'],
  'laboratory': ['laboratory', 'laboratoire', 'مختبر', 'lab', 'labo'],
  // Specialties
  'cardiology': ['cardiology', 'cardiologie', 'قلب', 'cardiologue', 'cardiologist'],
  'dermatology': ['dermatology', 'dermatologie', 'جلدية', 'dermatologue', 'dermatologist'],
  'pediatrics': ['pediatrics', 'pédiatrie', 'أطفال', 'pédiatre', 'pediatrician'],
  'gynecology': ['gynecology', 'gynécologie', 'نسائية', 'gynécologue', 'gynecologist'],
  'ophthalmology': ['ophthalmology', 'ophtalmologie', 'عيون', 'ophtalmologue', 'ophthalmologist'],
  'dentistry': ['dentistry', 'dentisterie', 'أسنان', 'dentiste', 'dentist'],
  'radiology': ['radiology', 'radiologie', 'أشعة', 'radiologue', 'radiologist'],
  'general': ['general', 'générale', 'عام', 'généraliste', 'general practitioner'],
  // Common terms
  'emergency': ['emergency', 'urgence', 'طوارئ', 'urgences'],
  'accessible': ['accessible', 'accessibilité', 'إمكانية الوصول', 'wheelchair'],
};

/**
 * Normalize search query for multilingual matching
 * Expands the query to include equivalent terms in other languages
 */
function normalizeSearchQuery(query: string): string[] {
  const lowerQuery = query.toLowerCase().trim();
  const terms: Set<string> = new Set([lowerQuery]);
  
  // Find equivalent terms in other languages
  for (const [, equivalents] of Object.entries(MULTILINGUAL_TERMS)) {
    if (equivalents.some(term => lowerQuery.includes(term) || term.includes(lowerQuery))) {
      equivalents.forEach(term => terms.add(term));
    }
  }
  
  return Array.from(terms);
}

/**
 * Check if a provider matches a search query (multilingual)
 */
function matchesSearchQuery(provider: Provider, searchTerms: string[]): boolean {
  const searchableText = [
    provider.businessName,
    provider.address,
    provider.description,
    provider.city,
    provider.providerType,
  ].filter(Boolean).join(' ').toLowerCase();
  
  return searchTerms.some(term => searchableText.includes(term));
}

/**
 * Search filter parameters interface
 */
export interface SearchFilters {
  type?: string;
  providerTypes?: string[];
  verificationStatus?: VerificationStatus;
  isEmergency?: boolean;
  accessibilityFeatures?: string[];
  homeVisitAvailable?: boolean;
  city?: string;
}

/**
 * Search providers with multilingual support
 * Supabase: SELECT * FROM providers WHERE ... (complex query)
 * Firebase: Client-side filtering (Firestore has limited text search)
 * 
 * Supports:
 * - Multilingual search (AR/FR/EN)
 * - Filter by provider_type, accessibility_features, home_visit_available
 * - AND logic for multiple filters
 * 
 * Requirements: 1.1, 1.2, 2.2, 2.3
 */
export async function searchProviders(
  searchQuery: string,
  filters?: SearchFilters
): Promise<Provider[]> {
  if (OFFLINE_MODE) {
    let results = getMockProviders();
    
    // Normalize search query for multilingual support
    const searchTerms = searchQuery ? normalizeSearchQuery(searchQuery) : [];
    
    // Apply search query with multilingual matching
    if (searchTerms.length > 0) {
      results = results.filter(p => {
        const searchableText = [
          p.name,
          p.address,
          p.description,
          p.city,
          p.type,
          p.specialty,
        ].filter(Boolean).join(' ').toLowerCase();
        
        return searchTerms.some(term => searchableText.includes(term));
      });
    }
    
    // Apply filters with AND logic (all filters must match)
    if (filters?.type) {
      results = results.filter(p => p.type === filters.type);
    }
    if (filters?.providerTypes && filters.providerTypes.length > 0) {
      results = results.filter(p => filters.providerTypes!.includes(p.type));
    }
    if (filters?.verificationStatus) {
      results = results.filter(p => 
        (filters.verificationStatus === 'verified' && p.verified) ||
        (filters.verificationStatus === 'pending' && !p.verified) ||
        (filters.verificationStatus === 'rejected' && !p.verified)
      );
    }
    if (filters?.isEmergency !== undefined && filters.isEmergency !== null) {
      results = results.filter(p => p.emergency === filters.isEmergency);
    }
    if (filters?.homeVisitAvailable !== undefined && filters.homeVisitAvailable !== null) {
      results = results.filter(p => p.home_visit_available === filters.homeVisitAvailable);
    }
    if (filters?.accessibilityFeatures && filters.accessibilityFeatures.length > 0) {
      // Match ANY of the selected accessibility features
      results = results.filter(p =>
        filters.accessibilityFeatures!.some(f => 
          (p.accessibility_features || []).includes(f)
        )
      );
    }
    if (filters?.city) {
      results = results.filter(p => 
        p.city.toLowerCase().includes(filters.city!.toLowerCase())
      );
    }
    
    return results.map(mockToProvider);
  }

  try {
    // Get all providers and filter client-side
    // Note: Firestore doesn't support full-text search natively
    // For production, consider using Algolia or Elasticsearch
    const allProviders = await getAllProviders();
    
    let results = allProviders;
    
    // Normalize search query for multilingual support
    const searchTerms = searchQuery ? normalizeSearchQuery(searchQuery) : [];
    
    // Apply search query with multilingual matching
    if (searchTerms.length > 0) {
      results = results.filter(p => matchesSearchQuery(p, searchTerms));
    }
    
    // Apply filters with AND logic (all filters must match)
    if (filters?.type) {
      results = results.filter(p => p.providerType === filters.type);
    }
    if (filters?.providerTypes && filters.providerTypes.length > 0) {
      results = results.filter(p => filters.providerTypes!.includes(p.providerType));
    }
    if (filters?.verificationStatus) {
      results = results.filter(p => p.verificationStatus === filters.verificationStatus);
    }
    if (filters?.isEmergency !== undefined && filters.isEmergency !== null) {
      results = results.filter(p => p.isEmergency === filters.isEmergency);
    }
    if (filters?.homeVisitAvailable !== undefined && filters.homeVisitAvailable !== null) {
      results = results.filter(p => p.homeVisitAvailable === filters.homeVisitAvailable);
    }
    if (filters?.accessibilityFeatures && filters.accessibilityFeatures.length > 0) {
      // Match ANY of the selected accessibility features
      results = results.filter(p =>
        filters.accessibilityFeatures!.some(f => 
          (p.accessibilityFeatures || []).includes(f)
        )
      );
    }
    if (filters?.city) {
      results = results.filter(p => 
        (p.city || '').toLowerCase().includes(filters.city!.toLowerCase())
      );
    }
    
    return results;
  } catch (error) {
    console.error('Error searching providers:', error);
    return [];
  }
}

/**
 * Get search result count for a given query and filters
 * Requirements: 2.5
 */
export async function getSearchResultCount(
  searchQuery: string,
  filters?: SearchFilters
): Promise<number> {
  const results = await searchProviders(searchQuery, filters);
  return results.length;
}

/**
 * Create provider
 * Supabase: INSERT INTO providers VALUES (...)
 * Firebase: addDoc(collection(db, 'providers'), data)
 */
export async function createProvider(data: Omit<Provider, 'id' | 'createdAt' | 'updatedAt'>): Promise<Provider> {
  if (OFFLINE_MODE) {
    throw new Error('Cannot create provider in offline mode');
  }

  try {
    const providersRef = collection(db, COLLECTIONS.providers);
    const now = Timestamp.now();
    
    const docRef = await addDoc(providersRef, {
      ...data,
      createdAt: now,
      updatedAt: now,
    });
    
    return {
      ...data,
      id: docRef.id,
      createdAt: now,
      updatedAt: now,
    } as Provider;
  } catch (error) {
    console.error('Error creating provider:', error);
    throw error;
  }
}

/**
 * Update provider
 * Supabase: UPDATE providers SET ... WHERE id = ?
 * Firebase: updateDoc(doc(db, 'providers', id), data)
 */
export async function updateProvider(id: string, data: Partial<Provider>): Promise<void> {
  if (OFFLINE_MODE) {
    throw new Error('Cannot update provider in offline mode');
  }

  try {
    const providerRef = doc(db, COLLECTIONS.providers, id);
    await updateDoc(providerRef, {
      ...data,
      updatedAt: Timestamp.now(),
    });
  } catch (error) {
    console.error('Error updating provider:', error);
    throw error;
  }
}

/**
 * Delete provider
 * Supabase: DELETE FROM providers WHERE id = ?
 * Firebase: deleteDoc(doc(db, 'providers', id))
 */
export async function deleteProvider(id: string): Promise<void> {
  if (OFFLINE_MODE) {
    throw new Error('Cannot delete provider in offline mode');
  }

  try {
    const providerRef = doc(db, COLLECTIONS.providers, id);
    await deleteDoc(providerRef);
  } catch (error) {
    console.error('Error deleting provider:', error);
    throw error;
  }
}
