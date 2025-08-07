import { useState, useEffect } from 'react';
import { Heart, MapPin, Phone, Star, Clock, Calendar, Trash2, Search, Filter } from 'lucide-react';
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

const FavoritesPage = () => {
  const [favorites, setFavorites] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  
  const { isAuthenticated } = useAuth();
  const headerRef = useScrollReveal();
  const { toasts, addToast } = useToastNotifications();

  const categories = [
    'Tous',
    'Hôpitaux',
    'Cliniques', 
    'Médecins Généralistes',
    'Spécialistes',
    'Pharmacies',
    'Laboratoires'
  ];

  // Simulated favorites data
  const mockFavorites = [
    {
      id: 1,
      name: "Dr. Benali (Cardiologue)",
      type: "Spécialiste",
      specialty: "Cardiologie",
      location: "Hay El Badr",
      rating: 4.9,
      isVerified: true,
      isOpen: true,
      phone: "+213 48 55 XX XX",
      nextAvailable: "Aujourd'hui 14h",
      addedDate: "2024-01-15",
      image: "/placeholder.svg"
    },
    {
      id: 2,
      name: "Pharmacie Centrale",
      type: "Pharmacie",
      specialty: "Pharmacie",
      location: "Centre Ville",
      rating: 4.7,
      isVerified: true,
      isOpen: true,
      phone: "+213 48 56 XX XX",
      nextAvailable: "Ouvert 24h/24",
      addedDate: "2024-01-10",
      image: "/placeholder.svg"
    },
    {
      id: 3,
      name: "Clinique Ibn Sina",
      type: "Clinique",
      specialty: "Médecine Générale",
      location: "Sidi Bel Abbès Est",
      rating: 4.6,
      isVerified: true,
      isOpen: false,
      phone: "+213 48 57 XX XX",
      nextAvailable: "Demain 08h",
      addedDate: "2024-01-05",
      image: "/placeholder.svg"
    },
    {
      id: 4,
      name: "Laboratoire Atlas",
      type: "Laboratoire",
      specialty: "Analyses Médicales",
      location: "Centre Ville",
      rating: 4.8,
      isVerified: true,
      isOpen: true,
      phone: "+213 48 58 XX XX",
      nextAvailable: "Aujourd'hui 16h",
      addedDate: "2024-01-03",
      image: "/placeholder.svg"
    }
  ];

  useEffect(() => {
    // Simulate loading favorites
    const loadFavorites = async () => {
      setIsLoading(true);
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      if (isAuthenticated) {
        setFavorites(mockFavorites);
      }
      setIsLoading(false);
    };

    loadFavorites();
  }, [isAuthenticated]);

  const handleRemoveFavorite = (id: number) => {
    setFavorites(prev => prev.filter(fav => fav.id !== id));
    addToast({
      type: 'success',
      title: 'Favori supprimé',
      message: 'Le prestataire a été retiré de vos favoris'
    });
  };

  const handleBookAppointment = (provider: any) => {
    addToast({
      type: 'info',
      title: 'Rendez-vous',
      message: `Redirection vers la prise de rendez-vous avec ${provider.name}`
    });
  };

  const handleCall = (provider: any) => {
    addToast({
      type: 'info',
      title: 'Appel',
      message: `Appel vers ${provider.name} - ${provider.phone}`
    });
  };

  const filteredFavorites = favorites.filter(favorite => {
    const matchesSearch = !searchQuery || 
      favorite.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      favorite.specialty.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = !selectedCategory || selectedCategory === 'Tous' || favorite.type === selectedCategory;
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
            <Button className="w-full">
              Se connecter
            </Button>
          </CardContent>
        </Card>
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
                        {category}
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
            {filteredFavorites.map((favorite, index) => (
              <Card 
                key={favorite.id} 
                className="glass-card hover-lift transition-all duration-300 animate-scale-in"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <CardContent className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="font-semibold text-lg line-clamp-1">{favorite.name}</h3>
                        {favorite.isVerified && (
                          <Badge variant="secondary" className="text-xs">✓ Vérifié</Badge>
                        )}
                      </div>
                      <p className="text-muted-foreground text-sm">{favorite.specialty}</p>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleRemoveFavorite(favorite.id)}
                      className="text-destructive hover:text-destructive hover:bg-destructive/10"
                    >
                      <Trash2 size={18} />
                    </Button>
                  </div>
                  
                  <div className="space-y-3 mb-4">
                    <div className="flex items-center gap-2">
                      <MapPin size={16} className="text-muted-foreground flex-shrink-0" />
                      <span className="text-sm">{favorite.location}</span>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <Phone size={16} className="text-muted-foreground flex-shrink-0" />
                      <span className="text-sm">{favorite.phone}</span>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1">
                        <Star size={16} className="text-yellow-500 fill-yellow-500" />
                        <span className="text-sm">{favorite.rating}</span>
                      </div>
                      
                      <Badge variant={favorite.isOpen ? 'default' : 'secondary'} className="text-xs">
                        {favorite.isOpen ? 'Ouvert' : 'Fermé'}
                      </Badge>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <Clock size={16} className="text-muted-foreground flex-shrink-0" />
                      <span className="text-sm">{favorite.nextAvailable}</span>
                    </div>
                  </div>
                  
                  <div className="flex gap-2">
                    <Button 
                      size="sm" 
                      className="flex-1"
                      onClick={() => handleBookAppointment(favorite)}
                    >
                      <Calendar className="mr-1" size={14} />
                      RDV
                    </Button>
                    <Button 
                      size="sm" 
                      variant="outline" 
                      className="flex-1"
                      onClick={() => handleCall(favorite)}
                    >
                      <Phone className="mr-1" size={14} />
                      Appeler
                    </Button>
                  </div>
                  
                  <div className="mt-3 pt-3 border-t border-border/50">
                    <p className="text-xs text-muted-foreground">
                      Ajouté le {new Date(favorite.addedDate).toLocaleDateString('fr-FR')}
                    </p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default FavoritesPage;