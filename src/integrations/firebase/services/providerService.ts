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
 * Search providers
 * Supabase: SELECT * FROM providers WHERE ... (complex query)
 * Firebase: Client-side filtering (Firestore has limited text search)
 */
export async function searchProviders(
  searchQuery: string,
  filters?: {
    type?: string;
    verificationStatus?: VerificationStatus;
    isEmergency?: boolean;
    accessibilityFeatures?: string[];
    homeVisitAvailable?: boolean;
  }
): Promise<Provider[]> {
  if (OFFLINE_MODE) {
    let results = getMockProviders();
    
    // Apply search query
    if (searchQuery) {
      const lowerQuery = searchQuery.toLowerCase();
      results = results.filter(p =>
        p.name.toLowerCase().includes(lowerQuery) ||
        p.specialty?.toLowerCase().includes(lowerQuery) ||
        p.address.toLowerCase().includes(lowerQuery)
      );
    }
    
    // Apply filters
    if (filters?.type) {
      results = results.filter(p => p.type === filters.type);
    }
    if (filters?.verificationStatus) {
      results = results.filter(p => 
        (filters.verificationStatus === 'verified' && p.verified) ||
        (filters.verificationStatus === 'pending' && !p.verified)
      );
    }
    if (filters?.isEmergency) {
      results = results.filter(p => p.emergency);
    }
    if (filters?.homeVisitAvailable) {
      results = results.filter(p => p.home_visit_available);
    }
    
    return results.map(mockToProvider);
  }

  try {
    // Get all providers and filter client-side
    // Note: Firestore doesn't support full-text search natively
    // For production, consider using Algolia or Elasticsearch
    const allProviders = await getAllProviders();
    
    let results = allProviders;
    
    // Apply search query
    if (searchQuery) {
      const lowerQuery = searchQuery.toLowerCase();
      results = results.filter(p =>
        p.businessName.toLowerCase().includes(lowerQuery) ||
        p.address.toLowerCase().includes(lowerQuery) ||
        p.description?.toLowerCase().includes(lowerQuery)
      );
    }
    
    // Apply filters
    if (filters?.type) {
      results = results.filter(p => p.providerType === filters.type);
    }
    if (filters?.verificationStatus) {
      results = results.filter(p => p.verificationStatus === filters.verificationStatus);
    }
    if (filters?.isEmergency) {
      results = results.filter(p => p.isEmergency);
    }
    if (filters?.homeVisitAvailable) {
      results = results.filter(p => p.homeVisitAvailable);
    }
    if (filters?.accessibilityFeatures?.length) {
      results = results.filter(p =>
        filters.accessibilityFeatures!.some(f => p.accessibilityFeatures.includes(f))
      );
    }
    
    return results;
  } catch (error) {
    console.error('Error searching providers:', error);
    return [];
  }
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
