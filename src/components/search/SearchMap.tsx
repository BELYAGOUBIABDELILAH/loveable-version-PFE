import React, { useState } from 'react';
import { MapPin, Phone, Star, Navigation, Calendar } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Provider } from '@/pages/SearchPage';
import { Link } from 'react-router-dom';
import MapPlaceholder from '@/components/MapPlaceholder';

interface SearchMapProps {
  providers: Provider[];
}

export const SearchMap = ({ providers }: SearchMapProps) => {
  const [selectedProvider, setSelectedProvider] = useState<Provider | null>(null);
  const [hoveredProvider, setHoveredProvider] = useState<string | null>(null);

  const handleMarkerClick = (provider: Provider) => {
    setSelectedProvider(provider);
  };

  const closeInfoWindow = () => {
    setSelectedProvider(null);
  };

  return (
    <div className="flex-1 relative">
      {/* Map Container */}
      <div className="h-screen relative">
        <MapPlaceholder 
          height="100%" 
          label="Interactive Map with Healthcare Providers"
        />
        
        {/* Simulated Markers */}
        <div className="absolute inset-0 overflow-hidden">
          {providers.slice(0, 20).map((provider, index) => (
            <button
              key={provider.id}
              className={`absolute w-8 h-8 rounded-full border-2 border-white shadow-lg transition-all transform hover:scale-110 cursor-pointer z-10 ${
                provider.verified ? 'bg-primary' : 'bg-secondary'
              } ${hoveredProvider === provider.id ? 'scale-110 z-20' : ''}`}
              style={{
                left: `${20 + (index % 10) * 8}%`,
                top: `${20 + Math.floor(index / 10) * 15}%`,
              }}
              onMouseEnter={() => setHoveredProvider(provider.id)}
              onMouseLeave={() => setHoveredProvider(null)}
              onClick={() => handleMarkerClick(provider)}
              title={provider.name}
            >
              <MapPin className="w-4 h-4 text-white m-auto" />
            </button>
          ))}
        </div>

        {/* Info Window */}
        {selectedProvider && (
          <div 
            className="absolute z-30 w-80"
            style={{
              left: '50%',
              top: '30%',
              transform: 'translateX(-50%)',
            }}
          >
            <Card className="shadow-xl border-2">
              <CardContent className="p-4">
                <div className="flex justify-between items-start mb-3">
                  <div className="flex-1">
                    <h3 className="font-semibold text-lg">{selectedProvider.name}</h3>
                    <p className="text-muted-foreground text-sm">{selectedProvider.specialty}</p>
                    {selectedProvider.verified && (
                      <Badge variant="secondary" className="mt-1">
                        ✅ Verified
                      </Badge>
                    )}
                  </div>
                  <button
                    onClick={closeInfoWindow}
                    className="text-muted-foreground hover:text-foreground ml-2"
                  >
                    ✕
                  </button>
                </div>

                <div className="flex items-center gap-1 mb-3">
                  <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                  <span className="text-sm font-medium">{selectedProvider.rating}</span>
                  <span className="text-xs text-muted-foreground">({selectedProvider.reviewsCount})</span>
                </div>

                <div className="space-y-2 mb-4">
                  <div className="flex items-start gap-2 text-sm">
                    <MapPin size={14} className="mt-0.5 text-muted-foreground" />
                    <span>{selectedProvider.address}</span>
                  </div>
                  {selectedProvider.distance && (
                    <div className="text-sm text-muted-foreground">
                      Distance: {selectedProvider.distance}km away
                    </div>
                  )}
                </div>

                {/* Price info - Note: Pricing not available in CityHealthProvider yet */}

                <div className="grid grid-cols-3 gap-2">
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={() => window.open(`tel:${selectedProvider.phone}`, '_self')}
                  >
                    <Phone size={14} />
                  </Button>
                  <Button size="sm" variant="outline">
                    <Navigation size={14} />
                  </Button>
                  <Link to={`/provider/${selectedProvider.id}`}>
                    <Button size="sm" className="w-full">
                      <Calendar size={14} />
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Map Controls */}
        <div className="absolute top-4 right-4 z-20">
          <div className="bg-background rounded-lg shadow-lg p-2 space-y-2">
            <Button size="sm" variant="outline" className="w-full">
              My Location
            </Button>
            <Button size="sm" variant="outline" className="w-full">
              Zoom In
            </Button>
            <Button size="sm" variant="outline" className="w-full">
              Zoom Out
            </Button>
          </div>
        </div>

        {/* Legend */}
        <div className="absolute bottom-4 left-4 z-20">
          <Card className="shadow-lg">
            <CardContent className="p-3">
              <h4 className="font-medium text-sm mb-2">Map Legend</h4>
              <div className="space-y-1 text-xs">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-primary rounded-full"></div>
                  <span>Verified Providers</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-secondary rounded-full"></div>
                  <span>Standard Providers</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};