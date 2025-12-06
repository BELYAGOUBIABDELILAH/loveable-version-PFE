import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { MapPin, Navigation, Filter, Phone, Star, Clock, Search, X, CheckCircle, Ambulance, Accessibility, Home } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { useScrollReveal } from '@/hooks/useScrollReveal';
import { useToastNotifications } from '@/hooks/useToastNotifications';
import ToastContainer from '@/components/ToastContainer';
import { MapContainerWrapper, MarkerCluster, GeolocationControl } from '@/components/maps';
import type { ProviderMarkerProps } from '@/components/maps';
import { useQuery } from '@tanstack/react-query';
import { getAllProviders } from '@/integrations/firebase/services/providerService';
import type { Provider } from '@/integrations/firebase/types';
import SkeletonCard from '@/components/SkeletonCard';

// Filter state interface matching SearchPage
interface MapFilterState {
  category: string;
  searchQuery: string;
  verifiedOnly: boolean;
  emergencyServices: boolean;
  accessibilityFeatures: string[];
  homeVisitAvailable: boolean;
}

// Serialize filters to URL params
const serializeFilters = (filters: MapFilterState): URLSearchParams => {
  const params = new URLSearchParams();
  
  if (filters.category) {
    params.set('category', filters.category);
  }
  if (filters.searchQuery) {
    params.set('q', filters.searchQuery);
  }
  if (filters.verifiedOnly) {
    params.set('verifiedOnly', 'true');
  }
  if (filters.emergencyServices) {
    params.set('emergencyServices', 'true');
  }
  if (filters.accessibilityFeatures.length > 0) {
    params.set('accessibilityFeatures', filters.accessibilityFeatures.join(','));
  }
  if (filters.homeVisitAvailable) {
    params.set('homeVisitAvailable', 'true');
  }
  
  return params;
};

// Deserialize URL params to filter state
const deserializeFilters = (searchParams: URLSearchParams): MapFilterState => {
  return {
    category: searchParams.get('category') || '',
    searchQuery: searchParams.get('q') || '',
    verifiedOnly: searchParams.get('verifiedOnly') === 'true',
    emergencyServices: searchParams.get('emergencyServices') === 'true',
    accessibilityFeatures: searchParams.get('accessibilityFeatures')?.split(',').filter(s => s.length > 0) || [],
    homeVisitAvailable: searchParams.get('homeVisitAvailable') === 'true',
  };
};

const MapPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [selectedProvider, setSelectedProvider] = useState<Provider | null>(null);
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);

  // Initialize filters from URL params
  const [filters, setFilters] = useState<MapFilterState>(() => deserializeFilters(searchParams));

  const mapRef = useScrollReveal();
  const { toasts, addToast } = useToastNotifications();

  // Sync filters to URL params
  useEffect(() => {
    const params = serializeFilters(filters);
    setSearchParams(params, { replace: true });
  }, [filters, setSearchParams]);

  // Update individual filter values
  const updateFilter = <K extends keyof MapFilterState>(key: K, value: MapFilterState[K]) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  // Clear all filters
  const clearFilters = () => {
    setFilters({
      category: '',
      searchQuery: '',
      verifiedOnly: false,
      emergencyServices: false,
      accessibilityFeatures: [],
      homeVisitAvailable: false,
    });
  };

  // Check if any filters are active
  const hasActiveFilters = filters.category || filters.searchQuery || 
    filters.verifiedOnly || filters.emergencyServices || 
    filters.accessibilityFeatures.length > 0 || filters.homeVisitAvailable;

  // Fetch providers from Firestore using TanStack Query
  const { 
    data: providers = [], 
    isLoading, 
    error,
    refetch 
  } = useQuery({
    queryKey: ['providers-map'],
    queryFn: getAllProviders,
    staleTime: 1000 * 60 * 5, // 5 minutes
    refetchOnWindowFocus: false,
  });

  // Get user location
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          });
        },
        () => {
          // Geolocation unavailable, using default center
        }
      );
    }
  }, []);


  const categories = [
    { value: '', label: 'Tous' },
    { value: 'doctor', label: 'Médecins' },
    { value: 'clinic', label: 'Cliniques' },
    { value: 'hospital', label: 'Hôpitaux' },
    { value: 'pharmacy', label: 'Pharmacies' },
    { value: 'laboratory', label: 'Laboratoires' }
  ];

  const getCategoryDisplayName = (type: string) => {
    const category = categories.find(c => c.value === type);
    return category?.label || type;
  };

  const handleProviderSelect = (provider: Provider) => {
    setSelectedProvider(provider);
    addToast({
      type: 'info',
      title: 'Prestataire sélectionné',
      message: `${provider.businessName} - ${provider.address}`
    });
  };

  const handleGetDirections = (provider: Provider) => {
    if (provider.latitude && provider.longitude) {
      const url = userLocation
        ? `https://www.google.com/maps/dir/?api=1&origin=${userLocation.lat},${userLocation.lng}&destination=${provider.latitude},${provider.longitude}`
        : `https://www.google.com/maps/dir/?api=1&destination=${provider.latitude},${provider.longitude}`;
      window.open(url, '_blank');
      addToast({
        type: 'success',
        title: 'Itinéraire',
        message: `Ouverture de l'itinéraire vers ${provider.businessName}`
      });
    } else {
      addToast({
        type: 'error',
        title: 'Erreur',
        message: 'Coordonnées manquantes pour ce prestataire'
      });
    }
  };
  // Accessibility features options
  const accessibilityOptions = [
    { value: 'wheelchair', label: 'Accès fauteuil roulant' },
    { value: 'elevator', label: 'Ascenseur' },
    { value: 'parking', label: 'Parking accessible' },
    { value: 'braille', label: 'Signalétique braille' },
  ];

  // Toggle accessibility feature
  const toggleAccessibilityFeature = (feature: string) => {
    const current = filters.accessibilityFeatures;
    if (current.includes(feature)) {
      updateFilter('accessibilityFeatures', current.filter(f => f !== feature));
    } else {
      updateFilter('accessibilityFeatures', [...current, feature]);
    }
  };

  // Filter providers based on all filter criteria
  const filteredProviders = providers.filter(provider => {
    // Category filter
    const matchesCategory = !filters.category || provider.providerType === filters.category;
    
    // Search query filter
    const matchesSearch = !filters.searchQuery || 
      provider.businessName.toLowerCase().includes(filters.searchQuery.toLowerCase()) ||
      (provider.address && provider.address.toLowerCase().includes(filters.searchQuery.toLowerCase()));
    
    // Verified only filter
    const matchesVerified = !filters.verifiedOnly || provider.verificationStatus === 'verified';
    
    // Emergency services filter
    const matchesEmergency = !filters.emergencyServices || provider.isEmergency;
    
    // Accessibility features filter (match ANY selected)
    const matchesAccessibility = filters.accessibilityFeatures.length === 0 ||
      filters.accessibilityFeatures.some(feature => 
        (provider.accessibilityFeatures || []).includes(feature)
      );
    
    // Home visit filter
    const matchesHomeVisit = !filters.homeVisitAvailable || provider.homeVisitAvailable;
    
    // Only include providers with valid coordinates
    const hasCoordinates = provider.latitude && provider.longitude;
    
    return matchesCategory && matchesSearch && matchesVerified && 
           matchesEmergency && matchesAccessibility && matchesHomeVisit && hasCoordinates;
  });

  // Convert to marker props for the map
  const markerProviders: ProviderMarkerProps[] = filteredProviders.map(p => ({
    id: p.id,
    business_name: p.businessName,
    provider_type: p.providerType,
    address: p.address,
    phone: p.phone,
    latitude: p.latitude!,
    longitude: p.longitude!,
    verification_status: p.verificationStatus,
    is_emergency: p.isEmergency,
  }));

  const handleMarkerClick = (providerId: string) => {
    const provider = providers.find(p => p.id === providerId);
    if (provider) {
      handleProviderSelect(provider);
    }
  };


  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-secondary/5">
      <ToastContainer toasts={toasts} />
      
      {/* Header */}
      <div className="glass-panel sticky top-20 z-30 p-6 m-6 rounded-lg">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-3xl font-bold mb-6 flex items-center gap-3">
            <MapPin className="text-primary" size={32} />
            Carte Interactive des Prestataires
          </h1>
          
          {/* Filters */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Rechercher</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" size={18} />
                <Input
                  placeholder="Nom ou adresse..."
                  value={filters.searchQuery}
                  onChange={(e) => updateFilter('searchQuery', e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Catégorie</label>
              <Select value={filters.category} onValueChange={(value) => updateFilter('category', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Choisir une catégorie" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((category) => (
                    <SelectItem key={category.value} value={category.value}>
                      {category.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="flex items-end gap-2">
              <Button 
                variant={showAdvancedFilters ? "secondary" : "outline"}
                onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
                className="flex-1"
              >
                <Filter className="mr-2" size={18} />
                Filtres
              </Button>
              {hasActiveFilters && (
                <Button variant="ghost" size="icon" onClick={clearFilters} title="Effacer les filtres">
                  <X size={18} />
                </Button>
              )}
            </div>
            
            <div className="flex items-end">
              <Button className="w-full" disabled={isLoading}>
                {isLoading ? 'Chargement...' : `${filteredProviders.length} prestataire(s)`}
              </Button>
            </div>
          </div>

          {/* Advanced Filters Panel */}
          {showAdvancedFilters && (
            <div className="mt-4 p-4 bg-muted/50 rounded-lg space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                {/* Verified Only */}
                <div className="flex items-center space-x-2">
                  <Switch
                    id="verifiedOnly"
                    checked={filters.verifiedOnly}
                    onCheckedChange={(checked) => updateFilter('verifiedOnly', checked)}
                  />
                  <Label htmlFor="verifiedOnly" className="flex items-center gap-2 cursor-pointer">
                    <CheckCircle size={16} className="text-primary" />
                    Vérifiés uniquement
                  </Label>
                </div>

                {/* Emergency Services */}
                <div className="flex items-center space-x-2">
                  <Switch
                    id="emergencyServices"
                    checked={filters.emergencyServices}
                    onCheckedChange={(checked) => updateFilter('emergencyServices', checked)}
                  />
                  <Label htmlFor="emergencyServices" className="flex items-center gap-2 cursor-pointer">
                    <Ambulance size={16} className="text-red-500" />
                    Services d'urgence
                  </Label>
                </div>

                {/* Home Visit */}
                <div className="flex items-center space-x-2">
                  <Switch
                    id="homeVisitAvailable"
                    checked={filters.homeVisitAvailable}
                    onCheckedChange={(checked) => updateFilter('homeVisitAvailable', checked)}
                  />
                  <Label htmlFor="homeVisitAvailable" className="flex items-center gap-2 cursor-pointer">
                    <Home size={16} className="text-green-500" />
                    Visite à domicile
                  </Label>
                </div>
              </div>

              {/* Accessibility Features */}
              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <Accessibility size={16} className="text-blue-500" />
                  Accessibilité
                </Label>
                <div className="flex flex-wrap gap-2">
                  {accessibilityOptions.map((option) => (
                    <Badge
                      key={option.value}
                      variant={filters.accessibilityFeatures.includes(option.value) ? "default" : "outline"}
                      className="cursor-pointer"
                      onClick={() => toggleAccessibilityFeature(option.value)}
                    >
                      {option.label}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 pb-8">
        {error ? (
          <Card className="glass-card">
            <CardContent className="p-12 text-center">
              <MapPin className="mx-auto mb-4 text-destructive" size={64} />
              <h3 className="text-2xl font-semibold mb-4">Erreur de chargement</h3>
              <p className="text-muted-foreground mb-6">
                {error instanceof Error ? error.message : 'Impossible de charger les prestataires.'}
              </p>
              <Button onClick={() => refetch()}>
                Réessayer
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Map Section */}
            <div className="lg:col-span-2">
              <Card ref={mapRef} className="glass-card h-[600px] relative overflow-hidden">
                <CardContent className="p-0 h-full">
                  <MapContainerWrapper className="h-full w-full">
                    <GeolocationControl />
                    <MarkerCluster 
                      providers={markerProviders}
                      onMarkerClick={handleMarkerClick}
                    />
                  </MapContainerWrapper>
                  
                  {/* Legend */}
                  <div className="absolute bottom-4 left-4 z-[1000] glass-panel p-3 rounded-lg">
                    <h4 className="font-medium mb-2">Légende</h4>
                    <div className="space-y-1 text-sm">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 bg-[#4285F4] rounded-full"></div>
                        <span>Vérifiés</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 bg-[#DC2626] rounded-full"></div>
                        <span>Urgences</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 bg-[#6B7280] rounded-full"></div>
                        <span>Standards</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>


            {/* Provider List */}
            <div className="space-y-4">
              <h2 className="text-xl font-semibold">
                Prestataires ({isLoading ? '...' : filteredProviders.length})
              </h2>
              
              <div className="space-y-3 max-h-[600px] overflow-y-auto">
                {isLoading ? (
                  Array.from({ length: 4 }).map((_, index) => (
                    <SkeletonCard key={index} />
                  ))
                ) : filteredProviders.length === 0 ? (
                  <Card className="glass-card">
                    <CardContent className="p-6 text-center">
                      <MapPin className="mx-auto mb-2 text-muted-foreground" size={32} />
                      <p className="text-muted-foreground">
                        Aucun prestataire trouvé avec ces critères.
                      </p>
                    </CardContent>
                  </Card>
                ) : (
                  filteredProviders.map((provider, index) => (
                    <Card 
                      key={provider.id} 
                      className={`glass-card cursor-pointer transition-all duration-300 hover-lift animate-scale-in ${
                        selectedProvider?.id === provider.id ? 'ring-2 ring-primary' : ''
                      }`}
                      style={{ animationDelay: `${index * 0.1}s` }}
                      onClick={() => handleProviderSelect(provider)}
                    >
                      <CardContent className="p-4">
                        <div className="flex justify-between items-start mb-3">
                          <div className="flex-1">
                            <h3 className="font-semibold text-sm line-clamp-2">{provider.businessName}</h3>
                            <p className="text-xs text-muted-foreground">
                              {getCategoryDisplayName(provider.providerType)}
                            </p>
                          </div>
                          <div className="flex items-center gap-1">
                            <Badge 
                              variant={provider.verificationStatus === 'verified' ? 'default' : 'secondary'} 
                              className="text-xs"
                            >
                              {provider.verificationStatus === 'verified' ? '✓ Vérifié' : 'En attente'}
                            </Badge>
                          </div>
                        </div>
                        
                        <div className="space-y-2 text-xs">
                          <div className="flex items-center gap-2">
                            <MapPin size={14} className="text-muted-foreground flex-shrink-0" />
                            <span className="line-clamp-1">{provider.address}</span>
                          </div>
                          
                          <div className="flex items-center gap-2">
                            <Phone size={14} className="text-muted-foreground flex-shrink-0" />
                            <span>{provider.phone}</span>
                          </div>
                          
                          {provider.isEmergency && (
                            <div className="flex items-center gap-2">
                              <Clock size={14} className="text-red-500 flex-shrink-0" />
                              <span className="text-red-500">Service d'urgence</span>
                            </div>
                          )}
                          
                          <div className="flex items-center justify-end">
                            <Button 
                              size="sm" 
                              variant="outline" 
                              onClick={(e) => {
                                e.stopPropagation();
                                handleGetDirections(provider);
                              }}
                              className="h-6 px-2 text-xs"
                            >
                              <Navigation size={12} className="mr-1" />
                              Itinéraire
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                )}
              </div>
            </div>
          </div>
        )}


        {/* Selected Provider Details */}
        {selectedProvider && (
          <Card className="mt-6 glass-card animate-scale-in">
            <CardContent className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-2xl font-bold mb-2">{selectedProvider.businessName}</h3>
                  <div className="flex gap-2 mb-4">
                    <Badge>{getCategoryDisplayName(selectedProvider.providerType)}</Badge>
                    {selectedProvider.verificationStatus === 'verified' && (
                      <Badge variant="secondary">✓ Vérifié</Badge>
                    )}
                    {selectedProvider.isEmergency && (
                      <Badge variant="destructive">Urgences</Badge>
                    )}
                  </div>
                  
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <MapPin className="text-primary flex-shrink-0" size={20} />
                      <span>{selectedProvider.address}</span>
                    </div>
                    
                    <div className="flex items-center gap-3">
                      <Phone className="text-primary flex-shrink-0" size={20} />
                      <span>{selectedProvider.phone}</span>
                    </div>
                    
                    {selectedProvider.description && (
                      <p className="text-muted-foreground text-sm mt-4">
                        {selectedProvider.description}
                      </p>
                    )}
                  </div>
                </div>
                
                <div className="flex flex-col justify-end">
                  <div className="flex gap-3">
                    <Button 
                      className="flex-1"
                      onClick={() => handleGetDirections(selectedProvider)}
                    >
                      <Navigation className="mr-2" size={18} />
                      Itinéraire
                    </Button>
                    <Button 
                      variant="outline" 
                      className="flex-1"
                      onClick={() => window.open(`tel:${selectedProvider.phone}`, '_self')}
                    >
                      <Phone className="mr-2" size={18} />
                      Appeler
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default MapPage;
