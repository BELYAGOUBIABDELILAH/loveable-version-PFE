import React, { useState } from 'react';
import { Heart, Phone, Star, MapPin, Clock, Navigation, Calendar, Share2 } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Provider, ViewMode } from '@/pages/SearchPage';
import { Link } from 'react-router-dom';

interface SearchResultsProps {
  providers: Provider[];
  viewMode: ViewMode;
  searchQuery: string;
}

export const SearchResults = ({ providers, viewMode, searchQuery }: SearchResultsProps) => {
  const [favorites, setFavorites] = useState<string[]>([]);
  const [visibleCount, setVisibleCount] = useState(20);

  const toggleFavorite = (providerId: string) => {
    setFavorites(prev =>
      prev.includes(providerId)
        ? prev.filter(id => id !== providerId)
        : [...prev, providerId]
    );
  };

  const loadMore = () => {
    setVisibleCount(prev => prev + 20);
  };

  if (providers.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center min-h-[400px]">
        <div className="text-center max-w-md mx-auto p-8">
          <div className="w-24 h-24 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
            <Heart className="w-12 h-12 text-muted-foreground" />
          </div>
          <h3 className="text-xl font-semibold mb-2">No providers found</h3>
          <p className="text-muted-foreground mb-4">
            We couldn't find any healthcare providers matching your search criteria.
          </p>
          <div className="space-y-2 text-sm text-muted-foreground">
            <p>Try adjusting your filters:</p>
            <ul className="list-disc list-inside text-left">
              <li>Expand your search radius</li>
              <li>Remove some category filters</li>
              <li>Try different keywords</li>
              <li>Check availability settings</li>
            </ul>
          </div>
        </div>
      </div>
    );
  }

  const ProviderCard = ({ provider, isGrid = false }: { provider: Provider; isGrid?: boolean }) => (
    <Card className={`hover:shadow-lg transition-all duration-300 cursor-pointer group ${isGrid ? 'h-full' : ''}`}>
      <CardContent className={`p-4 ${isGrid ? 'h-full flex flex-col' : ''}`}>
        <div className={`${isGrid ? 'flex flex-col h-full' : 'flex gap-4'}`}>
          {/* Provider Image */}
          <div className={`${isGrid ? 'w-full mb-4' : 'w-20 h-20'} flex-shrink-0`}>
            <img
              src={provider.image}
              alt={provider.name}
              className={`${isGrid ? 'w-full h-32' : 'w-20 h-20'} object-cover rounded-lg`}
            />
          </div>

          {/* Provider Info */}
          <div className={`${isGrid ? 'flex-1' : 'flex-1 min-w-0'}`}>
            <div className={`${isGrid ? 'text-center' : 'flex justify-between items-start mb-2'}`}>
              <div className={isGrid ? 'mb-2' : ''}>
                <Link to={`/provider/${provider.id}`} className="hover:text-primary transition-colors">
                  <h3 className="font-semibold text-lg group-hover:text-primary transition-colors line-clamp-1">
                    {provider.name}
                  </h3>
                </Link>
                <p className="text-muted-foreground text-sm">{provider.specialty}</p>
                {provider.verified && (
                  <Badge variant="secondary" className="mt-1">
                    ✅ Verified
                  </Badge>
                )}
              </div>

              {!isGrid && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={(e) => {
                    e.preventDefault();
                    toggleFavorite(provider.id);
                  }}
                  className="text-muted-foreground hover:text-destructive"
                >
                  <Heart
                    size={18}
                    className={favorites.includes(provider.id) ? 'fill-destructive text-destructive' : ''}
                  />
                </Button>
              )}
            </div>

            {/* Rating and Stats */}
            <div className={`flex items-center gap-4 mb-3 ${isGrid ? 'justify-center' : ''}`}>
              <div className="flex items-center gap-1">
                <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                <span className="text-sm font-medium">{provider.rating}</span>
                <span className="text-xs text-muted-foreground">({provider.reviewsCount})</span>
              </div>
              {provider.distance && (
                <div className="flex items-center gap-1 text-sm text-muted-foreground">
                  <MapPin size={14} />
                  <span>{provider.distance}km</span>
                </div>
              )}
            </div>

            {/* Location and Hours */}
            <div className="space-y-2 mb-4">
              <div className={`flex items-start gap-2 text-sm text-muted-foreground ${isGrid ? 'justify-center' : ''}`}>
                <MapPin size={14} className="mt-0.5 flex-shrink-0" />
                <span className={isGrid ? 'text-center' : ''}>{provider.address}</span>
              </div>
              <div className={`flex items-center gap-2 text-sm ${isGrid ? 'justify-center' : ''}`}>
                <Clock size={14} />
                <span className={provider.isOpen ? 'text-green-600' : 'text-destructive'}>
                  {provider.isOpen ? 'Open now' : 'Closed'}
                </span>
              </div>
            </div>

            {/* Price - Note: Pricing not available in CityHealthProvider yet */}

            {/* Action Buttons */}
            <div className={`grid grid-cols-2 gap-2 mt-auto ${isGrid ? 'mt-4' : ''}`}>
              <Button size="sm" variant="outline" onClick={() => window.open(`tel:${provider.phone}`, '_self')}>
                <Phone size={14} className="mr-1" />
                Call
              </Button>
              <Link to={`/provider/${provider.id}`}>
                <Button size="sm" className="w-full">
                  <Calendar size={14} className="mr-1" />
                  Book
                </Button>
              </Link>
            </div>

            {isGrid && (
              <div className="flex justify-between mt-3">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={(e) => {
                    e.preventDefault();
                    toggleFavorite(provider.id);
                  }}
                >
                  <Heart
                    size={16}
                    className={favorites.includes(provider.id) ? 'fill-destructive text-destructive' : ''}
                  />
                </Button>
                <Button variant="ghost" size="sm">
                  <Share2 size={16} />
                </Button>
                <Button variant="ghost" size="sm">
                  <Navigation size={16} />
                </Button>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="flex-1 p-4">
      {/* Results Grid/List */}
      <div className={
        viewMode === 'grid'
          ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4'
          : 'space-y-4'
      }>
        {providers.slice(0, visibleCount).map(provider => (
          <ProviderCard
            key={provider.id}
            provider={provider}
            isGrid={viewMode === 'grid'}
          />
        ))}
      </div>

      {/* Load More Button */}
      {visibleCount < providers.length && (
        <div className="text-center mt-8">
          <Button variant="outline" onClick={loadMore} size="lg">
            Load More Providers ({providers.length - visibleCount} remaining)
          </Button>
        </div>
      )}
    </div>
  );
};