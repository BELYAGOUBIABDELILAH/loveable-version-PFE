import { useState } from 'react';
import { Search, MapPin, Stethoscope } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useNavigate } from 'react-router-dom';

export const QuickSearchSection = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [providerType, setProviderType] = useState('');
  const [location, setLocation] = useState('');

  const providerTypes = [
    { value: 'doctor', label: 'Médecin' },
    { value: 'clinic', label: 'Clinique' },
    { value: 'pharmacy', label: 'Pharmacie' },
    { value: 'lab', label: 'Laboratoire' },
  ];

  const handleSearch = () => {
    const params = new URLSearchParams();
    if (searchQuery) params.append('q', searchQuery);
    if (providerType) params.append('type', providerType);
    if (location) params.append('location', location);
    navigate(`/search?${params.toString()}`);
  };

  return (
    <section className="py-16 px-4 -mt-16 relative z-10">
      <div className="container mx-auto max-w-5xl">
        <Card className="glass-card shadow-2xl border-primary/20">
          <CardContent className="p-8">
            <h2 className="text-2xl font-bold text-center mb-6 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              Recherche Rapide
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              {/* Search Input */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Nom ou spécialité..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 border-primary/20 focus:border-primary"
                  aria-label="Search for specialist or name"
                />
              </div>

              {/* Provider Type */}
              <Select value={providerType} onValueChange={setProviderType}>
                <SelectTrigger className="border-primary/20 focus:border-primary bg-background" aria-label="Select provider type">
                  <Stethoscope className="mr-2 h-4 w-4 text-primary" />
                  <SelectValue placeholder="Type de prestataire" />
                </SelectTrigger>
                <SelectContent className="bg-popover/95 backdrop-blur-lg border-border/50 z-50">
                  {providerTypes.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {/* Location */}
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Localisation..."
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="pl-10 border-primary/20 focus:border-primary"
                  aria-label="Enter location"
                />
              </div>
            </div>

            {/* Search Button */}
            <Button 
              onClick={handleSearch}
              className="w-full md:w-auto px-8 py-6 text-lg bg-gradient-to-r from-primary to-accent hover:opacity-90 text-white rounded-lg shadow-md hover:shadow-lg transition-all"
              aria-label="Launch search"
            >
              <Search className="mr-2 h-5 w-5" />
              Lancer la recherche
            </Button>
          </CardContent>
        </Card>
      </div>
    </section>
  );
};
