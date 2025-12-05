import React, { useState, useEffect } from 'react';
import { Heart, Phone, Star, MapPin, Clock, Calendar, Car, Building, Home, Eye, Hand, ShieldCheck, ExternalLink, Accessibility, UserCheck } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Provider, ViewMode } from '@/pages/SearchPage';
import { Link } from 'react-router-dom';
import { FavoriteButton } from '@/components/FavoriteButton';
import { ProfileClaimForm } from '@/components/ProfileClaimForm';
import { collection, query, where, orderBy, getDocs } from 'firebase/firestore';
import { db } from '@/integrations/firebase/client';
import { COLLECTIONS } from '@/integrations/firebase/types';
import { useAuth } from '@/contexts/AuthContext';

interface SearchResultsProps {
  providers: Provider[];
  viewMode: ViewMode;
  searchQuery?: string;
}

interface MedicalAd {
  id: string;
  provider_id: string;
  title: string;
  content: string;
  image_url: string | null;
  provider?: {
    id: string;
    business_name: string;
    provider_type: string;
    avatar_url: string | null;
  };
}

const getAccessibilityIcon = (feature: string) => {
  switch (feature) {
    case 'wheelchair':
      return <Accessibility className="h-3 w-3" />;
    case 'parking':
      return <Car className="h-3 w-3" />;
    case 'elevator':
      return <Building className="h-3 w-3" />;
    case 'ramp':
      return <Accessibility className="h-3 w-3" />;
    case 'accessible_restroom':
      return <ShieldCheck className="h-3 w-3" />;
    case 'braille':
      return <Eye className="h-3 w-3" />;
    case 'sign_language':
      return <Hand className="h-3 w-3" />;
    default:
      return <ShieldCheck className="h-3 w-3" />;
  }
};

const getAccessibilityLabel = (feature: string) => {
  switch (feature) {
    case 'wheelchair':
      return 'Wheelchair';
    case 'parking':
      return 'Parking';
    case 'elevator':
      return 'Elevator';
    case 'ramp':
      return 'Ramp';
    case 'accessible_restroom':
      return 'Restroom';
    case 'braille':
      return 'Braille';
    case 'sign_language':
      return 'Sign Lang';
    default:
      return feature;
  }
};

export const SearchResults = ({ providers, viewMode, searchQuery }: SearchResultsProps) => {
  const [visibleCount, setVisibleCount] = useState(20);
  const [medicalAds, setMedicalAds] = useState<MedicalAd[]>([]);

  const loadMore = () => {
    setVisibleCount(prev => prev + 20);
  };

  // Fetch approved medical ads for inline display
  const fetchInlineAds = async () => {
    try {
      const adsRef = collection(db, COLLECTIONS.medicalAds);
      const q = query(
        adsRef,
        where('status', '==', 'approved'),
        orderBy('displayPriority', 'desc')
      );
      
      const snapshot = await getDocs(q);
      const today = new Date();
      
      const ads: MedicalAd[] = [];
      for (const docSnap of snapshot.docs) {
        if (ads.length >= 5) break; // Limit to 5 ads
        
        const data = docSnap.data();
        // Handle missing endDate as "no expiration"
        let endDate: Date | null = null;
        if (data.endDate) {
          endDate = data.endDate.toDate ? data.endDate.toDate() : new Date(data.endDate);
        }
        
        // Filter by end date (null means no expiration)
        if (!endDate || endDate >= today) {          ads.push({
            id: docSnap.id,
            provider_id: data.providerId,
            title: data.title,
            content: data.content,
            image_url: data.imageUrl || null,
            provider: undefined // Provider data would need separate fetch
          });
        }
      }

      setMedicalAds(ads);
    } catch (error) {
      console.error('Error fetching inline ads:', error);
    }
  };

  useEffect(() => {
    fetchInlineAds();
  }, []);

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

  const MedicalAdCard = ({ ad, isGrid = false }: { ad: MedicalAd; isGrid?: boolean }) => (
    <Card className={`hover:shadow-lg transition-all duration-300 cursor-pointer group border-2 border-primary/20 bg-primary/5 relative ${isGrid ? 'h-full' : ''}`}>
      <CardContent className={`p-4 ${isGrid ? 'h-full flex flex-col' : ''}`}>
        {/* Ad Badge */}
        <div className="absolute top-2 right-2 z-10">
          <Badge variant="default" className="bg-primary text-primary-foreground">
            Annonce
          </Badge>
        </div>
        
        <div className={`${isGrid ? 'flex flex-col h-full' : 'flex gap-4'}`}>

          {/* Ad Image */}
          {ad.image_url && (
            <div className={`${isGrid ? 'w-full mb-4' : 'w-20 h-20'} flex-shrink-0 relative`}>
              <img
                src={ad.image_url}
                alt={ad.title}
                className={`${isGrid ? 'w-full h-32' : 'w-20 h-20'} object-cover rounded-lg`}
              />
            </div>
          )}

          {/* Ad Content */}
          <div className={`${isGrid ? 'flex-1' : 'flex-1 min-w-0'}`}>
            <div className={`${isGrid ? 'text-center' : 'mb-2'}`}>
              <Link 
                to={`/provider/${ad.provider_id}`} 
                className="hover:text-primary transition-colors"
              >
                <h3 className="font-semibold text-lg group-hover:text-primary transition-colors line-clamp-2">
                  {ad.title}
                </h3>
              </Link>
              <p className="text-muted-foreground text-sm mt-1 line-clamp-2">
                {ad.content.length > 100 ? `${ad.content.substring(0, 100)}...` : ad.content}
              </p>
            </div>

            {/* Provider Info */}
            {ad.provider && (
              <div className={`flex items-center gap-2 mb-3 ${isGrid ? 'justify-center' : ''}`}>
                {ad.provider.avatar_url ? (
                  <img
                    src={ad.provider.avatar_url}
                    alt={ad.provider.business_name}
                    className="w-6 h-6 rounded-full object-cover"
                  />
                ) : (
                  <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center">
                    <span className="text-xs font-medium text-primary">
                      {ad.provider.business_name.charAt(0).toUpperCase()}
                    </span>
                  </div>
                )}
                <div>
                  <p className="font-medium text-sm">{ad.provider.business_name}</p>
                </div>
              </div>
            )}

            {/* Action Button */}
            <div className={`mt-auto ${isGrid ? 'mt-4' : ''}`}>
              <Link to={`/provider/${ad.provider_id}`}>
                <Button size="sm" className="w-full">
                  <ExternalLink size={14} className="mr-1" />
                  Voir le profil
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  const ProviderCard = ({ provider, isGrid = false }: { provider: Provider; isGrid?: boolean }) => (
    <Card className={`hover:shadow-lg transition-all duration-300 cursor-pointer group ${isGrid ? 'h-full' : ''}`}>
      <CardContent className={`p-4 ${isGrid ? 'h-full flex flex-col' : ''}`}>
        <div className={`${isGrid ? 'flex flex-col h-full' : 'flex gap-4'}`}>
          {/* Provider Image */}
          <div className={`${isGrid ? 'w-full mb-4' : 'w-20 h-20'} flex-shrink-0`}>
            {provider.avatar_url ? (
              <img
                src={provider.avatar_url}
                alt={provider.business_name}
                className={`${isGrid ? 'w-full h-32' : 'w-20 h-20'} object-cover rounded-lg`}
              />
            ) : (
              <div className={`${isGrid ? 'w-full h-32' : 'w-20 h-20'} bg-primary/10 rounded-lg flex items-center justify-center`}>
                <span className="text-2xl font-bold text-primary">
                  {provider.business_name.charAt(0).toUpperCase()}
                </span>
              </div>
            )}
          </div>

          {/* Provider Info */}
          <div className={`${isGrid ? 'flex-1' : 'flex-1 min-w-0'}`}>
            <div className={`${isGrid ? 'text-center' : 'flex justify-between items-start mb-2'}`}>
              <div className={isGrid ? 'mb-2' : ''}>
                <Link to={`/provider/${provider.id}`} className="hover:text-primary transition-colors">
                  <h3 className="font-semibold text-lg group-hover:text-primary transition-colors line-clamp-1">
                    {provider.business_name}
                  </h3>
                </Link>
                <p className="text-muted-foreground text-sm">
                  {provider.specialty?.name_fr || provider.provider_type}
                </p>
                {provider.verification_status === 'verified' && (
                  <Badge variant="secondary" className="mt-1">
                    ✅ Verified
                  </Badge>
                )}
                {provider.is_emergency && (
                  <Badge variant="destructive" className="mt-1 ml-1">
                    24/7
                  </Badge>
                )}
              </div>

              {!isGrid && (
                <FavoriteButton
                  providerId={provider.id}
                  variant="ghost"
                  size="sm"
                />
              )}
            </div>

            {/* Rating and Stats */}
            <div className={`flex items-center gap-4 mb-3 ${isGrid ? 'justify-center' : ''}`}>
              <div className="flex items-center gap-1">
                <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                <span className="text-sm font-medium">{provider.avgRating?.toFixed(1) || 'N/A'}</span>
                <span className="text-xs text-muted-foreground">({provider.ratingCount || 0})</span>
              </div>
            </div>

            {/* Location */}
            <div className="space-y-2 mb-4">
              <div className={`flex items-start gap-2 text-sm text-muted-foreground ${isGrid ? 'justify-center' : ''}`}>
                <MapPin size={14} className="mt-0.5 flex-shrink-0" />
                <span className={isGrid ? 'text-center' : ''}>{provider.address}{provider.city && `, ${provider.city}`}</span>
              </div>
            </div>

            {/* Accessibility Features */}
            {((provider.accessibility_features && provider.accessibility_features.length > 0) || provider.home_visit_available) && (
              <div className={`mb-3 ${isGrid ? 'text-center' : ''}`}>
                <div className={`flex flex-wrap gap-1 ${isGrid ? 'justify-center' : ''}`}>
                  {provider.accessibility_features?.slice(0, 3).map((feature) => (
                    <Badge key={feature} variant="outline" className="text-xs px-1 py-0 h-5 flex items-center gap-1">
                      {getAccessibilityIcon(feature)}
                      <span className="hidden sm:inline">{getAccessibilityLabel(feature)}</span>
                    </Badge>
                  ))}
                  {provider.accessibility_features && provider.accessibility_features.length > 3 && (
                    <Badge variant="outline" className="text-xs px-1 py-0 h-5">
                      +{provider.accessibility_features.length - 3}
                    </Badge>
                  )}
                  {provider.home_visit_available && (
                    <Badge variant="outline" className="text-xs px-1 py-0 h-5 flex items-center gap-1">
                      <Home className="h-3 w-3" />
                      <span className="hidden sm:inline">Home Visit</span>
                    </Badge>
                  )}
                </div>
              </div>
            )}

            {/* Price - Note: Pricing not available in CityHealthProvider yet */}

            {/* Action Buttons */}
            <ClaimableProviderActions provider={provider} isGrid={isGrid} />
          </div>
        </div>
      </CardContent>
    </Card>
  );

  const ClaimableProviderActions = ({ provider, isGrid }: { provider: Provider; isGrid: boolean }) => {
    const { user } = useAuth();
    const [showClaimForm, setShowClaimForm] = useState(false);
    
    // Show claim button if:
    // 1. Provider is preloaded AND not claimed
    // 2. User is authenticated AND has provider role
    const canClaim = provider.is_preloaded && !provider.is_claimed && user?.role === 'provider';

    if (canClaim) {
      return (
        <>
          <div className={`space-y-2 mt-auto ${isGrid ? 'mt-4' : ''}`}>
            <Button 
              size="sm" 
              variant="default" 
              className="w-full bg-primary hover:bg-primary/90"
              onClick={() => setShowClaimForm(true)}
            >
              <UserCheck size={14} className="mr-1" />
              Revendiquer ce profil
            </Button>
            <div className="grid grid-cols-2 gap-2">
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
          </div>
          
          <ProfileClaimForm
            isOpen={showClaimForm}
            onClose={() => setShowClaimForm(false)}
            providerId={provider.id}
            providerName={provider.business_name}
          />
        </>
      );
    }

    return (
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
    );
  };



  return (
    <div className="flex-1 p-4">
      {/* Results Grid/List */}
      <div className={
        viewMode === 'grid'
          ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4'
          : 'space-y-4'
      }>
        {(() => {
          const visibleProviders = providers.slice(0, visibleCount);
          const results: React.ReactNode[] = [];
          let adIndex = 0;

          visibleProviders.forEach((provider, index) => {
            // Add provider card
            results.push(
              <ProviderCard
                key={provider.id}
                provider={provider}
                isGrid={viewMode === 'grid'}
              />
            );

            // Insert ad every 7 results (after positions 6, 13, 20, etc.)
            if ((index + 1) % 7 === 0 && adIndex < medicalAds.length) {
              results.push(
                <MedicalAdCard
                  key={`ad-${medicalAds[adIndex].id}`}
                  ad={medicalAds[adIndex]}
                  isGrid={viewMode === 'grid'}
                />
              );
              adIndex++;
            }
          });

          return results;
        })()}
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