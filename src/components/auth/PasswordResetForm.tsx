import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, Mail, ArrowLeft, CheckCircle } from 'lucide-react';
import { resetPassword } from '@/integrations/firebase/services/authService';

interface PasswordResetFormProps {
  onBack: () => void;
  onSuccess?: () => void;
}

export const PasswordResetForm = ({ onBack, onSuccess }: PasswordResetFormProps) => {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Validate email format
    if (!validateEmail(email)) {
      setError('Veuillez entrer une adresse email valide');
      return;
    }

    setIsLoading(true);

    try {
      await resetPassword(email);
      setSuccess(true);
      onSuccess?.();
    } catch (err: any) {
      setError(err.message || 'Une erreur est survenue. Veuillez réessayer.');
    } finally {
      setIsLoading(false);
    }
  };

  if (success) {
    return (
      <div className="space-y-4">
        <div className="flex flex-col items-center justify-center py-6 text-center">
          <CheckCircle className="h-12 w-12 text-green-500 mb-4" />
          <h3 className="text-lg font-semibold">Email envoyé !</h3>
          <p className="text-sm text-muted-foreground mt-2">
            Si un compte existe avec l'adresse {email}, vous recevrez un email avec les instructions pour réinitialiser votre mot de passe.
          </p>
        </div>
        <Button
          type="button"
          variant="outline"
          className="w-full"
          onClick={onBack}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Retour à la connexion
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="text-center mb-4">
        <h3 className="text-lg font-semibold">Mot de passe oublié ?</h3>
        <p className="text-sm text-muted-foreground mt-1">
          Entrez votre adresse email et nous vous enverrons un lien pour réinitialiser votre mot de passe.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="reset-email">Email</Label>
          <div className="relative">
            <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              id="reset-email"
              type="email"
              placeholder="votre@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="pl-10"
              required
              disabled={isLoading}
            />
          </div>
        </div>

        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <Button type="submit" className="w-full" disabled={isLoading}>
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Envoi en cours...
            </>
          ) : (
            'Envoyer le lien de réinitialisation'
          )}
        </Button>
      </form>

      <Button
        type="button"
        variant="ghost"
        className="w-full"
        onClick={onBack}
        disabled={isLoading}
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        Retour à la connexion
      </Button>
    </div>
  );
};
