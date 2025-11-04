import { Search, MapPin } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useLanguage } from '@/contexts/LanguageContext';
import { useNavigate } from 'react-router-dom';

export const ModernHeroSection = () => {
  const { t } = useLanguage();
  const navigate = useNavigate();

  const handleSearch = () => {
    navigate('/search');
  };

  return (
    <section className="relative pt-20 pb-32 px-4 overflow-hidden">
      {/* Background Gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-secondary/5 to-accent/5" />
      
      {/* Decorative Elements */}
      <div className="absolute top-20 right-10 w-72 h-72 bg-primary/10 rounded-full blur-3xl" />
      <div className="absolute bottom-20 left-10 w-96 h-96 bg-accent/10 rounded-full blur-3xl" />

      <div className="container mx-auto max-w-6xl relative z-10">
        <div className="text-center mb-12 animate-fade-in">
          {/* Main Title */}
          <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold mb-6 bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent leading-tight">
            Trouvez les meilleurs soins<br />à Sidi Bel Abbès
          </h1>
          
          {/* Subtitle */}
          <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto mb-10">
            Découvrez et prenez rendez-vous avec les meilleurs professionnels de santé près de chez vous
          </p>

          {/* CTA Button */}
          <Button 
            size="lg" 
            onClick={handleSearch}
            className="bg-gradient-to-r from-primary to-accent hover:opacity-90 text-white px-8 py-6 text-lg rounded-full shadow-lg hover:shadow-xl transition-all hover:scale-105"
            aria-label="Search for healthcare provider"
          >
            <Search className="mr-2 h-5 w-5" />
            Rechercher un prestataire
          </Button>
        </div>

        {/* Hero Image/Illustration Placeholder */}
        <div className="mt-16 relative">
          <div className="aspect-video max-w-4xl mx-auto rounded-3xl bg-gradient-to-br from-primary/20 to-accent/20 shadow-2xl backdrop-blur-sm border border-primary/20 flex items-center justify-center">
            <div className="text-center p-8">
              <div className="w-32 h-32 mx-auto mb-6 rounded-full bg-primary/20 flex items-center justify-center">
                <MapPin className="h-16 w-16 text-primary" />
              </div>
              <p className="text-2xl font-semibold text-muted-foreground">
                Illustration médicale moderne
              </p>
              <p className="text-sm text-muted-foreground mt-2">
                (À remplacer par une vraie image/illustration)
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
