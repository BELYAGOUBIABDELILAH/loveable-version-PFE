import { useState, useEffect } from 'react';
import { Search, MapPin, Clock, Filter, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { useLanguage } from '@/hooks/useLanguage';

interface AdvancedSearchProps {
  onSearch: (query: SearchQuery) => void;
  isLoading?: boolean;
}

interface SearchQuery {
  text: string;
  location: string;
  service: string;
  availability: string;
}

export const AdvancedSearch = ({ onSearch, isLoading = false }: AdvancedSearchProps) => {
  const { t } = useLanguage();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLocation, setSelectedLocation] = useState('');
  const [selectedService, setSelectedService] = useState('');
  const [selectedAvailability, setSelectedAvailability] = useState('');
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);

  const locations = [
    'Alger Centre', 'Oran', 'Constantine', 'Annaba', 'Sétif', 'Batna',
    'Sidi Bel Abbès', 'Tlemcen', 'Biskra', 'Tizi Ouzou'
  ];

  const services = [
    'services.generalDoctors',
    'services.specialists', 
    'services.pharmacies',
    'services.laboratories',
    'services.clinics',
    'services.emergency'
  ];

  const availability = [
    'available_now',
    'today',
    'this_week',
    'emergency_only'
  ];

  useEffect(() => {
    const saved = localStorage.getItem('recentSearches');
    if (saved) {
      setRecentSearches(JSON.parse(saved));
    }
  }, []);

  const handleSearch = () => {
    const query: SearchQuery = {
      text: searchQuery,
      location: selectedLocation,
      service: selectedService,
      availability: selectedAvailability
    };

    // Save to recent searches
    if (searchQuery.trim()) {
      const updated = [searchQuery, ...recentSearches.filter(s => s !== searchQuery)].slice(0, 5);
      setRecentSearches(updated);
      localStorage.setItem('recentSearches', JSON.stringify(updated));
    }

    onSearch(query);
    setShowSuggestions(false);
  };

  const handleRecentSearch = (term: string) => {
    setSearchQuery(term);
    setShowSuggestions(false);
  };

  const clearRecentSearches = () => {
    setRecentSearches([]);
    localStorage.removeItem('recentSearches');
  };

  return (
    <div className="relative glass-card rounded-2xl p-6 border shadow-lg hover-lift">
      {/* Main Search Row */}
      <div className="grid md:grid-cols-4 gap-4 mb-4">
        {/* Search Input */}
        <div className="relative md:col-span-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" size={18} />
            <Input
              placeholder={t('search.placeholder')}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onFocus={() => setShowSuggestions(true)}
              className="pl-10 pr-4 h-12 bg-background/50 border-primary/20 focus:border-primary"
            />
          </div>
          
          {/* Search Suggestions */}
          {showSuggestions && recentSearches.length > 0 && (
            <div className="absolute top-full left-0 right-0 mt-2 bg-background border rounded-lg shadow-lg z-50">
              <div className="p-3 border-b">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-muted-foreground">{t('search.recent')}</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={clearRecentSearches}
                    className="h-6 px-2 text-xs"
                  >
                    <X size={12} />
                  </Button>
                </div>
              </div>
              <div className="py-2">
                {recentSearches.map((term, index) => (
                  <button
                    key={index}
                    onClick={() => handleRecentSearch(term)}
                    className="w-full text-left px-3 py-2 hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex items-center gap-2">
                      <Clock size={14} className="text-muted-foreground" />
                      <span className="text-sm">{term}</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Location Select */}
        <div>
          <Select value={selectedLocation} onValueChange={setSelectedLocation}>
            <SelectTrigger className="h-12 bg-background/50 border-primary/20 focus:border-primary">
              <div className="flex items-center gap-2">
                <MapPin size={16} className="text-muted-foreground" />
                <SelectValue placeholder={t('search.location')} />
              </div>
            </SelectTrigger>
            <SelectContent>
              {locations.map((location) => (
                <SelectItem key={location} value={location}>
                  {location}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Service Type Select */}
        <div>
          <Select value={selectedService} onValueChange={setSelectedService}>
            <SelectTrigger className="h-12 bg-background/50 border-primary/20 focus:border-primary">
              <SelectValue placeholder={t('search.service')} />
            </SelectTrigger>
            <SelectContent>
              {services.map((service) => (
                <SelectItem key={service} value={service}>
                  {t(service)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Filters Row */}
      <div className="flex flex-wrap items-center gap-3 mb-6">
        <div className="flex items-center gap-2">
          <Filter size={16} className="text-muted-foreground" />
          <span className="text-sm font-medium text-muted-foreground">Filters:</span>
        </div>
        
        <Select value={selectedAvailability} onValueChange={setSelectedAvailability}>
          <SelectTrigger className="w-fit h-8 bg-background/50 border-primary/20">
            <SelectValue placeholder="Availability" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="available_now">Available Now</SelectItem>
            <SelectItem value="today">Available Today</SelectItem>
            <SelectItem value="this_week">This Week</SelectItem>
            <SelectItem value="emergency_only">Emergency Only</SelectItem>
          </SelectContent>
        </Select>

        {/* Active Filters */}
        {selectedLocation && (
          <Badge variant="secondary" className="gap-1">
            {selectedLocation}
            <button onClick={() => setSelectedLocation('')}>
              <X size={12} />
            </button>
          </Badge>
        )}
        
        {selectedService && (
          <Badge variant="secondary" className="gap-1">
            {t(selectedService)}
            <button onClick={() => setSelectedService('')}>
              <X size={12} />
            </button>
          </Badge>
        )}
      </div>

      {/* Search Actions */}
      <div className="flex flex-col sm:flex-row gap-3 items-center">
        <Button 
          onClick={handleSearch} 
          size="lg" 
          className="w-full sm:w-auto bg-primary hover:bg-primary/90 text-white px-8 ripple-effect"
          disabled={isLoading}
        >
          {isLoading ? (
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              <span>{t('loading')}</span>
            </div>
          ) : (
            <>
              <Search className="mr-2" size={18} />
              {t('search.now')}
            </>
          )}
        </Button>

        <Button 
          variant="destructive" 
          size="lg" 
          className="w-full sm:w-auto animate-pulse-slow hover:animate-none"
        >
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-white rounded-full animate-ping" />
            {t('emergency.services')}
          </div>
        </Button>
      </div>
    </div>
  );
};