import React, { useState, useEffect } from 'react';
import { Search, MapPin, Phone, Star, ChevronLeft, ChevronRight, Loader2, Filter } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useLanguage } from '@/contexts/LanguageContext';
import AnimatedTransition from '@/components/AnimatedTransition';
import { supabase } from '@/integrations/supabase/client';
import { Tables } from '@/integrations/supabase/types';
import { useNavigate } from 'react-router-dom';
import { FavoriteButton } from '@/components/FavoriteButton';
import { OFFLINE_MODE } from '@/config/app';
import { getProviders } from '@/data/providers';

type Provider = Tables<"providers">;

const ITEMS_PER_PAGE = 12;

const ProvidersPage = () => {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [providers, setProviders] = useState<Provider[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  const [filterVerified, setFilterVerified] = useState<string>('all');

  // Fetch providers with pagination and filters
  useEffect(() => {
    fetchProviders();
  }, [currentPage, searchQuery, filterType, filterVerified]);

  const fetchProviders = async () => {
    try {
      setLoading(true);

      if (OFFLINE_MODE) {
        // Mode offline: utiliser les données mock
        let mockData = getProviders().map(p => ({
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
        }));

        // Apply search filter
        if (searchQuery.trim()) {
          const query = searchQuery.toLowerCase();
          mockData = mockData.filter(p =>
            p.business_name.toLowerCase().includes(query) ||
            p.address.toLowerCase().includes(query) ||
            (p.city || '').toLowerCase().includes(query)
          );
        }

        // Apply type filter
        if (filterType !== 'all') {
          mockData = mockData.filter(p => p.provider_type === filterType);
        }

        // Apply verification filter
        if (filterVerified === 'verified') {
          mockData = mockData.filter(p => p.verification_status === 'verified');
        }

        // Apply pagination
        const from = (currentPage - 1) * ITEMS_PER_PAGE;
        const paginatedData = mockData.slice(from, from + ITEMS_PER_PAGE);

        setProviders(paginatedData as Provider[]);
        setTotalCount(mockData.length);
        setLoading(false);
        return;
      }

      // Build query for Supabase
      let query = supabase
        .from('providers')
        .select('*', { count: 'exact' });

      // Apply search filter
      if (searchQuery.trim()) {
        query = query.or(`business_name.ilike.%${searchQuery}%,address.ilike.%${searchQuery}%,city.ilike.%${searchQuery}%`);
      }

      // Apply type filter
      if (filterType !== 'all') {
        query = query.eq('provider_type', filterType as any);
      }

      // Apply verification filter
      if (filterVerified === 'verified') {
        query = query.eq('verification_status', 'verified');
      }

      // Apply pagination
      const from = (currentPage - 1) * ITEMS_PER_PAGE;
      const to = from + ITEMS_PER_PAGE - 1;
      query = query.range(from, to);

      // Order by created_at descending
      query = query.order('created_at', { ascending: false });

      const { data, error, count } = await query;

      if (error) throw error;

      setProviders(data || []);
      setTotalCount(count || 0);
    } catch (error) {
      console.error('Error fetching providers:', error);
      // Fallback vers les données mock
      const mockData = getProviders().map(p => ({
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
      }));
      setProviders(mockData.slice(0, ITEMS_PER_PAGE) as Provider[]);
      setTotalCount(mockData.length);
    } finally {
      setLoading(false);
    }
  };

  const totalPages = Math.ceil(totalCount / ITEMS_PER_PAGE);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentPage(1); // Reset to first page on new search
  };

  const getProviderTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      doctor: 'Médecin',
      clinic: 'Clinique',
      hospital: 'Hôpital',
      pharmacy: 'Pharmacie',
      laboratory: 'Laboratoire',
    };
    return labels[type] || type;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/20 to-secondary/10 pt-20">
      <div className="container mx-auto px-4 py-8">
        <AnimatedTransition show={true} animation="fade">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold mb-2">Annuaire des Prestataires</h1>
            <p className="text-muted-foreground">
              Découvrez tous les professionnels de santé à Sidi Bel Abbès
            </p>
          </div>

          {/* Search and Filters */}
          <Card className="glass-card mb-8">
            <CardContent className="p-6">
              <form onSubmit={handleSearch} className="space-y-4">
                <div className="flex gap-4 flex-col md:flex-row">
                  <div className="flex-1 relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                    <Input
                      placeholder="Rechercher par nom, adresse ou ville..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                  <Button type="submit" className="md:w-auto">
                    <Search className="h-4 w-4 mr-2" />
                    Rechercher
                  </Button>
                </div>

                <div className="flex gap-4 flex-col md:flex-row">
                  <Select value={filterType} onValueChange={setFilterType}>
                    <SelectTrigger className="md:w-[200px]">
                      <SelectValue placeholder="Type de prestataire" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Tous les types</SelectItem>
                      <SelectItem value="doctor">Médecin</SelectItem>
                      <SelectItem value="clinic">Clinique</SelectItem>
                      <SelectItem value="hospital">Hôpital</SelectItem>
                      <SelectItem value="pharmacy">Pharmacie</SelectItem>
                      <SelectItem value="laboratory">Laboratoire</SelectItem>
                    </SelectContent>
                  </Select>

                  <Select value={filterVerified} onValueChange={setFilterVerified}>
                    <SelectTrigger className="md:w-[200px]">
                      <SelectValue placeholder="Statut de vérification" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Tous</SelectItem>
                      <SelectItem value="verified">Vérifiés uniquement</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </form>
            </CardContent>
          </Card>

          {/* Results Count */}
          <div className="mb-4 text-sm text-muted-foreground">
            {loading ? (
              'Chargement...'
            ) : (
              `${totalCount} prestataire${totalCount !== 1 ? 's' : ''} trouvé${totalCount !== 1 ? 's' : ''}`
            )}
          </div>

          {/* Providers Grid */}
          {loading ? (
            <div className="flex items-center justify-center min-h-[400px]">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : providers.length === 0 ? (
            <Card className="glass-card">
              <CardContent className="p-12 text-center">
                <p className="text-lg text-muted-foreground mb-2">
                  Aucun prestataire trouvé
                </p>
                <p className="text-sm text-muted-foreground">
                  Essayez de modifier vos critères de recherche
                </p>
              </CardContent>
            </Card>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                {providers.map((provider) => (
                  <Card
                    key={provider.id}
                    className="glass-card hover:shadow-lg transition-shadow cursor-pointer group"
                    onClick={() => navigate(`/provider/${provider.id}`)}
                  >
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex-1">
                          <h3 className="font-semibold text-lg mb-1 group-hover:text-primary transition-colors">
                            {provider.business_name}
                          </h3>
                          <Badge variant="secondary" className="mb-2">
                            {getProviderTypeLabel(provider.provider_type)}
                          </Badge>
                        </div>
                        <div onClick={(e) => e.stopPropagation()}>
                          <FavoriteButton providerId={provider.id} />
                        </div>
                      </div>

                      {provider.verification_status === 'verified' && (
                        <Badge variant="default" className="mb-3 gap-1">
                          <Star className="h-3 w-3" />
                          Vérifié
                        </Badge>
                      )}

                      <div className="space-y-2 text-sm">
                        {provider.address && (
                          <div className="flex items-start gap-2 text-muted-foreground">
                            <MapPin className="h-4 w-4 mt-0.5 flex-shrink-0" />
                            <span className="line-clamp-2">{provider.address}</span>
                          </div>
                        )}
                        {provider.city && (
                          <div className="text-muted-foreground">
                            {provider.city}
                          </div>
                        )}
                        {provider.phone && (
                          <div className="flex items-center gap-2 text-muted-foreground">
                            <Phone className="h-4 w-4" />
                            <span>{provider.phone}</span>
                          </div>
                        )}
                      </div>

                      {provider.description && (
                        <p className="text-sm text-muted-foreground mt-3 line-clamp-2">
                          {provider.description}
                        </p>
                      )}

                      {provider.is_emergency && (
                        <Badge variant="destructive" className="mt-3">
                          Urgences 24/7
                        </Badge>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                  >
                    <ChevronLeft className="h-4 w-4" />
                    Précédent
                  </Button>

                  <div className="flex items-center gap-1">
                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                      let pageNum;
                      if (totalPages <= 5) {
                        pageNum = i + 1;
                      } else if (currentPage <= 3) {
                        pageNum = i + 1;
                      } else if (currentPage >= totalPages - 2) {
                        pageNum = totalPages - 4 + i;
                      } else {
                        pageNum = currentPage - 2 + i;
                      }

                      return (
                        <Button
                          key={pageNum}
                          variant={currentPage === pageNum ? 'default' : 'outline'}
                          size="sm"
                          onClick={() => setCurrentPage(pageNum)}
                          className="w-10"
                        >
                          {pageNum}
                        </Button>
                      );
                    })}
                  </div>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                    disabled={currentPage === totalPages}
                  >
                    Suivant
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              )}
            </>
          )}
        </AnimatedTransition>
      </div>
    </div>
  );
};

export default ProvidersPage;