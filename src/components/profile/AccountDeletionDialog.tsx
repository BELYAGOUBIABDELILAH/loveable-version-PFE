/**
 * Account Deletion Dialog Component
 * 
 * Provides a confirmation dialog for account deletion with:
 * - Email confirmation input
 * - Warning message about data loss
 * - Cancel and confirm buttons
 * - Redirect to homepage after success
 * 
 * Requirements: 4.1, 4.2, 4.5
 */

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, AlertTriangle } from 'lucide-react';
import { deleteAccount } from '@/integrations/firebase/services/accountService';
import { useToast } from '@/hooks/use-toast';

interface AccountDeletionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  userEmail: string;
}

export function AccountDeletionDialog({
  open,
  onOpenChange,
  userEmail,
}: AccountDeletionDialogProps) {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [confirmEmail, setConfirmEmail] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isConfirmationValid = confirmEmail.toLowerCase() === userEmail.toLowerCase();

  const handleDelete = async () => {
    if (!isConfirmationValid) {
      setError('L\'email de confirmation ne correspond pas');
      return;
    }

    setIsDeleting(true);
    setError(null);

    try {
      // Get current user ID from Firebase auth
      const { auth } = await import('@/integrations/firebase/client');
      const userId = auth.currentUser?.uid;
      
      if (!userId) {
        throw new Error('Utilisateur non connecté');
      }

      await deleteAccount(userId);

      // Sign out the user before showing success
      await auth.signOut();

      toast({
        title: 'Compte supprimé',
        description: 'Votre compte a été supprimé avec succès.',
      });

      // Close dialog and redirect to homepage
      onOpenChange(false);
      navigate('/');    } catch (err: any) {
      console.error('Account deletion error:', err);
      setError(err.message || 'Une erreur est survenue lors de la suppression');
      
      toast({
        title: 'Erreur',
        description: err.message || 'Impossible de supprimer le compte',
        variant: 'destructive',
      });
    } finally {
      setIsDeleting(false);
    }
  };

  const handleCancel = () => {
    setConfirmEmail('');
    setError(null);
    onOpenChange(false);
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="max-w-md">
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2 text-destructive">
            <AlertTriangle className="h-5 w-5" />
            Supprimer le compte
          </AlertDialogTitle>
          <AlertDialogDescription asChild>
            <div className="space-y-4">
              <Alert variant="destructive">
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  Cette action est irréversible. Toutes vos données seront définitivement supprimées :
                  <ul className="list-disc list-inside mt-2 space-y-1">
                    <li>Votre profil et informations personnelles</li>
                    <li>Vos favoris</li>
                    <li>Vos sessions de chat</li>
                    <li>Vos notifications</li>
                  </ul>
                  <p className="mt-2">
                    Vos rendez-vous seront anonymisés pour préserver l'historique des prestataires.
                  </p>
                </AlertDescription>
              </Alert>

              <div className="space-y-2">
                <Label htmlFor="confirm-email">
                  Pour confirmer, tapez votre email : <strong>{userEmail}</strong>
                </Label>
                <Input
                  id="confirm-email"
                  type="email"
                  placeholder="Entrez votre email"
                  value={confirmEmail}
                  onChange={(e) => {
                    setConfirmEmail(e.target.value);
                    setError(null);
                  }}
                  disabled={isDeleting}
                  className={error ? 'border-destructive' : ''}
                />
                {error && (
                  <p className="text-sm text-destructive">{error}</p>
                )}
              </div>
            </div>
          </AlertDialogDescription>
        </AlertDialogHeader>

        <AlertDialogFooter>
          <Button
            variant="outline"
            onClick={handleCancel}
            disabled={isDeleting}
          >
            Annuler
          </Button>
          <Button
            variant="destructive"
            onClick={handleDelete}
            disabled={!isConfirmationValid || isDeleting}
          >
            {isDeleting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Suppression...
              </>
            ) : (
              'Supprimer définitivement'
            )}
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
