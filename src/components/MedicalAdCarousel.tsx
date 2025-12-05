import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ChevronLeft, ChevronRight, ExternalLink } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import useEmblaCarousel from 'embla-carousel-react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '@/hooks/useLanguage';

interface MedicalAd {
  id: string;
  provider_id: string;
  title: string;
  content: string;
  image_url: string | null;
  display_priority: number;
  start_date: string;
  end_date: string;
  created_at: string;
  provider?: {
    id: string;
    business_name: string;
    provider_type: string;
    avatar_url: string | null;
  };
}

interface MedicalAdCarouselProps {
  className?: string;
}

export default function MedicalAdCarousel({ className = '' }: MedicalAdCarouselProps) {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const [medicalAds, setMedicalAds] = useState<MedicalAd[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Initialize Embla Carousel
  const [emblaRef, emblaApi] = useEmblaCarousel({
    loop: true,
    align: 'start',
    skipSnaps: false,
  });

  const scrollPrev = useCallback(() => {
    if (emblaApi) emblaApi.scrollPrev();
  }, [emblaApi]);

  const scrollNext = useCallback(() => {
    if (emblaApi) emblaApi.scrollNext();
  }, [emblaApi]);

  // Fetch approved medical ads
  const fetchApprovedAds = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const { data: ads, error: adsError } = await (supabase as any)
        .from('medical_ads')
        .select(`
          *,
          provider:providers(
            id,
            business_name,
            provider_type,
            avatar_url
          )
        `)
        .eq('status', 'approved')
        .gte('end_date', new Date().toISOString().split('T')[0]) // Only show ads that haven't expired
        .order('display_priority', { ascending: false })
        .order('created_at', { ascending: false });

      if (adsError) {
        console.error('Error fetching medical ads:', adsError);
        setError('Impossible de charger les annonces');
        return;
      }

      setMedicalAds(ads || []);
    } catch (error) {
      console.error('Error in fetchApprovedAds:', error);
      setError('Une erreur inattendue s\'est produite');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchApprovedAds();
  }, []);

  // Auto-rotate every 5 seconds
  useEffect(() => {
    if (!emblaApi || medicalAds.length <= 1) return;

    const autoplay = setInterval(() => {
      emblaApi.scrollNext();
    }, 5000);

    return () => clearInterval(autoplay);
  }, [emblaApi, medicalAds.length]);

  const handleAdClick = (providerId: string) => {
    navigate(`/provider/${providerId}`);
  };

  const truncateContent = (content: string, maxLength: number = 120) => {
    if (content.length <= maxLength) return content;
    return content.substring(0, maxLength).trim() + '...';
  };

  const getProviderTypeLabel = (type: string) => {
    switch (type) {
      case 'doctor':
        return 'Médecin';
      case 'clinic':
        return 'Clinique';
      case 'hospital':
        return 'Hôpital';
      case 'pharmacy':
        return 'Pharmacie';
      case 'laboratory':
        return 'Laboratoire';
      default:
        return type;
    }
  };

  if (isLoading) {
    return (
      <div className={`w-full ${className}`}>
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`w-full ${className}`}>
        <Card>
          <CardContent className="flex items-center justify-center py-12">
            <p className="text-muted-foreground">{error}</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (medicalAds.length === 0) {
    return null; // Don't show anything if no approved ads
  }

  return (
    <div className={`w-full ${className}`}>
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">{t('medicalAds.title')}</h2>
          <p className="text-muted-foreground">{t('medicalAds.subtitle')}</p>
        </div>
        {medicalAds.length > 1 && (
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="icon"
              onClick={scrollPrev}
              className="h-8 w-8"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={scrollNext}
              className="h-8 w-8"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        )}
      </div>

      <div className="overflow-hidden" ref={emblaRef}>
        <div className="flex">
          {medicalAds.map((ad) => (
            <div key={ad.id} className="flex-[0_0_100%] min-w-0 pr-4 md:flex-[0_0_50%] lg:flex-[0_0_33.333%]">
              <Card 
                className="h-full cursor-pointer transition-all hover:shadow-lg hover:scale-[1.02]"
                onClick={() => handleAdClick(ad.provider_id)}
              >
                <CardContent className="p-0">
                  {ad.image_url && (
                    <div className="relative h-48 overflow-hidden rounded-t-lg">
                      <img
                        src={ad.image_url}
                        alt={ad.title}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute top-2 left-2">
                        <Badge variant="secondary" className="bg-white/90 text-primary">
                          {t('medicalAds.adLabel')}
                        </Badge>
                      </div>
                    </div>
                  )}
                  
                  <div className="p-4">
                    {!ad.image_url && (
                      <div className="mb-3">
                        <Badge variant="secondary">
                          {t('medicalAds.adLabel')}
                        </Badge>
                      </div>
                    )}
                    
                    <h3 className="font-semibold text-lg mb-2 line-clamp-2">
                      {ad.title}
                    </h3>
                    
                    <p className="text-muted-foreground text-sm mb-3 line-clamp-3">
                      {truncateContent(ad.content)}
                    </p>
                    
                    {ad.provider && (
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          {ad.provider.avatar_url ? (
                            <img
                              src={ad.provider.avatar_url}
                              alt={ad.provider.business_name}
                              className="w-8 h-8 rounded-full object-cover"
                            />
                          ) : (
                            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                              <span className="text-xs font-medium text-primary">
                                {ad.provider.business_name.charAt(0).toUpperCase()}
                              </span>
                            </div>
                          )}
                          <div>
                            <p className="font-medium text-sm">{ad.provider.business_name}</p>
                            <p className="text-xs text-muted-foreground">
                              {getProviderTypeLabel(ad.provider.provider_type)}
                            </p>
                          </div>
                        </div>
                        
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                          <ExternalLink className="h-4 w-4" />
                        </Button>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}