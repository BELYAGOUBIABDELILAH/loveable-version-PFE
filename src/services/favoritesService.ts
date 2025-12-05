import { supabase } from '@/integrations/supabase/client';
import type { Tables } from '@/integrations/supabase/types';

// Types for favorites functionality
export interface Favorite {
  id: string;
  user_id: string;
  provider_id: string;
  created_at: string;
}

export type Provider = Tables<'providers'>;

export interface FavoriteWithProvider extends Favorite {
  provider: Provider;
}

export class FavoritesService {
  /**
   * Add a provider to the user's favorites
   * Requires authentication
   */
  async addFavorite(provider_id: string): Promise<void> {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      throw new Error('Authentication required to add favorites');
    }

    const { error } = await (supabase as any)
      .from('favorites')
      .insert({
        user_id: user.id,
        provider_id: provider_id
      });

    if (error) {
      // Handle unique constraint violation (already favorited)
      if (error.code === '23505') {
        throw new Error('Provider is already in your favorites');
      }
      throw new Error(`Failed to add favorite: ${error.message}`);
    }
  }

  /**
   * Remove a provider from the user's favorites
   * Requires authentication
   */
  async removeFavorite(provider_id: string): Promise<void> {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      throw new Error('Authentication required to remove favorites');
    }

    const { error } = await (supabase as any)
      .from('favorites')
      .delete()
      .eq('user_id', user.id)
      .eq('provider_id', provider_id);

    if (error) {
      throw new Error(`Failed to remove favorite: ${error.message}`);
    }
  }

  /**
   * Get all favorites for the current user with provider details
   * Requires authentication
   */
  async getFavorites(): Promise<FavoriteWithProvider[]> {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      throw new Error('Authentication required to get favorites');
    }

    const { data, error } = await (supabase as any)
      .from('favorites')
      .select(`
        *,
        provider:providers(*)
      `)
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (error) {
      throw new Error(`Failed to get favorites: ${error.message}`);
    }

    // Type assertion needed due to Supabase's complex join types
    return (data as any[]).map(item => ({
      ...item,
      provider: item.provider
    })) as FavoriteWithProvider[];
  }

  /**
   * Check if a provider is in the user's favorites
   * Requires authentication
   */
  async isFavorite(provider_id: string): Promise<boolean> {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return false; // Not authenticated, so no favorites
    }

    const { data, error } = await (supabase as any)
      .from('favorites')
      .select('id')
      .eq('user_id', user.id)
      .eq('provider_id', provider_id)
      .single();

    if (error) {
      // If no record found, it's not a favorite
      if (error.code === 'PGRST116') {
        return false;
      }
      throw new Error(`Failed to check favorite status: ${error.message}`);
    }

    return !!data;
  }

  /**
   * Toggle favorite status for a provider
   * Returns the new favorite status (true if added, false if removed)
   */
  async toggleFavorite(provider_id: string): Promise<boolean> {
    const isFav = await this.isFavorite(provider_id);
    
    if (isFav) {
      await this.removeFavorite(provider_id);
      return false;
    } else {
      await this.addFavorite(provider_id);
      return true;
    }
  }

  /**
   * Get the count of favorites for the current user
   * Requires authentication
   */
  async getFavoritesCount(): Promise<number> {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return 0;
    }

    const { count, error } = await (supabase as any)
      .from('favorites')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user.id);

    if (error) {
      throw new Error(`Failed to get favorites count: ${error.message}`);
    }

    return count || 0;
  }

  /**
   * Subscribe to real-time changes in the user's favorites
   * Returns a subscription that should be unsubscribed when no longer needed
   */
  async subscribeToFavorites(callback: (favorites: FavoriteWithProvider[]) => void) {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      throw new Error('Authentication required to subscribe to favorites');
    }

    // Subscribe to changes in the favorites table for this user
    const subscription = supabase
      .channel('favorites_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'favorites',
          filter: `user_id=eq.${user.id}`
        },
        async () => {
          // Refetch favorites when changes occur
          try {
            const favorites = await this.getFavorites();
            callback(favorites);
          } catch (error) {
            console.error('Error refetching favorites:', error);
          }
        }
      )
      .subscribe();

    return subscription;
  }
}

// Export a singleton instance
export const favoritesService = new FavoritesService();