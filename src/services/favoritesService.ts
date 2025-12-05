/**
 * Favorites Service - Firebase Implementation
 * 
 * Migrated from Supabase to Firebase Firestore
 * Stores favorites in /users/{userId}/favorites subcollection
 */

import { 
  collection, 
  doc, 
  addDoc, 
  deleteDoc, 
  getDocs, 
  query, 
  where,
  orderBy,
  getDoc,
  Timestamp,
  onSnapshot,
  Unsubscribe
} from 'firebase/firestore';
import { db, auth } from '@/integrations/firebase/client';
import { COLLECTIONS, Provider, Favorite } from '@/integrations/firebase/types';
import { getProviderById } from '@/integrations/firebase/services/providerService';
import { OFFLINE_MODE } from '@/config/app';

export interface FavoriteWithProvider extends Favorite {
  provider: Provider;
}

export class FavoritesService {
  /**
   * Add a provider to the user's favorites
   * Requires authentication
   */
  async addFavorite(providerId: string): Promise<void> {
    if (OFFLINE_MODE) {
      throw new Error('Favorites not available in offline mode');
    }

    const user = auth.currentUser;
    if (!user) {
      throw new Error('Authentication required to add favorites');
    }

    // Check if already favorited
    const isFav = await this.isFavorite(providerId);
    if (isFav) {
      throw new Error('Provider is already in your favorites');
    }

    const favoritesRef = collection(db, COLLECTIONS.favorites);
    await addDoc(favoritesRef, {
      userId: user.uid,
      providerId: providerId,
      createdAt: Timestamp.now()
    });
  }

  /**
   * Remove a provider from the user's favorites
   * Requires authentication
   */
  async removeFavorite(providerId: string): Promise<void> {
    if (OFFLINE_MODE) {
      throw new Error('Favorites not available in offline mode');
    }

    const user = auth.currentUser;
    if (!user) {
      throw new Error('Authentication required to remove favorites');
    }

    const favoritesRef = collection(db, COLLECTIONS.favorites);
    const q = query(
      favoritesRef,
      where('userId', '==', user.uid),
      where('providerId', '==', providerId)
    );
    
    const snapshot = await getDocs(q);
    const deletePromises = snapshot.docs.map(docSnap => deleteDoc(docSnap.ref));
    await Promise.all(deletePromises);
  }

  /**
   * Get all favorites for the current user with provider details
   * Requires authentication
   */
  async getFavorites(): Promise<FavoriteWithProvider[]> {
    if (OFFLINE_MODE) {
      return [];
    }

    const user = auth.currentUser;
    if (!user) {
      throw new Error('Authentication required to get favorites');
    }

    const favoritesRef = collection(db, COLLECTIONS.favorites);
    const q = query(
      favoritesRef,
      where('userId', '==', user.uid),
      orderBy('createdAt', 'desc')
    );
    
    const snapshot = await getDocs(q);
    const favorites: FavoriteWithProvider[] = [];

    for (const docSnap of snapshot.docs) {
      const data = docSnap.data();
      const provider = await getProviderById(data.providerId);
      
      if (provider) {
        favorites.push({
          id: docSnap.id,
          userId: data.userId,
          providerId: data.providerId,
          createdAt: data.createdAt,
          provider
        });
      }
    }

    return favorites;
  }

  /**
   * Check if a provider is in the user's favorites
   * Requires authentication
   */
  async isFavorite(providerId: string): Promise<boolean> {
    if (OFFLINE_MODE) {
      return false;
    }

    const user = auth.currentUser;
    if (!user) {
      return false;
    }

    const favoritesRef = collection(db, COLLECTIONS.favorites);
    const q = query(
      favoritesRef,
      where('userId', '==', user.uid),
      where('providerId', '==', providerId)
    );
    
    const snapshot = await getDocs(q);
    return !snapshot.empty;
  }

  /**
   * Toggle favorite status for a provider
   * Returns the new favorite status (true if added, false if removed)
   */
  async toggleFavorite(providerId: string): Promise<boolean> {
    const isFav = await this.isFavorite(providerId);
    
    if (isFav) {
      await this.removeFavorite(providerId);
      return false;
    } else {
      await this.addFavorite(providerId);
      return true;
    }
  }

  /**
   * Get the count of favorites for the current user
   * Requires authentication
   */
  async getFavoritesCount(): Promise<number> {
    if (OFFLINE_MODE) {
      return 0;
    }

    const user = auth.currentUser;
    if (!user) {
      return 0;
    }

    const favoritesRef = collection(db, COLLECTIONS.favorites);
    const q = query(
      favoritesRef,
      where('userId', '==', user.uid)
    );
    
    const snapshot = await getDocs(q);
    return snapshot.size;
  }

  /**
   * Subscribe to real-time changes in the user's favorites
   * Returns an unsubscribe function
   */
  subscribeToFavorites(callback: (favorites: FavoriteWithProvider[]) => void): Unsubscribe | null {
    if (OFFLINE_MODE) {
      return null;
    }

    const user = auth.currentUser;
    if (!user) {
      throw new Error('Authentication required to subscribe to favorites');
    }

    const favoritesRef = collection(db, COLLECTIONS.favorites);
    const q = query(
      favoritesRef,
      where('userId', '==', user.uid),
      orderBy('createdAt', 'desc')
    );

    return onSnapshot(q, async (snapshot) => {
      const favorites: FavoriteWithProvider[] = [];
      
      for (const docSnap of snapshot.docs) {
        const data = docSnap.data();
        const provider = await getProviderById(data.providerId);
        
        if (provider) {
          favorites.push({
            id: docSnap.id,
            userId: data.userId,
            providerId: data.providerId,
            createdAt: data.createdAt,
            provider
          });
        }
      }
      
      callback(favorites);
    });
  }
}

// Export a singleton instance
export const favoritesService = new FavoritesService();
