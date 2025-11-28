import React, { useState } from 'react';
import { X, Upload, FileText, AlertCircle, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface ProfileClaimFormProps {
  isOpen: boolean;
  onClose: () => void;
  providerId: string;
  providerName: string;
}

interface ClaimFormData {
  reason: string;
  documentation: File[];
}

export const ProfileClaimForm: React.FC<ProfileClaimFormProps> = ({
  isOpen,
  onClose,
  providerId,
  providerName,
}) => {
  const { user } = useAuth();
  const [formData, setFormData] = useState<ClaimFormData>({
    reason: '',
    documentation: [],
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    
    // Validate file types (allow common document formats)
    const allowedTypes = [
      'application/pdf',
      'image/jpeg',
      'image/jpg', 
      'image/png',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ];
    
    const validFiles = files.filter(file => {
      if (!allowedTypes.includes(file.type)) {
        toast.error(`Type de fichier non supporté: ${file.name}`);
        return false;
      }
      if (file.size > 10 * 1024 * 1024) { // 10MB limit
        toast.error(`Fichier trop volumineux: ${file.name} (max 10MB)`);
        return false;
      }
      return true;
    });

    setFormData(prev => ({
      ...prev,
      documentation: [...prev.documentation, ...validFiles].slice(0, 5) // Max 5 files
    }));
  };

  const removeFile = (index: number) => {
    setFormData(prev => ({
      ...prev,
      documentation: prev.documentation.filter((_, i) => i !== index)
    }));
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.reason.trim()) {
      newErrors.reason = 'Veuillez expliquer pourquoi vous revendiquez ce profil';
    } else if (formData.reason.trim().length < 20) {
      newErrors.reason = 'Veuillez fournir une explication plus détaillée (minimum 20 caractères)';
    }

    if (formData.documentation.length === 0) {
      newErrors.documentation = 'Veuillez joindre au moins un document justificatif';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const uploadFiles = async (files: File[]): Promise<string[]> => {
    const uploadedUrls: string[] = [];

    for (const file of files) {
      const fileExt = file.name.split('.').pop();
      const fileName = `${user?.id}/${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;

      const { data, error } = await (supabase as any).storage
        .from('claim-docs')
        .upload(fileName, file);

      if (error) {
        console.error('Error uploading file:', error);
        throw new Error(`Erreur lors du téléchargement de ${file.name}`);
      }

      uploadedUrls.push(fileName);
    }

    return uploadedUrls;
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!validateForm()) {
      return;
    }

    if (!user) {
      toast.error('Vous devez être connecté pour revendiquer un profil');
      return;
    }

    setIsSubmitting(true);

    try {
      // Upload documentation files
      const documentationUrls = await uploadFiles(formData.documentation);

      // Insert claim request into database
      const { error } = await (supabase as any)
        .from('profile_claims')
        .insert({
          provider_id: providerId,
          user_id: user.id,
          status: 'pending',
          documentation: documentationUrls,
          notes: formData.reason.trim(),
        });

      if (error) {
        console.error('Error submitting claim:', error);
        throw new Error('Erreur lors de la soumission de la demande');
      }

      setSubmitSuccess(true);
      toast.success('Demande de revendication soumise avec succès!');
      
      // Reset form
      setFormData({ reason: '', documentation: [] });
      setErrors({});

      // Close modal after a short delay
      setTimeout(() => {
        onClose();
        setSubmitSuccess(false);
      }, 2000);

    } catch (error) {
      console.error('Claim submission error:', error);
      toast.error(error instanceof Error ? error.message : 'Erreur lors de la soumission');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    if (!isSubmitting) {
      setFormData({ reason: '', documentation: [] });
      setErrors({});
      setSubmitSuccess(false);
      onClose();
    }
  };

  if (submitSuccess) {
    return (
      <Dialog open={isOpen} onOpenChange={handleClose}>
        <DialogContent className="sm:max-w-md">
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <CheckCircle className="h-16 w-16 text-green-500 mb-4" />
            <h3 className="text-lg font-semibold mb-2">Demande soumise!</h3>
            <p className="text-muted-foreground mb-4">
              Votre demande de revendication pour <strong>{providerName}</strong> a été soumise avec succès.
            </p>
            <p className="text-sm text-muted-foreground">
              Un administrateur examinera votre demande et vous contactera sous peu.
            </p>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Revendiquer le profil: {providerName}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Information Alert */}
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Pour revendiquer ce profil, vous devez prouver que vous êtes le propriétaire légitime de cet établissement de santé.
              Veuillez fournir une explication détaillée et joindre des documents justificatifs.
            </AlertDescription>
          </Alert>

          {/* Reason Field */}
          <div className="space-y-2">
            <Label htmlFor="reason" className="text-sm font-medium">
              Raison de la revendication *
            </Label>
            <Textarea
              id="reason"
              placeholder="Expliquez pourquoi ce profil vous appartient. Incluez des détails sur votre établissement, votre rôle, et toute information pertinente..."
              value={formData.reason}
              onChange={(e) => setFormData(prev => ({ ...prev, reason: e.target.value }))}
              className={`min-h-[120px] ${errors.reason ? 'border-destructive' : ''}`}
              disabled={isSubmitting}
            />
            {errors.reason && (
              <p className="text-sm text-destructive">{errors.reason}</p>
            )}
            <p className="text-xs text-muted-foreground">
              {formData.reason.length}/500 caractères (minimum 20)
            </p>
          </div>

          {/* Documentation Upload */}
          <div className="space-y-2">
            <Label className="text-sm font-medium">
              Documents justificatifs *
            </Label>
            <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-6">
              <div className="text-center">
                <Upload className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                <p className="text-sm text-muted-foreground mb-2">
                  Glissez-déposez vos fichiers ici ou cliquez pour sélectionner
                </p>
                <input
                  type="file"
                  multiple
                  accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                  onChange={handleFileChange}
                  className="hidden"
                  id="file-upload"
                  disabled={isSubmitting}
                />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => document.getElementById('file-upload')?.click()}
                  disabled={isSubmitting || formData.documentation.length >= 5}
                >
                  Sélectionner des fichiers
                </Button>
              </div>
              <p className="text-xs text-muted-foreground mt-2 text-center">
                Formats acceptés: PDF, DOC, DOCX, JPG, PNG (max 10MB par fichier, 5 fichiers max)
              </p>
            </div>

            {/* File List */}
            {formData.documentation.length > 0 && (
              <div className="space-y-2">
                <p className="text-sm font-medium">Fichiers sélectionnés:</p>
                {formData.documentation.map((file, index) => (
                  <div key={index} className="flex items-center justify-between p-2 bg-muted rounded">
                    <div className="flex items-center gap-2">
                      <FileText className="h-4 w-4" />
                      <span className="text-sm truncate">{file.name}</span>
                      <span className="text-xs text-muted-foreground">
                        ({(file.size / 1024 / 1024).toFixed(1)} MB)
                      </span>
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => removeFile(index)}
                      disabled={isSubmitting}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            )}

            {errors.documentation && (
              <p className="text-sm text-destructive">{errors.documentation}</p>
            )}
          </div>

          {/* Suggested Documents */}
          <div className="bg-muted/50 p-4 rounded-lg">
            <h4 className="text-sm font-medium mb-2">Documents suggérés:</h4>
            <ul className="text-xs text-muted-foreground space-y-1">
              <li>• Licence d'exercice professionnel</li>
              <li>• Registre de commerce ou document d'immatriculation</li>
              <li>• Contrat de bail ou titre de propriété des locaux</li>
              <li>• Carte d'identité professionnelle</li>
              <li>• Autorisation d'ouverture d'établissement de santé</li>
            </ul>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={isSubmitting}
              className="flex-1"
            >
              Annuler
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting || !formData.reason.trim() || formData.documentation.length === 0}
              className="flex-1"
            >
              {isSubmitting ? 'Soumission...' : 'Soumettre la demande'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};