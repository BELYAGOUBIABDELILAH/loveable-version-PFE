
import React, { useState } from 'react';
import { Search, MapPin, Filter, Star, Clock, Phone, Navigation, Grid, List, Map } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useLanguage } from '@/contexts/LanguageContext';
import AnimatedTransition from '@/components/AnimatedTransition';

interface Provider {
  id: string;
  name: string;
  specialty: string;
  rating: number;
  distance: number;
  isOpen: boolean;
  isVerified: boolean;
  isEmergency: boolean;
  address: string;
  phone: string;
  image: string;
  reviews: number;
}

const SearchPage = () => {
  const { t, isRTL } = useLanguage();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSpecialty, setSelectedSpecialty] = useState('');
  const [selectedLocation, setSelectedLocation] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list' | 'map'>('grid');
  const [sortBy, setSortBy] = useState('distance');

  const specialties = [
    'Médecin généraliste',
    'Cardiologue',
    'Dermatologue',
    'Pédiatre',
    'Gynécologue',
    'Ophtalmologue',
    'Dentiste',
    'Pharmacie',
    'Laboratoire',
    'Radiologie'
  ];

  const locations = [
    'Centre Ville',
    'Hay El Badr',
    'Sidi Bel Abbès Est',
    'Sidi Bel Abbès Ouest',
    'Périphérie Nord',
    'Périphérie Sud'
  ];

  const providers: Provider[] = [
    {
      id: '1',
      name: 'Dr. Ahmed Benali',
      specialty: 'Cardiologue',
      rating: 4.9,
      distance: 0.8,
      isOpen: true,
      isVerified: true,
      isEmergency: false,
      address: '15 Rue de la République, Centre Ville',
      phone: '+213 48 54 XX XX',
      image: '/placeholder.svg',
      reviews: 127
    },
    {
      id: '2',
      name: 'Clinique El Amal',
      specialty: 'Clinique générale',
      rating: 4.7,
      distance: 1.2,
      isOpen: true,
      isVerified: true,
      isEmergency: true,
      address: '45 Boulevard Houari Boumediene',
      phone: '+213 48 55 XX XX',
      image: '/placeholder.svg',
      reviews: 89
    },
    {
      id: '3',
      name: 'Pharmacie Centrale',
      specialty: 'Pharmacie',
      rating: 4.8,
      distance: 0.5,
      isOpen: false,
      isVerified: true,
      isEmergency: false,
      address: '8 Place de la Mairie, Centre Ville',
      phone: '+213 48 56 XX XX',
      image: '/placeholder.svg',
      reviews: 203
    }
  ];

  const ProviderCard = ({ provider }: { provider: Provider }) => (
    <Card className="glass-card hover:shadow-glow transition-all duration-300 hover:scale-[1.02] cursor-pointer">
      <CardContent className="p-6">
        <div className="flex gap-4">
          <img 
            src={provider.image} 
            alt={provider.name}
            className="w-16 h-16 rounded-xl object-cover bg-muted"
          />
          <div className="flex-1">
            <div className="flex items-start justify-between mb-2">
              <div>
                <h3 className="font-semibold text-lg flex items-center gap-2">
                  {provider.name}
                  {provider.isVerified && (
                    <Badge variant="secondary" className="text-xs">
                      ✓ {t('provider.verified')}
                    </Badge>
                  )}
                </h3>
                <p className="text-muted-foreground text-sm">{provider.specialty}</p>
              </div>
              <div className="text-right">
                <div className="flex items-center gap-1 mb-1">
                  <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                  <span className="font-medium">{provider.rating}</span>
                  <span className="text-muted-foreground text-sm">({provider.reviews})</span>
                </div>
                <div className="flex items-center gap-1 text-sm text-muted-foreground">
                  <Navigation className="h-3 w-3" />
                  <span>{provider.distance} km</span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 mb-3 text-sm">
              <MapPin className="h-4 w-4 text-muted-foreground" />
              <span className="text-muted-foreground">{provider.address}</span>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs ${
                  provider.isOpen ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                }`}>
                  <Clock className="h-3 w-3" />
                  {provider.isOpen ? 'Ouvert' : 'Fermé'}
                </div>
                {provider.isEmergency && (
                  <Badge variant="destructive" className="text-xs">
                    Urgences 24/7
                  </Badge>
                )}
              </div>
              <Button variant="outline" size="sm" className="gap-2">
                <Phone className="h-4 w-4" />
                Appeler
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/20 to-secondary/10 pt-20">
      <div className="container mx-auto px-4 py-8">
        <AnimatedTransition show={true} animation="fade">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold mb-2">Rechercher un prestataire</h1>
            <p className="text-muted-foreground">Trouvez le professionnel de santé adapté à vos besoins</p>
          </div>

          {/* Search Filters */}
          <div className="glass-panel rounded-2xl p-6 mb-8">
            <div className="grid lg:grid-cols-4 md:grid-cols-2 gap-4 mb-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  placeholder={t('search.placeholder')}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              
              <Select value={selectedSpecialty} onValueChange={setSelectedSpecialty}>
                <SelectTrigger>
                  <SelectValue placeholder={t('search.specialty')} />
                </SelectTrigger>
                <SelectContent>
                  {specialties.map((specialty) => (
                    <SelectItem key={specialty} value={specialty}>
                      {specialty}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              
              <Select value={selectedLocation} onValueChange={setSelectedLocation}>
                <SelectTrigger>
                  <SelectValue placeholder={t('search.location')} />
                </SelectTrigger>
                <SelectContent>
                  {locations.map((location) => (
                    <SelectItem key={location} value={location}>
                      {location}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger>
                  <SelectValue placeholder="Trier par" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="distance">Distance</SelectItem>
                  <SelectItem value="rating">Note</SelectItem>
                  <SelectItem value="name">Nom</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Filter className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">
                  {providers.length} résultats trouvés
                </span>
              </div>

              {/* View Mode Toggle */}
              <div className="flex items-center gap-1 bg-muted/50 rounded-lg p-1">
                <Button
                  variant={viewMode === 'grid' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setViewMode('grid')}
                  className="h-8 w-8 p-0"
                >
                  <Grid className="h-4 w-4" />
                </Button>
                <Button
                  variant={viewMode === 'list' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setViewMode('list')}
                  className="h-8 w-8 p-0"
                >
                  <List className="h-4 w-4" />
                </Button>
                <Button
                  variant={viewMode === 'map' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setViewMode('map')}
                  className="h-8 w-8 p-0"
                >
                  <Map className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>

          {/* Results */}
          <div className={`grid gap-6 ${viewMode === 'grid' ? 'lg:grid-cols-2' : 'grid-cols-1'}`}>
            {providers.map((provider) => (
              <ProviderCard key={provider.id} provider={provider} />
            ))}
          </div>

          {/* Load More */}
          <div className="text-center mt-8">
            <Button variant="outline" size="lg">
              Charger plus de résultats
            </Button>
          </div>
        </AnimatedTransition>
      </div>
    </div>
  );
};

export default SearchPage;
