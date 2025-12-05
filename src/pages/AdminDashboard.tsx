import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { 
  CheckCircle, XCircle, Eye, Users, Building2, TrendingUp,
  AlertCircle, Activity, Search, Filter, BarChart3, Settings,
  FileText, Trash2, Calendar
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { collection, query, where, orderBy, getDocs, doc, updateDoc, deleteDoc, Timestamp } from 'firebase/firestore';
import { db } from '@/integrations/firebase/client';
import { COLLECTIONS } from '@/integrations/firebase/types';
import { getAllProviders, updateProvider, deleteProvider } from '@/integrations/firebase/services/providerService';
import BulkImportForm from '@/components/BulkImportForm';
import {
  logProviderApproval,
  logProviderRejection,
  logMedicalAdApproval,
  logMedicalAdRejection,
  logMedicalAdDeletion,
  logProfileClaimApproval,
  logProfileClaimRejection,
} from '@/services/adminLoggingService';

interface MedicalAd {
  id: string;
  title: string;
  content: string;
  image_url: string | null;
  status: 'pending' | 'approved' | 'rejected';
  display_priority: number;
  start_date: string;
  end_date: string | null;
  created_at: string;
  provider: {
    id: string;
    business_name: string;
    provider_type: string;
  };
}

interface ProfileClaim {
  id: string;
  status: 'pending' | 'approved' | 'rejected';
  documentation: string[];
  notes: string;
  reviewed_by: string | null;
  reviewed_at: string | null;
  created_at: string;
  provider: {
    id: string;
    business_name: string;
    provider_type: string;
    address: string;
  };
  claimant: {
    id: string;
    name: string;
    email: string;
  };
}

export default function AdminDashboard() {
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  
  // Medical ads state
  const [medicalAds, setMedicalAds] = useState<MedicalAd[]>([]);
  const [adsLoading, setAdsLoading] = useState(false);
  const [adsSearchQuery, setAdsSearchQuery] = useState('');
  const [adsStatusFilter, setAdsStatusFilter] = useState('all');
  const [selectedAd, setSelectedAd] = useState<MedicalAd | null>(null);
  const [viewModalOpen, setViewModalOpen] = useState(false);

  // Profile claims state
  const [profileClaims, setProfileClaims] = useState<ProfileClaim[]>([]);
  const [claimsLoading, setClaimsLoading] = useState(false);
  const [claimsSearchQuery, setClaimsSearchQuery] = useState('');
  const [claimsStatusFilter, setClaimsStatusFilter] = useState('all');
  const [selectedClaim, setSelectedClaim] = useState<ProfileClaim | null>(null);
  const [claimViewModalOpen, setClaimViewModalOpen] = useState(false);

  const [stats] = useState({
    totalUsers: 15847,
    totalProviders: 342,
    pendingApprovals: 23,
    monthlyGrowth: 12,
    activeUsers: 8934,
    verifiedProviders: 298,
  });

  const [pendingProviders, setPendingProviders] = useState(() => {
    const stored = localStorage.getItem('ch_pending_registrations');
    return stored ? JSON.parse(stored) : [
      {
        id: '1',
        providerName: 'Cabinet Dr. Merabet',
        type: 'doctor',
        specialty: 'Cardiologie',
        email: 'merabet@example.com',
        phone: '+213 48 50 10 20',
        submittedAt: '2025-01-10T10:30:00',
        status: 'pending'
      },
      {
        id: '2',
        providerName: 'Clinique El Amal',
        type: 'clinic',
        email: 'elamal@example.com',
        phone: '+213 48 50 11 21',
        submittedAt: '2025-01-09T14:20:00',
        status: 'pending'
      }
    ];
  });

  const [recentActivity] = useState([
    { type: 'registration', user: 'Dr. Ahmed B.', action: 'Nouvelle inscription', time: 'Il y a 2h' },
    { type: 'approval', user: 'Admin', action: 'Profil approuvé: Pharmacie Centrale', time: 'Il y a 3h' },
    { type: 'report', user: 'Patient #4521', action: 'Signalement: Avis inapproprié', time: 'Il y a 5h' },
    { type: 'update', user: 'Dr. Sara M.', action: 'Mise à jour du profil', time: 'Il y a 6h' },
  ]);

  const handleApprove = async (id: string) => {
    const provider = pendingProviders.find((p: { id: string }) => p.id === id);
    if (!provider) return;

    const updated = pendingProviders.map((p: { id: string; status: string }) => 
      p.id === id ? { ...p, status: 'approved' } : p
    );
    setPendingProviders(updated);
    localStorage.setItem('ch_pending_registrations', JSON.stringify(updated));
    
    // Log the approval action
    await logProviderApproval(id, provider.providerName);
    
    toast({
      title: "Profil approuvé",
      description: "Le professionnel a été notifié par email.",
    });
  };

  const handleReject = async (id: string) => {
    const provider = pendingProviders.find((p: { id: string }) => p.id === id);
    if (!provider) return;

    const updated = pendingProviders.map((p: { id: string; status: string }) => 
      p.id === id ? { ...p, status: 'rejected' } : p
    );
    setPendingProviders(updated);
    localStorage.setItem('ch_pending_registrations', JSON.stringify(updated));
    
    // Log the rejection action
    await logProviderRejection(id, provider.providerName);
    
    toast({
      title: "Profil rejeté",
      description: "Le professionnel a été notifié par email.",
      variant: "destructive",
    });
  };

  // Medical ads functions
  const fetchMedicalAds = async () => {
    try {
      setAdsLoading(true);
      
      // Fetch medical ads from Firestore
      const adsQuery = query(
        collection(db, COLLECTIONS.medicalAds),
        orderBy('createdAt', 'desc')
      );
      const adsSnapshot = await getDocs(adsQuery);
      
      const ads: MedicalAd[] = [];
      for (const docSnap of adsSnapshot.docs) {
        const adData = docSnap.data();
        // Fetch provider data
        const providerDoc = await getDocs(query(
          collection(db, COLLECTIONS.providers),
          where('__name__', '==', adData.providerId)
        ));
        const providerData = providerDoc.docs[0]?.data() || {};
        
        ads.push({
          id: docSnap.id,
          title: adData.title || '',
          content: adData.content || '',
          image_url: adData.imageUrl || null,
          status: adData.status || 'pending',
          display_priority: adData.displayPriority || 0,
          start_date: adData.startDate?.toDate?.()?.toISOString() || new Date().toISOString(),
          end_date: adData.endDate?.toDate?.()?.toISOString() || null,
          created_at: adData.createdAt?.toDate?.()?.toISOString() || new Date().toISOString(),
          provider: {
            id: adData.providerId || '',
            business_name: providerData.businessName || 'Unknown',
            provider_type: providerData.providerType || 'doctor',
          },
        });
      }

      setMedicalAds(ads);
    } catch (error) {
      console.error('Error fetching medical ads:', error);
      toast({
        title: "Erreur",
        description: "Une erreur inattendue s'est produite.",
        variant: "destructive",
      });
    } finally {
      setAdsLoading(false);
    }
  };

  const handleViewAd = (ad: MedicalAd) => {
    setSelectedAd(ad);
    setViewModalOpen(true);
  };

  const handleApproveAd = async (adId: string) => {
    if (!confirm('Êtes-vous sûr de vouloir approuver cette annonce ? Elle sera visible publiquement.')) {
      return;
    }

    try {
      // Get the ad details before updating
      const ad = medicalAds.find(a => a.id === adId);
      if (!ad) return;

      // Update in Firestore
      const adRef = doc(db, COLLECTIONS.medicalAds, adId);
      await updateDoc(adRef, { status: 'approved' });

      // Log the approval action
      await logMedicalAdApproval(adId, ad.title, ad.provider.id);

      // Update local state
      setMedicalAds(ads => 
        ads.map(ad => 
          ad.id === adId ? { ...ad, status: 'approved' as const } : ad
        )
      );

      toast({
        title: "Annonce approuvée",
        description: "L'annonce est maintenant visible publiquement.",
      });
    } catch (error) {
      console.error('Error approving ad:', error);
      toast({
        title: "Erreur",
        description: "Une erreur inattendue s'est produite.",
        variant: "destructive",
      });
    }
  };

  const handleRejectAd = async (adId: string) => {
    if (!confirm('Êtes-vous sûr de vouloir rejeter cette annonce ? Elle ne sera plus visible.')) {
      return;
    }

    try {
      // Get the ad details before updating
      const ad = medicalAds.find(a => a.id === adId);
      if (!ad) return;

      // Update in Firestore
      const adRef = doc(db, COLLECTIONS.medicalAds, adId);
      await updateDoc(adRef, { status: 'rejected' });

      // Log the rejection action
      await logMedicalAdRejection(adId, ad.title, ad.provider.id);

      // Update local state
      setMedicalAds(ads => 
        ads.map(ad => 
          ad.id === adId ? { ...ad, status: 'rejected' as const } : ad
        )
      );

      toast({
        title: "Annonce rejetée",
        description: "L'annonce a été rejetée et n'est plus visible.",
        variant: "destructive",
      });
    } catch (error) {
      console.error('Error rejecting ad:', error);
      toast({
        title: "Erreur",
        description: "Une erreur inattendue s'est produite.",
        variant: "destructive",
      });
    }
  };

  const handleDeleteAd = async (adId: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer définitivement cette annonce ?')) {
      return;
    }

    try {
      // Get the ad details before deleting
      const ad = medicalAds.find(a => a.id === adId);
      if (!ad) return;

      // Delete from Firestore
      const adRef = doc(db, COLLECTIONS.medicalAds, adId);
      await deleteDoc(adRef);

      // Log the deletion action
      await logMedicalAdDeletion(adId, ad.title, ad.provider.id, ad.status);

      // Update local state
      setMedicalAds(ads => ads.filter(ad => ad.id !== adId));

      toast({
        title: "Annonce supprimée",
        description: "L'annonce a été supprimée définitivement.",
      });
    } catch (error) {
      console.error('Error deleting ad:', error);
      toast({
        title: "Erreur",
        description: "Une erreur inattendue s'est produite.",
        variant: "destructive",
      });
    }
  };

  const filteredProviders = pendingProviders.filter((p: { providerName: string; email: string; status: string }) => {
    const matchesSearch = p.providerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          p.email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || p.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const filteredAds = medicalAds.filter(ad => {
    const matchesSearch = ad.title.toLowerCase().includes(adsSearchQuery.toLowerCase()) ||
                          ad.provider.business_name.toLowerCase().includes(adsSearchQuery.toLowerCase());
    const matchesStatus = adsStatusFilter === 'all' || ad.status === adsStatusFilter;
    return matchesSearch && matchesStatus;
  });

  // Profile claims functions
  const fetchProfileClaims = async () => {
    try {
      setClaimsLoading(true);
      
      // Fetch profile claims from Firestore
      const claimsQuery = query(
        collection(db, COLLECTIONS.profileClaims),
        orderBy('createdAt', 'desc')
      );
      const claimsSnapshot = await getDocs(claimsQuery);
      
      const claims: ProfileClaim[] = [];
      for (const docSnap of claimsSnapshot.docs) {
        const claimData = docSnap.data();
        
        // Fetch provider data
        const providerDoc = await getDocs(query(
          collection(db, COLLECTIONS.providers),
          where('__name__', '==', claimData.providerId)
        ));
        const providerData = providerDoc.docs[0]?.data() || {};
        
        // Fetch claimant profile data
        const profileDoc = await getDocs(query(
          collection(db, COLLECTIONS.profiles),
          where('__name__', '==', claimData.userId)
        ));
        const profileData = profileDoc.docs[0]?.data() || {};
        
        claims.push({
          id: docSnap.id,
          status: claimData.status || 'pending',
          documentation: claimData.documentation || [],
          notes: claimData.notes || '',
          reviewed_by: claimData.reviewedBy || null,
          reviewed_at: claimData.reviewedAt?.toDate?.()?.toISOString() || null,
          created_at: claimData.createdAt?.toDate?.()?.toISOString() || new Date().toISOString(),
          provider: {
            id: claimData.providerId || '',
            business_name: providerData.businessName || 'Unknown',
            provider_type: providerData.providerType || 'doctor',
            address: providerData.address || '',
          },
          claimant: {
            id: claimData.userId || '',
            name: profileData.fullName || 'Utilisateur inconnu',
            email: 'email@example.com',
          },
        });
      }

      setProfileClaims(claims);
    } catch (error) {
      console.error('Error fetching profile claims:', error);
      toast({
        title: "Erreur",
        description: "Une erreur inattendue s'est produite.",
        variant: "destructive",
      });
    } finally {
      setClaimsLoading(false);
    }
  };

  const handleViewClaim = (claim: ProfileClaim) => {
    setSelectedClaim(claim);
    setClaimViewModalOpen(true);
  };

  const handleApproveClaim = async (claimId: string) => {
    if (!confirm('Êtes-vous sûr de vouloir approuver cette revendication ? Le profil sera transféré au demandeur.')) {
      return;
    }

    try {
      const claim = profileClaims.find(c => c.id === claimId);
      if (!claim) return;

      // Get current admin user ID from Firebase Auth
      const { auth } = await import('@/integrations/firebase/client');
      const adminUserId = auth.currentUser?.uid || 'admin-user-id';

      // Update the claim status in Firestore
      const claimRef = doc(db, COLLECTIONS.profileClaims, claimId);
      await updateDoc(claimRef, { 
        status: 'approved',
        reviewedBy: adminUserId,
        reviewedAt: Timestamp.now()
      });

      // Update the provider profile in Firestore
      const providerRef = doc(db, COLLECTIONS.providers, claim.provider.id);
      await updateDoc(providerRef, { 
        userId: claim.claimant.id,
        isClaimed: true,
        isPreloaded: false
      });

      // Log the approval action
      await logProfileClaimApproval(
        claimId,
        claim.provider.id,
        claim.provider.business_name,
        claim.claimant.id,
        claim.claimant.name
      );

      toast({
        title: "Revendication approuvée",
        description: "Le profil a été transféré au demandeur.",
      });

      // Refresh the claims list
      fetchProfileClaims();
    } catch (error) {
      console.error('Error approving claim:', error);
      toast({
        title: "Erreur",
        description: error instanceof Error ? error.message : "Impossible d'approuver la revendication.",
        variant: "destructive",
      });
    }
  };

  const handleRejectClaim = async (claimId: string) => {
    const reason = prompt('Raison du rejet (optionnel):');
    
    if (!confirm('Êtes-vous sûr de vouloir rejeter cette revendication ?')) {
      return;
    }

    try {
      const claim = profileClaims.find(c => c.id === claimId);
      if (!claim) return;

      // Get current admin user ID from Firebase Auth
      const { auth } = await import('@/integrations/firebase/client');
      const adminUserId = auth.currentUser?.uid || 'admin-user-id';

      // Update in Firestore
      const claimRef = doc(db, COLLECTIONS.profileClaims, claimId);
      await updateDoc(claimRef, { 
        status: 'rejected',
        notes: reason || null,
        reviewedBy: adminUserId,
        reviewedAt: Timestamp.now()
      });

      // Log the rejection action
      await logProfileClaimRejection(
        claimId,
        claim.provider.id,
        claim.provider.business_name,
        claim.claimant.id,
        claim.claimant.name,
        reason || undefined
      );

      toast({
        title: "Revendication rejetée",
        description: "Le demandeur a été notifié du rejet.",
        variant: "destructive",
      });

      // Refresh the claims list
      fetchProfileClaims();
    } catch (error) {
      console.error('Error rejecting claim:', error);
      toast({
        title: "Erreur",
        description: "Une erreur inattendue s'est produite.",
        variant: "destructive",
      });
    }
  };

  const filteredClaims = profileClaims.filter(claim => {
    const matchesSearch = claim.provider.business_name.toLowerCase().includes(claimsSearchQuery.toLowerCase()) ||
                          claim.claimant.name.toLowerCase().includes(claimsSearchQuery.toLowerCase());
    const matchesStatus = claimsStatusFilter === 'all' || claim.status === claimsStatusFilter;
    return matchesSearch && matchesStatus;
  });

  // Fetch medical ads and profile claims when component mounts
  useEffect(() => {
    fetchMedicalAds();
    fetchProfileClaims();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-secondary/20 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold mb-2">Tableau de bord Admin</h1>
              <p className="text-muted-foreground">Gestion de la plateforme CityHealth</p>
            </div>
            <Button>
              <Settings className="mr-2 h-4 w-4" />
              Paramètres
            </Button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardHeader className="pb-3">
              <CardDescription>Total Utilisateurs</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-3xl font-bold">{stats.totalUsers.toLocaleString()}</p>
                  <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                    <TrendingUp className="h-3 w-3" /> +{stats.monthlyGrowth}% ce mois
                  </p>
                </div>
                <Users className="h-8 w-8 text-primary" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardDescription>Professionnels</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-3xl font-bold">{stats.totalProviders}</p>
                  <p className="text-xs text-muted-foreground">{stats.verifiedProviders} vérifiés</p>
                </div>
                <Building2 className="h-8 w-8 text-primary" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardDescription>En attente</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-3xl font-bold text-orange-500">{stats.pendingApprovals}</p>
                  <p className="text-xs text-muted-foreground">À vérifier</p>
                </div>
                <AlertCircle className="h-8 w-8 text-orange-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardDescription>Utilisateurs actifs</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-3xl font-bold">{stats.activeUsers.toLocaleString()}</p>
                  <p className="text-xs text-muted-foreground">Dernières 24h</p>
                </div>
                <Activity className="h-8 w-8 text-primary" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <Tabs defaultValue="approvals" className="space-y-6">
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="approvals">
              Approbations ({stats.pendingApprovals})
            </TabsTrigger>
            <TabsTrigger value="ads">Annonces</TabsTrigger>
            <TabsTrigger value="import">Import</TabsTrigger>
            <TabsTrigger value="analytics">Analytiques</TabsTrigger>
            <TabsTrigger value="moderation">Modération</TabsTrigger>
            <TabsTrigger value="settings">Configuration</TabsTrigger>
          </TabsList>

          {/* Approvals Tab */}
          <TabsContent value="approvals" className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Demandes d'inscription</CardTitle>
                    <CardDescription>Vérifier et approuver les nouveaux professionnels</CardDescription>
                  </div>
                  <div className="flex gap-2">
                    <div className="relative">
                      <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        placeholder="Rechercher..."
                        className="pl-10 w-64"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                      />
                    </div>
                    <Select value={statusFilter} onValueChange={setStatusFilter}>
                      <SelectTrigger className="w-40">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Tous</SelectItem>
                        <SelectItem value="pending">En attente</SelectItem>
                        <SelectItem value="approved">Approuvés</SelectItem>
                        <SelectItem value="rejected">Rejetés</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Professionnel</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Contact</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Statut</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredProviders.map((provider: { id: string; providerName: string; specialty?: string; type: string; email: string; phone: string; submittedAt: string; status: string }) => (
                      <TableRow key={provider.id}>
                        <TableCell>
                          <div>
                            <p className="font-medium">{provider.providerName}</p>
                            {provider.specialty && (
                              <p className="text-sm text-muted-foreground">{provider.specialty}</p>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">
                            {provider.type === 'doctor' ? 'Médecin' :
                             provider.type === 'clinic' ? 'Clinique' :
                             provider.type === 'pharmacy' ? 'Pharmacie' :
                             provider.type === 'lab' ? 'Laboratoire' : 'Hôpital'}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm">
                            <p>{provider.email}</p>
                            <p className="text-muted-foreground">{provider.phone}</p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <span className="text-sm text-muted-foreground">
                            {new Date(provider.submittedAt).toLocaleDateString('fr-FR')}
                          </span>
                        </TableCell>
                        <TableCell>
                          <Badge 
                            variant={
                              provider.status === 'pending' ? 'secondary' :
                              provider.status === 'approved' ? 'default' : 'destructive'
                            }
                          >
                            {provider.status === 'pending' ? 'En attente' :
                             provider.status === 'approved' ? 'Approuvé' : 'Rejeté'}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button size="sm" variant="outline">
                              <Eye className="h-4 w-4" />
                            </Button>
                            {provider.status === 'pending' && (
                              <>
                                <Button 
                                  size="sm" 
                                  variant="default"
                                  onClick={() => handleApprove(provider.id)}
                                >
                                  <CheckCircle className="h-4 w-4" />
                                </Button>
                                <Button 
                                  size="sm" 
                                  variant="destructive"
                                  onClick={() => handleReject(provider.id)}
                                >
                                  <XCircle className="h-4 w-4" />
                                </Button>
                              </>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>

            {/* Profile Claims Section */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Revendications de profils</CardTitle>
                    <CardDescription>Gérer les demandes de revendication de profils préchargés</CardDescription>
                  </div>
                  <div className="flex gap-2">
                    <div className="relative">
                      <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        placeholder="Rechercher..."
                        className="pl-10 w-64"
                        value={claimsSearchQuery}
                        onChange={(e) => setClaimsSearchQuery(e.target.value)}
                      />
                    </div>
                    <Select value={claimsStatusFilter} onValueChange={setClaimsStatusFilter}>
                      <SelectTrigger className="w-40">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Tous</SelectItem>
                        <SelectItem value="pending">En attente</SelectItem>
                        <SelectItem value="approved">Approuvés</SelectItem>
                        <SelectItem value="rejected">Rejetés</SelectItem>
                      </SelectContent>
                    </Select>
                    <Button onClick={fetchProfileClaims} variant="outline" disabled={claimsLoading}>
                      {claimsLoading ? (
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
                      ) : (
                        'Actualiser'
                      )}
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {claimsLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Profil revendiqué</TableHead>
                        <TableHead>Demandeur</TableHead>
                        <TableHead>Raison</TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead>Statut</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredClaims.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                            Aucune revendication trouvée
                          </TableCell>
                        </TableRow>
                      ) : (
                        filteredClaims.map((claim) => (
                          <TableRow key={claim.id}>
                            <TableCell>
                              <div>
                                <p className="font-medium">{claim.provider.business_name}</p>
                                <p className="text-sm text-muted-foreground">{claim.provider.address}</p>
                              </div>
                            </TableCell>
                            <TableCell>
                              <div>
                                <p className="font-medium">{claim.claimant.name}</p>
                                <p className="text-sm text-muted-foreground">{claim.claimant.email}</p>
                              </div>
                            </TableCell>
                            <TableCell>
                              <p className="text-sm max-w-xs truncate" title={claim.notes}>
                                {claim.notes}
                              </p>
                            </TableCell>
                            <TableCell>
                              <span className="text-sm text-muted-foreground">
                                {new Date(claim.created_at).toLocaleDateString('fr-FR')}
                              </span>
                            </TableCell>
                            <TableCell>
                              <Badge 
                                variant={
                                  claim.status === 'pending' ? 'secondary' :
                                  claim.status === 'approved' ? 'default' : 'destructive'
                                }
                              >
                                {claim.status === 'pending' ? 'En attente' :
                                 claim.status === 'approved' ? 'Approuvé' : 'Rejeté'}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-right">
                              <div className="flex justify-end gap-2">
                                <Button 
                                  size="sm" 
                                  variant="outline"
                                  onClick={() => handleViewClaim(claim)}
                                >
                                  <Eye className="h-4 w-4" />
                                </Button>
                                {claim.status === 'pending' && (
                                  <>
                                    <Button 
                                      size="sm" 
                                      variant="default"
                                      onClick={() => handleApproveClaim(claim.id)}
                                    >
                                      <CheckCircle className="h-4 w-4" />
                                    </Button>
                                    <Button 
                                      size="sm" 
                                      variant="destructive"
                                      onClick={() => handleRejectClaim(claim.id)}
                                    >
                                      <XCircle className="h-4 w-4" />
                                    </Button>
                                  </>
                                )}
                              </div>
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>

            {/* Recent Activity */}
            <Card>
              <CardHeader>
                <CardTitle>Activité récente</CardTitle>
                <CardDescription>Dernières actions sur la plateforme</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recentActivity.map((activity, idx) => (
                    <div key={idx} className="flex items-start gap-4 pb-4 border-b last:border-0">
                      <div className={`w-2 h-2 mt-2 rounded-full ${
                        activity.type === 'approval' ? 'bg-green-500' :
                        activity.type === 'report' ? 'bg-red-500' :
                        'bg-blue-500'
                      }`} />
                      <div className="flex-1">
                        <p className="text-sm font-medium">{activity.action}</p>
                        <p className="text-xs text-muted-foreground">{activity.user}</p>
                      </div>
                      <span className="text-xs text-muted-foreground">{activity.time}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Medical Ads Tab */}
          <TabsContent value="ads" className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Modération des annonces médicales</CardTitle>
                    <CardDescription>Approuver, rejeter ou supprimer les annonces des prestataires</CardDescription>
                  </div>
                  <div className="flex gap-2">
                    <div className="relative">
                      <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        placeholder="Rechercher annonces..."
                        className="pl-10 w-64"
                        value={adsSearchQuery}
                        onChange={(e) => setAdsSearchQuery(e.target.value)}
                      />
                    </div>
                    <Select value={adsStatusFilter} onValueChange={setAdsStatusFilter}>
                      <SelectTrigger className="w-40">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Tous</SelectItem>
                        <SelectItem value="pending">En attente</SelectItem>
                        <SelectItem value="approved">Approuvées</SelectItem>
                        <SelectItem value="rejected">Rejetées</SelectItem>
                      </SelectContent>
                    </Select>
                    <Button onClick={fetchMedicalAds} variant="outline" disabled={adsLoading}>
                      {adsLoading ? (
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
                      ) : (
                        'Actualiser'
                      )}
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {adsLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Prestataire</TableHead>
                        <TableHead>Titre de l'annonce</TableHead>
                        <TableHead>Statut</TableHead>
                        <TableHead>Date de création</TableHead>
                        <TableHead>Période</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredAds.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                            {adsSearchQuery || adsStatusFilter !== 'all' 
                              ? 'Aucune annonce trouvée avec ces critères'
                              : 'Aucune annonce médicale'
                            }
                          </TableCell>
                        </TableRow>
                      ) : (
                        filteredAds.map((ad) => (
                          <TableRow key={ad.id}>
                            <TableCell>
                              <div>
                                <p className="font-medium">{ad.provider.business_name}</p>
                                <p className="text-sm text-muted-foreground">
                                  {ad.provider.provider_type === 'doctor' ? 'Médecin' :
                                   ad.provider.provider_type === 'clinic' ? 'Clinique' :
                                   ad.provider.provider_type === 'pharmacy' ? 'Pharmacie' :
                                   ad.provider.provider_type === 'lab' ? 'Laboratoire' : 'Hôpital'}
                                </p>
                              </div>
                            </TableCell>
                            <TableCell>
                              <div>
                                <p className="font-medium">{ad.title}</p>
                                <p className="text-sm text-muted-foreground line-clamp-2">
                                  {ad.content.length > 60 
                                    ? `${ad.content.substring(0, 60)}...` 
                                    : ad.content
                                  }
                                </p>
                              </div>
                            </TableCell>
                            <TableCell>
                              <Badge 
                                variant={
                                  ad.status === 'pending' ? 'secondary' :
                                  ad.status === 'approved' ? 'default' : 'destructive'
                                }
                              >
                                {ad.status === 'pending' ? 'En attente' :
                                 ad.status === 'approved' ? 'Approuvée' : 'Rejetée'}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <span className="text-sm text-muted-foreground">
                                {new Date(ad.created_at).toLocaleDateString('fr-FR')}
                              </span>
                            </TableCell>
                            <TableCell>
                              <div className="text-sm">
                                <div className="flex items-center gap-1">
                                  <Calendar className="h-3 w-3" />
                                  <span>{new Date(ad.start_date).toLocaleDateString('fr-FR')}</span>
                                </div>
                                {ad.end_date && (
                                  <div className="text-muted-foreground">
                                    → {new Date(ad.end_date).toLocaleDateString('fr-FR')}
                                  </div>
                                )}
                              </div>
                            </TableCell>
                            <TableCell className="text-right">
                              <div className="flex justify-end gap-2">
                                <Button 
                                  size="sm" 
                                  variant="outline"
                                  onClick={() => handleViewAd(ad)}
                                >
                                  <Eye className="h-4 w-4" />
                                </Button>
                                {ad.status === 'pending' && (
                                  <>
                                    <Button 
                                      size="sm" 
                                      variant="default"
                                      onClick={() => handleApproveAd(ad.id)}
                                    >
                                      <CheckCircle className="h-4 w-4" />
                                    </Button>
                                    <Button 
                                      size="sm" 
                                      variant="destructive"
                                      onClick={() => handleRejectAd(ad.id)}
                                    >
                                      <XCircle className="h-4 w-4" />
                                    </Button>
                                  </>
                                )}
                                <Button 
                                  size="sm" 
                                  variant="destructive"
                                  onClick={() => handleDeleteAd(ad.id)}
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Import Tab */}
          <TabsContent value="import" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Import en masse de prestataires</CardTitle>
                <CardDescription>
                  Importez plusieurs profils de prestataires à partir d'un fichier CSV ou JSON
                </CardDescription>
              </CardHeader>
              <CardContent>
                <BulkImportForm />
              </CardContent>
            </Card>

            {/* Import History */}
            <Card>
              <CardHeader>
                <CardTitle>Historique des imports</CardTitle>
                <CardDescription>Derniers imports effectués par les administrateurs</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead>Administrateur</TableHead>
                      <TableHead>Nombre de profils</TableHead>
                      <TableHead>Succès</TableHead>
                      <TableHead>Erreurs</TableHead>
                      <TableHead>Statut</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    <TableRow>
                      <TableCell>23/11/2025 14:30</TableCell>
                      <TableCell>Admin User</TableCell>
                      <TableCell>25</TableCell>
                      <TableCell>23</TableCell>
                      <TableCell>2</TableCell>
                      <TableCell>
                        <Badge variant="default">Terminé</Badge>
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>22/11/2025 09:15</TableCell>
                      <TableCell>Admin User</TableCell>
                      <TableCell>50</TableCell>
                      <TableCell>50</TableCell>
                      <TableCell>0</TableCell>
                      <TableCell>
                        <Badge variant="default">Terminé</Badge>
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>21/11/2025 16:45</TableCell>
                      <TableCell>Admin User</TableCell>
                      <TableCell>12</TableCell>
                      <TableCell>10</TableCell>
                      <TableCell>2</TableCell>
                      <TableCell>
                        <Badge variant="default">Terminé</Badge>
                      </TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Analytics Tab */}
          <TabsContent value="analytics">
            <div className="grid gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Statistiques d'utilisation</CardTitle>
                  <CardDescription>Métriques clés de la plateforme</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    <div>
                      <div className="flex justify-between mb-2">
                        <span className="text-sm font-medium">Recherches par jour</span>
                        <span className="text-sm text-muted-foreground">~2,400</span>
                      </div>
                      <div className="h-2 bg-muted rounded-full">
                        <div className="h-2 bg-primary rounded-full" style={{width: '85%'}} />
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between mb-2">
                        <span className="text-sm font-medium">Taux de conversion</span>
                        <span className="text-sm text-muted-foreground">23%</span>
                      </div>
                      <div className="h-2 bg-muted rounded-full">
                        <div className="h-2 bg-primary rounded-full" style={{width: '23%'}} />
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between mb-2">
                        <span className="text-sm font-medium">Satisfaction utilisateur</span>
                        <span className="text-sm text-muted-foreground">92%</span>
                      </div>
                      <div className="h-2 bg-muted rounded-full">
                        <div className="h-2 bg-primary rounded-full" style={{width: '92%'}} />
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Top Spécialités</CardTitle>
                  <CardDescription>Les plus recherchées</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {['Médecine générale', 'Dentisterie', 'Cardiologie', 'Pédiatrie', 'Gynécologie'].map((spec, idx) => (
                      <div key={spec} className="flex items-center justify-between">
                        <span className="text-sm">{spec}</span>
                        <Badge variant="secondary">{345 - idx * 50}</Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Moderation Tab */}
          <TabsContent value="moderation">
            <Card>
              <CardHeader>
                <CardTitle>Modération de contenu</CardTitle>
                <CardDescription>Gérer les signalements et le contenu</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">Aucun signalement en attente</p>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Settings Tab */}
          <TabsContent value="settings">
            <Card>
              <CardHeader>
                <CardTitle>Configuration de la plateforme</CardTitle>
                <CardDescription>Paramètres système et maintenance</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <p className="font-medium">Mode maintenance</p>
                    <p className="text-sm text-muted-foreground">Désactiver temporairement la plateforme</p>
                  </div>
                  <Button variant="outline">Activer</Button>
                </div>
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <p className="font-medium">Critères de vérification</p>
                    <p className="text-sm text-muted-foreground">Modifier les exigences d'approbation</p>
                  </div>
                  <Button variant="outline">Configurer</Button>
                </div>
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <p className="font-medium">Notifications email</p>
                    <p className="text-sm text-muted-foreground">Gérer les modèles d'emails</p>
                  </div>
                  <Button variant="outline">Modifier</Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* Medical Ad View Modal */}
      <Dialog open={viewModalOpen} onOpenChange={setViewModalOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Détails de l'annonce médicale</DialogTitle>
            <DialogDescription>
              Examinez le contenu complet de l'annonce avant de prendre une décision
            </DialogDescription>
          </DialogHeader>
          
          {selectedAd && (
            <div className="space-y-6">
              {/* Provider Info */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg">{selectedAd.provider.business_name}</CardTitle>
                  <CardDescription>
                    {selectedAd.provider.provider_type === 'doctor' ? 'Médecin' :
                     selectedAd.provider.provider_type === 'clinic' ? 'Clinique' :
                     selectedAd.provider.provider_type === 'pharmacy' ? 'Pharmacie' :
                     selectedAd.provider.provider_type === 'lab' ? 'Laboratoire' : 'Hôpital'}
                  </CardDescription>
                </CardHeader>
              </Card>

              {/* Ad Content */}
              <Card>
                <CardHeader>
                  <CardTitle>{selectedAd.title}</CardTitle>
                  <div className="flex items-center gap-2">
                    <Badge 
                      variant={
                        selectedAd.status === 'pending' ? 'secondary' :
                        selectedAd.status === 'approved' ? 'default' : 'destructive'
                      }
                    >
                      {selectedAd.status === 'pending' ? 'En attente' :
                       selectedAd.status === 'approved' ? 'Approuvée' : 'Rejetée'}
                    </Badge>
                    <span className="text-sm text-muted-foreground">
                      Créée le {new Date(selectedAd.created_at).toLocaleDateString('fr-FR')}
                    </span>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <h4 className="font-medium mb-2">Contenu</h4>
                    <p className="text-sm leading-relaxed whitespace-pre-wrap">
                      {selectedAd.content}
                    </p>
                  </div>

                  {selectedAd.image_url && (
                    <div>
                      <h4 className="font-medium mb-2">Image</h4>
                      <img
                        src={selectedAd.image_url}
                        alt={selectedAd.title}
                        className="w-full max-w-md h-48 object-cover rounded-lg border"
                      />
                    </div>
                  )}

                  <div>
                    <h4 className="font-medium mb-2">Période d'affichage</h4>
                    <div className="flex items-center gap-2 text-sm">
                      <Calendar className="h-4 w-4" />
                      <span>Du {new Date(selectedAd.start_date).toLocaleDateString('fr-FR')}</span>
                      {selectedAd.end_date && (
                        <>
                          <span>au</span>
                          <span>{new Date(selectedAd.end_date).toLocaleDateString('fr-FR')}</span>
                        </>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Actions */}
              {selectedAd.status === 'pending' && (
                <div className="flex gap-3">
                  <Button
                    variant="default"
                    onClick={() => {
                      handleApproveAd(selectedAd.id);
                      setViewModalOpen(false);
                    }}
                    className="flex-1"
                  >
                    <CheckCircle className="mr-2 h-4 w-4" />
                    Approuver l'annonce
                  </Button>
                  <Button
                    variant="destructive"
                    onClick={() => {
                      handleRejectAd(selectedAd.id);
                      setViewModalOpen(false);
                    }}
                    className="flex-1"
                  >
                    <XCircle className="mr-2 h-4 w-4" />
                    Rejeter l'annonce
                  </Button>
                </div>
              )}
              
              <div className="flex justify-end">
                <Button
                  variant="destructive"
                  onClick={() => {
                    handleDeleteAd(selectedAd.id);
                    setViewModalOpen(false);
                  }}
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Supprimer définitivement
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Profile Claim View Modal */}
      <Dialog open={claimViewModalOpen} onOpenChange={setClaimViewModalOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Détails de la revendication</DialogTitle>
            <DialogDescription>
              Examinez la demande de revendication et les documents justificatifs
            </DialogDescription>
          </DialogHeader>
          
          {selectedClaim && (
            <div className="space-y-6">
              {/* Provider Info */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg">Profil revendiqué</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="font-medium">{selectedClaim.provider.business_name}</p>
                      <p className="text-sm text-muted-foreground">{selectedClaim.provider.provider_type}</p>
                      <p className="text-sm text-muted-foreground">{selectedClaim.provider.address}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Claimant Info */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg">Demandeur</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="font-medium">{selectedClaim.claimant.name}</p>
                      <p className="text-sm text-muted-foreground">{selectedClaim.claimant.email}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">
                        Demande soumise le {new Date(selectedClaim.created_at).toLocaleDateString('fr-FR')}
                      </p>
                      <Badge 
                        variant={
                          selectedClaim.status === 'pending' ? 'secondary' :
                          selectedClaim.status === 'approved' ? 'default' : 'destructive'
                        }
                      >
                        {selectedClaim.status === 'pending' ? 'En attente' :
                         selectedClaim.status === 'approved' ? 'Approuvée' : 'Rejetée'}
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Claim Details */}
              <Card>
                <CardHeader>
                  <CardTitle>Justification</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <h4 className="font-medium mb-2">Raison de la revendication</h4>
                    <p className="text-sm leading-relaxed whitespace-pre-wrap bg-muted p-3 rounded">
                      {selectedClaim.notes}
                    </p>
                  </div>

                  {selectedClaim.documentation && selectedClaim.documentation.length > 0 && (
                    <div>
                      <h4 className="font-medium mb-2">Documents justificatifs</h4>
                      <div className="space-y-2">
                        {selectedClaim.documentation.map((doc, index) => (
                          <div key={index} className="flex items-center gap-2 p-2 bg-muted rounded">
                            <FileText className="h-4 w-4" />
                            <span className="text-sm">Document {index + 1}</span>
                            <Button size="sm" variant="outline" className="ml-auto">
                              Télécharger
                            </Button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Actions */}
              {selectedClaim.status === 'pending' && (
                <div className="flex gap-3">
                  <Button
                    variant="default"
                    onClick={() => {
                      handleApproveClaim(selectedClaim.id);
                      setClaimViewModalOpen(false);
                    }}
                    className="flex-1"
                  >
                    <CheckCircle className="mr-2 h-4 w-4" />
                    Approuver la revendication
                  </Button>
                  <Button
                    variant="destructive"
                    onClick={() => {
                      handleRejectClaim(selectedClaim.id);
                      setClaimViewModalOpen(false);
                    }}
                    className="flex-1"
                  >
                    <XCircle className="mr-2 h-4 w-4" />
                    Rejeter la revendication
                  </Button>
                </div>
              )}

              {selectedClaim.reviewed_at && (
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm">Historique de révision</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">
                      Révisé le {new Date(selectedClaim.reviewed_at).toLocaleDateString('fr-FR')} 
                      {selectedClaim.reviewed_by && ` par ${selectedClaim.reviewed_by}`}
                    </p>
                  </CardContent>
                </Card>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
