import React, { useState, useEffect } from 'react';
import { MapPin, Phone, Star, Navigation, Calendar, Target } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Provider } from '@/pages/SearchPage';
import { Link } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { MapContainerWrapper, MarkerCluster, GeolocationControl } from '@/components/maps';
import type { ProviderMarkerProps } from '@/components/maps';

interface SearchMapProps {
  providers: Provider[];
}

export const SearchMap = ({ providers }: SearchMapProps) => {
  const { toast } = useToast();
  const [selectedProvider, setSelectedProvider] = useState<Provider | null>(null);
  const [userLocation, setUserLocation] = useState<[number, number] | null>(null);

  // Get user location
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation([position.coords.longitude, position.coords.latitude]);
        },
        () => {
          // Geolocation unavailable
        }
      );
    }
  }, []);

  // Convert providers to marker props
  const markerProviders: ProviderMarkerProps[] = providers
    .filter(p => p.latitude !== null && p.longitude !== null)
    .map(p => ({
      id: p.id,
      business_name: p.business_name,
      provider_type: p.provider_type,
      address: p.address,
      phone: p.phone,
      latitude: p.latitude!,
      longitude: p.longitude!,
      verification_status: p.verification_status,
      is_emergency: p.is_emergency,
      accessibility_features: p.accessibility_features,
      home_visit_available: p.home_visit_available,
    }));

  // Get directions to provider
  const getDirections = (provider: Provider) => {
    if (userLocation && provider.latitude && provider.longitude) {
      const url = `https://www.google.com/maps/dir/?api=1&origin=${userLocation[1]},${userLocation[0]}&destination=${provider.latitude},${provider.longitude}`;
      window.open(url, '_blank');
    } else if (provider.latitude && provider.longitude) {
      const url = `https://www.google.com/maps/dir/?api=1&destination=${provider.latitude},${provider.longitude}`;
      window.open(url, '_blank');
    } else {
      toast({
        title: "Position non disponible",
        description: "Les coordonnées du prestataire ne sont pas disponibles.",
      });
    }
  };

  // Calculate distance from user location
  const calculateDistance = (provider: Provider): number | null => {
    if (!userLocation || !provider.latitude || !provider.longitude) return null;
    
    const R = 6371; // Earth radius in km
    const dLat = (provider.latitude - userLocation[1]) * Math.PI / 180;
    const dLon = (provider.longitude - userLocation[0]) * Math.PI / 180;
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(userLocation[1] * Math.PI / 180) * Math.cos(provider.latitude * Math.PI / 180) *
      Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return Math.round(R * c * 10) / 10;
  };

  const handleMarkerClick = (providerId: string) => {
    const provider = providers.find(p => p.id === providerId);
    if (provider) {
      setSelectedProvider(provider);
    }
  };

  return (
    <div className="flex-1 relative">
      {/* Map Container */}
      <div className="h-screen relative">
        <MapContainerWrapper className="absolute inset-0">
          <GeolocationControl />
          <MarkerCluster 
            providers={markerProviders}
            onMarkerClick={handleMarkerClick}
          />
        </MapContainerWrapper>

        {/* Provider Info Card */}
        {selectedProvider && (
          <div className="absolute z-[1000] w-80 top-4 left-4">
            <Card className="shadow-xl border-2">
              <CardContent className="p-4">
                <div className="flex justify-between items-start mb-3">
                  <div className="flex-1">
                    <h3 className="font-semibold text-lg">{selectedProvider.business_name}</h3>
                    <p className="text-muted-foreground text-sm">
                      {selectedProvider.specialty?.name_fr || selectedProvider.provider_type}
                    </p>
                    {selectedProvider.verification_status === 'verified' && (
                      <Badge variant="secondary" className="mt-1">
                        ✅ Vérifié
                      </Badge>
                    )}
                  </div>
                  <button
                    onClick={() => setSelectedProvider(null)}
                    className="text-muted-foreground hover:text-foreground ml-2"
                  >
                    ✕
                  </button>
                </div>

                <div className="flex items-center gap-1 mb-3">
                  <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                  <span className="text-sm font-medium">{selectedProvider.avgRating?.toFixed(1) || 'N/A'}</span>
                  <span className="text-xs text-muted-foreground">({selectedProvider.ratingCount || 0})</span>
                </div>

                <div className="space-y-2 mb-4">
                  <div className="flex items-start gap-2 text-sm">
                    <MapPin size={14} className="mt-0.5 text-muted-foreground" />
                    <span>{selectedProvider.address}</span>
                  </div>
                  {userLocation && selectedProvider.latitude && selectedProvider.longitude && (
                    <div className="text-sm text-muted-foreground flex items-center gap-1">
                      <Target size={14} />
                      Distance: {calculateDistance(selectedProvider)}km
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-3 gap-2">
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={() => window.open(`tel:${selectedProvider.phone}`, '_self')}
                    title="Appeler"
                  >
                    <Phone size={14} />
                  </Button>
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={() => getDirections(selectedProvider)}
                    title="Itinéraire"
                  >
                    <Navigation size={14} />
                  </Button>
                  <Link to={`/provider/${selectedProvider.id}`}>
                    <Button size="sm" className="w-full" title="Voir profil">
                      <Calendar size={14} />
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Legend */}
        <div className="absolute bottom-4 left-4 z-[1000]">
          <Card className="shadow-lg">
            <CardContent className="p-3">
              <h4 className="font-medium text-sm mb-2">Légende</h4>
              <div className="space-y-1 text-xs">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-[#4285F4] rounded-full"></div>
                  <span>Professionnels vérifiés</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-[#6B7280] rounded-full"></div>
                  <span>Professionnels standards</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-[#DC2626] rounded-full"></div>
                  <span>Urgences 24/7</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};
