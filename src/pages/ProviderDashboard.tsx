import { useState, useEffect, useRef } from 'react';
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
  Eye, Phone, TrendingUp, Calendar, Star, 
  Upload, Settings, BarChart3, Clock, Car, Building, ShieldCheck, Hand, Home, FileText, Plus, Accessibility, Loader2, X, Check, User
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { ACCESSIBILITY_FEATURES, SPECIALTIES } from '@/data/providers';
import MedicalAdForm from '@/components/MedicalAdForm';
import VerificationRequestCard from '@/components/provider/VerificationRequestCard';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db, auth } from '@/integrations/firebase/client';
import { COLLECTIONS, Provider, Appointment } from '@/integrations/firebase/types';
import { updateProvider } from '@/integrations/firebase/services/providerService';
import { uploadMultipleFiles, validateFile } from '@/integrations/firebase/services/storageService';
import { getAppointmentsByProvider, updateAppointmentStatus, cancelAppointment } from '@/integrations/firebase/services/appointmentService';
import { OFFLINE_MODE } from '@/config/app';

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
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploadingPhotos, setIsUploadingPhotos] = useState(false);
  const [providerId, setProviderId] = useState<string | null>(null);
  
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
    email: '',
    address: '15 Rue principale, Centre Ville',
    city: 'Sidi Bel Abbès',
    description: 'Cardiologue expérimenté avec plus de 15 ans de pratique. Spécialisé dans les maladies cardiovasculaires et la prévention.',
    schedule: 'Lun-Ven: 9h-17h\nSam: 9h-13h',
    accessibility_features: ['wheelchair', 'parking'] as string[],
    home_visit_available: true,
    photos: [] as string[],
    avatar_url: '',
    website: '',
  });

  const [recentActivity] = useState([
    { type: 'view', date: '2025-01-10', count: 47 },
    { type: 'contact', date: '2025-01-09', count: 12 },
    { type: 'appointment', date: '2025-01-08', count: 5 },
  ]);

  const [medicalAds, setMedicalAds] = useState<any[]>([]);
  const [isLoadingAds, setIsLoadingAds] = useState(false);
  
  // Appointments state
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [isLoadingAppointments, setIsLoadingAppointments] = useState(false);
  const [updatingAppointmentId, setUpdatingAppointmentId] = useState<string | null>(null);
  
  // Provider data for verification card
  const [providerData, setProviderData] = useState<Provider | null>(null);

  // Fetch provider data from Firebase on mount
  useEffect(() => {
    const fetchProviderData = async () => {
      if (OFFLINE_MODE) {
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        const currentUser = auth.currentUser;
        
        if (!currentUser) {
          setIsLoading(false);
          return;
        }

        // Get provider by user ID
        const providersRef = collection(db, COLLECTIONS.providers);
        const providerQuery = query(providersRef, where('userId', '==', currentUser.uid));
        const providerSnapshot = await getDocs(providerQuery);

        if (!providerSnapshot.empty) {
          const providerDoc = providerSnapshot.docs[0];
          const providerDocData = providerDoc.data();
          const providerIdValue = providerDoc.id;
          setProviderId(providerIdValue);
          
          // Set provider data for VerificationRequestCard
          setProviderData({
            id: providerIdValue,
            userId: providerDocData.userId || currentUser.uid,
            businessName: providerDocData.businessName || '',
            providerType: providerDocData.providerType || 'doctor',
            phone: providerDocData.phone || '',
            email: providerDocData.email,
            address: providerDocData.address || '',
            city: providerDocData.city,
            latitude: providerDocData.latitude,
            longitude: providerDocData.longitude,
            description: providerDocData.description,
            avatarUrl: providerDocData.avatarUrl,
            coverImageUrl: providerDocData.coverImageUrl,
            website: providerDocData.website,
            verificationStatus: providerDocData.verificationStatus || 'pending',
            isEmergency: providerDocData.isEmergency || false,
            isPreloaded: providerDocData.isPreloaded || false,
            isClaimed: providerDocData.isClaimed || false,
            accessibilityFeatures: providerDocData.accessibilityFeatures || [],
            homeVisitAvailable: providerDocData.homeVisitAvailable || false,
            photos: providerDocData.photos || [],
            createdAt: providerDocData.createdAt,
            updatedAt: providerDocData.updatedAt,
          } as Provider);
          
          // Resolve specialty name from specialtyId
          // specialtyId may contain the specialty name directly (from ProviderRegister)
          // or could be a UUID in legacy data - check if it's in SPECIALTIES list
          const specialtyValue = providerDocData.specialtyId || '';
          const specialtyName = SPECIALTIES.includes(specialtyValue)
            ? specialtyValue
            : ''; // Fall back to empty string if not a valid specialty name

          setProfile({
            name: providerDocData.businessName || '',
            specialty: specialtyName,
            phone: providerDocData.phone || '',
            email: providerDocData.email || '',
            address: providerDocData.address || '',
            city: providerDocData.city || '',
            description: providerDocData.description || '',
            schedule: '',
            accessibility_features: providerDocData.accessibilityFeatures || [],
            home_visit_available: providerDocData.homeVisitAvailable || false,
            photos: providerDocData.photos || [],
            avatar_url: providerDocData.avatarUrl || '',
            website: providerDocData.website || '',
          });
        }
      } catch (error) {
        console.error('Error fetching provider data:', error);
        toast({
          title: "Erreur",
          description: "Impossible de charger les données du profil.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchProviderData();
  }, [toast]);

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (OFFLINE_MODE) {
      toast({
        title: "Profil mis à jour",
        description: "Vos modifications ont été enregistrées avec succès.",
      });
      return;
    }

    if (!providerId) {
      toast({
        title: "Erreur",
        description: "Impossible de trouver votre profil.",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsSaving(true);
      
      await updateProvider(providerId, {
        businessName: profile.name,
        phone: profile.phone,
        email: profile.email || undefined,
        address: profile.address,
        city: profile.city || undefined,
        description: profile.description || undefined,
        accessibilityFeatures: profile.accessibility_features,
        homeVisitAvailable: profile.home_visit_available,
        website: profile.website || undefined,
      });

      toast({
        title: "Profil mis à jour",
        description: "Vos modifications ont été enregistrées avec succès.",
      });
    } catch (error) {
      console.error('Error updating profile:', error);
      toast({
        title: "Erreur",
        description: "Impossible de sauvegarder les modifications.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  // Handle photo upload via Firebase Storage
  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    if (OFFLINE_MODE) {
      toast({
        title: "Mode hors ligne",
        description: "L'upload de photos n'est pas disponible en mode hors ligne.",
        variant: "destructive",
      });
      return;
    }

    if (!providerId) {
      toast({
        title: "Erreur",
        description: "Impossible de trouver votre profil.",
        variant: "destructive",
      });
      return;
    }

    // Validate all files
    const fileArray = Array.from(files);
    for (const file of fileArray) {
      const validation = validateFile(file, {
        maxSizeMB: 5,
        allowedTypes: ['image/jpeg', 'image/png', 'image/webp'],
      });
      
      if (!validation.valid) {
        toast({
          title: "Fichier invalide",
          description: validation.error,
          variant: "destructive",
        });
        return;
      }
    }

    try {
      setIsUploadingPhotos(true);
      
      // Upload all files
      const uploadResults = await uploadMultipleFiles(fileArray, providerId, 'photo');
      const newPhotoUrls = uploadResults.map(result => result.url);
      
      // Update provider with new photos
      const updatedPhotos = [...profile.photos, ...newPhotoUrls];
      await updateProvider(providerId, {
        photos: updatedPhotos,
      });

      setProfile(prev => ({
        ...prev,
        photos: updatedPhotos,
      }));

      toast({
        title: "Photos ajoutées",
        description: `${fileArray.length} photo(s) ajoutée(s) avec succès.`,
      });
    } catch (error) {
      console.error('Error uploading photos:', error);
      toast({
        title: "Erreur",
        description: "Impossible d'uploader les photos.",
        variant: "destructive",
      });
    } finally {
      setIsUploadingPhotos(false);
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  // Remove a photo from the gallery
  const handleRemovePhoto = async (photoUrl: string) => {
    if (OFFLINE_MODE || !providerId) return;

    try {
      const updatedPhotos = profile.photos.filter(url => url !== photoUrl);
      await updateProvider(providerId, {
        photos: updatedPhotos,
      });

      setProfile(prev => ({
        ...prev,
        photos: updatedPhotos,
      }));

      toast({
        title: "Photo supprimée",
        description: "La photo a été supprimée avec succès.",
      });
    } catch (error) {
      console.error('Error removing photo:', error);
      toast({
        title: "Erreur",
        description: "Impossible de supprimer la photo.",
        variant: "destructive",
      });
    }
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

  // Fetch appointments for this provider
  const fetchAppointments = async () => {
    if (OFFLINE_MODE || !providerId) return;
    
    try {
      setIsLoadingAppointments(true);
      const providerAppointments = await getAppointmentsByProvider(providerId);
      setAppointments(providerAppointments);
    } catch (error) {
      console.error('Error fetching appointments:', error);
      toast({
        title: "Erreur",
        description: "Impossible de charger les rendez-vous.",
        variant: "destructive",
      });
    } finally {
      setIsLoadingAppointments(false);
    }
  };

  // Handle appointment confirmation
  const handleConfirmAppointment = async (appointmentId: string) => {
    try {
      setUpdatingAppointmentId(appointmentId);
      await updateAppointmentStatus(appointmentId, 'confirmed');
      
      // Update local state
      setAppointments(prev => 
        prev.map(a => a.id === appointmentId ? { ...a, status: 'confirmed' } : a)
      );
      
      toast({
        title: "Rendez-vous confirmé",
        description: "Le rendez-vous a été confirmé avec succès.",
      });
    } catch (error) {
      console.error('Error confirming appointment:', error);
      toast({
        title: "Erreur",
        description: "Impossible de confirmer le rendez-vous.",
        variant: "destructive",
      });
    } finally {
      setUpdatingAppointmentId(null);
    }
  };

  // Handle appointment cancellation
  const handleCancelAppointment = async (appointmentId: string) => {
    try {
      setUpdatingAppointmentId(appointmentId);
      await cancelAppointment(appointmentId);
      
      // Update local state
      setAppointments(prev => 
        prev.map(a => a.id === appointmentId ? { ...a, status: 'cancelled' } : a)
      );
      
      toast({
        title: "Rendez-vous annulé",
        description: "Le rendez-vous a été annulé avec succès.",
      });
    } catch (error) {
      console.error('Error cancelling appointment:', error);
      toast({
        title: "Erreur",
        description: "Impossible d'annuler le rendez-vous.",
        variant: "destructive",
      });
    } finally {
      setUpdatingAppointmentId(null);
    }
  };

  // Get appointment status badge variant
  const getAppointmentStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'confirmed':
        return 'default';
      case 'pending':
        return 'secondary';
      case 'cancelled':
        return 'destructive';
      case 'completed':
        return 'outline';
      default:
        return 'secondary';
    }
  };

  // Get appointment status label in French
  const getAppointmentStatusLabel = (status: string) => {
    switch (status) {
      case 'confirmed':
        return 'Confirmé';
      case 'pending':
        return 'En attente';
      case 'cancelled':
        return 'Annulé';
      case 'completed':
        return 'Terminé';
      default:
        return status;
    }
  };

  const fetchMedicalAds = async () => {
    try {
      setIsLoadingAds(true);
      
      // Get current user from Firebase Auth
      const { auth } = await import('@/integrations/firebase/client');
      const { db } = await import('@/integrations/firebase/client');
      const { collection, query, where, getDocs, orderBy } = await import('firebase/firestore');
      const { COLLECTIONS } = await import('@/integrations/firebase/types');
      
      const currentUser = auth.currentUser;
      if (!currentUser) {
        console.error('No authenticated user');
        return;
      }

      // Get provider ID first
      const providersRef = collection(db, COLLECTIONS.providers);
      const providerQuery = query(providersRef, where('userId', '==', currentUser.uid));
      const providerSnapshot = await getDocs(providerQuery);

      if (providerSnapshot.empty) {
        console.error('No provider found for user');
        return;
      }

      const providerId = providerSnapshot.docs[0].id;

      // Fetch medical ads for this provider
      const adsRef = collection(db, COLLECTIONS.medicalAds);
      const adsQuery = query(
        adsRef, 
        where('providerId', '==', providerId),
        orderBy('createdAt', 'desc')
      );
      const adsSnapshot = await getDocs(adsQuery);

      const ads = adsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        created_at: doc.data().createdAt?.toDate?.()?.toISOString() || new Date().toISOString(),
      }));

      setMedicalAds(ads);
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

  // Handle verification request submitted - refresh provider data
  const handleVerificationSubmitted = async () => {
    if (OFFLINE_MODE || !providerId) return;
    
    try {
      const currentUser = auth.currentUser;
      if (!currentUser) return;
      
      // Refresh provider data to get updated verification status
      const providersRef = collection(db, COLLECTIONS.providers);
      const providerQuery = query(providersRef, where('userId', '==', currentUser.uid));
      const providerSnapshot = await getDocs(providerQuery);
      
      if (!providerSnapshot.empty) {
        const providerDoc = providerSnapshot.docs[0];
        const providerDocData = providerDoc.data();
        
        setProviderData(prev => prev ? {
          ...prev,
          verificationStatus: providerDocData.verificationStatus || 'pending',
        } : null);
      }
    } catch (error) {
      console.error('Error refreshing provider data:', error);
    }
  };

  // Fetch medical ads on component mount
  useEffect(() => {
    fetchMedicalAds();
  }, []);

  // Fetch appointments when providerId is available
  useEffect(() => {
    if (providerId) {
      fetchAppointments();
    }
  }, [providerId]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-background to-secondary/20 py-8 px-4 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
          <p className="text-muted-foreground">Chargement du tableau de bord...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-secondary/20 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Avatar className="h-16 w-16">
                <AvatarImage src={profile.avatar_url || "/placeholder.svg"} />
                <AvatarFallback>{profile.name.substring(0, 2).toUpperCase()}</AvatarFallback>
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
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="profile">Mon Profil</TabsTrigger>
            <TabsTrigger value="appointments">Rendez-vous</TabsTrigger>
            <TabsTrigger value="analytics">Statistiques</TabsTrigger>
            <TabsTrigger value="reviews">Avis ({stats.reviewsCount})</TabsTrigger>
            <TabsTrigger value="ads">Mes Annonces</TabsTrigger>
          </TabsList>

          {/* Profile Tab */}
          <TabsContent value="profile">
            <div className="space-y-6">
              {/* Verification Request Card */}
              {providerData && (
                <VerificationRequestCard 
                  provider={providerData}
                  onRequestSubmitted={handleVerificationSubmitted}
                />
              )}
              
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
                    
                    {/* Existing photos gallery */}
                    {profile.photos.length > 0 && (
                      <div className="mt-2 grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
                        {profile.photos.map((photoUrl, index) => (
                          <div key={index} className="relative group aspect-video rounded-lg overflow-hidden bg-muted">
                            <img 
                              src={photoUrl} 
                              alt={`Photo ${index + 1}`}
                              className="w-full h-full object-cover"
                            />
                            <button
                              type="button"
                              onClick={() => handleRemovePhoto(photoUrl)}
                              className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                              <X className="h-3 w-3" />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                    
                    {/* Upload area */}
                    <div 
                      className="mt-2 border-2 border-dashed rounded-lg p-6 text-center hover:border-primary transition-colors cursor-pointer"
                      onClick={() => fileInputRef.current?.click()}
                    >
                      {isUploadingPhotos ? (
                        <>
                          <Loader2 className="h-8 w-8 mx-auto mb-2 text-muted-foreground animate-spin" />
                          <p className="text-sm text-muted-foreground">Upload en cours...</p>
                        </>
                      ) : (
                        <>
                          <Upload className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                          <p className="text-sm text-muted-foreground">
                            Cliquez pour ajouter des photos
                          </p>
                          <p className="text-xs text-muted-foreground mt-1">
                            JPG, PNG ou WebP (max 5MB)
                          </p>
                        </>
                      )}
                      <Input
                        ref={fileInputRef}
                        type="file"
                        accept="image/jpeg,image/png,image/webp"
                        multiple
                        className="hidden"
                        id="photos"
                        onChange={handlePhotoUpload}
                        disabled={isUploadingPhotos}
                      />
                    </div>
                  </div>

                  <Button type="submit" className="w-full" disabled={isSaving}>
                    {isSaving ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Enregistrement...
                      </>
                    ) : (
                      'Enregistrer les modifications'
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>
            </div>
          </TabsContent>

          {/* Appointments Tab */}
          <TabsContent value="appointments">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  Rendez-vous
                </CardTitle>
                <CardDescription>
                  Gérez les rendez-vous de vos patients
                </CardDescription>
              </CardHeader>
              <CardContent>
                {isLoadingAppointments ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  </div>
                ) : appointments.length === 0 ? (
                  <div className="text-center py-8">
                    <Calendar className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                    <h3 className="text-lg font-medium mb-2">Aucun rendez-vous</h3>
                    <p className="text-muted-foreground">
                      Vous n'avez pas encore de rendez-vous programmés.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {appointments.map((appointment) => {
                      const appointmentDate = appointment.datetime?.toDate?.() || new Date();
                      const isPending = appointment.status === 'pending';
                      const isUpdating = updatingAppointmentId === appointment.id;
                      
                      return (
                        <div key={appointment.id} className="border rounded-lg p-4">
                          <div className="flex items-start justify-between mb-3">
                            <div className="flex items-center gap-3">
                              <Avatar className="h-10 w-10">
                                <AvatarFallback>
                                  <User className="h-5 w-5" />
                                </AvatarFallback>
                              </Avatar>
                              <div>
                                <h3 className="font-medium">
                                  {appointment.contactInfo?.name || 'Patient'}
                                </h3>
                                <p className="text-sm text-muted-foreground">
                                  {appointment.contactInfo?.phone}
                                </p>
                                {appointment.contactInfo?.email && (
                                  <p className="text-sm text-muted-foreground">
                                    {appointment.contactInfo.email}
                                  </p>
                                )}
                              </div>
                            </div>
                            <Badge variant={getAppointmentStatusBadgeVariant(appointment.status)}>
                              {getAppointmentStatusLabel(appointment.status)}
                            </Badge>
                          </div>
                          
                          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-3">
                            <Clock className="h-4 w-4" />
                            <span>
                              {appointmentDate.toLocaleDateString('fr-FR', {
                                weekday: 'long',
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric',
                              })}
                              {' à '}
                              {appointmentDate.toLocaleTimeString('fr-FR', {
                                hour: '2-digit',
                                minute: '2-digit',
                              })}
                            </span>
                          </div>
                          
                          {appointment.notes && (
                            <p className="text-sm text-muted-foreground mb-3 italic bg-muted p-2 rounded">
                              Note: {appointment.notes}
                            </p>
                          )}
                          
                          {isPending && (
                            <div className="flex justify-end gap-2">
                              <Button
                                variant="default"
                                size="sm"
                                onClick={() => handleConfirmAppointment(appointment.id)}
                                disabled={isUpdating}
                              >
                                {isUpdating ? (
                                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                ) : (
                                  <Check className="mr-2 h-4 w-4" />
                                )}
                                Confirmer
                              </Button>
                              <Button
                                variant="destructive"
                                size="sm"
                                onClick={() => handleCancelAppointment(appointment.id)}
                                disabled={isUpdating}
                              >
                                {isUpdating ? (
                                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                ) : (
                                  <X className="mr-2 h-4 w-4" />
                                )}
                                Annuler
                              </Button>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
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
