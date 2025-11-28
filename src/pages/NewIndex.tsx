import { Header } from '@/components/layout/Header';
import { ModernHeroSection } from '@/components/homepage/ModernHeroSection';
import { QuickSearchSection } from '@/components/homepage/QuickSearchSection';
import { FeaturedProviders } from '@/components/homepage/FeaturedProviders';
import { TestimonialsSlider } from '@/components/homepage/TestimonialsSlider';
import { ProviderCTA } from '@/components/homepage/ProviderCTA';
import { ModernFooter } from '@/components/homepage/ModernFooter';
import { ScrollToTop } from '@/components/ScrollToTop';
import MedicalAdCarousel from '@/components/MedicalAdCarousel';
import { SmartSuggestions } from '@/components/SmartSuggestions';
import { useState, useEffect } from 'react';

export const NewIndex = () => {
  const [userLocation, setUserLocation] = useState<{ latitude: number; longitude: number } | undefined>();

  // Get user location for smart suggestions with fallback
  useEffect(() => {
    // Coordonnées par défaut de Sidi Bel Abbès, Algérie
    const defaultLocation = {
      latitude: 35.1903,
      longitude: -0.6308,
    };

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          });
        },
        (error) => {
          console.log('Location access denied or unavailable, using default:', error);
          // Fallback vers les coordonnées de Sidi Bel Abbès
          setUserLocation(defaultLocation);
        },
        {
          timeout: 5000,
          maximumAge: 300000, // 5 minutes cache
        }
      );
    } else {
      // Fallback si géolocalisation non supportée
      setUserLocation(defaultLocation);
    }
  }, []);

  return (
    <div className="min-h-screen bg-background">
      {/* Header - Sticky Navigation */}
      <Header />
      
      {/* Hero Section */}
      <ModernHeroSection />
      
      {/* Quick Search Section */}
      <QuickSearchSection />
      
      {/* Medical Ads Carousel */}
      <section className="py-16 px-4 bg-secondary/20">
        <div className="max-w-7xl mx-auto">
          <MedicalAdCarousel />
        </div>
      </section>

      {/* Smart Suggestions */}
      <section className="py-16 px-4">
        <div className="max-w-7xl mx-auto">
          <SmartSuggestions userLocation={userLocation} />
        </div>
      </section>
      
      {/* Featured Providers */}
      <FeaturedProviders />
      
      {/* Testimonials Slider */}
      <TestimonialsSlider />
      
      {/* Provider CTA Banner */}
      <ProviderCTA />
      
      {/* Footer */}
      <ModernFooter />
      
      {/* Scroll to Top Button */}
      <ScrollToTop />
    </div>
  );
};

export default NewIndex;