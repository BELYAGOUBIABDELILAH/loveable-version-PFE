import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Users, 
  Activity, 
  TrendingUp, 
  AlertTriangle,
  Eye,
  Check,
  X,
  Search,
  Filter,
  Download,
  Settings,
  BarChart3,
  UserCheck,
  Clock,
  Star
} from 'lucide-react';
import AnimatedTransition from '@/components/AnimatedTransition';

interface Provider {
  id: number;
  name: string;
  type: string;
  status: 'pending' | 'approved' | 'rejected';
  submittedAt: string;
  rating?: number;
  specialty?: string;
}

interface Stats {
  totalUsers: number;
  totalProviders: number;
  pendingApprovals: number;
  monthlyGrowth: number;
}

const AdminPage = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');

  // Mock data
  const stats: Stats = {
    totalUsers: 5247,
    totalProviders: 156,
    pendingApprovals: 12,
    monthlyGrowth: 23.5
  };

  const pendingProviders: Provider[] = [
    {
      id: 1,
      name: "Dr. Amina Khelifi",
      type: "Médecin généraliste",
      specialty: "Médecine générale",
      status: "pending",
      submittedAt: "2024-01-15"
    },
    {
      id: 2,
      name: "Pharmacie El Shifa",
      type: "Pharmacie",
      status: "pending",
      submittedAt: "2024-01-14"
    },
    {
      id: 3,
      name: "Clinique El Amal",
      type: "Clinique privée",
      status: "pending",
      submittedAt: "2024-01-13"
    }
  ];

  const recentActivity = [
    { action: "Nouveau prestataire approuvé", provider: "Dr. Benali", time: "Il y a 2h" },
    { action: "Utilisateur signalé", provider: "Pharmacie Centrale", time: "Il y a 4h" },
    { action: "Nouveau compte créé", provider: "User #5247", time: "Il y a 6h" },
    { action: "Prestataire rejeté", provider: "Cabinet XYZ", time: "Il y a 1j" }
  ];

  const handleApprove = (providerId: number) => {
    // TODO: Implement provider approval
  };

  const handleReject = (providerId: number) => {
    // TODO: Implement provider rejection
  };

  return (
    <div className="min-h-screen pt-24 pb-12 px-4">
      <div className="max-w-7xl mx-auto">
        <AnimatedTransition show={true} animation="fade">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-foreground mb-2">
              Tableau de Bord Administrateur
            </h1>
            <p className="text-muted-foreground">
              Gérez les prestataires, modérez le contenu et suivez les statistiques de la plateforme
            </p>
          </div>

          {/* Stats Cards */}
          <div className="grid md:grid-cols-4 gap-6 mb-8">
            <Card className="glass-card">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Utilisateurs</p>
                    <p className="text-2xl font-bold text-foreground">{stats.totalUsers.toLocaleString()}</p>
                  </div>
                  <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                    <Users className="h-6 w-6 text-blue-600" />
                  </div>
                </div>
                <div className="flex items-center mt-4 text-sm">
                  <TrendingUp className="h-4 w-4 text-green-600 mr-1" />
                  <span className="text-green-600">+{stats.monthlyGrowth}%</span>
                  <span className="text-muted-foreground ml-1">ce mois</span>
                </div>
              </CardContent>
            </Card>

            <Card className="glass-card">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Prestataires</p>
                    <p className="text-2xl font-bold text-foreground">{stats.totalProviders}</p>
                  </div>
                  <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                    <UserCheck className="h-6 w-6 text-green-600" />
                  </div>
                </div>
                <div className="flex items-center mt-4 text-sm">
                  <span className="text-muted-foreground">Vérifiés et actifs</span>
                </div>
              </CardContent>
            </Card>

            <Card className="glass-card">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">En attente</p>
                    <p className="text-2xl font-bold text-foreground">{stats.pendingApprovals}</p>
                  </div>
                  <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center">
                    <Clock className="h-6 w-6 text-orange-600" />
                  </div>
                </div>
                <div className="flex items-center mt-4 text-sm">
                  <AlertTriangle className="h-4 w-4 text-orange-600 mr-1" />
                  <span className="text-orange-600">Nécessite une action</span>
                </div>
              </CardContent>
            </Card>

            <Card className="glass-card">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Activité</p>
                    <p className="text-2xl font-bold text-foreground">847</p>
                  </div>
                  <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                    <Activity className="h-6 w-6 text-purple-600" />
                  </div>
                </div>
                <div className="flex items-center mt-4 text-sm">
                  <span className="text-muted-foreground">Actions cette semaine</span>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Main Content */}
          <Tabs defaultValue="approvals" className="space-y-6">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="approvals">Approbations</TabsTrigger>
              <TabsTrigger value="analytics">Analytics</TabsTrigger>
              <TabsTrigger value="moderation">Modération</TabsTrigger>
              <TabsTrigger value="settings">Paramètres</TabsTrigger>
            </TabsList>

            {/* Approvals Tab */}
            <TabsContent value="approvals" className="space-y-6">
              <Card className="glass-card">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle>Prestataires en attente d'approbation</CardTitle>
                    <div className="flex gap-2">
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" size={16} />
                        <Input
                          placeholder="Rechercher..."
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          className="pl-10 w-64"
                        />
                      </div>
                      <Button variant="outline" size="icon">
                        <Filter className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {pendingProviders.map((provider) => (
                      <div key={provider.id} className="flex items-center justify-between p-4 bg-muted/20 rounded-lg">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center">
                            <UserCheck className="h-6 w-6 text-primary" />
                          </div>
                          <div>
                            <h3 className="font-semibold text-foreground">{provider.name}</h3>
                            <p className="text-sm text-muted-foreground">{provider.type}</p>
                            {provider.specialty && (
                              <p className="text-sm text-primary">{provider.specialty}</p>
                            )}
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-4">
                          <div className="text-right">
                            <Badge variant="outline" className="mb-1">
                              En attente
                            </Badge>
                            <p className="text-xs text-muted-foreground">
                              Soumis le {new Date(provider.submittedAt).toLocaleDateString('fr-FR')}
                            </p>
                          </div>
                          
                          <div className="flex gap-2">
                            <Button size="sm" variant="outline">
                              <Eye className="h-4 w-4 mr-2" />
                              Détails
                            </Button>
                            <Button 
                              size="sm" 
                              className="bg-green-600 hover:bg-green-700"
                              onClick={() => handleApprove(provider.id)}
                            >
                              <Check className="h-4 w-4 mr-2" />
                              Approuver
                            </Button>
                            <Button 
                              size="sm" 
                              variant="destructive"
                              onClick={() => handleReject(provider.id)}
                            >
                              <X className="h-4 w-4 mr-2" />
                              Rejeter
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Recent Activity */}
              <Card className="glass-card">
                <CardHeader>
                  <CardTitle>Activité récente</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {recentActivity.map((activity, index) => (
                      <div key={index} className="flex items-center gap-4 p-3 rounded-lg hover:bg-muted/20 transition-colors">
                        <div className="w-2 h-2 bg-primary rounded-full"></div>
                        <div className="flex-1">
                          <p className="text-sm text-foreground">{activity.action}</p>
                          <p className="text-sm text-primary font-medium">{activity.provider}</p>
                        </div>
                        <span className="text-xs text-muted-foreground">{activity.time}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Analytics Tab */}
            <TabsContent value="analytics" className="space-y-6">
              <Card className="glass-card">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle>Statistiques détaillées</CardTitle>
                    <Button variant="outline">
                      <Download className="h-4 w-4 mr-2" />
                      Exporter
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="h-64 bg-muted/20 rounded-lg flex items-center justify-center">
                    <div className="text-center">
                      <BarChart3 className="h-16 w-16 text-primary mx-auto mb-4" />
                      <p className="text-muted-foreground">
                        Graphiques d'analytics à implémenter avec une librairie de charts
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Moderation Tab */}
            <TabsContent value="moderation" className="space-y-6">
              <Card className="glass-card">
                <CardHeader>
                  <CardTitle>Signalements et modération</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-12">
                    <AlertTriangle className="h-16 w-16 text-orange-500 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold mb-2">Aucun signalement en cours</h3>
                    <p className="text-muted-foreground">
                      Les signalements d'utilisateurs apparaîtront ici pour modération
                    </p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Settings Tab */}
            <TabsContent value="settings" className="space-y-6">
              <Card className="glass-card">
                <CardHeader>
                  <CardTitle>Paramètres de la plateforme</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    <div>
                      <h3 className="font-semibold mb-2">Critères d'approbation</h3>
                      <p className="text-sm text-muted-foreground mb-4">
                        Configurer les critères automatiques pour l'approbation des prestataires
                      </p>
                      <Button variant="outline">
                        <Settings className="h-4 w-4 mr-2" />
                        Configurer
                      </Button>
                    </div>
                    
                    <div>
                      <h3 className="font-semibold mb-2">Notifications</h3>
                      <p className="text-sm text-muted-foreground mb-4">
                        Gérer les notifications envoyées aux utilisateurs et prestataires
                      </p>
                      <Button variant="outline">
                        <Settings className="h-4 w-4 mr-2" />
                        Paramétrer
                      </Button>
                    </div>

                    <div>
                      <h3 className="font-semibold mb-2">Maintenance</h3>
                      <p className="text-sm text-muted-foreground mb-4">
                        Outils de maintenance et de sauvegarde de la plateforme
                      </p>
                      <Button variant="outline">
                        <Settings className="h-4 w-4 mr-2" />
                        Accéder
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </AnimatedTransition>
      </div>
    </div>
  );
};

export default AdminPage;