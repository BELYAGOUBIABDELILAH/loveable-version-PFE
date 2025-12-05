import { useState, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { 
  Upload, FileText, CheckCircle, XCircle, AlertTriangle, 
  Download, Trash2, Eye, EyeOff 
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import Papa from 'papaparse';
import { createProvider } from '@/integrations/firebase/services/providerService';

interface ImportRow {
  business_name: string;
  provider_type: 'doctor' | 'clinic' | 'hospital' | 'pharmacy' | 'laboratory';
  phone: string;
  address: string;
  email?: string;
  city?: string;
  specialty?: string;
  description?: string;
  website?: string;
  accessibility_features?: string;
  home_visit_available?: string;
}

interface ValidationError {
  row: number;
  field: string;
  message: string;
}

interface ImportResult {
  success: boolean;
  row: number;
  data?: ImportRow;
  error?: string;
}

export default function BulkImportForm() {
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [file, setFile] = useState<File | null>(null);
  const [parsedData, setParsedData] = useState<ImportRow[]>([]);
  const [validationErrors, setValidationErrors] = useState<ValidationError[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [importResults, setImportResults] = useState<ImportResult[]>([]);
  const [showPreview, setShowPreview] = useState(true);
  const [importComplete, setImportComplete] = useState(false);

  const requiredFields = ['business_name', 'provider_type', 'phone', 'address'];
  const validProviderTypes = ['doctor', 'clinic', 'hospital', 'pharmacy', 'laboratory'];

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    if (!selectedFile) return;

    // Reset previous state
    setFile(selectedFile);
    setParsedData([]);
    setValidationErrors([]);
    setImportResults([]);
    setImportComplete(false);

    // Validate file type
    const fileExtension = selectedFile.name.split('.').pop()?.toLowerCase();
    if (!['csv', 'json'].includes(fileExtension || '')) {
      toast({
        title: "Format de fichier non supporté",
        description: "Veuillez sélectionner un fichier CSV ou JSON.",
        variant: "destructive",
      });
      return;
    }

    // Parse file
    if (fileExtension === 'csv') {
      parseCSV(selectedFile);
    } else {
      parseJSON(selectedFile);
    }
  };

  const parseCSV = (file: File) => {
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        const data = results.data as ImportRow[];
        setParsedData(data);
        validateData(data);
      },
      error: (error) => {
        toast({
          title: "Erreur de parsing CSV",
          description: error.message,
          variant: "destructive",
        });
      }
    });
  };

  const parseJSON = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const jsonData = JSON.parse(e.target?.result as string);
        const data = Array.isArray(jsonData) ? jsonData : [jsonData];
        setParsedData(data);
        validateData(data);
      } catch (error) {
        toast({
          title: "Erreur de parsing JSON",
          description: "Le fichier JSON n'est pas valide.",
          variant: "destructive",
        });
      }
    };
    reader.readAsText(file);
  };

  const validateData = (data: ImportRow[]) => {
    const errors: ValidationError[] = [];

    data.forEach((row, index) => {
      // Check required fields
      requiredFields.forEach(field => {
        if (!row[field as keyof ImportRow] || String(row[field as keyof ImportRow]).trim() === '') {
          errors.push({
            row: index + 1,
            field,
            message: `Le champ "${field}" est requis`
          });
        }
      });

      // Validate provider_type
      if (row.provider_type && !validProviderTypes.includes(row.provider_type)) {
        errors.push({
          row: index + 1,
          field: 'provider_type',
          message: `Type de prestataire invalide. Valeurs acceptées: ${validProviderTypes.join(', ')}`
        });
      }

      // Validate phone format (basic validation)
      if (row.phone && !/^[\+]?[0-9\s\-\(\)]{8,}$/.test(row.phone.trim())) {
        errors.push({
          row: index + 1,
          field: 'phone',
          message: 'Format de téléphone invalide'
        });
      }

      // Validate email format if provided
      if (row.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(row.email.trim())) {
        errors.push({
          row: index + 1,
          field: 'email',
          message: 'Format d\'email invalide'
        });
      }

      // Validate website URL if provided
      if (row.website && !/^https?:\/\/.+/.test(row.website.trim())) {
        errors.push({
          row: index + 1,
          field: 'website',
          message: 'URL de site web invalide (doit commencer par http:// ou https://)'
        });
      }
    });

    setValidationErrors(errors);
  };

  const handleImport = async () => {
    if (validationErrors.length > 0) {
      toast({
        title: "Erreurs de validation",
        description: "Veuillez corriger les erreurs avant d'importer.",
        variant: "destructive",
      });
      return;
    }

    setIsProcessing(true);
    const results: ImportResult[] = [];

    try {
      for (let i = 0; i < parsedData.length; i++) {
        const row = parsedData[i];
        
        try {
          // Parse accessibility features if provided
          let accessibilityFeatures: string[] = [];
          if (row.accessibility_features) {
            accessibilityFeatures = row.accessibility_features
              .split(',')
              .map(f => f.trim())
              .filter(f => f.length > 0);
          }

          // Parse home visit availability
          const homeVisitAvailable = row.home_visit_available?.toLowerCase() === 'true' || 
                                   row.home_visit_available?.toLowerCase() === 'oui' || 
                                   row.home_visit_available === '1';

          // Insert provider into Firebase
          await createProvider({
            userId: '', // Preloaded providers don't have a user yet
            businessName: row.business_name.trim(),
            providerType: row.provider_type,
            phone: row.phone.trim(),
            address: row.address.trim(),
            email: row.email?.trim() || undefined,
            city: row.city?.trim() || undefined,
            description: row.description?.trim() || undefined,
            website: row.website?.trim() || undefined,
            verificationStatus: 'verified', // Admin imported = auto-verified
            isPreloaded: true,
            isClaimed: false,
            accessibilityFeatures: accessibilityFeatures,
            homeVisitAvailable: homeVisitAvailable,
            isEmergency: false
          });

          results.push({
            success: true,
            row: i + 1,
            data: row
          });

        } catch (error) {
          results.push({
            success: false,
            row: i + 1,
            data: row,
            error: error instanceof Error ? error.message : 'Erreur inconnue'
          });
        }
      }

      setImportResults(results);
      setImportComplete(true);

      const successCount = results.filter(r => r.success).length;
      const errorCount = results.filter(r => !r.success).length;

      toast({
        title: "Import terminé",
        description: `${successCount} profils importés avec succès. ${errorCount} erreurs.`,
        variant: errorCount > 0 ? "destructive" : "default",
      });

    } catch (error) {
      toast({
        title: "Erreur d'import",
        description: "Une erreur inattendue s'est produite.",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const downloadTemplate = () => {
    const template = [
      {
        business_name: "Cabinet Dr. Exemple",
        provider_type: "doctor",
        phone: "+213 48 50 10 20",
        address: "123 Rue de la Santé, Sidi Bel Abbès",
        email: "contact@exemple.com",
        city: "Sidi Bel Abbès",
        specialty: "Cardiologie",
        description: "Cabinet de cardiologie moderne",
        website: "https://exemple.com",
        accessibility_features: "wheelchair,parking,elevator",
        home_visit_available: "true"
      }
    ];

    const csv = Papa.unparse(template);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', 'template_import_prestataires.csv');
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const resetForm = () => {
    setFile(null);
    setParsedData([]);
    setValidationErrors([]);
    setImportResults([]);
    setImportComplete(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const getProviderTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      doctor: 'Médecin',
      clinic: 'Clinique',
      hospital: 'Hôpital',
      pharmacy: 'Pharmacie',
      laboratory: 'Laboratoire'
    };
    return labels[type] || type;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <CardTitle>Import en masse de prestataires</CardTitle>
          <CardDescription>
            Importez plusieurs profils de prestataires à partir d'un fichier CSV ou JSON
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-4">
            <Button onClick={downloadTemplate} variant="outline">
              <Download className="mr-2 h-4 w-4" />
              Télécharger le modèle CSV
            </Button>
            
            <div className="flex-1">
              <Input
                ref={fileInputRef}
                type="file"
                accept=".csv,.json"
                onChange={handleFileSelect}
                disabled={isProcessing}
              />
            </div>

            {file && (
              <Button onClick={resetForm} variant="outline" size="icon">
                <Trash2 className="h-4 w-4" />
              </Button>
            )}
          </div>

          {file && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <FileText className="h-4 w-4" />
              <span>{file.name} ({(file.size / 1024).toFixed(1)} KB)</span>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Validation Errors */}
      {validationErrors.length > 0 && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            <div className="space-y-1">
              <p className="font-medium">{validationErrors.length} erreur(s) de validation détectée(s):</p>
              <ul className="list-disc list-inside space-y-1 max-h-32 overflow-y-auto">
                {validationErrors.slice(0, 10).map((error, index) => (
                  <li key={index} className="text-sm">
                    Ligne {error.row}, champ "{error.field}": {error.message}
                  </li>
                ))}
                {validationErrors.length > 10 && (
                  <li className="text-sm font-medium">
                    ... et {validationErrors.length - 10} autres erreurs
                  </li>
                )}
              </ul>
            </div>
          </AlertDescription>
        </Alert>
      )}

      {/* Data Preview */}
      {parsedData.length > 0 && !importComplete && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Aperçu des données</CardTitle>
                <CardDescription>
                  {parsedData.length} ligne(s) détectée(s) - 
                  {validationErrors.length === 0 ? (
                    <span className="text-green-600 ml-1">Prêt pour l'import</span>
                  ) : (
                    <span className="text-red-600 ml-1">{validationErrors.length} erreur(s)</span>
                  )}
                </CardDescription>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowPreview(!showPreview)}
                >
                  {showPreview ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
                <Button
                  onClick={handleImport}
                  disabled={validationErrors.length > 0 || isProcessing}
                >
                  {isProcessing ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Import en cours...
                    </>
                  ) : (
                    <>
                      <Upload className="mr-2 h-4 w-4" />
                      Importer {parsedData.length} profil(s)
                    </>
                  )}
                </Button>
              </div>
            </div>
          </CardHeader>
          
          {showPreview && (
            <CardContent>
              <div className="max-h-96 overflow-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-12">#</TableHead>
                      <TableHead>Nom</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Téléphone</TableHead>
                      <TableHead>Adresse</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Statut</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {parsedData.map((row, index) => {
                      const rowErrors = validationErrors.filter(e => e.row === index + 1);
                      const hasErrors = rowErrors.length > 0;
                      
                      return (
                        <TableRow key={index} className={hasErrors ? 'bg-red-50' : ''}>
                          <TableCell className="font-medium">{index + 1}</TableCell>
                          <TableCell>
                            <div>
                              <p className="font-medium">{row.business_name || '-'}</p>
                              {row.specialty && (
                                <p className="text-sm text-muted-foreground">{row.specialty}</p>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>
                            {row.provider_type ? (
                              <Badge variant="outline">
                                {getProviderTypeLabel(row.provider_type)}
                              </Badge>
                            ) : '-'}
                          </TableCell>
                          <TableCell>{row.phone || '-'}</TableCell>
                          <TableCell>
                            <div>
                              <p className="text-sm">{row.address || '-'}</p>
                              {row.city && (
                                <p className="text-xs text-muted-foreground">{row.city}</p>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>{row.email || '-'}</TableCell>
                          <TableCell>
                            {hasErrors ? (
                              <Badge variant="destructive">
                                <XCircle className="mr-1 h-3 w-3" />
                                {rowErrors.length} erreur(s)
                              </Badge>
                            ) : (
                              <Badge variant="default">
                                <CheckCircle className="mr-1 h-3 w-3" />
                                Valide
                              </Badge>
                            )}
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          )}
        </Card>
      )}

      {/* Import Results */}
      {importComplete && importResults.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Résultats de l'import</CardTitle>
            <CardDescription>
              {importResults.filter(r => r.success).length} succès, {importResults.filter(r => !r.success).length} erreurs
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="max-h-96 overflow-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-12">#</TableHead>
                    <TableHead>Nom</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Statut</TableHead>
                    <TableHead>Message</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {importResults.map((result, index) => (
                    <TableRow key={index} className={result.success ? 'bg-green-50' : 'bg-red-50'}>
                      <TableCell className="font-medium">{result.row}</TableCell>
                      <TableCell>{result.data?.business_name || '-'}</TableCell>
                      <TableCell>
                        {result.data?.provider_type ? (
                          <Badge variant="outline">
                            {getProviderTypeLabel(result.data.provider_type)}
                          </Badge>
                        ) : '-'}
                      </TableCell>
                      <TableCell>
                        {result.success ? (
                          <Badge variant="default">
                            <CheckCircle className="mr-1 h-3 w-3" />
                            Importé
                          </Badge>
                        ) : (
                          <Badge variant="destructive">
                            <XCircle className="mr-1 h-3 w-3" />
                            Erreur
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        {result.success ? (
                          <span className="text-green-600 text-sm">Profil créé avec succès</span>
                        ) : (
                          <span className="text-red-600 text-sm">{result.error}</span>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}