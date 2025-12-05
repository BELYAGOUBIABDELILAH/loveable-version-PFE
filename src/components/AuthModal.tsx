import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { useAuth } from '@/contexts/AuthContext';
import { Loader2, Mail, Lock, User, Chrome } from 'lucide-react';
import { PasswordResetForm } from '@/components/auth/PasswordResetForm';

interface AuthModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  defaultTab?: 'login' | 'signup';
}

type AuthView = 'login' | 'signup' | 'reset';

export const AuthModal = ({ open, onOpenChange, defaultTab = 'login' }: AuthModalProps) => {
  const { login, signup, loginWithGoogle, isLoading } = useAuth();
  const [activeTab, setActiveTab] = useState<'login' | 'signup'>(defaultTab);
  const [view, setView] = useState<AuthView>(defaultTab);
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [signupEmail, setSignupEmail] = useState('');
  const [signupPassword, setSignupPassword] = useState('');
  const [signupName, setSignupName] = useState('');
  const [signupRole, setSignupRole] = useState<'citizen' | 'provider'>('citizen');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await login(loginEmail, loginPassword);
      onOpenChange(false);
      resetForms();
    } catch (error) {
      // Error handled in context
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await signup(signupEmail, signupPassword, signupName, signupRole);
      onOpenChange(false);
      resetForms();
    } catch (error) {
      // Error handled in context
    }
  };

  const handleGoogleLogin = async () => {
    try {
      await loginWithGoogle();
      onOpenChange(false);
      resetForms();
    } catch (error) {
      // Error handled in context
    }
  };

  const resetForms = () => {
    setLoginEmail('');
    setLoginPassword('');
    setSignupEmail('');
    setSignupPassword('');
    setSignupName('');
    setSignupRole('citizen');
  };

  const handleBackToLogin = () => {
    setView('login');
    setActiveTab('login');
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        {view === 'reset' ? (
          <>
            <DialogHeader>
              <DialogTitle>Réinitialiser le mot de passe</DialogTitle>
              <DialogDescription>
                Nous vous enverrons un lien pour réinitialiser votre mot de passe
              </DialogDescription>
            </DialogHeader>
            <PasswordResetForm onBack={handleBackToLogin} />
          </>
        ) : (
          <>
            <DialogHeader>
              <DialogTitle>Bienvenue sur CityHealth</DialogTitle>
              <DialogDescription>
                Connectez-vous ou créez un compte pour accéder à toutes les fonctionnalités
              </DialogDescription>
            </DialogHeader>

            <Tabs value={activeTab} onValueChange={(v) => { setActiveTab(v as 'login' | 'signup'); setView(v as AuthView); }}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="login">Connexion</TabsTrigger>
            <TabsTrigger value="signup">Inscription</TabsTrigger>
          </TabsList>

          <TabsContent value="login" className="space-y-4">
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="login-email">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="login-email"
                    type="email"
                    placeholder="votre@email.com"
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                    className="pl-10"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="login-password">Mot de passe</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="login-password"
                    type="password"
                    placeholder="••••••••"
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    className="pl-10"
                    required
                  />
                </div>
              </div>

              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Connexion...
                  </>
                ) : (
                  'Se connecter'
                )}
              </Button>

              <div className="text-center">
                <button
                  type="button"
                  className="text-sm text-primary hover:underline"
                  onClick={() => setView('reset')}
                >
                  Mot de passe oublié ?
                </button>
              </div>
            </form>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-background px-2 text-muted-foreground">Ou</span>
              </div>
            </div>

            <Button
              type="button"
              variant="outline"
              className="w-full"
              onClick={handleGoogleLogin}
              disabled={isLoading}
            >
              <Chrome className="mr-2 h-4 w-4" />
              Google
            </Button>
          </TabsContent>

          <TabsContent value="signup" className="space-y-4">
            <form onSubmit={handleSignup} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="signup-name">Nom complet</Label>
                <div className="relative">
                  <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="signup-name"
                    type="text"
                    placeholder="Nom et prénom"
                    value={signupName}
                    onChange={(e) => setSignupName(e.target.value)}
                    className="pl-10"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="signup-email">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="signup-email"
                    type="email"
                    placeholder="votre@email.com"
                    value={signupEmail}
                    onChange={(e) => setSignupEmail(e.target.value)}
                    className="pl-10"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="signup-password">Mot de passe</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="signup-password"
                    type="password"
                    placeholder="••••••••"
                    value={signupPassword}
                    onChange={(e) => setSignupPassword(e.target.value)}
                    className="pl-10"
                    required
                    minLength={6}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Type de compte</Label>
                <RadioGroup value={signupRole} onValueChange={(v) => setSignupRole(v as 'citizen' | 'provider')}>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="citizen" id="citizen" />
                    <Label htmlFor="citizen" className="font-normal cursor-pointer">
                      Citoyen
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="provider" id="provider" />
                    <Label htmlFor="provider" className="font-normal cursor-pointer">
                      Professionnel
                    </Label>
                  </div>
                </RadioGroup>
              </div>

              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Création...
                  </>
                ) : (
                  'Créer un compte'
                )}
              </Button>
            </form>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-background px-2 text-muted-foreground">Ou</span>
              </div>
            </div>

            <Button
              type="button"
              variant="outline"
              className="w-full"
              onClick={handleGoogleLogin}
              disabled={isLoading}
            >
              <Chrome className="mr-2 h-4 w-4" />
              Google
            </Button>
          </TabsContent>
        </Tabs>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
};
