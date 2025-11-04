import { ArrowRight, Briefcase, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Link } from 'react-router-dom';

export const ProviderCTA = () => {
  const benefits = [
    'Visibilité accrue auprès des patients',
    'Gestion simplifiée des rendez-vous',
    'Profil professionnel vérifié',
    'Statistiques et analytics détaillés'
  ];

  return (
    <section className="py-20 px-4 relative overflow-hidden">
      {/* Background Gradient */}
      <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-accent/5 to-primary/5" />
      
      <div className="container mx-auto max-w-6xl relative z-10">
        <Card className="glass-card border-primary/20 shadow-2xl overflow-hidden">
          <CardContent className="p-0">
            <div className="grid md:grid-cols-2 gap-8 p-8 md:p-12">
              {/* Left Side */}
              <div className="flex flex-col justify-center">
                <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full w-fit mb-6">
                  <Briefcase className="h-4 w-4" />
                  <span className="text-sm font-semibold">Pour les professionnels</span>
                </div>
                
                <h2 className="text-3xl md:text-4xl font-bold mb-4 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                  Vous êtes un professionnel de santé ?
                </h2>
                
                <p className="text-lg text-muted-foreground mb-8">
                  Rejoignez notre plateforme gratuitement et développez votre patientèle à Sidi Bel Abbès
                </p>

                <div className="space-y-3 mb-8">
                  {benefits.map((benefit, index) => (
                    <div key={index} className="flex items-start gap-3">
                      <CheckCircle className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                      <span className="text-foreground">{benefit}</span>
                    </div>
                  ))}
                </div>

                <Link to="/contact">
                  <Button 
                    size="lg" 
                    className="bg-gradient-to-r from-primary to-accent hover:opacity-90 text-white px-8 py-6 text-lg rounded-full shadow-lg hover:shadow-xl transition-all group"
                    aria-label="Register your healthcare practice"
                  >
                    Inscrire mon cabinet
                    <ArrowRight className="ml-2 group-hover:translate-x-1 transition-transform" size={18} />
                  </Button>
                </Link>
              </div>

              {/* Right Side */}
              <div className="flex items-center justify-center">
                <div className="relative">
                  <div className="w-64 h-64 rounded-3xl bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center backdrop-blur-sm">
                    <div className="text-center p-6">
                      <Briefcase className="h-20 w-20 mx-auto mb-4 text-primary" />
                      <p className="text-3xl font-bold text-foreground mb-1">+500</p>
                      <p className="text-muted-foreground">Professionnels inscrits</p>
                    </div>
                  </div>
                  
                  <div className="absolute -top-4 -right-4 w-24 h-24 bg-accent/10 rounded-full blur-2xl" />
                  <div className="absolute -bottom-4 -left-4 w-32 h-32 bg-primary/10 rounded-full blur-2xl" />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </section>
  );
};
