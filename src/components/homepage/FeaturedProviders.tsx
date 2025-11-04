import { useState } from 'react';
import { ChevronLeft, ChevronRight, Star, MapPin, Shield, Clock, ArrowRight } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useLanguage } from '@/contexts/LanguageContext';
import { useScrollReveal } from '@/hooks/useScrollReveal';
import { Link } from 'react-router-dom';

interface Provider {
  id: string;
  name: string;
  specialty: string;
  location: string;
  rating: number;
  reviewCount: number;
  distance: string;
  isVerified: boolean;
  isAvailable: boolean;
  image: string;
  nextAvailable: string;
}

export const FeaturedProviders = () => {
  const { t } = useLanguage();
  const sectionRef = useScrollReveal();
  const [currentSlide, setCurrentSlide] = useState(0);

  // Mock data - in real app this would come from props or API
  const providers: Provider[] = [
    {
      id: '1',
      name: 'Dr. Ahmed Benali',
      specialty: 'Cardiologue',
      location: 'Alger Centre',
      rating: 4.9,
      reviewCount: 124,
      distance: '1.2 km',
      isVerified: true,
      isAvailable: true,
      image: '/placeholder.svg',
      nextAvailable: 'Aujourd\'hui 14:30'
    },
    {
      id: '2',
      name: 'Dr. Fatima Khodja',
      specialty: 'Pédiatre',
      location: 'Oran',
      rating: 4.8,
      reviewCount: 89,
      distance: '2.1 km',
      isVerified: true,
      isAvailable: false,
      image: '/placeholder.svg',
      nextAvailable: 'Demain 09:00'
    },
    {
      id: '3',
      name: 'Clinique El Rahma',
      specialty: 'Médecine Générale',
      location: 'Constantine',
      rating: 4.7,
      reviewCount: 203,
      distance: '0.8 km',
      isVerified: true,
      isAvailable: true,
      image: '/placeholder.svg',
      nextAvailable: 'Maintenant'
    },
    {
      id: '4',
      name: 'Dr. Youcef Meziane',
      specialty: 'Dermatologue',
      location: 'Annaba',
      rating: 4.9,
      reviewCount: 156,
      distance: '3.2 km',
      isVerified: true,
      isAvailable: true,
      image: '/placeholder.svg',
      nextAvailable: 'Aujourd\'hui 16:00'
    },
    {
      id: '5',
      name: 'Centre Médical Atlas',
      specialty: 'Radiologie',
      location: 'Sétif',
      rating: 4.6,
      reviewCount: 78,
      distance: '1.5 km',
      isVerified: true,
      isAvailable: false,
      image: '/placeholder.svg',
      nextAvailable: 'Lundi 08:00'
    }
  ];

  const itemsPerSlide = 3;
  const maxSlides = Math.ceil(providers.length / itemsPerSlide);

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % maxSlides);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + maxSlides) % maxSlides);
  };

  const getCurrentProviders = () => {
    const start = currentSlide * itemsPerSlide;
    return providers.slice(start, start + itemsPerSlide);
  };

  return (
    <section ref={sectionRef} className="py-20 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row justify-between items-center mb-16 animate-slide-up">
          <div>
            <h2 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              {t('providers.featured')}
            </h2>
            <p className="text-xl text-muted-foreground">
              Highly rated and verified healthcare professionals
            </p>
          </div>
          
          {/* Navigation Controls */}
          <div className="flex items-center gap-3 mt-6 md:mt-0">
            <Button
              variant="outline"
              size="sm"
              onClick={prevSlide}
              disabled={currentSlide === 0}
              className="hover-lift"
            >
              <ChevronLeft size={16} />
            </Button>
            <span className="text-sm text-muted-foreground px-3">
              {currentSlide + 1} / {maxSlides}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={nextSlide}
              disabled={currentSlide === maxSlides - 1}
              className="hover-lift"
            >
              <ChevronRight size={16} />
            </Button>
          </div>
        </div>

        {/* Providers Grid - Responsive */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {getCurrentProviders().map((provider, index) => (
            <Card 
              key={provider.id}
              className="group glass-card hover:shadow-xl transition-all duration-300 cursor-pointer border border-primary/10 hover:border-primary/30 hover-lift animate-scale-in"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <CardContent className="p-6">
                {/* Provider Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                      <span className="text-primary font-semibold">
                        {provider.name.split(' ').map(n => n[0]).join('')}
                      </span>
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg group-hover:text-primary transition-colors">
                        {provider.name}
                      </h3>
                      <p className="text-muted-foreground text-sm">{provider.specialty}</p>
                    </div>
                  </div>
                  
                  {provider.isVerified && (
                    <Badge variant="secondary" className="gap-1">
                      <Shield size={12} />
                      {t('providers.verified')}
                    </Badge>
                  )}
                </div>

                {/* Location & Rating */}
                <div className="space-y-3 mb-4">
                  <div className="flex items-center gap-2 text-sm">
                    <MapPin size={14} className="text-muted-foreground" />
                    <span>{provider.location}</span>
                    <span className="text-muted-foreground">•</span>
                    <span className="text-primary font-medium">{provider.distance}</span>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-1">
                      <Star className="text-yellow-400 fill-yellow-400" size={14} />
                      <span className="font-medium">{provider.rating}</span>
                      <span className="text-muted-foreground text-sm">({provider.reviewCount})</span>
                    </div>
                    
                    <div className="flex items-center gap-1">
                      <Clock size={14} className={provider.isAvailable ? 'text-green-500' : 'text-orange-500'} />
                      <span className={`text-sm font-medium ${provider.isAvailable ? 'text-green-600' : 'text-orange-600'}`}>
                        {provider.nextAvailable}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Availability Status */}
                <div className="mb-4">
                  <Badge 
                    variant={provider.isAvailable ? "default" : "secondary"}
                    className={provider.isAvailable ? "bg-green-100 text-green-700 border-green-200" : ""}
                  >
                    {provider.isAvailable ? 'Available Now' : 'Next Available'}
                  </Badge>
                </div>

                {/* Action Button */}
                <Link to={`/provider/${provider.id}`}>
                  <Button 
                    className="w-full group-hover:bg-primary group-hover:text-white transition-all duration-300 ripple-effect"
                    variant="outline"
                    aria-label={`View profile of ${provider.name}`}
                  >
                    View Profile
                    <ArrowRight className="ml-2 group-hover:translate-x-1 transition-transform" size={14} />
                  </Button>
                </Link>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* View All Button */}
        <div className="text-center mt-12 animate-slide-up" style={{ animationDelay: '0.6s' }}>
          <Link to="/search">
            <Button size="lg" className="hover-lift ripple-effect">
              {t('providers.viewAll')}
              <ArrowRight className="ml-2" size={18} />
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
};