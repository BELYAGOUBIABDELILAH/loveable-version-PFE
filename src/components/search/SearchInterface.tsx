import React, { useState, useRef, useEffect } from 'react';
import { Search, Mic, MapPin, Filter, Grid, List, Map as MapIcon, SlidersHorizontal } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { useLanguage } from '@/contexts/LanguageContext';
import { type ViewMode, type SortOption } from '@/pages/SearchPage';

interface SearchInterfaceProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  showFilters: boolean;
  setShowFilters: (show: boolean) => void;
  viewMode: ViewMode;
  setViewMode: (mode: ViewMode) => void;
  sortBy: SortOption;
  setSortBy: (sort: SortOption) => void;
  resultCount: number;
}

export const SearchInterface = ({
  searchQuery,
  setSearchQuery,
  showFilters,
  setShowFilters,
  viewMode,
  setViewMode,
  sortBy,
  setSortBy,
  resultCount
}: SearchInterfaceProps) => {
  const { t } = useLanguage();
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [recentSearches] = useState([
    'Cardiology near me',
    '24/7 pharmacies',
    'Emergency dentist',
    'Pediatrician Algiers'
  ]);

  const searchRef = useRef<HTMLDivElement>(null);

  const suggestions = [
    'Cardiology near me',
    '24/7 pharmacies',
    'Emergency dentist',
    'Dermatologist Oran',
    'Pediatrician available today',
    'Orthopedic specialist',
    'Eye clinic',
    'Mental health support'
  ];

  // Voice search simulation
  const handleVoiceSearch = () => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      setIsListening(true);
      // Simulate voice search
      setTimeout(() => {
        setSearchQuery('cardiologist near me');
        setIsListening(false);
      }, 2000);
    }
  };

  // Click outside to close suggestions
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const sortOptions = [
    { value: 'relevance', label: 'Relevance' },
    { value: 'distance', label: 'Distance' },
    { value: 'rating', label: 'Rating' },
    { value: 'price', label: 'Price' },
    { value: 'newest', label: 'Newest' }
  ];

  return (
    <div className="sticky top-0 z-50 bg-background/95 backdrop-blur-sm border-b">
      <div className="max-w-7xl mx-auto px-4 py-4">
        {/* Main Search Bar */}
        <div className="relative mb-4" ref={searchRef}>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" size={20} />
            <Input
              placeholder="Search for doctors, clinics, pharmacies..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onFocus={() => setShowSuggestions(true)}
              className="pl-12 pr-20 h-12 text-lg border-2 focus:border-primary transition-colors"
            />
            <div className="absolute right-3 top-1/2 transform -translate-y-1/2 flex gap-2">
              <Button
                size="sm"
                variant="ghost"
                onClick={handleVoiceSearch}
                className={`${isListening ? 'text-destructive animate-pulse' : 'text-muted-foreground'}`}
              >
                <Mic size={18} />
              </Button>
              <Button size="sm" variant="ghost" className="text-muted-foreground">
                <MapPin size={18} />
              </Button>
            </div>
          </div>

          {/* Search Suggestions */}
          {showSuggestions && (
            <Card className="absolute top-full left-0 right-0 mt-1 p-4 shadow-lg z-50">
              {recentSearches.length > 0 && (
                <div className="mb-4">
                  <p className="text-sm font-medium text-muted-foreground mb-2">Recent Searches</p>
                  {recentSearches.map((search, index) => (
                    <button
                      key={index}
                      onClick={() => {
                        setSearchQuery(search);
                        setShowSuggestions(false);
                      }}
                      className="block w-full text-left px-2 py-1 hover:bg-muted rounded text-sm"
                    >
                      {search}
                    </button>
                  ))}
                </div>
              )}
              
              <div>
                <p className="text-sm font-medium text-muted-foreground mb-2">Suggestions</p>
                {suggestions
                  .filter(s => s.toLowerCase().includes(searchQuery.toLowerCase()))
                  .slice(0, 5)
                  .map((suggestion, index) => (
                    <button
                      key={index}
                      onClick={() => {
                        setSearchQuery(suggestion);
                        setShowSuggestions(false);
                      }}
                      className="block w-full text-left px-2 py-1 hover:bg-muted rounded text-sm"
                    >
                      {suggestion}
                    </button>
                  ))}
              </div>
            </Card>
          )}
        </div>

        {/* Controls Row */}
        <div className="flex items-center justify-between flex-wrap gap-4">
          {/* Left: Results count and filters */}
          <div className="flex items-center gap-4">
            <p className="text-sm text-muted-foreground">
              Found <span className="font-semibold text-foreground">{resultCount}</span> providers in your area
            </p>
            
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowFilters(!showFilters)}
              className={showFilters ? 'bg-primary text-white' : ''}
            >
              <SlidersHorizontal size={16} className="mr-2" />
              Filters
            </Button>
          </div>

          {/* Right: Sort and view options */}
          <div className="flex items-center gap-4">
            {/* Sort Dropdown */}
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">Sort by:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as SortOption)}
                className="bg-background border border-input rounded px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              >
                {sortOptions.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            {/* View Mode Toggle */}
            <div className="flex bg-muted rounded-md p-1">
              <Button
                size="sm"
                variant={viewMode === 'list' ? 'default' : 'ghost'}
                onClick={() => setViewMode('list')}
                className="h-8 px-3"
              >
                <List size={16} />
              </Button>
              <Button
                size="sm"
                variant={viewMode === 'grid' ? 'default' : 'ghost'}
                onClick={() => setViewMode('grid')}
                className="h-8 px-3"
              >
                <Grid size={16} />
              </Button>
              <Button
                size="sm"
                variant={viewMode === 'map' ? 'default' : 'ghost'}
                onClick={() => setViewMode('map')}
                className="h-8 px-3"
              >
                <MapIcon size={16} />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};