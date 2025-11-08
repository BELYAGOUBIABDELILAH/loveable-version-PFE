import { Users, MapPin, Star, Shield } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { useLanguage } from '@/hooks/useLanguage';
import { useScrollReveal } from '@/hooks/useScrollReveal';
import CounterAnimation from '@/components/CounterAnimation';

interface Stat {
  key: string;
  icon: React.ComponentType<any>;
  value: number;
  suffix: string;
  description: string;
  color: string;
}

export const StatsSection = () => {
  const { t } = useLanguage();
  const sectionRef = useScrollReveal();

  const stats: Stat[] = [
    {
      key: 'providers',
      icon: Shield,
      value: 450,
      suffix: '+',
      description: 'Verified healthcare providers across Algeria',
      color: 'text-primary'
    },
    {
      key: 'cities',
      icon: MapPin,
      value: 48,
      suffix: '',
      description: 'Cities and towns covered nationwide',
      color: 'text-secondary'
    },
    {
      key: 'patients',
      icon: Users,
      value: 15000,
      suffix: '+',
      description: 'Happy patients served this year',
      color: 'text-accent'
    },
    {
      key: 'rating',
      icon: Star,
      value: 4.8,
      suffix: '/5',
      description: 'Average satisfaction rating',
      color: 'text-yellow-500'
    }
  ];

  return (
    <section ref={sectionRef} className="py-20 px-4 bg-gradient-to-br from-muted/20 via-background to-primary/5">
      <div className="max-w-7xl mx-auto">
        {/* Section Header */}
        <div className="text-center mb-16 animate-slide-up">
          <h2 className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
            Trusted by Thousands
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Join the growing community of patients and healthcare providers who trust CityHealth
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {stats.map((stat, index) => {
            const IconComponent = stat.icon;
            return (
              <Card 
                key={stat.key}
                className="group glass-card hover:shadow-xl transition-all duration-500 border border-primary/10 hover:border-primary/30 hover-lift animate-scale-in"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <CardContent className="p-8 text-center">
                  {/* Icon */}
                  <div className="relative mb-6">
                    <div className={`w-16 h-16 ${stat.color.replace('text-', 'bg-')}/10 rounded-2xl flex items-center justify-center mx-auto group-hover:scale-110 transition-transform duration-300 animate-float`} style={{ animationDelay: `${index * 0.2}s` }}>
                      <IconComponent className={`${stat.color} group-hover:scale-110 transition-transform duration-300`} size={28} />
                    </div>
                    {/* Glow effect */}
                    <div className={`absolute inset-0 w-16 h-16 ${stat.color.replace('text-', 'bg-')}/20 rounded-2xl mx-auto opacity-0 group-hover:opacity-100 group-hover:animate-ping`} />
                  </div>

                  {/* Value */}
                  <div className="space-y-3">
                    <div className={`text-4xl md:text-5xl font-bold ${stat.color}`}>
                      <CounterAnimation 
                        end={stat.value} 
                        duration={2500}
                        suffix={stat.suffix}
                      />
                    </div>
                    
                    {/* Label */}
                    <h3 className="text-lg font-semibold text-foreground group-hover:text-primary transition-colors">
                      {t(`stats.${stat.key}`)}
                    </h3>
                    
                    {/* Description */}
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {stat.description}
                    </p>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Bottom Achievement Badges */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-16">
          {[
            {
              title: 'Ministry Certified',
              description: 'All providers verified by Algerian Health Ministry',
              icon: Shield,
              badge: 'Official'
            },
            {
              title: '24/7 Support',
              description: 'Round-the-clock emergency assistance',
              icon: Users,
              badge: 'Always On'
            },
            {
              title: 'Multilingual',
              description: 'Services in Arabic, French, and English',
              icon: MapPin,
              badge: '3 Languages'
            }
          ].map((achievement, index) => {
            const IconComponent = achievement.icon;
            return (
              <div 
                key={index}
                className="text-center space-y-3 animate-slide-up"
                style={{ animationDelay: `${0.8 + index * 0.1}s` }}
              >
                <div className="flex items-center justify-center gap-3">
                  <IconComponent className="text-primary" size={20} />
                  <span className="font-semibold">{achievement.title}</span>
                  <span className="px-2 py-1 bg-primary/10 text-primary text-xs rounded-full">
                    {achievement.badge}
                  </span>
                </div>
                <p className="text-sm text-muted-foreground">
                  {achievement.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};