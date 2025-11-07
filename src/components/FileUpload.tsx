import { useState, useRef } from 'react';
import { Upload, X, FileText, Image as ImageIcon, Loader2, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { toast } from 'sonner';

interface FileUploadProps {
  label: string;
  accept?: string;
  multiple?: boolean;
  maxSizeMB?: number;
  onFilesSelected: (files: File[]) => void;
  required?: boolean;
  disabled?: boolean;
}

export const FileUpload = ({
  label,
  accept = '.pdf,.jpg,.jpeg,.png',
  multiple = false,
  maxSizeMB = 5,
  onFilesSelected,
  required = false,
  disabled = false,
}: FileUploadProps) => {
  const [files, setFiles] = useState<File[]>([]);
  const [uploading, setUploading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const validateFile = (file: File): boolean => {
    const maxSize = maxSizeMB * 1024 * 1024;
    
    if (file.size > maxSize) {
      toast.error(`${file.name} est trop volumineux. Maximum: ${maxSizeMB}MB`);
      return false;
    }

    const allowedExtensions = accept.split(',').map(ext => ext.trim().toLowerCase());
    const fileExt = '.' + file.name.split('.').pop()?.toLowerCase();
    
    if (!allowedExtensions.some(ext => fileExt === ext || ext === '*')) {
      toast.error(`Type de fichier non autorisé: ${file.name}`);
      return false;
    }

    return true;
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(e.target.files || []);
    const validFiles = selectedFiles.filter(validateFile);

    if (validFiles.length > 0) {
      const newFiles = multiple ? [...files, ...validFiles] : validFiles;
      setFiles(newFiles);
      onFilesSelected(newFiles);
    }

    if (inputRef.current) {
      inputRef.current.value = '';
    }
  };

  const removeFile = (index: number) => {
    const newFiles = files.filter((_, i) => i !== index);
    setFiles(newFiles);
    onFilesSelected(newFiles);
  };

  const getFileIcon = (file: File) => {
    if (file.type.startsWith('image/')) {
      return <ImageIcon className="h-5 w-5" />;
    }
    return <FileText className="h-5 w-5" />;
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  return (
    <div className="space-y-3">
      <Label>
        {label}
        {required && <span className="text-destructive ml-1">*</span>}
      </Label>

      <div
        className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
          disabled ? 'opacity-50 cursor-not-allowed' : 'hover:border-primary cursor-pointer'
        }`}
        onClick={() => !disabled && inputRef.current?.click()}
      >
        <input
          ref={inputRef}
          type="file"
          accept={accept}
          multiple={multiple}
          className="hidden"
          onChange={handleFileChange}
          disabled={disabled}
        />

        <Upload className="h-10 w-10 mx-auto mb-2 text-muted-foreground" />
        
        <p className="text-sm font-medium mb-1">
          Cliquez pour télécharger {multiple && 'ou glissez-déposez'}
        </p>
        <p className="text-xs text-muted-foreground">
          {accept.replace(/\./g, '').toUpperCase()} • Max {maxSizeMB}MB
        </p>
      </div>

      {files.length > 0 && (
        <div className="space-y-2">
          {files.map((file, index) => (
            <div
              key={index}
              className="flex items-center gap-3 p-3 bg-muted rounded-lg"
            >
              <div className="text-primary">{getFileIcon(file)}</div>
              
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{file.name}</p>
                <p className="text-xs text-muted-foreground">
                  {formatFileSize(file.size)}
                </p>
              </div>

              <CheckCircle2 className="h-5 w-5 text-green-500" />

              {!disabled && (
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={(e) => {
                    e.stopPropagation();
                    removeFile(index);
                  }}
                >
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
