/**
 * VerificationRequestCard Component
 *
 * Displays verification status and allows providers to request verification.
 *
 * Requirements: 6.1, 6.2, 6.4, 6.5
 */

import { useState, useEffect, useRef, RefObject } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import {
  ShieldCheck,
  ShieldAlert,
  Clock,
  Upload,
  Loader2,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  FileText,
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Provider, VerificationStatus } from '@/integrations/firebase/types';
import {
  createVerificationRequest,
  getVerificationByProvider,
  VerificationRequest,
} from '@/integrations/firebase/services/verificationService';
import {
  uploadProviderDocument,
  validateFile,
} from '@/integrations/firebase/services/storageService';
import { auth } from '@/integrations/firebase/client';
import { OFFLINE_MODE } from '@/config/app';

interface VerificationRequestCardProps {
  provider: Provider;
  onRequestSubmitted?: () => void;
}

/**
 * Props for the reusable VerificationUploadForm component
 */
interface VerificationUploadFormProps {
  uploadedDocuments: string[];
  onRemoveDocument: (url: string) => void;
  onUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onSubmit: () => void;
  isUploading: boolean;
  isSubmitting: boolean;
  fileInputRef: RefObject<HTMLInputElement>;
  inputId: string;
  labelText: string;
  descriptionText: string;
  submitLabel: string;
}

/**
 * Reusable component for verification document upload form
 * Extracted to avoid duplication between canRequestVerification and isRejected states
 */
function VerificationUploadForm({
  uploadedDocuments,
  onRemoveDocument,
  onUpload,
  onSubmit,
  isUploading,
  isSubmitting,
  fileInputRef,
  inputId,
  labelText,
  descriptionText,
  submitLabel,
}: VerificationUploadFormProps) {
  return (
    <div className="space-y-4 pt-4 border-t">
      <div>
        <Label htmlFor={inputId} className="text-sm font-medium">
          {labelText}
        </Label>
        <p className="text-xs text-muted-foreground mb-2">{descriptionText}</p>

        {/* Uploaded documents list */}
        {uploadedDocuments.length > 0 && (
          <div className="space-y-2 mb-3">
            {uploadedDocuments.map((url) => (
              <div
                key={url || `doc-${Math.random()}`}
                className="flex items-center justify-between p-2 bg-muted rounded-md"
              >
                <div className="flex items-center gap-2">
                  <FileText className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm truncate max-w-[200px]">
                    {url ? url.split('/').pop()?.substring(0, 30) || 'Document' : 'Document'}
                  </span>
                </div>
                <Button variant="ghost" size="sm" onClick={() => onRemoveDocument(url)}>
                  <XCircle className="h-4 w-4 text-destructive" />
                </Button>
              </div>
            ))}
          </div>
        )}

        {/* Upload area */}
        <div
          className="border-2 border-dashed rounded-lg p-4 text-center hover:border-primary transition-colors cursor-pointer"
          onClick={() => fileInputRef.current?.click()}
        >
          {isUploading ? (
            <>
              <Loader2 className="h-6 w-6 mx-auto mb-2 text-muted-foreground animate-spin" />
              <p className="text-sm text-muted-foreground">Téléchargement...</p>
            </>
          ) : (
            <>
              <Upload className="h-6 w-6 mx-auto mb-2 text-muted-foreground" />
              <p className="text-sm text-muted-foreground">
                Cliquez pour ajouter un document
              </p>
            </>
          )}
          <Input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,application/pdf"
            className="hidden"
            id={inputId}
            onChange={onUpload}
            disabled={isUploading}
          />
        </div>
      </div>

      <Button
        onClick={onSubmit}
        disabled={isSubmitting || uploadedDocuments.length === 0}
        className="w-full"
        data-testid="request-verification-button"
      >
        {isSubmitting ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Envoi en cours...
          </>
        ) : (
          <>
            <ShieldCheck className="mr-2 h-4 w-4" />
            {submitLabel}
          </>
        )}
      </Button>
    </div>
  );
}

/**
 * Check if provider profile has required fields for verification
 */
function isProfileComplete(provider: Provider): boolean {
  return !!(
    provider.businessName &&
    provider.phone &&
    provider.address &&
    provider.providerType
  );
}

/**
 * Get status badge variant based on verification status
 */
function getStatusBadgeVariant(
  status: VerificationStatus
): 'default' | 'secondary' | 'destructive' | 'outline' {
  switch (status) {
    case 'verified':
      return 'default';
    case 'pending':
      return 'secondary';
    case 'rejected':
      return 'destructive';
    default:
      return 'outline';
  }
}

/**
 * Get status label in French
 */
function getStatusLabel(status: VerificationStatus): string {
  switch (status) {
    case 'verified':
      return 'Vérifié';
    case 'pending':
      return 'En attente';
    case 'rejected':
      return 'Rejeté';
    default:
      return status;
  }
}

/**
 * Get status icon component
 */
function getStatusIcon(status: VerificationStatus) {
  switch (status) {
    case 'verified':
      return <CheckCircle2 className="h-5 w-5 text-green-500" />;
    case 'pending':
      return <Clock className="h-5 w-5 text-yellow-500" />;
    case 'rejected':
      return <XCircle className="h-5 w-5 text-red-500" />;
    default:
      return <ShieldAlert className="h-5 w-5 text-muted-foreground" />;
  }
}

export default function VerificationRequestCard({
  provider,
  onRequestSubmitted,
}: VerificationRequestCardProps) {
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [verificationRequest, setVerificationRequest] =
    useState<VerificationRequest | null>(null);
  const [uploadedDocuments, setUploadedDocuments] = useState<string[]>([]);

  const profileComplete = isProfileComplete(provider);
  const currentStatus = verificationRequest?.status || provider.verificationStatus;
  const isVerified = currentStatus === 'verified';
  const isPending = currentStatus === 'pending';
  const isRejected = currentStatus === 'rejected';
  const canRequestVerification = !isVerified && !isPending && profileComplete;

  // Fetch existing verification request on mount
  useEffect(() => {
    const fetchVerification = async () => {
      if (OFFLINE_MODE) {
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        const verification = await getVerificationByProvider(provider.id);
        setVerificationRequest(verification);
      } catch (error) {
        console.error('Error fetching verification:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchVerification();
  }, [provider.id]);

  // Handle document upload
  const handleDocumentUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    if (OFFLINE_MODE) {
      toast({
        title: 'Mode hors ligne',
        description: "L'upload de documents n'est pas disponible en mode hors ligne.",
        variant: 'destructive',
      });
      return;
    }

    const file = files[0];
    const validation = validateFile(file, {
      maxSizeMB: 10,
      allowedTypes: ['image/jpeg', 'image/png', 'application/pdf'],
    });

    if (!validation.valid) {
      toast({
        title: 'Fichier invalide',
        description: validation.error,
        variant: 'destructive',
      });
      return;
    }

    try {
      setIsUploading(true);
      const result = await uploadProviderDocument(file, provider.id, 'license');
      setUploadedDocuments((prev) => [...prev, result.url]);

      toast({
        title: 'Document ajouté',
        description: 'Le document a été téléchargé avec succès.',
      });
    } catch (error) {
      console.error('Error uploading document:', error);
      toast({
        title: 'Erreur',
        description: 'Impossible de télécharger le document.',
        variant: 'destructive',
      });
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  // Handle verification request submission
  // Separated error handling: createVerificationRequest success is not masked by refresh errors
  const handleSubmitRequest = async () => {
    if (OFFLINE_MODE) {
      toast({
        title: 'Mode hors ligne',
        description:
          'Les demandes de vérification ne sont pas disponibles en mode hors ligne.',
        variant: 'destructive',
      });
      return;
    }

    const currentUser = auth.currentUser;
    if (!currentUser) {
      toast({
        title: 'Erreur',
        description: 'Vous devez être connecté pour demander une vérification.',
        variant: 'destructive',
      });
      return;
    }

    if (uploadedDocuments.length === 0) {
      toast({
        title: 'Documents requis',
        description: 'Veuillez télécharger au moins un document justificatif.',
        variant: 'destructive',
      });
      return;
    }

    setIsSubmitting(true);

    // Step 1: Create verification request
    try {
      await createVerificationRequest({
        providerId: provider.id,
        userId: currentUser.uid,
        documentType: 'license',
        documentUrls: uploadedDocuments,
      });

      // Success! Show toast and notify parent immediately
      toast({
        title: 'Demande envoyée',
        description: 'Votre demande de vérification a été soumise avec succès.',
      });

      setUploadedDocuments([]);
      onRequestSubmitted?.();

      // Step 2: Try to refresh verification status (non-blocking)
      try {
        const verification = await getVerificationByProvider(provider.id);
        setVerificationRequest(verification);
      } catch (refreshError) {
        // Log but don't show error - the submission was successful
        console.warn(
          'Failed to refresh verification status after submission:',
          refreshError
        );
      }
    } catch (error) {
      // Only show error if the actual submission failed
      console.error('Error submitting verification request:', error);
      toast({
        title: 'Erreur',
        description: 'Impossible de soumettre la demande de vérification.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Remove uploaded document
  const handleRemoveDocument = (url: string) => {
    setUploadedDocuments((prev) => prev.filter((d) => d !== url));
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card data-testid="verification-request-card">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShieldCheck className="h-5 w-5 text-primary" />
            <CardTitle>Vérification du profil</CardTitle>
          </div>
          <Badge
            variant={getStatusBadgeVariant(currentStatus)}
            data-testid="verification-status-badge"
          >
            {getStatusIcon(currentStatus)}
            <span className="ml-1">{getStatusLabel(currentStatus)}</span>
          </Badge>
        </div>
        <CardDescription>Un profil vérifié inspire confiance aux patients</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Verified Status */}
        {isVerified && (
          <Alert className="border-green-200 bg-green-50">
            <CheckCircle2 className="h-4 w-4 text-green-600" />
            <AlertTitle className="text-green-800">Profil vérifié</AlertTitle>
            <AlertDescription className="text-green-700">
              Votre profil a été vérifié par notre équipe. Les patients peuvent voir le
              badge de vérification sur votre profil.
            </AlertDescription>
          </Alert>
        )}

        {/* Pending Status */}
        {isPending && (
          <Alert className="border-yellow-200 bg-yellow-50">
            <Clock className="h-4 w-4 text-yellow-600" />
            <AlertTitle className="text-yellow-800">Vérification en cours</AlertTitle>
            <AlertDescription className="text-yellow-700">
              Votre demande de vérification est en cours d&apos;examen. Nous vous
              notifierons dès qu&apos;elle sera traitée.
            </AlertDescription>
          </Alert>
        )}

        {/* Rejected Status with Reason */}
        {isRejected && (
          <Alert variant="destructive">
            <XCircle className="h-4 w-4" />
            <AlertTitle>Demande rejetée</AlertTitle>
            <AlertDescription>
              {verificationRequest?.rejectionReason ||
                'Votre demande de vérification a été rejetée. Veuillez soumettre une nouvelle demande avec des documents valides.'}
            </AlertDescription>
          </Alert>
        )}

        {/* Profile Incomplete Warning */}
        {!profileComplete && !isVerified && (
          <Alert className="border-orange-200 bg-orange-50">
            <AlertTriangle className="h-4 w-4 text-orange-600" />
            <AlertTitle className="text-orange-800">Profil incomplet</AlertTitle>
            <AlertDescription className="text-orange-700">
              Veuillez compléter votre profil (nom, téléphone, adresse, type) avant de
              demander une vérification.
            </AlertDescription>
          </Alert>
        )}

        {/* Request Verification Form - for new requests */}
        {canRequestVerification && (
          <VerificationUploadForm
            uploadedDocuments={uploadedDocuments}
            onRemoveDocument={handleRemoveDocument}
            onUpload={handleDocumentUpload}
            onSubmit={handleSubmitRequest}
            isUploading={isUploading}
            isSubmitting={isSubmitting}
            fileInputRef={fileInputRef}
            inputId="verification-docs"
            labelText="Documents justificatifs"
            descriptionText="Téléchargez votre licence professionnelle, diplôme ou autre document officiel (PDF, JPG, PNG - max 10MB)"
            submitLabel="Demander la vérification"
          />
        )}

        {/* Request Verification Form - for resubmission after rejection */}
        {isRejected && profileComplete && (
          <VerificationUploadForm
            uploadedDocuments={uploadedDocuments}
            onRemoveDocument={handleRemoveDocument}
            onUpload={handleDocumentUpload}
            onSubmit={handleSubmitRequest}
            isUploading={isUploading}
            isSubmitting={isSubmitting}
            fileInputRef={fileInputRef}
            inputId="verification-docs-retry"
            labelText="Soumettre de nouveaux documents"
            descriptionText="Téléchargez de nouveaux documents pour une nouvelle demande de vérification"
            submitLabel="Soumettre une nouvelle demande"
          />
        )}
      </CardContent>
    </Card>
  );
}
