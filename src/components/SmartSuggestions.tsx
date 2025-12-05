import React, { useState, useEffect } from 'react';
import { X, Sparkles, MapPin, TrendingUp } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useNavigate } from 'react-router-dom';
import { getAllProviders } from '@/integrations/firebase/services/providerService';
import { Provider as FirebaseProvider } from '@/integrations/firebase/types';
import { useLanguage } from '@/hooks/useLanguage';
import { OFFLINE_MODE } from '@/config/app';
import { getProviders } from '@/data/providers';

type Provider = FirebaseProvider;

interface SmartSuggestionsProps {
  searchQuery?: string;
  userLocation?: { latitude: number; longitude: number };
  onDismiss?: () => void;
  className?: string;
}

interface Suggestion {
  provider: Provider;
  reason: 'popular' | 'nearby' | 'relevant';
  score: number;
}

export const SmartSuggestions: React.FC<SmartSuggestionsProps> = ({
  searchQuery = '',
  userLocation,
  onDismiss,
  className = '',
}) => {
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [loading, setLoading] = useState(true);
  const [dismissed, setDismissed] = useState(false);
  const navigate = useNavigate();
  const { t } = useLanguage();

  useEffect(() => {
    const fetchSuggestions = async () => {
      const startTime = Date.now();
      setLoading(true);

      try {
        let providers: any[] = [];

        // Mode offline: utiliser les données mock
        if (OFFLINE_MODE) {
          const mockProviders = getProviders();
          providers = mockProviders
            .filter(p => p.verified)
            .slice(0, 50)
            .map(p => ({
              id: p.id,
              business_name: p.name,
              description: p.description,
              provider_type: p.type,
              latitude: p.lat,
              longitude: p.lng,
              address: p.address,
              is_emergency: p.emergency,
              accessibility_features: p.accessibility_features,
              verification_status: 'verified',
              ratings: [{ rating: p.rating }]
            }));
        } else {
          // Fetch verified providers from Firebase
          const firebaseProviders = await getAllProviders();
          providers = firebaseProviders
            .filter(p => p.verificationStatus === 'verified')
            .slice(0, 50)
            .map(p => ({
              id: p.id,
              business_name: p.businessName,
              description: p.description || '',
              provider_type: p.providerType,
              latitude: p.latitude || null,
              longitude: p.longitude || null,
              address: p.address,
              is_emergency: p.isEmergency,
              accessibility_features: p.accessibilityFeatures || [],
              verification_status: p.verificationStatus,
              ratings: []
            }));
        }

        const suggestionsArray: Suggestion[] = [];

        // Calculate suggestions based on different criteria
        (providers || []).forEach((provider) => {
          let score = 0;
          let reason: 'popular' | 'nearby' | 'relevant' = 'popular';

          // Relevance scoring based on search query
          if (searchQuery) {
            const queryLower = searchQuery.toLowerCase();
            const businessName = (provider.business_name || '').toLowerCase();
            const description = (provider.description || '').toLowerCase();
            const providerType = (provider.provider_type || '').toLowerCase();

            if (businessName.includes(queryLower)) {
              score += 10;
              reason = 'relevant';
            }
            if (description.includes(queryLower)) {
              score += 5;
              reason = 'relevant';
            }
            if (providerType.includes(queryLower)) {
              score += 7;
              reason = 'relevant';
            }
          }

          // Popularity scoring based on ratings
          const ratings = (provider.ratings as any[]) || [];
          if (ratings.length > 0) {
            const avgRating = ratings.reduce((sum, r) => sum + r.rating, 0) / ratings.length;
            score += avgRating * 2 + ratings.length * 0.5;
            if (!searchQuery) {
              reason = 'popular';
            }
          }

          // Location proximity scoring
          if (userLocation && provider.latitude && provider.longitude) {
            const distance = calculateDistance(
              userLocation.latitude,
              userLocation.longitude,
              provider.latitude,
              provider.longitude
            );
            // Closer providers get higher scores (inverse distance)
            if (distance < 5) {
              score += 15;
              reason = 'nearby';
            } else if (distance < 10) {
              score += 10;
              reason = 'nearby';
            } else if (distance < 20) {
              score += 5;
            }
          }

          // Emergency services boost
          if (provider.is_emergency) {
            score += 3;
          }

          // Accessibility features boost
          if ((provider.accessibility_features || []).length > 0) {
            score += 2;
          }

          if (score > 0) {
            suggestionsArray.push({ provider, reason, score });
          }
        });

        // Sort by score and take top 6
        suggestionsArray.sort((a, b) => b.score - a.score);
        const topSuggestions = suggestionsArray.slice(0, 6);

        setSuggestions(topSuggestions);

        // Ensure we meet the 2-second performance requirement
        const elapsed = Date.now() - startTime;
        if (elapsed < 2000) {
          // If we're faster than 2 seconds, we're good
          setLoading(false);
        } else {
          // If we're slower, still set loading to false but log a warning
          console.warn(`Smart suggestions took ${elapsed}ms to load`);
          setLoading(false);
        }
      } catch (error) {
        console.error('Error fetching smart suggestions:', error);
        setLoading(false);
      }
    };

    if (!dismissed) {
      fetchSuggestions();
    }
  }, [searchQuery, userLocation, dismissed]);

  // Calculate distance between two coordinates (Haversine formula)
  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
    const R = 6371; // Earth's radius in km
    const dLat = toRad(lat2 - lat1);
    const dLon = toRad(lon2 - lon1);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };

  const toRad = (value: number): number => {
    return (value * Math.PI) / 180;
  };

  const handleDismiss = () => {
    setDismissed(true);
    onDismiss?.();
  };

  const handleProviderClick = (providerId: string) => {
    navigate(`/providers/${providerId}`);
  };

  const getReasonIcon = (reason: 'popular' | 'nearby' | 'relevant') => {
    switch (reason) {
      case 'popular':
        return <TrendingUp className="h-4 w-4" />;
      case 'nearby':
        return <MapPin className="h-4 w-4" />;
      case 'relevant':
        return <Sparkles className="h-4 w-4" />;
    }
  };

  const getReasonText = (reason: 'popular' | 'nearby' | 'relevant') => {
    switch (reason) {
      case 'popular':
        return t('suggestions.popular') || 'Populaire';
      case 'nearby':
        return t('suggestions.nearby') || 'À proximité';
      case 'relevant':
        return t('suggestions.relevant') || 'Pertinent';
    }
  };

  if (dismissed || suggestions.length === 0) {
    return null;
  }

  return (
    <Card className={`relative ${className}`}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Sparkles className="h-5 w-5 text-primary" />
          {t('suggestions.title') || 'Suggestions intelligentes'}
        </CardTitle>
        <Button
          variant="ghost"
          size="icon"
          onClick={handleDismiss}
          className="h-8 w-8"
          aria-label={t('suggestions.dismiss') || 'Masquer les suggestions'}
        >
          <X className="h-4 w-4" />
        </Button>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="animate-pulse">
                <div className="h-24 bg-muted rounded-lg"></div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {suggestions.map(({ provider, reason }) => (
              <div
                key={provider.id}
                onClick={() => handleProviderClick(provider.id)}
                className="p-4 border rounded-lg hover:border-primary hover:shadow-md transition-all cursor-pointer bg-card"
              >
                <div className="flex items-start justify-between mb-2">
                  <h4 className="font-semibold text-sm line-clamp-1">
                    {provider.businessName}
                  </h4>
                  <Badge variant="secondary" className="ml-2 flex items-center gap-1 text-xs">
                    {getReasonIcon(reason)}
                    {getReasonText(reason)}
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground line-clamp-1 mb-1">
                  {provider.providerType}
                </p>
                <p className="text-xs text-muted-foreground line-clamp-2">
                  {provider.address}
                </p>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
