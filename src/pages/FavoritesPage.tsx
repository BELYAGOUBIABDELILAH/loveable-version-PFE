import { useState, useEffect } from 'react';
import { Heart, MapPin, Phone, Clock, Calendar, Trash2, Search, Filter } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/contexts/AuthContext';
import { useScrollReveal } from '@/hooks/useScrollReveal';
import { useToastNotifications } from '@/hooks/useToastNotifications';
import ToastContainer from '@/components/ToastContainer';
import SkeletonCard from '@/components/SkeletonCard';
import { favoritesService, type FavoriteWithProvider } from '@/services/favoritesService';
import { Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { AuthModal } from '@/components/AuthModal';
import { BookingModal } from '@/components/BookingModal';

const FavoritesPage = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [selectedProvider, setSelectedProvider] = useState<{ id: string; name: string } | null>(null);
  
  const { isAuthenticated } = useAuth();
  const headerRef = useScrollReveal();
  const { toasts, addToast } = useToastNotifications();
  const queryClient = useQueryClient();

  const categories = [
    'Tous',
    'doctor',
    'clinic',
    'hospital',
    'pharmacy',
    'laboratory'
  ];

  const getCategoryDisplayName = (category: string) => {
    const categoryMap: Record<string, string> = {
      'Tous': 'Tous',
      'doctor': 'Médecins',
      'clinic': 'Cliniques',
      'hospital': 'Hôpitaux',
      'pharmacy': 'Pharmacies',
      'laboratory': 'Laboratoires'
    };
    return categoryMap[category] || category;
  };

  // Use TanStack Query for data fetching with real-time updates
  const {
    data: favorites = [],
    isLoading,
    error,
    refetch
  } = useQuery({
    queryKey: ['favorites'],
    queryFn: () => favoritesService.getFavorites(),
    enabled: isAuthenticated,
    staleTime: 1000 * 60 * 5, // 5 minutes
    refetchOnWindowFocus: true,
  });

  // Set up real-time subscription for favorites updates
  useEffect(() => {
    if (!isAuthenticated) return;

    let subscription: any;

    const setupSubscription = async () => {
      try {
        subscription = await favoritesService.subscribeToFavorites(() => {
          // Invalidate and refetch favorites when changes occur
          queryClient.invalidateQueries({ queryKey: ['favorites'] });
        });
      } catch (err) {
        console.error('Failed to set up favorites subscription:', err);
      }
    };

    setupSubscription();

    return () => {
      if (subscription) {
        subscription.unsubscribe();
      }
    };
  }, [isAuthenticated, queryClient]);

  // Mutation for removing favorites with optimistic updates
  const removeFavoriteMutation = useMutation({
    mutationFn: (providerId: string) => favoritesService.removeFavorite(providerId),
    onMutate: async (providerId) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: ['favorites'] });

      // Snapshot the previous value
      const previousFavorites = queryClient.getQueryData<FavoriteWithProvider[]>(['favorites']);

      // Optimistically update to the new value
      queryClient.setQueryData<FavoriteWithProvider[]>(['favorites'], (old) =>
        old?.filter(fav => fav.providerId !== providerId) || []
      );

      // Return a context object with the snapshotted value
      return { previousFavorites };
    },
    onError: (err, providerId, context) => {
      // If the mutation fails, use the context returned from onMutate to roll back
      queryClient.setQueryData(['favorites'], context?.previousFavorites);
      
      const errorMessage = err instanceof Error ? err.message : 'Une erreur est survenue';
      addToast({
        type: 'error',
        title: 'Erreur',
        message: `Impossible de supprimer le favori: ${errorMessage}`
      });
    },
    onSuccess: (_, providerId) => {
      // Find the provider name for the toast
      const provider = favorites.find(fav => fav.providerId === providerId)?.provider;
      addToast({
        type: 'success',
        title: 'Favori supprimé',
        message: `${provider?.businessName || 'Le prestataire'} a été retiré de vos favoris`
      });
    },
    onSettled: () => {
      // Always refetch after error or success
      queryClient.invalidateQueries({ queryKey: ['favorites'] });
    },
  });

  const handleRemoveFavorite = (providerId: string) => {
    removeFavoriteMutation.mutate(providerId);
  };

  const handleBookAppointment = (provider: { id: string; businessName: string }) => {
    setSelectedProvider({ id: provider.id, name: provider.businessName });
    setShowBookingModal(true);
  };

  const handleCall = (provider: any) => {
    // Open phone dialer
    window.open(`tel:${provider.phone}`, '_self');
    addToast({
      type: 'info',
      title: 'Appel',
      message: `Appel vers ${provider.business_name} - ${provider.phone}`
    });
  };

  const filteredFavorites = favorites.filter(favorite => {
    const provider = favorite.provider;
    const matchesSearch = !searchQuery || 
      provider.businessName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (provider.specialtyId && provider.specialtyId.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesCategory = !selectedCategory || selectedCategory === 'Tous' || provider.providerType === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-secondary/5 flex items-center justify-center">
        <Card className="glass-card max-w-md w-full mx-4">
          <CardContent className="p-8 text-center">
            <Heart className="mx-auto mb-4 text-muted-foreground" size={48} />
            <h2 className="text-2xl font-bold mb-4">Connectez-vous</h2>
            <p className="text-muted-foreground mb-6">
              Vous devez être connecté pour voir vos prestataires favoris.
            </p>
            <Button className="w-full" onClick={() => setShowAuthModal(true)}>
              Se connecter
            </Button>
          </CardContent>
        </Card>
        <AuthModal 
          open={showAuthModal} 
          onOpenChange={setShowAuthModal}
          defaultTab="login"
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-secondary/5">
      <ToastContainer toasts={toasts} />
      
      {/* Header */}
      <section ref={headerRef} className="py-20 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center gap-3 mb-6 animate-float">
            <div className="w-12 h-12 bg-primary/20 rounded-full flex items-center justify-center animate-glow">
              <Heart className="text-primary" size={24} />
            </div>
            <div>
              <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                Mes Favoris
              </h1>
              <p className="text-lg text-muted-foreground mt-2">
                Vos prestataires de santé préférés, toujours à portée de main
              </p>
            </div>
          </div>

          {/* Filters */}
          <Card className="glass-panel p-6 mb-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Rechercher</label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" size={18} />
                  <Input
                    placeholder="Nom ou spécialité..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium">Catégorie</label>
                <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                  <SelectTrigger>
                    <SelectValue placeholder="Toutes catégories" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((category) => (
                      <SelectItem key={category} value={category}>
                        {getCategoryDisplayName(category)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="flex items-end">
                <Button variant="outline" className="w-full">
                  <Filter className="mr-2" size={18} />
                  {filteredFavorites.length} résultat(s)
                </Button>
              </div>
            </div>
          </Card>
        </div>
      </section>

      {/* Favorites List */}
      <div className="max-w-6xl mx-auto px-6 pb-16">
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, index) => (
              <SkeletonCard key={index} />
            ))}
          </div>
        ) : error ? (
          <Card className="glass-card">
            <CardContent className="p-12 text-center">
              <Heart className="mx-auto mb-4 text-destructive" size={64} />
              <h3 className="text-2xl font-semibold mb-4">Erreur de chargement</h3>
              <p className="text-muted-foreground mb-6">
                {error instanceof Error ? error.message : 'Impossible de charger vos favoris.'}
              </p>
              <Button onClick={() => refetch()}>
                Réessayer
              </Button>
            </CardContent>
          </Card>
        ) : filteredFavorites.length === 0 ? (
          <Card className="glass-card">
            <CardContent className="p-12 text-center">
              <Heart className="mx-auto mb-4 text-muted-foreground" size={64} />
              <h3 className="text-2xl font-semibold mb-4">
                {searchQuery || selectedCategory ? 'Aucun résultat' : 'Aucun favori'}
              </h3>
              <p className="text-muted-foreground mb-6">
                {searchQuery || selectedCategory 
                  ? 'Aucun prestataire ne correspond à vos critères de recherche.'
                  : 'Vous n\'avez pas encore ajouté de prestataires à vos favoris.'
                }
              </p>
              {!searchQuery && !selectedCategory && (
                <Button>
                  <Search className="mr-2" size={18} />
                  Découvrir des prestataires
                </Button>
              )}
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredFavorites.map((favorite, index) => {
              const provider = favorite.provider;
              return (
                <Card 
                  key={favorite.id} 
                  className="glass-card hover-lift transition-all duration-300 animate-scale-in"
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <CardContent className="p-6">
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <Link 
                            to={`/provider/${provider.id}`}
                            className="hover:text-primary transition-colors"
                          >
                            <h3 className="font-semibold text-lg line-clamp-1 hover:text-primary">
                              {provider.businessName}
                            </h3>
                          </Link>
                          {provider.verificationStatus === 'verified' && (
                            <Badge variant="secondary" className="text-xs">✓ Vérifié</Badge>
                          )}
                        </div>
                        <p className="text-muted-foreground text-sm capitalize">
                          {getCategoryDisplayName(provider.providerType)}
                        </p>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleRemoveFavorite(provider.id)}
                        disabled={removeFavoriteMutation.isPending}
                        className="text-destructive hover:text-destructive hover:bg-destructive/10"
                      >
                        <Trash2 size={18} />
                      </Button>
                    </div>
                    
                    <div className="space-y-3 mb-4">
                      <div className="flex items-center gap-2">
                        <MapPin size={16} className="text-muted-foreground flex-shrink-0" />
                        <span className="text-sm">{provider.address}</span>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <Phone size={16} className="text-muted-foreground flex-shrink-0" />
                        <span className="text-sm">{provider.phone}</span>
                      </div>
                      
                      {provider.isEmergency && (
                        <div className="flex items-center gap-2">
                          <Clock size={16} className="text-green-600 flex-shrink-0" />
                          <span className="text-sm text-green-600">Service d'urgence 24h/24</span>
                        </div>
                      )}
                    </div>
                    
                    <div className="flex gap-2">
                      <Button 
                        size="sm" 
                        className="flex-1"
                        onClick={() => handleBookAppointment({ id: provider.id, businessName: provider.businessName })}
                      >
                        <Calendar className="mr-1" size={14} />
                        RDV
                      </Button>
                      <Button 
                        size="sm" 
                        variant="outline" 
                        className="flex-1"
                        onClick={() => handleCall(provider)}
                      >
                        <Phone className="mr-1" size={14} />
                        Appeler
                      </Button>
                    </div>
                    
                    <div className="mt-3 pt-3 border-t border-border/50">
                      <p className="text-xs text-muted-foreground">
                        Ajouté le {favorite.createdAt?.toDate ? new Date(favorite.createdAt.toDate()).toLocaleDateString('fr-FR') : 'Date inconnue'}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>

      {/* Booking Modal */}
      {selectedProvider && (
        <BookingModal
          open={showBookingModal}
          onOpenChange={setShowBookingModal}
          providerName={selectedProvider.name}
          providerId={selectedProvider.id}
        />
      )}
    </div>
  );
};

export default FavoritesPage;