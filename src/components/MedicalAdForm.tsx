import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Upload, Calendar, FileText, Image as ImageIcon, AlertCircle, CheckCircle2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { collection, query, where, getDocs, addDoc, Timestamp } from 'firebase/firestore';
import { db } from '@/integrations/firebase/client';
import { COLLECTIONS } from '@/integrations/firebase/types';
import { fileUploadService } from '@/services/fileUploadService';
import { useAuth } from '@/contexts/AuthContext';

interface MedicalAdFormData {
  title: string;
  content: string;
  image_url: string | null;
  start_date: string;
  end_date: string;
}

interface MedicalAdFormProps {
  onSuccess?: () => void;
  trigger?: React.ReactNode;
}

export default function MedicalAdForm({ onSuccess, trigger }: MedicalAdFormProps) {
  const { toast } = useToast();
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isVerified, setIsVerified] = useState<boolean | null>(null);
  const [providerId, setProviderId] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  
  const [formData, setFormData] = useState<MedicalAdFormData>({
    title: '',
    content: '',
    image_url: null,
    start_date: new Date().toISOString().split('T')[0], // Today's date
    end_date: '',
  });

  // Check provider verification status when dialog opens
  const checkProviderVerification = async () => {
    if (!user) return;

    try {
      setIsLoading(true);
      
      // Get provider information for current user from Firebase
      const providersRef = collection(db, COLLECTIONS.providers);
      const q = query(providersRef, where('userId', '==', user.id));
      const snapshot = await getDocs(q);

      if (snapshot.empty) {
        setIsVerified(false);
        return;
      }

      const providerDoc = snapshot.docs[0];
      const providerData = providerDoc.data();
      
      setProviderId(providerDoc.id);
      setIsVerified(providerData.verificationStatus === 'verified');
    } catch (error) {
      console.error('Error checking verification:', error);
      setIsVerified(false);
    } finally {
      setIsLoading(false);
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file
    const validation = fileUploadService.validateFile(file, 5);
    if (!validation.valid) {
      toast({
        title: "Erreur de fichier",
        description: validation.error,
        variant: "destructive",
      });
      return;
    }

    setImageFile(file);
    
    // Create preview
    const reader = new FileReader();
    reader.onload = (e) => {
      setImagePreview(e.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user || !providerId || !isVerified) {
      toast({
        title: "Accès refusé",
        description: "Seuls les prestataires vérifiés peuvent créer des annonces.",
        variant: "destructive",
      });
      return;
    }

    if (!formData.title.trim() || !formData.content.trim()) {
      toast({
        title: "Champs requis",
        description: "Veuillez remplir le titre et le contenu de l'annonce.",
        variant: "destructive",
      });
      return;
    }

    if (!formData.end_date || new Date(formData.end_date) <= new Date(formData.start_date)) {
      toast({
        title: "Dates invalides",
        description: "La date de fin doit être postérieure à la date de début.",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsLoading(true);
      
      let imageUrl = null;
      
      // Upload image if provided
      if (imageFile) {
        const uploadResult = await fileUploadService.uploadProviderDocument(
          imageFile,
          providerId,
          'photo'
        );
        imageUrl = uploadResult.url;
      }

      // Insert medical ad into Firebase
      try {
        const medicalAdsRef = collection(db, COLLECTIONS.medicalAds);
        await addDoc(medicalAdsRef, {
          providerId: providerId,
          title: formData.title.trim(),
          content: formData.content.trim(),
          imageUrl: imageUrl,
          startDate: Timestamp.fromDate(new Date(formData.start_date)),
          endDate: Timestamp.fromDate(new Date(formData.end_date)),
          status: 'pending',
          displayPriority: 0, // Default priority
          createdAt: Timestamp.now()
        });
      } catch (error) {
        console.error('Error creating medical ad:', error);
        toast({
          title: "Erreur",
          description: "Impossible de créer l'annonce. Veuillez réessayer.",
          variant: "destructive",
        });
        return;
      }

      // Success
      toast({
        title: "Annonce créée",
        description: "Votre annonce a été soumise pour approbation. Elle sera visible après validation par notre équipe.",
      });

      // Reset form
      setFormData({
        title: '',
        content: '',
        image_url: null,
        start_date: new Date().toISOString().split('T')[0],
        end_date: '',
      });
      setImageFile(null);
      setImagePreview(null);
      
      setIsOpen(false);
      onSuccess?.();
      
    } catch (error) {
      console.error('Error submitting medical ad:', error);
      toast({
        title: "Erreur",
        description: "Une erreur inattendue s'est produite. Veuillez réessayer.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenChange = (open: boolean) => {
    setIsOpen(open);
    if (open) {
      checkProviderVerification();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        {trigger || (
          <Button>
            <FileText className="mr-2 h-4 w-4" />
            Créer une annonce
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Créer une annonce médicale</DialogTitle>
          <DialogDescription>
            Créez une annonce pour promouvoir vos services auprès des patients.
          </DialogDescription>
        </DialogHeader>

        {isLoading && isVerified === null ? (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : !isVerified ? (
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Seuls les prestataires vérifiés peuvent créer des annonces médicales. 
              Veuillez d'abord faire vérifier votre profil par notre équipe.
            </AlertDescription>
          </Alert>
        ) : (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5 text-green-600" />
                Profil vérifié
              </CardTitle>
              <CardDescription>
                Vous pouvez créer des annonces médicales
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <Label htmlFor="title">Titre de l'annonce *</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="Ex: Consultation cardiologique avec ECG"
                    maxLength={100}
                    required
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    {formData.title.length}/100 caractères
                  </p>
                </div>

                <div>
                  <Label htmlFor="content">Contenu de l'annonce *</Label>
                  <Textarea
                    id="content"
                    value={formData.content}
                    onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                    placeholder="Décrivez votre service, les avantages, les conditions..."
                    rows={4}
                    maxLength={500}
                    required
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    {formData.content.length}/500 caractères
                  </p>
                </div>

                <div>
                  <Label htmlFor="image">Image (optionnelle)</Label>
                  <div className="mt-2">
                    {imagePreview ? (
                      <div className="relative">
                        <img
                          src={imagePreview}
                          alt="Aperçu"
                          className="w-full h-48 object-cover rounded-lg border"
                        />
                        <Button
                          type="button"
                          variant="destructive"
                          size="sm"
                          className="absolute top-2 right-2"
                          onClick={() => {
                            setImageFile(null);
                            setImagePreview(null);
                          }}
                        >
                          Supprimer
                        </Button>
                      </div>
                    ) : (
                      <div className="border-2 border-dashed rounded-lg p-6 text-center hover:border-primary transition-colors cursor-pointer">
                        <Upload className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                        <Input
                          type="file"
                          accept="image/*"
                          onChange={handleImageChange}
                          className="hidden"
                          id="image"
                        />
                        <Label htmlFor="image" className="cursor-pointer">
                          <div className="flex items-center justify-center gap-2">
                            <ImageIcon className="h-4 w-4" />
                            Cliquez pour ajouter une image
                          </div>
                          <p className="text-xs text-muted-foreground mt-1">
                            JPG, PNG - Max 5MB
                          </p>
                        </Label>
                      </div>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="start_date">Date de début *</Label>
                    <Input
                      id="start_date"
                      type="date"
                      value={formData.start_date}
                      onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                      min={new Date().toISOString().split('T')[0]}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="end_date">Date de fin *</Label>
                    <Input
                      id="end_date"
                      type="date"
                      value={formData.end_date}
                      onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                      min={formData.start_date}
                      required
                    />
                  </div>
                </div>

                <Alert>
                  <Calendar className="h-4 w-4" />
                  <AlertDescription>
                    Votre annonce sera soumise pour approbation et sera visible après validation par notre équipe.
                  </AlertDescription>
                </Alert>

                <div className="flex gap-3">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsOpen(false)}
                    disabled={isLoading}
                  >
                    Annuler
                  </Button>
                  <Button type="submit" disabled={isLoading} className="flex-1">
                    {isLoading ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Création...
                      </>
                    ) : (
                      <>
                        <FileText className="mr-2 h-4 w-4" />
                        Créer l'annonce
                      </>
                    )}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}
      </DialogContent>
    </Dialog>
  );
}