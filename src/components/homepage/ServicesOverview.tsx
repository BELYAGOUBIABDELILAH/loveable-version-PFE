import { ArrowRight, Stethoscope, UserPlus, Pill, TestTube, Building, Siren } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/contexts/LanguageContext';
import { useScrollReveal } from '@/hooks/useScrollReveal';
import { Link } from 'react-router-dom';

interface ServiceCard {
  key: string;
  icon: React.ComponentType<any>;
  count: string;
  href: string;
}

export const ServicesOverview = () => {
  const { t } = useLanguage();
  const sectionRef = useScrollReveal();

  const services: ServiceCard[] = [
    {
      key: 'generalDoctors',
      icon: Stethoscope,
      count: '120+',
      href: '/search?type=doctors'
    },
    {
      key: 'specialists',
      icon: UserPlus,
      count: '85+',
      href: '/search?type=specialists'
    },
    {
      key: 'pharmacies',
      icon: Pill,
      count: '200+',
      href: '/search?type=pharmacies'
    },
    {
      key: 'laboratories',
      icon: TestTube,
      count: '45+',
      href: '/search?type=laboratories'
    },
    {
      key: 'clinics',
      icon: Building,
      count: '60+',
      href: '/search?type=clinics'
    },
    {
      key: 'emergency',
      icon: Siren,
      count: '24/7',
      href: '/emergency'
    }
  ];

  return (
    <section ref={sectionRef} className="py-20 px-4 bg-gradient-to-br from-primary/5 via-background to-secondary/5">
      <div className="max-w-7xl mx-auto">
        {/* Section Header */}
        <div className="text-center mb-16 animate-slide-up">
          <h2 className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
            {t('services.title')}
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Discover our comprehensive healthcare services across Algeria
          </p>
        </div>

        {/* Services Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {services.map((service, index) => {
            const IconComponent = service.icon;
            return (
              <Card 
                key={service.key}
                className="group glass-card hover:shadow-xl transition-all duration-500 cursor-pointer border border-primary/10 hover:border-primary/30 hover-lift animate-scale-in"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <CardContent className="p-8">
                  <div className="text-center space-y-6">
                    {/* Icon */}
                    <div className="relative">
                      <div className="w-20 h-20 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto group-hover:bg-primary/20 transition-all duration-300 animate-float" style={{ animationDelay: `${index * 0.2}s` }}>
                        <IconComponent className="text-primary group-hover:scale-110 transition-transform duration-300" size={32} />
                      </div>
                      {/* Glow effect */}
                      <div className="absolute inset-0 w-20 h-20 bg-primary/20 rounded-2xl mx-auto opacity-0 group-hover:opacity-100 group-hover:animate-ping" />
                    </div>

                    {/* Content */}
                    <div className="space-y-3">
                      <h3 className="text-xl font-semibold group-hover:text-primary transition-colors">
                        {t(`services.${service.key}`)}
                      </h3>
                      <p className="text-muted-foreground text-sm leading-relaxed">
                        {t(`services.${service.key}.desc`)}
                      </p>
                      
                      {/* Provider Count */}
                      <div className="flex items-center justify-center gap-2 text-primary font-semibold">
                        <span className="text-2xl">{service.count}</span>
                        <span className="text-sm">providers</span>
                      </div>
                    </div>

                    {/* Action */}
                    <Link to={service.href}>
                      <Button 
                        variant="outline" 
                        className="group-hover:bg-primary group-hover:text-white group-hover:border-primary transition-all duration-300 ripple-effect"
                      >
                        {t('services.explore')}
                        <ArrowRight className="ml-2 group-hover:translate-x-1 transition-transform" size={16} />
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Bottom CTA */}
        <div className="text-center mt-16 animate-slide-up" style={{ animationDelay: '0.8s' }}>
          <div className="glass-card rounded-2xl p-8 border border-primary/20">
            <h3 className="text-2xl font-bold mb-4">Need immediate assistance?</h3>
            <p className="text-muted-foreground mb-6">
              Our emergency services are available 24/7 across all major cities in Algeria
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" variant="destructive" className="animate-pulse-slow hover:animate-none">
                <Siren className="mr-2" size={18} />
                Emergency Services
              </Button>
              <Button size="lg" variant="outline">
                Find Nearest Hospital
                <ArrowRight className="ml-2" size={16} />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};