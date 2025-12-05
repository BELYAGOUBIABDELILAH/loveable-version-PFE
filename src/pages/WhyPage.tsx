import { useState, useEffect } from 'react';
import { useAnimateIn } from '@/lib/animations';
import { Button } from '@/components/ui/button';
import { 
  Heart, 
  Shield, 
  MapPin, 
  Clock, 
  Users, 
  CheckCircle,
  Accessibility,
  Phone,
  Star
} from 'lucide-react';
import { Link } from 'react-router-dom';

const WhySection = ({ 
  title, 
  content, 
  icon, 
  id 
}: { 
  title: string, 
  content: React.ReactNode, 
  icon: React.ReactNode,
  id: string 
}) => {
  return (
    <div id={id} className="mb-20 max-w-4xl mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-12 h-12 flex items-center justify-center rounded-full bg-primary/10">
          {icon}
        </div>
        <h2 className="text-2xl md:text-3xl font-bold text-primary">{title}</h2>
      </div>
      <div className="text-foreground/80 space-y-4">
        {content}
      </div>
    </div>
  );
};

const WhyPage = () => {
  const [loading, setLoading] = useState(true);
  const showContent = useAnimateIn(false, 300);
  
  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
    }, 1000);
    return () => clearTimeout(timer);
  }, []);
  
  return (
    <div className="relative overflow-hidden">
      {/* Background elements */}
      <div className="absolute top-0 left-0 w-full h-[500px] bg-gradient-to-b from-primary/5 to-transparent -z-10"></div>
      <div className="absolute top-1/3 right-0 w-[300px] h-[300px] rounded-full bg-primary/5 blur-3xl -z-10"></div>
      <div className="absolute bottom-1/3 left-0 w-[250px] h-[250px] rounded-full bg-accent/5 blur-3xl -z-10"></div>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-36 pb-24">
        <div className="flex flex-col items-center text-center mb-16">
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold mb-6 text-foreground bg-clip-text">
            Pourquoi CityHealth ?
          </h1>
          
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Votre santé mérite le meilleur accès aux soins à Sidi Bel Abbès
          </p>
          
          <div className="mt-10 glass-panel p-8 md:p-10 rounded-lg max-w-3xl mx-auto shadow-lg border-2 border-primary/20">
            <p className="text-xl md:text-2xl text-foreground/90">
              CityHealth est né d'un constat simple : trouver un professionnel de santé de confiance 
              à Sidi Bel Abbès ne devrait pas être compliqué.
            </p>
            <p className="text-xl md:text-2xl text-foreground/90 mt-6">
              Notre mission est de connecter les citoyens aux meilleurs prestataires de santé de la région.
            </p>
          </div>
        </div>
        
        <WhySection
          id="why-1"
          icon={<Shield className="w-6 h-6 text-primary" />}
          title="Des prestataires vérifiés"
          content={
            <>
              <p>
                Chaque professionnel de santé sur CityHealth passe par un processus de vérification rigoureux. 
                Nous vérifions les licences, les qualifications et les avis des patients pour vous garantir 
                des soins de qualité.
              </p>
              <p>
                Fini les incertitudes : avec le badge "Vérifié", vous savez que vous consultez un 
                professionnel reconnu et fiable.
              </p>
              <div className="mt-6 flex flex-wrap gap-4">
                <div className="flex items-center gap-2 bg-green-50 px-4 py-2 rounded-full">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                  <span className="text-green-700 font-medium">Licences vérifiées</span>
                </div>
                <div className="flex items-center gap-2 bg-blue-50 px-4 py-2 rounded-full">
                  <Star className="w-5 h-5 text-blue-600" />
                  <span className="text-blue-700 font-medium">Avis authentiques</span>
                </div>
              </div>
            </>
          }
        />

        <WhySection
          id="why-2"
          icon={<Clock className="w-6 h-6 text-primary" />}
          title="Services d'urgence 24h/24"
          content={
            <>
              <p>
                Les urgences médicales n'attendent pas. CityHealth vous permet de localiser rapidement 
                les services d'urgence disponibles à tout moment, de jour comme de nuit.
              </p>
              <p>
                Notre carte interactive affiche en temps réel les pharmacies de garde, les urgences 
                hospitalières et les médecins disponibles pour les consultations urgentes.
              </p>
              <div className="mt-6">
                <Button variant="outline" className="gap-2" asChild>
                  <Link to="/emergency">
                    Voir les urgences
                    <Phone size={16} />
                  </Link>
                </Button>
              </div>
            </>
          }
        />
        
        <WhySection
          id="why-3"
          icon={<Accessibility className="w-6 h-6 text-primary" />}
          title="Accessibilité pour tous"
          content={
            <>
              <p>
                Nous croyons que l'accès aux soins de santé est un droit fondamental. CityHealth 
                met en avant les établissements accessibles aux personnes à mobilité réduite (PMR) 
                et propose des filtres de recherche adaptés.
              </p>
              <p>
                Notre plateforme est conçue pour être utilisable par tous, avec une interface claire 
                et des informations détaillées sur l'accessibilité de chaque établissement.
              </p>
              <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-muted p-4 rounded-lg">
                  <h4 className="font-semibold mb-2">Filtres d'accessibilité</h4>
                  <p className="text-sm text-muted-foreground">
                    Trouvez facilement les établissements avec accès PMR, ascenseurs, et places de parking adaptées.
                  </p>
                </div>
                <div className="bg-muted p-4 rounded-lg">
                  <h4 className="font-semibold mb-2">Visites à domicile</h4>
                  <p className="text-sm text-muted-foreground">
                    Identifiez les professionnels qui proposent des consultations à domicile.
                  </p>
                </div>
              </div>
            </>
          }
        />
        
        <WhySection
          id="why-4"
          icon={<MapPin className="w-6 h-6 text-primary" />}
          title="Conçu pour Sidi Bel Abbès"
          content={
            <>
              <p>
                CityHealth n'est pas une plateforme générique. Nous sommes spécialement conçus pour 
                répondre aux besoins de santé de la population de Sidi Bel Abbès et ses environs.
              </p>
              <p>
                Notre équipe locale connaît les quartiers, les établissements et les spécificités 
                de notre région. Nous travaillons main dans la main avec les professionnels de santé 
                locaux pour vous offrir le meilleur service possible.
              </p>
              <div className="mt-6">
                <Button variant="outline" className="gap-2" asChild>
                  <Link to="/map">
                    Explorer la carte
                    <MapPin size={16} />
                  </Link>
                </Button>
              </div>
            </>
          }
        />

        <WhySection
          id="why-5"
          icon={<Users className="w-6 h-6 text-primary" />}
          title="Une communauté de confiance"
          content={
            <>
              <p>
                CityHealth est plus qu'un annuaire : c'est une communauté. Les patients partagent 
                leurs expériences, les professionnels mettent à jour leurs informations, et ensemble, 
                nous construisons un écosystème de santé plus transparent.
              </p>
              <p>
                Rejoignez des milliers de citoyens qui font confiance à CityHealth pour leurs 
                besoins de santé quotidiens.
              </p>
            </>
          }
        />
        
        <WhySection
          id="why-6"
          icon={<Heart className="w-6 h-6 text-primary" />}
          title="Votre santé, notre priorité"
          content={
            <>
              <p>
                Chez CityHealth, nous mettons la santé des citoyens au cœur de tout ce que nous faisons. 
                Notre plateforme est gratuite pour les patients et conçue pour simplifier votre 
                parcours de soins.
              </p>
              <p>
                De la recherche d'un médecin généraliste à la prise de rendez-vous avec un spécialiste, 
                en passant par la localisation de la pharmacie de garde la plus proche, CityHealth 
                vous accompagne à chaque étape.
              </p>
            </>
          }
        />
        
        <div className="mt-16 text-center">
          <Button size="lg" className="gap-2" asChild>
            <Link to="/search">
              Trouver un prestataire
              <MapPin size={18} />
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
};

export default WhyPage;
