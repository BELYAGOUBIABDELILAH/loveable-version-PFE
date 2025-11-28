import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { SearchInterface } from '@/components/search/SearchInterface';
import { AdvancedFilters } from '@/components/search/AdvancedFilters';
import { SearchResults } from '@/components/search/SearchResults';
import { SearchMap } from '@/components/search/SearchMap';
import { SmartSuggestions } from '@/components/SmartSuggestions';
import { supabase } from '@/integrations/supabase/client';
import { Tables } from '@/integrations/supabase/types';
import { OFFLINE_MODE } from '@/config/app';
import { getProviders } from '@/data/providers';

export type ViewMode = 'list' | 'grid' | 'map';
export type SortOption = 'relevance' | 'distance' | 'rating' | 'price' | 'newest';

export interface FilterState {
  categories: string[];
  location: string;
  radius: number;
  availability: string;
  minRating: number;
  verifiedOnly: boolean;
  emergencyServices: boolean;
  wheelchairAccessible: boolean;
  insuranceAccepted: boolean;
  priceRange: [number, number];
  accessibility_features: string[];
  home_visit_available: boolean;
}

type SupabaseProvider = Tables<"providers">;
type Specialty = Tables<"specialties">;
type Rating = Tables<"ratings">;

export interface Provider extends SupabaseProvider {
  specialty?: Specialty | null;
  ratings?: Rating[];
  avgRating?: number;
  ratingCount?: number;
}

// Helper functions for URL parameter persistence
const serializeFilters = (filters: FilterState): URLSearchParams => {
  const params = new URLSearchParams();
  
  const validCategories = filters.categories.filter(c => c.length > 0);
  if (validCategories.length > 0) {
    params.set('categories', validCategories.join(','));
  }
  if (filters.location) {
    params.set('location', filters.location);
  }
  if (filters.radius !== 25) {
    params.set('radius', filters.radius.toString());
  }
  if (filters.availability !== 'any') {
    params.set('availability', filters.availability);
  }
  if (filters.minRating > 0) {
    params.set('minRating', filters.minRating.toString());
  }
  if (filters.verifiedOnly) {
    params.set('verifiedOnly', 'true');
  }
  if (filters.emergencyServices) {
    params.set('emergencyServices', 'true');
  }
  if (filters.wheelchairAccessible) {
    params.set('wheelchairAccessible', 'true');
  }
  if (filters.insuranceAccepted) {
    params.set('insuranceAccepted', 'true');
  }
  if (filters.priceRange[0] !== 0 || filters.priceRange[1] !== 500) {
    params.set('priceRange', `${filters.priceRange[0]},${filters.priceRange[1]}`);
  }
  const validAccessibilityFeatures = filters.accessibility_features.filter(f => f.length > 0);
  if (validAccessibilityFeatures.length > 0) {
    params.set('accessibilityFeatures', validAccessibilityFeatures.join(','));
  }
  if (filters.home_visit_available) {
    params.set('homeVisitAvailable', 'true');
  }
  
  return params;
};

const deserializeFilters = (searchParams: URLSearchParams): FilterState => {
  return {
    categories: searchParams.get('categories')?.split(',').filter(s => s.length > 0) || [],
    location: searchParams.get('location') || '',
    radius: parseInt(searchParams.get('radius') || '25'),
    availability: searchParams.get('availability') || 'any',
    minRating: parseFloat(searchParams.get('minRating') || '0'),
    verifiedOnly: searchParams.get('verifiedOnly') === 'true',
    emergencyServices: searchParams.get('emergencyServices') === 'true',
    wheelchairAccessible: searchParams.get('wheelchairAccessible') === 'true',
    insuranceAccepted: searchParams.get('insuranceAccepted') === 'true',
    priceRange: searchParams.get('priceRange')?.split(',').map(Number) as [number, number] || [0, 500],
    accessibility_features: searchParams.get('accessibilityFeatures')?.split(',').filter(s => s.length > 0) || [],
    home_visit_available: searchParams.get('homeVisitAvailable') === 'true',
  };
};

const SearchPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [sortBy, setSortBy] = useState<SortOption>('relevance');
  const [showFilters, setShowFilters] = useState(false);
  const [filteredProviders, setFilteredProviders] = useState<Provider[]>([]);
  const [allProviders, setAllProviders] = useState<Provider[]>([]);
  
  // Initialize search query and filters from URL parameters
  const [searchQuery, setSearchQuery] = useState(searchParams.get('q') || '');
  const [filters, setFilters] = useState<FilterState>(() => deserializeFilters(searchParams));
  const [userLocation, setUserLocation] = useState<{ latitude: number; longitude: number } | undefined>();

  // Get user location for smart suggestions
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          });
        },
        (error) => {
          console.log('Location access denied or unavailable:', error);
          // Fallback: utiliser les coordonnées de Sidi Bel Abbès
          setUserLocation({
            latitude: 35.1903,
            longitude: -0.6308,
          });
        }
      );
    } else {
      // Fallback si géolocalisation non supportée
      setUserLocation({
        latitude: 35.1903,
        longitude: -0.6308,
      });
    }
  }, []);

  // Fetch providers from Supabase or mock data
  useEffect(() => {
    const fetchProviders = async () => {
      try {
        let providersWithRatings: Provider[] = [];

        if (OFFLINE_MODE) {
          // Mode offline: utiliser les données mock
          const mockProviders = getProviders();
          providersWithRatings = mockProviders.map((p) => ({
            id: p.id,
            user_id: null,
            business_name: p.name,
            provider_type: p.type as any,
            specialty_id: null,
            phone: p.phone,
            email: null,
            address: p.address,
            city: p.city,
            latitude: p.lat,
            longitude: p.lng,
            description: p.description,
            avatar_url: p.image,
            cover_image_url: null,
            website: null,
            verification_status: p.verified ? 'verified' : 'pending',
            is_emergency: p.emergency,
            is_preloaded: p.is_preloaded,
            is_claimed: p.is_claimed,
            accessibility_features: p.accessibility_features,
            home_visit_available: p.home_visit_available,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            specialty: null,
            ratings: [],
            avgRating: p.rating,
            ratingCount: p.reviewsCount,
          }));
        } else {
          const { data, error } = await supabase
            .from("providers")
            .select(`
              *,
              specialty:specialties(*),
              ratings(*)
            `)
            .eq("verification_status", "verified")
            .order("business_name");

          if (error) throw error;

          // Calculate average ratings
          providersWithRatings = (data || []).map((provider) => {
            const ratings = provider.ratings || [];
            const avgRating = ratings.length > 0
              ? ratings.reduce((sum: number, r: Rating) => sum + r.rating, 0) / ratings.length
              : 0;

            return {
              ...provider,
              avgRating: Math.round(avgRating * 10) / 10,
              ratingCount: ratings.length,
            };
          });
        }

        setAllProviders(providersWithRatings);
        setFilteredProviders(providersWithRatings);
      } catch (error) {
        console.error("Error fetching providers:", error);
        // Fallback vers les données mock en cas d'erreur
        const mockProviders = getProviders();
        const fallbackProviders = mockProviders.map((p) => ({
          id: p.id,
          user_id: null,
          business_name: p.name,
          provider_type: p.type as any,
          specialty_id: null,
          phone: p.phone,
          email: null,
          address: p.address,
          city: p.city,
          latitude: p.lat,
          longitude: p.lng,
          description: p.description,
          avatar_url: p.image,
          cover_image_url: null,
          website: null,
          verification_status: p.verified ? 'verified' : 'pending',
          is_emergency: p.emergency,
          is_preloaded: p.is_preloaded,
          is_claimed: p.is_claimed,
          accessibility_features: p.accessibility_features,
          home_visit_available: p.home_visit_available,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          specialty: null,
          ratings: [],
          avgRating: p.rating,
          ratingCount: p.reviewsCount,
        }));
        setAllProviders(fallbackProviders as Provider[]);
        setFilteredProviders(fallbackProviders as Provider[]);
      }
    };

    fetchProviders();
  }, []);

  // Update URL parameters when filters change
  useEffect(() => {
    const params = serializeFilters(filters);
    if (searchQuery) {
      params.set('q', searchQuery);
    }
    setSearchParams(params, { replace: true });
  }, [filters, searchQuery, setSearchParams]);

  // Custom setFilters that preserves URL sync
  const updateFilters = (newFilters: FilterState) => {
    setFilters(newFilters);
  };

  // Custom setSearchQuery that preserves URL sync
  const updateSearchQuery = (query: string) => {
    setSearchQuery(query);
  };

  // Filter and search logic
  useEffect(() => {
    let results = allProviders;

    // Text search
    if (searchQuery) {
      results = results.filter(provider =>
        provider.business_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (provider.specialty?.name_fr || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
        (provider.specialty?.name_ar || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
        (provider.specialty?.name_en || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
        provider.address.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (provider.description || '').toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Category filter (by provider type or specialty)
    if (filters.categories.length > 0) {
      results = results.filter(provider =>
        filters.categories.some(category => 
          provider.provider_type.toLowerCase().includes(category.toLowerCase()) ||
          (provider.specialty?.name_fr || '').toLowerCase().includes(category.toLowerCase()) ||
          (provider.specialty?.name_ar || '').toLowerCase().includes(category.toLowerCase()) ||
          (provider.specialty?.name_en || '').toLowerCase().includes(category.toLowerCase())
        )
      );
    }

    // Rating filter
    if (filters.minRating > 0) {
      results = results.filter(provider => (provider.avgRating || 0) >= filters.minRating);
    }

    // Verified only (already filtered in query, but keep for consistency)
    if (filters.verifiedOnly) {
      results = results.filter(provider => provider.verification_status === 'verified');
    }

    // Emergency services
    if (filters.emergencyServices) {
      results = results.filter(provider => provider.is_emergency);
    }

    // Accessibility features filter (match ANY selected)
    if (filters.accessibility_features.length > 0) {
      results = results.filter(provider => 
        filters.accessibility_features.some(feature => 
          (provider.accessibility_features || []).includes(feature)
        )
      );
    }

    // Home visit availability filter
    if (filters.home_visit_available) {
      results = results.filter(provider => provider.home_visit_available);
    }

    // Location filter
    if (filters.location) {
      results = results.filter(provider =>
        (provider.city || '').toLowerCase().includes(filters.location.toLowerCase()) ||
        provider.address.toLowerCase().includes(filters.location.toLowerCase())
      );
    }

    // Sort results
    switch (sortBy) {
      case 'rating':
        results.sort((a, b) => (b.avgRating || 0) - (a.avgRating || 0));
        break;
      case 'distance':
        // Distance sorting would require geolocation - not implemented yet
        break;
      case 'newest':
        results.sort((a, b) => 
          new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime()
        );
        break;
      default:
        // Keep relevance order (by name)
        break;
    }

    setFilteredProviders(results);
  }, [searchQuery, filters, sortBy, allProviders]);

  return (
    <div className="min-h-screen bg-background">
      {/* Search Interface */}
      <SearchInterface
        searchQuery={searchQuery}
        setSearchQuery={updateSearchQuery}
        showFilters={showFilters}
        setShowFilters={setShowFilters}
        viewMode={viewMode}
        setViewMode={setViewMode}
        sortBy={sortBy}
        setSortBy={setSortBy}
        resultCount={filteredProviders.length}
      />

      <div className="flex">
        {/* Advanced Filters Sidebar */}
        <AdvancedFilters
          filters={filters}
          setFilters={updateFilters}
          showFilters={showFilters}
        />

        {/* Main Content */}
        <div className="flex-1">
          {/* Smart Suggestions */}
          <div className="container mx-auto px-4 py-6">
            <SmartSuggestions
              searchQuery={searchQuery}
              userLocation={userLocation}
            />
          </div>

          {viewMode === 'map' ? (
            <SearchMap providers={filteredProviders} />
          ) : (
            <SearchResults 
              providers={filteredProviders}
              viewMode={viewMode}
              searchQuery={searchQuery}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default SearchPage;
