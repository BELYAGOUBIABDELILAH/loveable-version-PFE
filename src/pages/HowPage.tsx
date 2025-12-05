import { useState, useEffect, useRef } from 'react';
import { useAnimateIn } from '@/lib/animations';
import { 
  Search, 
  MapPin, 
  Calendar, 
  Star,
  CheckCircle,
  UserPlus,
  FileText,
  Shield,
  Phone,
  Heart,
  Building2,
  Users
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Link } from 'react-router-dom';

const StepCard = ({ 
  number, 
  icon, 
  title, 
  description,
  color = "primary" 
}: { 
  number: number,
  icon: React.ReactNode, 
  title: string, 
  description: string,
  color?: string 
}) => {
  return (
    <div className="relative">
      <div className={`absolute -top-4 -left-4 w-10 h-10 rounded-full bg-primary text-white flex items-center justify-center font-bold text-lg z-10`}>
        {number}
      </div>
      <Card className="glass-card h-full pt-6">
        <CardContent className="p-6">
          <div className="w-12 h-12 flex items-center justify-center rounded-full bg-primary/10 mb-4">
            {icon}
          </div>
          <h3 className="text-xl font-bold mb-2">{title}</h3>
          <p className="text-foreground/80">{description}</p>
        </CardContent>
      </Card>
    </div>
  );
};

const FeatureItem = ({ icon, text }: { icon: React.ReactNode, text: string }) => (
  <div className="flex items-start gap-3">
    <div className="w-6 h-6 mt-1 flex-shrink-0 text-primary">
      {icon}
    </div>
    <p className="text-foreground/80">{text}</p>
  </div>
);


const HowPage = () => {
  const [loading, setLoading] = useState(true);
  const showContent = useAnimateIn(false, 300);
  const heroRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
    }, 1000);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      if (heroRef.current) {
        const scrollPosition = window.scrollY;
        const parallaxFactor = 0.4;
        heroRef.current.style.transform = `translateY(${scrollPosition * parallaxFactor}px)`;
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);
  
  return (
    <div className="relative overflow-hidden">
      {/* Background elements */}
      <div className="absolute top-0 left-0 w-full h-[500px] bg-gradient-to-b from-primary/5 to-transparent -z-10"></div>
      <div className="absolute top-1/3 right-0 w-[300px] h-[300px] rounded-full bg-primary/5 blur-3xl -z-10"></div>
      <div className="absolute bottom-1/3 left-0 w-[250px] h-[250px] rounded-full bg-accent/5 blur-3xl -z-10"></div>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-36 pb-24">
        {/* Hero Section */}
        <div className="flex flex-col items-center text-center mb-24">
          <div ref={heroRef} className="relative w-full max-w-3xl mx-auto">
            <div className="absolute -z-10 w-[300px] h-[300px] rounded-full bg-gradient-to-r from-primary/30 to-accent/30 blur-3xl left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2"></div>
            <div className="glass-panel rounded-full py-5 px-8 inline-block mx-auto mb-12">
              <h1 className="text-2xl md:text-3xl font-bold text-primary">Comment utiliser CityHealth ?</h1>
            </div>
            
            <p className="text-xl text-center text-foreground/80 max-w-2xl mx-auto mb-12">
              Trouvez et contactez les meilleurs professionnels de santé de Sidi Bel Abbès en quelques clics.
            </p>
            
            <div className="flex justify-center gap-4">
              <Button size="lg" className="rounded-full" asChild>
                <Link to="/search">Rechercher un prestataire</Link>
              </Button>
              <Button size="lg" variant="outline" className="rounded-full" asChild>
                <Link to="/provider/register">Devenir prestataire</Link>
              </Button>
            </div>
          </div>
        </div>

        {/* For Citizens Section */}
        <div className="mb-24">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 bg-blue-50 px-4 py-2 rounded-full mb-4">
              <Users className="w-5 h-5 text-blue-600" />
              <span className="text-blue-700 font-medium">Pour les citoyens</span>
            </div>
            <h2 className="text-3xl font-bold">Trouvez votre professionnel de santé</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <StepCard 
              number={1}
              icon={<Search className="w-6 h-6 text-primary" />}
              title="Recherchez"
              description="Utilisez notre barre de recherche pour trouver un médecin, une pharmacie, un laboratoire ou tout autre prestataire de santé."
            />
            <StepCard 
              number={2}
              icon={<MapPin className="w-6 h-6 text-primary" />}
              title="Localisez"
              description="Consultez la carte interactive pour voir les prestataires près de chez vous et obtenir l'itinéraire."
            />
            <StepCard 
              number={3}
              icon={<Star className="w-6 h-6 text-primary" />}
              title="Comparez"
              description="Lisez les avis des autres patients et vérifiez les qualifications pour faire le meilleur choix."
            />
            <StepCard 
              number={4}
              icon={<Calendar className="w-6 h-6 text-primary" />}
              title="Contactez"
              description="Appelez directement ou prenez rendez-vous en ligne avec le prestataire de votre choix."
            />
          </div>
        </div>
        
        {/* Features for Citizens */}
        <div className="glass-panel p-8 rounded-lg mb-24">
          <h3 className="text-2xl font-bold mb-6 text-center">Fonctionnalités pour les patients</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FeatureItem 
              icon={<CheckCircle className="w-5 h-5" />}
              text="Recherche par spécialité, quartier ou nom du prestataire"
            />
            <FeatureItem 
              icon={<CheckCircle className="w-5 h-5" />}
              text="Filtres avancés : urgences, accessibilité PMR, visites à domicile"
            />
            <FeatureItem 
              icon={<CheckCircle className="w-5 h-5" />}
              text="Carte interactive avec géolocalisation"
            />
            <FeatureItem 
              icon={<CheckCircle className="w-5 h-5" />}
              text="Sauvegarde de vos prestataires favoris"
            />
            <FeatureItem 
              icon={<CheckCircle className="w-5 h-5" />}
              text="Informations détaillées : horaires, services, coordonnées"
            />
            <FeatureItem 
              icon={<CheckCircle className="w-5 h-5" />}
              text="Accès aux services d'urgence 24h/24"
            />
          </div>
        </div>

        {/* For Providers Section */}
        <div className="mb-24">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 bg-green-50 px-4 py-2 rounded-full mb-4">
              <Building2 className="w-5 h-5 text-green-600" />
              <span className="text-green-700 font-medium">Pour les professionnels de santé</span>
            </div>
            <h2 className="text-3xl font-bold">Rejoignez CityHealth</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <StepCard 
              number={1}
              icon={<UserPlus className="w-6 h-6 text-primary" />}
              title="Inscrivez-vous"
              description="Créez votre compte professionnel en quelques minutes avec vos informations de base."
            />
            <StepCard 
              number={2}
              icon={<FileText className="w-6 h-6 text-primary" />}
              title="Complétez votre profil"
              description="Ajoutez vos services, horaires, photos et documents pour un profil complet."
            />
            <StepCard 
              number={3}
              icon={<Shield className="w-6 h-6 text-primary" />}
              title="Faites-vous vérifier"
              description="Soumettez vos documents pour obtenir le badge 'Vérifié' et gagner la confiance des patients."
            />
            <StepCard 
              number={4}
              icon={<Users className="w-6 h-6 text-primary" />}
              title="Accueillez des patients"
              description="Recevez des demandes de rendez-vous et développez votre patientèle."
            />
          </div>
        </div>
        
        {/* Features for Providers */}
        <div className="glass-panel p-8 rounded-lg mb-24">
          <h3 className="text-2xl font-bold mb-6 text-center">Avantages pour les prestataires</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FeatureItem 
              icon={<CheckCircle className="w-5 h-5" />}
              text="Visibilité accrue auprès des patients de Sidi Bel Abbès"
            />
            <FeatureItem 
              icon={<CheckCircle className="w-5 h-5" />}
              text="Profil professionnel personnalisable avec photos et services"
            />
            <FeatureItem 
              icon={<CheckCircle className="w-5 h-5" />}
              text="Badge de vérification pour renforcer la confiance"
            />
            <FeatureItem 
              icon={<CheckCircle className="w-5 h-5" />}
              text="Gestion des rendez-vous depuis votre tableau de bord"
            />
            <FeatureItem 
              icon={<CheckCircle className="w-5 h-5" />}
              text="Statistiques de visites et d'engagement"
            />
            <FeatureItem 
              icon={<CheckCircle className="w-5 h-5" />}
              text="Inscription gratuite et sans engagement"
            />
          </div>
          
          <div className="flex justify-center mt-8">
            <Button size="lg" className="rounded-full" asChild>
              <Link to="/provider/register">
                S'inscrire comme prestataire
              </Link>
            </Button>
          </div>
        </div>

        {/* FAQ Section */}
        <div className="mb-24">
          <h2 className="text-3xl font-bold text-center mb-12">Questions fréquentes</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
            <Card className="glass-card">
              <CardContent className="p-6">
                <h4 className="font-bold mb-2">CityHealth est-il gratuit ?</h4>
                <p className="text-foreground/80 text-sm">
                  Oui, CityHealth est entièrement gratuit pour les patients. Les prestataires 
                  peuvent s'inscrire gratuitement et bénéficier de fonctionnalités de base.
                </p>
              </CardContent>
            </Card>
            
            <Card className="glass-card">
              <CardContent className="p-6">
                <h4 className="font-bold mb-2">Comment sont vérifiés les prestataires ?</h4>
                <p className="text-foreground/80 text-sm">
                  Notre équipe vérifie les licences professionnelles, les diplômes et les 
                  agréments de chaque prestataire avant d'attribuer le badge "Vérifié".
                </p>
              </CardContent>
            </Card>
            
            <Card className="glass-card">
              <CardContent className="p-6">
                <h4 className="font-bold mb-2">Puis-je prendre rendez-vous en ligne ?</h4>
                <p className="text-foreground/80 text-sm">
                  Oui, vous pouvez prendre rendez-vous directement via la plateforme avec 
                  les prestataires qui ont activé cette fonctionnalité.
                </p>
              </CardContent>
            </Card>
            
            <Card className="glass-card">
              <CardContent className="p-6">
                <h4 className="font-bold mb-2">Comment signaler un problème ?</h4>
                <p className="text-foreground/80 text-sm">
                  Vous pouvez nous contacter via la page Contact ou signaler directement 
                  un problème sur le profil d'un prestataire.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
        
        {/* CTA Section */}
        <div className="glass-panel p-10 rounded-lg text-center">
          <h2 className="text-3xl font-bold mb-4">Prêt à commencer ?</h2>
          <p className="text-xl text-foreground/80 max-w-2xl mx-auto mb-8">
            Rejoignez des milliers de citoyens qui utilisent CityHealth pour trouver 
            les meilleurs professionnels de santé à Sidi Bel Abbès.
          </p>
          
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Button size="lg" className="rounded-full" asChild>
              <Link to="/search">
                <Search className="mr-2" size={18} />
                Rechercher un prestataire
              </Link>
            </Button>
            <Button size="lg" variant="outline" className="rounded-full" asChild>
              <Link to="/contact">
                <Phone className="mr-2" size={18} />
                Nous contacter
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HowPage;
