import { ArrowRight, Phone, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/hooks/useLanguage';
import { useScrollReveal } from '@/hooks/useScrollReveal';
import { AdvancedSearch } from './AdvancedSearch';

interface SearchQuery {
  text: string;
  location: string;
  service: string;
  availability: string;
}

export const HeroSection = () => {
  const { t } = useLanguage();
  const sectionRef = useScrollReveal();

  const handleSearch = (_query: SearchQuery) => {
    // TODO: Navigate to search results
  };

  return (
    <section 
      ref={sectionRef} 
      className="relative min-h-screen flex items-center py-20 px-4 bg-gradient-to-br from-primary/10 via-background to-secondary/10"
      style={{
        backgroundImage: `
          radial-gradient(circle at 20% 50%, hsl(var(--primary) / 0.05) 0%, transparent 50%),
          radial-gradient(circle at 80% 20%, hsl(var(--secondary) / 0.05) 0%, transparent 50%),
          radial-gradient(circle at 40% 80%, hsl(var(--accent) / 0.03) 0%, transparent 50%)
        `
      }}
    >
      {/* Medical Pattern Overlay */}
      <div className="absolute inset-0 opacity-5">
        <div 
          className="w-full h-full"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23000000' fill-opacity='0.1'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3Ccircle cx='10' cy='30' r='1'/%3E%3Ccircle cx='50' cy='30' r='1'/%3E%3Ccircle cx='30' cy='10' r='1'/%3E%3Ccircle cx='30' cy='50' r='1'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
          }}
        />
      </div>

      <div className="max-w-7xl mx-auto w-full">
        <div className="text-center mb-12 animate-slide-up">
          {/* Main Title */}
          <h1 className="text-5xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent animate-gradient">
            {t('hero.title')}
          </h1>
          
          {/* Subtitle */}
          <p className="text-xl md:text-2xl text-muted-foreground max-w-4xl mx-auto leading-relaxed animate-slide-up" style={{ animationDelay: '0.2s' }}>
            {t('hero.subtitle')}
          </p>
        </div>

        {/* Advanced Search Component */}
        <div className="max-w-5xl mx-auto mb-8 animate-scale-in" style={{ animationDelay: '0.4s' }}>
          <AdvancedSearch onSearch={handleSearch} />
        </div>

        {/* Emergency CTA */}
        <div className="text-center animate-slide-up" style={{ animationDelay: '0.6s' }}>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Button 
              size="lg" 
              variant="destructive" 
              className="animate-pulse-slow hover:animate-none px-8 py-4 text-lg"
            >
              <Phone className="mr-2" size={20} />
              {t('emergency.title')} - {t('emergency.subtitle')}
            </Button>
            
            <Button 
              size="lg" 
              variant="outline" 
              className="hover-lift px-8 py-4 text-lg border-primary/20 hover:border-primary"
            >
              <Sparkles className="mr-2" size={20} />
              {t('ai.try')}
              <ArrowRight className="ml-2" size={20} />
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
};