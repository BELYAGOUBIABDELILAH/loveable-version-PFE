import React, { useState } from 'react';
import { Upload, User, Settings, BarChart3, MessageSquare, Star, Calendar, Camera } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useLanguage } from '@/contexts/LanguageContext';
import AnimatedTransition from '@/components/AnimatedTransition';

const ProvidersPage = () => {
  const { t } = useLanguage();
  const [activeTab, setActiveTab] = useState<'register' | 'dashboard'>('register');

  const RegistrationForm = () => (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold mb-2">Rejoindre CityHealth</h2>
        <p className="text-muted-foreground">Inscrivez-vous en tant que prestataire de santé</p>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <Card className="glass-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Informations personnelles
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <Input placeholder="Nom" />
              <Input placeholder="Prénom" />
            </div>
            <Input placeholder="Email professionnel" type="email" />
            <Input placeholder="Téléphone" type="tel" />
            <Select>
              <SelectTrigger>
                <SelectValue placeholder="Type de prestataire" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="doctor">Médecin</SelectItem>
                <SelectItem value="clinic">Clinique</SelectItem>
                <SelectItem value="pharmacy">Pharmacie</SelectItem>
                <SelectItem value="lab">Laboratoire</SelectItem>
              </SelectContent>
            </Select>
          </CardContent>
        </Card>

        <Card className="glass-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              Informations professionnelles
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Input placeholder="Spécialité" />
            <Input placeholder="Numéro d'ordre / Licence" />
            <Textarea placeholder="Adresse du cabinet" />
            <div className="grid grid-cols-2 gap-4">
              <Input placeholder="Ville" />
              <Input placeholder="Code postal" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="glass-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Upload className="h-5 w-5" />
            Documents et certification
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="border-2 border-dashed border-muted rounded-lg p-6 text-center">
              <Camera className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
              <p className="text-sm text-muted-foreground">Photo de profil</p>
              <Button variant="outline" size="sm" className="mt-2">
                Télécharger
              </Button>
            </div>
            <div className="border-2 border-dashed border-muted rounded-lg p-6 text-center">
              <Upload className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
              <p className="text-sm text-muted-foreground">Diplôme / Certificat</p>
              <Button variant="outline" size="sm" className="mt-2">
                Télécharger
              </Button>
            </div>
          </div>
          <Textarea placeholder="Présentation professionnelle (optionnel)" />
        </CardContent>
      </Card>

      <div className="text-center">
        <Button size="lg" className="w-full md:w-auto px-8">
          Soumettre ma candidature
        </Button>
        <p className="text-sm text-muted-foreground mt-2">
          Votre profil sera vérifié par notre équipe sous 48h
        </p>
      </div>
    </div>
  );

  const Dashboard = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-2xl font-bold">Tableau de bord</h2>
          <p className="text-muted-foreground">Dr. Ahmed Benali - Cardiologue</p>
        </div>
        <Badge variant="secondary" className="gap-2">
          <Star className="h-4 w-4" />
          Vérifié
        </Badge>
      </div>

      <div className="grid md:grid-cols-3 gap-6 mb-8">
        <Card className="glass-card">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                <BarChart3 className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">127</p>
                <p className="text-sm text-muted-foreground">Consultations</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="glass-card">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-secondary/10 rounded-lg flex items-center justify-center">
                <Star className="h-6 w-6 text-secondary" />
              </div>
              <div>
                <p className="text-2xl font-bold">4.9</p>
                <p className="text-sm text-muted-foreground">Note moyenne</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="glass-card">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-accent/10 rounded-lg flex items-center justify-center">
                <MessageSquare className="h-6 w-6 text-accent" />
              </div>
              <div>
                <p className="text-2xl font-bold">23</p>
                <p className="text-sm text-muted-foreground">Messages</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <Card className="glass-card">
          <CardHeader>
            <CardTitle>Profil public</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Input placeholder="Nom complet" defaultValue="Dr. Ahmed Benali" />
            <Input placeholder="Spécialité" defaultValue="Cardiologue" />
            <Textarea placeholder="Présentation" defaultValue="Spécialiste en cardiologie avec 15 ans d'expérience..." />
            <Button variant="outline" className="w-full">
              Mettre à jour le profil
            </Button>
          </CardContent>
        </Card>

        <Card className="glass-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Disponibilités
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between p-2 rounded-lg bg-muted/50">
                <span className="text-sm">Lundi - Vendredi</span>
                <span className="text-sm text-muted-foreground">8h - 17h</span>
              </div>
              <div className="flex items-center justify-between p-2 rounded-lg bg-muted/50">
                <span className="text-sm">Samedi</span>
                <span className="text-sm text-muted-foreground">8h - 12h</span>
              </div>
              <div className="flex items-center justify-between p-2 rounded-lg bg-muted/50">
                <span className="text-sm">Dimanche</span>
                <span className="text-sm text-red-600">Fermé</span>
              </div>
            </div>
            <Button variant="outline" className="w-full">
              Modifier les horaires
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/20 to-secondary/10 pt-20">
      <div className="container mx-auto px-4 py-8">
        <AnimatedTransition show={true} animation="fade">
          {/* Tab Navigation */}
          <div className="flex justify-center mb-8">
            <div className="glass-panel rounded-lg p-1 flex">
              <Button
                variant={activeTab === 'register' ? 'default' : 'ghost'}
                onClick={() => setActiveTab('register')}
                className="px-6"
              >
                S'inscrire
              </Button>
              <Button
                variant={activeTab === 'dashboard' ? 'default' : 'ghost'}
                onClick={() => setActiveTab('dashboard')}
                className="px-6"
              >
                Tableau de bord
              </Button>
            </div>
          </div>

          {/* Content */}
          {activeTab === 'register' ? <RegistrationForm /> : <Dashboard />}
        </AnimatedTransition>
      </div>
    </div>
  );
};

export default ProvidersPage;