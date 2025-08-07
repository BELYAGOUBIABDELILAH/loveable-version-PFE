import { useState } from 'react';
import { MapPin, Navigation, Filter, Phone, Star, Clock, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useScrollReveal } from '@/hooks/useScrollReveal';
import { useToastNotifications } from '@/hooks/useToastNotifications';
import ToastContainer from '@/components/ToastContainer';

const MapPage = () => {
  const [selectedCategory, setSelectedCategory] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedProvider, setSelectedProvider] = useState<any>(null);

  const mapRef = useScrollReveal();
  const { toasts, addToast } = useToastNotifications();

  const categories = [
    'Tous',
    'Hôpitaux',
    'Cliniques',
    'Médecins Généralistes',
    'Spécialistes',
    'Pharmacies',
    'Laboratoires',
    'Urgences'
  ];

  const providers = [
    {
      id: 1,
      name: "Hôpital Universitaire Dr. Hassani Abdelkader",
      type: "Hôpital",
      address: "Avenue de la République, Centre Ville",
      phone: "+213 48 54 XX XX",
      rating: 4.8,
      coordinates: { lat: 35.1969, lng: -0.6394 },
      isOpen: true,
      services: ["Urgences 24/7", "Cardiologie", "Chirurgie"],
      image: "/placeholder.svg"
    },
    {
      id: 2,
      name: "Cabinet Dr. Benali (Cardiologue)",
      type: "Spécialiste",
      address: "Rue des Martyrs, Hay El Badr",
      phone: "+213 48 55 XX XX",
      rating: 4.9,
      coordinates: { lat: 35.2012, lng: -0.6456 },
      isOpen: true,
      services: ["Consultation", "ECG", "Échocardiographie"],
      image: "/placeholder.svg"
    },
    {
      id: 3,
      name: "Pharmacie Centrale",
      type: "Pharmacie",
      address: "Boulevard Emir Abdelkader, Centre Ville",
      phone: "+213 48 56 XX XX",
      rating: 4.7,
      coordinates: { lat: 35.1945, lng: -0.6378 },
      isOpen: true,
      services: ["Médicaments", "Parapharmacie", "Garde 24h"],
      image: "/placeholder.svg"
    },
    {
      id: 4,
      name: "Laboratoire d'Analyses Médicales Atlas",
      type: "Laboratoire",
      address: "Rue Ahmed Zabana, Sidi Bel Abbès Est",
      phone: "+213 48 57 XX XX",
      rating: 4.6,
      coordinates: { lat: 35.2034, lng: -0.6312 },
      isOpen: false,
      services: ["Analyses sanguines", "Radiologie", "Échographie"],
      image: "/placeholder.svg"
    }
  ];

  const handleProviderSelect = (provider: any) => {
    setSelectedProvider(provider);
    addToast({
      type: 'info',
      title: 'Prestataire sélectionné',
      message: `${provider.name} - ${provider.address}`
    });
  };

  const handleGetDirections = (provider: any) => {
    addToast({
      type: 'success',
      title: 'Itinéraire',
      message: `Ouverture de l'itinéraire vers ${provider.name}`
    });
  };

  const filteredProviders = providers.filter(provider => {
    const matchesCategory = !selectedCategory || selectedCategory === 'Tous' || provider.type === selectedCategory;
    const matchesSearch = !searchQuery || provider.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

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
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Rechercher</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" size={18} />
                <Input
                  placeholder="Nom du prestataire..."
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
                  <SelectValue placeholder="Choisir une catégorie" />
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
              <Button className="w-full">
                <Filter className="mr-2" size={18} />
                Filtrer ({filteredProviders.length})
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 pb-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Map Section */}
          <div className="lg:col-span-2">
            <Card ref={mapRef} className="glass-card h-[600px] relative overflow-hidden">
              <CardContent className="p-0 h-full">
                {/* Placeholder for map - In a real app, you'd integrate Mapbox or Google Maps */}
                <div className="h-full bg-gradient-to-br from-blue-100 to-green-100 dark:from-blue-900/20 dark:to-green-900/20 flex items-center justify-center relative">
                  <div className="text-center space-y-4">
                    <MapPin className="mx-auto text-primary animate-bounce-soft" size={64} />
                    <h3 className="text-xl font-semibold">Carte Interactive</h3>
                    <p className="text-muted-foreground max-w-md">
                      Cette zone afficherait une carte interactive avec les prestataires de santé.
                      Intégration Mapbox/Google Maps à venir.
                    </p>
                  </div>
                  
                  {/* Simulated map markers */}
                  <div className="absolute top-1/4 left-1/3 w-4 h-4 bg-red-500 rounded-full border-2 border-white shadow-lg animate-pulse"></div>
                  <div className="absolute top-1/2 right-1/3 w-4 h-4 bg-blue-500 rounded-full border-2 border-white shadow-lg animate-pulse"></div>
                  <div className="absolute bottom-1/3 left-1/2 w-4 h-4 bg-green-500 rounded-full border-2 border-white shadow-lg animate-pulse"></div>
                  
                  {/* Legend */}
                  <div className="absolute bottom-4 left-4 glass-panel p-3 rounded-lg">
                    <h4 className="font-medium mb-2">Légende</h4>
                    <div className="space-y-1 text-sm">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                        <span>Hôpitaux</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                        <span>Cliniques</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                        <span>Pharmacies</span>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Provider List */}
          <div className="space-y-4">
            <h2 className="text-xl font-semibold">Prestataires ({filteredProviders.length})</h2>
            
            <div className="space-y-3 max-h-[600px] overflow-y-auto">
              {filteredProviders.map((provider, index) => (
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
                        <h3 className="font-semibold text-sm line-clamp-2">{provider.name}</h3>
                        <p className="text-xs text-muted-foreground">{provider.type}</p>
                      </div>
                      <div className="flex items-center gap-1">
                        <Badge variant={provider.isOpen ? 'default' : 'secondary'} className="text-xs">
                          {provider.isOpen ? 'Ouvert' : 'Fermé'}
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
                      
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1">
                          <Star size={14} className="text-yellow-500 fill-yellow-500" />
                          <span>{provider.rating}</span>
                        </div>
                        
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
              ))}
            </div>
          </div>
        </div>

        {/* Selected Provider Details */}
        {selectedProvider && (
          <Card className="mt-6 glass-card animate-scale-in">
            <CardContent className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-2xl font-bold mb-2">{selectedProvider.name}</h3>
                  <Badge className="mb-4">{selectedProvider.type}</Badge>
                  
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <MapPin className="text-primary flex-shrink-0" size={20} />
                      <span>{selectedProvider.address}</span>
                    </div>
                    
                    <div className="flex items-center gap-3">
                      <Phone className="text-primary flex-shrink-0" size={20} />
                      <span>{selectedProvider.phone}</span>
                    </div>
                    
                    <div className="flex items-center gap-3">
                      <Star className="text-yellow-500 fill-yellow-500 flex-shrink-0" size={20} />
                      <span>{selectedProvider.rating} / 5</span>
                    </div>
                    
                    <div className="flex items-center gap-3">
                      <Clock className="text-primary flex-shrink-0" size={20} />
                      <Badge variant={selectedProvider.isOpen ? 'default' : 'secondary'}>
                        {selectedProvider.isOpen ? 'Ouvert maintenant' : 'Fermé'}
                      </Badge>
                    </div>
                  </div>
                </div>
                
                <div>
                  <h4 className="font-semibold mb-3">Services disponibles</h4>
                  <div className="flex flex-wrap gap-2 mb-4">
                    {selectedProvider.services.map((service: string, index: number) => (
                      <Badge key={index} variant="outline">
                        {service}
                      </Badge>
                    ))}
                  </div>
                  
                  <div className="flex gap-3">
                    <Button 
                      className="flex-1"
                      onClick={() => handleGetDirections(selectedProvider)}
                    >
                      <Navigation className="mr-2" size={18} />
                      Itinéraire
                    </Button>
                    <Button variant="outline" className="flex-1">
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