import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Switch } from '@/components/ui/switch';
import { 
  Eye, Phone, MapPin, TrendingUp, Calendar, Star, 
  Upload, Settings, BarChart3, Users, Clock, Car, Building, ShieldCheck, Hand, Home, FileText, Plus, Accessibility
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { ACCESSIBILITY_FEATURES } from '@/data/providers';
import MedicalAdForm from '@/components/MedicalAdForm';
import { supabase } from '@/integrations/supabase/client';

const getAccessibilityIcon = (feature: string) => {
  switch (feature) {
    case 'wheelchair':
      return <Accessibility className="h-4 w-4" />;
    case 'parking':
      return <Car className="h-4 w-4" />;
    case 'elevator':
      return <Building className="h-4 w-4" />;
    case 'ramp':
      return <Accessibility className="h-4 w-4" />;
    case 'accessible_restroom':
      return <ShieldCheck className="h-4 w-4" />;
    case 'braille':
      return <Eye className="h-4 w-4" />;
    case 'sign_language':
      return <Hand className="h-4 w-4" />;
    default:
      return <ShieldCheck className="h-4 w-4" />;
  }
};

const getAccessibilityLabel = (feature: string) => {
  switch (feature) {
    case 'wheelchair':
      return 'Wheelchair Accessible';
    case 'parking':
      return 'Accessible Parking';
    case 'elevator':
      return 'Elevator Access';
    case 'ramp':
      return 'Ramp Access';
    case 'accessible_restroom':
      return 'Accessible Restroom';
    case 'braille':
      return 'Braille Support';
    case 'sign_language':
      return 'Sign Language';
    default:
      return feature;
  }
};

export default function ProviderDashboard() {
  const { toast } = useToast();
  const [stats, setStats] = useState({
    profileViews: 1247,
    phoneClicks: 89,
    appointments: 23,
    rating: 4.7,
    reviewsCount: 142,
  });

  const [profile, setProfile] = useState({
    name: 'Dr. Ahmed Benali',
    specialty: 'Cardiologie',
    phone: '+213 48 50 10 20',
    address: '15 Rue principale, Centre Ville',
    description: 'Cardiologue expérimenté avec plus de 15 ans de pratique. Spécialisé dans les maladies cardiovasculaires et la prévention.',
    schedule: 'Lun-Ven: 9h-17h\nSam: 9h-13h',
    accessibility_features: ['wheelchair', 'parking'] as string[],
    home_visit_available: true,
  });

  const [recentActivity] = useState([
    { type: 'view', date: '2025-01-10', count: 47 },
    { type: 'contact', date: '2025-01-09', count: 12 },
    { type: 'appointment', date: '2025-01-08', count: 5 },
  ]);

  const [medicalAds, setMedicalAds] = useState<any[]>([]);
  const [isLoadingAds, setIsLoadingAds] = useState(false);

  const handleProfileUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    toast({
      title: "Profil mis à jour",
      description: "Vos modifications ont été enregistrées avec succès.",
    });
  };

  const handleAccessibilityFeatureChange = (feature: string, checked: boolean) => {
    setProfile(prev => ({
      ...prev,
      accessibility_features: checked
        ? [...prev.accessibility_features, feature]
        : prev.accessibility_features.filter(f => f !== feature)
    }));
  };

  const handleHomeVisitChange = (checked: boolean) => {
    setProfile(prev => ({
      ...prev,
      home_visit_available: checked
    }));
  };

  const fetchMedicalAds = async () => {
    try {
      setIsLoadingAds(true);
      
      // Mock user ID for now - in real implementation, get from auth context
      const mockUserId = 'mock-user-id';
      
      // Get provider ID first
      const { data: provider, error: providerError } = await supabase
        .from('providers')
        .select('id')
        .eq('user_id', mockUserId)
        .single();

      if (providerError || !provider) {
        console.error('Error fetching provider:', providerError);
        return;
      }

      // Fetch medical ads for this provider
      const { data: ads, error: adsError } = await (supabase as any)
        .from('medical_ads')
        .select('*')
        .eq('provider_id', provider.id)
        .order('created_at', { ascending: false });

      if (adsError) {
        console.error('Error fetching medical ads:', adsError);
        return;
      }

      setMedicalAds(ads || []);
    } catch (error) {
      console.error('Error in fetchMedicalAds:', error);
    } finally {
      setIsLoadingAds(false);
    }
  };

  const handleAdCreated = () => {
    // Refresh the ads list when a new ad is created
    fetchMedicalAds();
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'approved':
        return 'default';
      case 'pending':
        return 'secondary';
      case 'rejected':
        return 'destructive';
      default:
        return 'secondary';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'approved':
        return 'Approuvée';
      case 'pending':
        return 'En attente';
      case 'rejected':
        return 'Rejetée';
      default:
        return status;
    }
  };

  // Fetch medical ads on component mount
  useEffect(() => {
    fetchMedicalAds();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-secondary/20 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Avatar className="h-16 w-16">
                <AvatarImage src="/placeholder.svg" />
                <AvatarFallback>AB</AvatarFallback>
              </Avatar>
              <div>
                <h1 className="text-3xl font-bold">{profile.name}</h1>
                <p className="text-muted-foreground">{profile.specialty}</p>
                <Badge variant="secondary" className="mt-1">✅ Vérifié</Badge>
              </div>
            </div>
            <Button>
              <Settings className="mr-2 h-4 w-4" />
              Paramètres
            </Button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
          <Card>
            <CardHeader className="pb-3">
              <CardDescription>Vues du profil</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-3xl font-bold">{stats.profileViews}</p>
                  <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                    <TrendingUp className="h-3 w-3" /> +12% ce mois
                  </p>
                </div>
                <Eye className="h-8 w-8 text-primary" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardDescription>Appels reçus</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-3xl font-bold">{stats.phoneClicks}</p>
                  <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                    <TrendingUp className="h-3 w-3" /> +8% ce mois
                  </p>
                </div>
                <Phone className="h-8 w-8 text-primary" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardDescription>Rendez-vous</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-3xl font-bold">{stats.appointments}</p>
                  <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                    <Calendar className="h-3 w-3" /> Cette semaine
                  </p>
                </div>
                <Calendar className="h-8 w-8 text-primary" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardDescription>Note moyenne</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-3xl font-bold">{stats.rating}</p>
                  <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                    <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" /> {stats.reviewsCount} avis
                  </p>
                </div>
                <Star className="h-8 w-8 text-primary fill-primary" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardDescription>Taux de réponse</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-3xl font-bold">94%</p>
                  <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                    <Clock className="h-3 w-3" /> Excellent
                  </p>
                </div>
                <BarChart3 className="h-8 w-8 text-primary" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <Tabs defaultValue="profile" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="profile">Mon Profil</TabsTrigger>
            <TabsTrigger value="analytics">Statistiques</TabsTrigger>
            <TabsTrigger value="reviews">Avis ({stats.reviewsCount})</TabsTrigger>
            <TabsTrigger value="ads">Mes Annonces</TabsTrigger>
          </TabsList>

          {/* Profile Tab */}
          <TabsContent value="profile">
            <Card>
              <CardHeader>
                <CardTitle>Informations du profil</CardTitle>
                <CardDescription>
                  Mettez à jour vos informations publiques
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleProfileUpdate} className="space-y-6">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="name">Nom complet</Label>
                      <Input
                        id="name"
                        value={profile.name}
                        onChange={(e) => setProfile({...profile, name: e.target.value})}
                      />
                    </div>
                    <div>
                      <Label htmlFor="specialty">Spécialité</Label>
                      <Input
                        id="specialty"
                        value={profile.specialty}
                        onChange={(e) => setProfile({...profile, specialty: e.target.value})}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="phone">Téléphone</Label>
                      <Input
                        id="phone"
                        value={profile.phone}
                        onChange={(e) => setProfile({...profile, phone: e.target.value})}
                      />
                    </div>
                    <div>
                      <Label htmlFor="address">Adresse</Label>
                      <Input
                        id="address"
                        value={profile.address}
                        onChange={(e) => setProfile({...profile, address: e.target.value})}
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      rows={4}
                      value={profile.description}
                      onChange={(e) => setProfile({...profile, description: e.target.value})}
                    />
                  </div>

                  <div>
                    <Label htmlFor="schedule">Horaires</Label>
                    <Textarea
                      id="schedule"
                      rows={3}
                      value={profile.schedule}
                      onChange={(e) => setProfile({...profile, schedule: e.target.value})}
                    />
                  </div>

                  {/* Accessibility Features Section */}
                  <div className="space-y-4">
                    <div>
                      <Label className="text-base font-medium">Accessibilité</Label>
                      <p className="text-sm text-muted-foreground mb-3">
                        Sélectionnez les équipements d'accessibilité disponibles dans votre établissement
                      </p>
                      <div className="grid grid-cols-2 gap-3">
                        {ACCESSIBILITY_FEATURES.map((feature) => (
                          <div key={feature} className="flex items-center space-x-2">
                            <Checkbox
                              id={feature}
                              checked={profile.accessibility_features.includes(feature)}
                              onCheckedChange={(checked) => 
                                handleAccessibilityFeatureChange(feature, checked as boolean)
                              }
                            />
                            <Label 
                              htmlFor={feature} 
                              className="flex items-center gap-2 text-sm cursor-pointer"
                            >
                              {getAccessibilityIcon(feature)}
                              {getAccessibilityLabel(feature)}
                            </Label>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="flex items-center space-x-2">
                      <Switch
                        id="home-visit"
                        checked={profile.home_visit_available}
                        onCheckedChange={handleHomeVisitChange}
                      />
                      <Label htmlFor="home-visit" className="flex items-center gap-2">
                        <Home className="h-4 w-4" />
                        Visites à domicile disponibles
                      </Label>
                    </div>
                  </div>

                  <div>
                    <Label>Photos du cabinet</Label>
                    <div className="mt-2 border-2 border-dashed rounded-lg p-6 text-center hover:border-primary transition-colors cursor-pointer">
                      <Upload className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                      <Input
                        type="file"
                        accept="image/*"
                        multiple
                        className="hidden"
                        id="photos"
                      />
                      <Label htmlFor="photos" className="cursor-pointer">
                        Cliquez pour ajouter des photos
                      </Label>
                    </div>
                  </div>

                  <Button type="submit" className="w-full">
                    Enregistrer les modifications
                  </Button>
                </form>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Analytics Tab */}
          <TabsContent value="analytics">
            <div className="grid gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Activité récente</CardTitle>
                  <CardDescription>Aperçu de votre engagement</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {recentActivity.map((activity, idx) => (
                      <div key={idx} className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex items-center gap-4">
                          {activity.type === 'view' && <Eye className="h-5 w-5 text-primary" />}
                          {activity.type === 'contact' && <Phone className="h-5 w-5 text-primary" />}
                          {activity.type === 'appointment' && <Calendar className="h-5 w-5 text-primary" />}
                          <div>
                            <p className="font-medium">
                              {activity.type === 'view' && 'Vues du profil'}
                              {activity.type === 'contact' && 'Contacts'}
                              {activity.type === 'appointment' && 'Rendez-vous'}
                            </p>
                            <p className="text-sm text-muted-foreground">{activity.date}</p>
                          </div>
                        </div>
                        <Badge variant="secondary">{activity.count}</Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Performance</CardTitle>
                  <CardDescription>Comparaison avec les autres professionnels</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between mb-2">
                        <span className="text-sm">Visibilité</span>
                        <span className="text-sm font-medium">87%</span>
                      </div>
                      <div className="h-2 bg-muted rounded-full">
                        <div className="h-2 bg-primary rounded-full" style={{width: '87%'}} />
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between mb-2">
                        <span className="text-sm">Taux de réponse</span>
                        <span className="text-sm font-medium">94%</span>
                      </div>
                      <div className="h-2 bg-muted rounded-full">
                        <div className="h-2 bg-primary rounded-full" style={{width: '94%'}} />
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between mb-2">
                        <span className="text-sm">Satisfaction patient</span>
                        <span className="text-sm font-medium">92%</span>
                      </div>
                      <div className="h-2 bg-muted rounded-full">
                        <div className="h-2 bg-primary rounded-full" style={{width: '92%'}} />
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Reviews Tab */}
          <TabsContent value="reviews">
            <Card>
              <CardHeader>
                <CardTitle>Avis patients</CardTitle>
                <CardDescription>Ce que vos patients disent de vous</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="border-b pb-4">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <Avatar className="h-8 w-8">
                            <AvatarFallback>P{i}</AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium text-sm">Patient {i}</p>
                            <div className="flex">
                              {[...Array(5)].map((_, idx) => (
                                <Star key={idx} className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                              ))}
                            </div>
                          </div>
                        </div>
                        <span className="text-xs text-muted-foreground">Il y a {i} jours</span>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Excellent professionnel, très à l'écoute et compétent. Je recommande vivement.
                      </p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Medical Ads Tab */}
          <TabsContent value="ads">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Mes Annonces Médicales</CardTitle>
                    <CardDescription>
                      Gérez vos annonces promotionnelles pour attirer de nouveaux patients
                    </CardDescription>
                  </div>
                  <MedicalAdForm 
                    onSuccess={handleAdCreated}
                    trigger={
                      <Button>
                        <Plus className="mr-2 h-4 w-4" />
                        Créer une annonce
                      </Button>
                    }
                  />
                </div>
              </CardHeader>
              <CardContent>
                {isLoadingAds ? (
                  <div className="flex items-center justify-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                  </div>
                ) : medicalAds.length === 0 ? (
                  <div className="text-center py-8">
                    <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                    <h3 className="text-lg font-medium mb-2">Aucune annonce créée</h3>
                    <p className="text-muted-foreground mb-4">
                      Créez votre première annonce médicale pour promouvoir vos services
                    </p>
                    <MedicalAdForm 
                      onSuccess={handleAdCreated}
                      trigger={
                        <Button>
                          <Plus className="mr-2 h-4 w-4" />
                          Créer ma première annonce
                        </Button>
                      }
                    />
                  </div>
                ) : (
                  <div className="space-y-4">
                    {medicalAds.map((ad) => (
                      <div key={ad.id} className="border rounded-lg p-4">
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex-1">
                            <h3 className="font-medium text-lg mb-1">{ad.title}</h3>
                            <p className="text-muted-foreground text-sm line-clamp-2">
                              {ad.content}
                            </p>
                          </div>
                          <Badge variant={getStatusBadgeVariant(ad.status)}>
                            {getStatusLabel(ad.status)}
                          </Badge>
                        </div>
                        
                        {ad.image_url && (
                          <div className="mb-3">
                            <img 
                              src={ad.image_url} 
                              alt={ad.title}
                              className="w-full h-32 object-cover rounded-md"
                            />
                          </div>
                        )}
                        
                        <div className="flex items-center justify-between text-sm text-muted-foreground">
                          <div className="flex items-center gap-4">
                            <span className="flex items-center gap-1">
                              <Calendar className="h-4 w-4" />
                              Créée le {new Date(ad.created_at).toLocaleDateString('fr-FR')}
                            </span>
                            {ad.start_date && ad.end_date && (
                              <span>
                                Du {new Date(ad.start_date).toLocaleDateString('fr-FR')} 
                                au {new Date(ad.end_date).toLocaleDateString('fr-FR')}
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-2">
                            {ad.status === 'pending' && (
                              <span className="text-orange-600">En cours de validation</span>
                            )}
                            {ad.status === 'approved' && (
                              <span className="text-green-600">Visible publiquement</span>
                            )}
                            {ad.status === 'rejected' && (
                              <span className="text-red-600">Rejetée par l'équipe</span>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
