import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Header } from '@/components/layout/Header';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { User, Mail, Calendar, Shield, Lock, Loader2, X, Clock, MapPin } from 'lucide-react';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { useNotifications } from '@/hooks/useNotifications';
import { useToast } from '@/hooks/use-toast';
import { getAppointmentsByUser, cancelAppointment } from '@/integrations/firebase/services/appointmentService';
import { getProviderById } from '@/integrations/firebase/services/providerService';
import { AccountDeletionDialog } from '@/components/profile/AccountDeletionDialog';
import type { Appointment, Provider } from '@/integrations/firebase/types';

// Helper to get status badge variant
const getStatusBadgeVariant = (status: string) => {
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

// Helper to get status label in French
const getStatusLabel = (status: string) => {
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

export default function UserProfilePage() {
  const { user, updateProfile, logout } = useAuth();
  const { preferences, updatePreferences } = useNotifications();
  const { toast } = useToast();
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  
  // Appointments state
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [providers, setProviders] = useState<Record<string, Provider>>({});
  const [isLoadingAppointments, setIsLoadingAppointments] = useState(false);
  const [cancellingId, setCancellingId] = useState<string | null>(null);
  
  // Account deletion dialog state
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  // Fetch appointments when user is available
  useEffect(() => {
    const fetchAppointments = async () => {
      if (!user?.id) return;
      
      try {
        setIsLoadingAppointments(true);
        const userAppointments = await getAppointmentsByUser(user.id);
        setAppointments(userAppointments);
        
        // Fetch provider details for each appointment
        const providerIds = [...new Set(userAppointments.map(a => a.providerId))];
        const providerData: Record<string, Provider> = {};
        
        for (const providerId of providerIds) {
          try {
            const provider = await getProviderById(providerId);
            if (provider) {
              providerData[providerId] = provider;
            }
          } catch (error) {
            console.error(`Error fetching provider ${providerId}:`, error);
          }
        }
        
        setProviders(providerData);
      } catch (error) {
        console.error('Error fetching appointments:', error);
        toast({
          title: "Erreur",
          description: "Impossible de charger vos rendez-vous.",
          variant: "destructive",
        });
      } finally {
        setIsLoadingAppointments(false);
      }
    };

    fetchAppointments();
  }, [user?.id, toast]);

  // Handle appointment cancellation
  const handleCancelAppointment = async (appointmentId: string) => {
    try {
      setCancellingId(appointmentId);
      await cancelAppointment(appointmentId);
      
      // Update local state
      setAppointments(prev => 
        prev.map(a => a.id === appointmentId ? { ...a, status: 'cancelled' } : a)
      );
      
      toast({
        title: "Rendez-vous annulé",
        description: "Votre rendez-vous a été annulé avec succès.",
      });
    } catch (error) {
      console.error('Error cancelling appointment:', error);
      toast({
        title: "Erreur",
        description: "Impossible d'annuler le rendez-vous.",
        variant: "destructive",
      });
    } finally {
      setCancellingId(null);
    }
  };

  if (!user) return null;

  const handleSave = async () => {
    await updateProfile({ name, email });
    setIsEditing(false);
  };

  const initials = user.name
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Mon Profil</h1>
          <p className="text-muted-foreground">Gérez vos informations personnelles et préférences</p>
        </div>

        <Tabs defaultValue="profile" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="profile">Profil</TabsTrigger>
            <TabsTrigger value="appointments">Mes Rendez-vous</TabsTrigger>
            <TabsTrigger value="notifications">Notifications</TabsTrigger>
            <TabsTrigger value="security">Sécurité</TabsTrigger>
          </TabsList>

          <TabsContent value="profile" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Informations personnelles</CardTitle>
                <CardDescription>Mettez à jour vos informations de profil</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center gap-6">
                  <Avatar className="h-20 w-20">
                    <AvatarImage src={user.avatar} />
                    <AvatarFallback className="text-lg">{initials}</AvatarFallback>
                  </Avatar>
                  <div>
                    <Button variant="outline" size="sm">Changer la photo</Button>
                    <p className="text-xs text-muted-foreground mt-2">JPG, PNG. Max 2MB</p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Nom complet</Label>
                    <div className="relative">
                      <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        disabled={!isEditing}
                        className="pl-10"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="email"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        disabled={!isEditing}
                        className="pl-10"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Type de compte</Label>
                    <div className="flex items-center gap-2 p-3 bg-muted rounded-lg">
                      <Shield className="h-4 w-4 text-primary" />
                      <span className="capitalize">{user.role}</span>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Membre depuis</Label>
                    <div className="flex items-center gap-2 p-3 bg-muted rounded-lg">
                      <Calendar className="h-4 w-4 text-primary" />
                      <span>{new Date(user.createdAt).toLocaleDateString('fr-FR')}</span>
                    </div>
                  </div>
                </div>

                <div className="flex gap-2">
                  {isEditing ? (
                    <>
                      <Button onClick={handleSave}>Enregistrer</Button>
                      <Button variant="outline" onClick={() => setIsEditing(false)}>Annuler</Button>
                    </>
                  ) : (
                    <Button onClick={() => setIsEditing(true)}>Modifier</Button>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="appointments" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  Mes Rendez-vous
                </CardTitle>
                <CardDescription>Consultez et gérez vos rendez-vous médicaux</CardDescription>
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
                      Vous n'avez pas encore de rendez-vous. Recherchez un professionnel de santé pour prendre rendez-vous.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {appointments.map((appointment) => {
                      const provider = providers[appointment.providerId];
                      const appointmentDate = appointment.datetime?.toDate?.() || new Date();
                      const isPending = appointment.status === 'pending';
                      const isCancelling = cancellingId === appointment.id;
                      
                      return (
                        <div key={appointment.id} className="border rounded-lg p-4">
                          <div className="flex items-start justify-between mb-3">
                            <div className="flex-1">
                              <h3 className="font-medium text-lg mb-1">
                                {provider?.businessName || 'Professionnel de santé'}
                              </h3>
                              {provider?.specialtyId && (
                                <p className="text-sm text-muted-foreground">{provider.specialtyId}</p>
                              )}
                            </div>
                            <Badge variant={getStatusBadgeVariant(appointment.status)}>
                              {getStatusLabel(appointment.status)}
                            </Badge>
                          </div>
                          
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm text-muted-foreground mb-3">
                            <div className="flex items-center gap-2">
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
                            {provider?.address && (
                              <div className="flex items-center gap-2">
                                <MapPin className="h-4 w-4" />
                                <span>{provider.address}</span>
                              </div>
                            )}
                          </div>
                          
                          {appointment.notes && (
                            <p className="text-sm text-muted-foreground mb-3 italic">
                              Note: {appointment.notes}
                            </p>
                          )}
                          
                          {isPending && (
                            <div className="flex justify-end">
                              <Button
                                variant="destructive"
                                size="sm"
                                onClick={() => handleCancelAppointment(appointment.id)}
                                disabled={isCancelling}
                              >
                                {isCancelling ? (
                                  <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Annulation...
                                  </>
                                ) : (
                                  <>
                                    <X className="mr-2 h-4 w-4" />
                                    Annuler
                                  </>
                                )}
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

          <TabsContent value="notifications" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Préférences de notification</CardTitle>
                <CardDescription>Choisissez comment vous souhaitez être notifié</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="push-notifications">Notifications push</Label>
                      <p className="text-sm text-muted-foreground">Recevoir des notifications dans le navigateur</p>
                    </div>
                    <Switch
                      id="push-notifications"
                      checked={preferences.pushNotifications}
                      onCheckedChange={(checked) => updatePreferences({ pushNotifications: checked })}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="email-notifications">Notifications email</Label>
                      <p className="text-sm text-muted-foreground">Recevoir des emails de notification</p>
                    </div>
                    <Switch
                      id="email-notifications"
                      checked={preferences.emailNotifications}
                      onCheckedChange={(checked) => updatePreferences({ emailNotifications: checked })}
                    />
                  </div>

                  <div className="border-t pt-4 mt-4">
                    <h4 className="font-medium mb-4">Types de notifications</h4>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <Label htmlFor="appointments">Rendez-vous</Label>
                        <Switch
                          id="appointments"
                          checked={preferences.appointments}
                          onCheckedChange={(checked) => updatePreferences({ appointments: checked })}
                        />
                      </div>

                      <div className="flex items-center justify-between">
                        <Label htmlFor="messages">Messages</Label>
                        <Switch
                          id="messages"
                          checked={preferences.messages}
                          onCheckedChange={(checked) => updatePreferences({ messages: checked })}
                        />
                      </div>

                      <div className="flex items-center justify-between">
                        <Label htmlFor="profile-updates">Mises à jour du profil</Label>
                        <Switch
                          id="profile-updates"
                          checked={preferences.profileUpdates}
                          onCheckedChange={(checked) => updatePreferences({ profileUpdates: checked })}
                        />
                      </div>

                      <div className="flex items-center justify-between">
                        <Label htmlFor="verification">Statut de vérification</Label>
                        <Switch
                          id="verification"
                          checked={preferences.verificationStatus}
                          onCheckedChange={(checked) => updatePreferences({ verificationStatus: checked })}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="security" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Sécurité</CardTitle>
                <CardDescription>Gérez vos paramètres de sécurité</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label>Mot de passe</Label>
                    <Button variant="outline" className="w-full justify-start">
                      <Lock className="mr-2 h-4 w-4" />
                      Changer le mot de passe
                    </Button>
                  </div>

                  <div className="border-t pt-4">
                    <h4 className="font-medium mb-4">Zone de danger</h4>
                    <div className="space-y-4">
                      <Button variant="destructive" onClick={logout} className="w-full">
                        Se déconnecter
                      </Button>
                      <Button 
                        variant="outline" 
                        className="w-full text-destructive hover:bg-destructive hover:text-destructive-foreground"
                        onClick={() => setShowDeleteDialog(true)}
                      >
                        Supprimer le compte
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Account Deletion Dialog */}
        <AccountDeletionDialog
          open={showDeleteDialog}
          onOpenChange={setShowDeleteDialog}
          userEmail={user.email}
        />
      </div>
    </div>
  );
}
