import { HeroSection } from '@/components/homepage/HeroSection';
import { ServicesOverview } from '@/components/homepage/ServicesOverview';
import { FeaturedProviders } from '@/components/homepage/FeaturedProviders';
import { AIAssistantPreview } from '@/components/homepage/AIAssistantPreview';
import { StatsSection } from '@/components/homepage/StatsSection';
import { ComprehensiveFooter } from '@/components/homepage/ComprehensiveFooter';
import { TestimonialsSection } from '@/components/landing/TestimonialsSection';
import { MobileAppSection } from '@/components/MobileAppSection';
import { MapSection } from '@/components/MapSection';
import { ScrollToTop } from '@/components/ScrollToTop';
import { ToastContainer } from '@/components/ToastContainer';
import { ParticleBackground } from '@/components/ParticleBackground';
import { useToastNotifications } from '@/hooks/useToastNotifications';

export const NewIndex = () => {
  const { toasts } = useToastNotifications();

  return (
    <div className="min-h-screen relative overflow-hidden">
      <ParticleBackground />
      <ToastContainer toasts={toasts} />
      
      {/* Hero Section with Advanced Search */}
      <HeroSection />
      
      {/* Services Overview */}
      <ServicesOverview />
      
      {/* Featured Providers Carousel */}
      <FeaturedProviders />
      
      {/* AI Assistant Preview */}
      <AIAssistantPreview />
      
      {/* Statistics Section */}
      <StatsSection />
      
      {/* Testimonials */}
      <TestimonialsSection showTestimonials={true} />
      
      {/* Map Section */}
      <MapSection />
      
      {/* Mobile App */}
      <MobileAppSection />
      
      {/* Comprehensive Footer */}
      <ComprehensiveFooter />
      
      {/* Scroll to Top */}
      <ScrollToTop />
    </div>
  );
};

export default NewIndex;