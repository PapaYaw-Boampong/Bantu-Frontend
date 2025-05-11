import { useState, useRef } from 'react';
import { useFileUpload } from '@/hooks/storageHooks';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Loader2, Upload, X, CheckCircle, AlertCircle } from 'lucide-react';

interface FileUploadProps {
  contributionType: 'annotation' | 'transcription';
  languageId: string;
  onSuccess: (url: string) => void;
  onError?: (error: Error) => void;
  accept?: string;
  maxSizeMB?: number;
  className?: string;
}

/**
 * A reusable file upload component for GCS uploads
 */
export function FileUpload({
  contributionType,
  languageId,
  onSuccess,
  onError,
  accept = '*/*',
  maxSizeMB = 20,
  className = '',
}: FileUploadProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { isUploading, progress, error, url, uploadFile, cancelUpload } = useFileUpload();
  
  // Max file size in bytes
  const maxSize = maxSizeMB * 1024 * 1024;

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files && files.length > 0) {
      const file = files[0];
      
      // Check file size
      if (file.size > maxSize) {
        alert(`File size exceeds the maximum allowed size (${maxSizeMB}MB)`);
        return;
      }
      
      setSelectedFile(file);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile || !languageId) return;
    
    try {
      const uploadedUrl = await uploadFile(selectedFile, contributionType, languageId);
      onSuccess(uploadedUrl);
    } catch (err) {
      if (err instanceof Error && onError) {
        onError(err);
      }
    }
  };

  const handleCancel = () => {
    cancelUpload();
    setSelectedFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleTriggerFileInput = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  return (
    <div className={`border border-dashed rounded-lg p-6 ${className}`}>
      <input
        type="file"
        accept={accept}
        onChange={handleFileSelect}
        ref={fileInputRef}
        className="hidden"
      />
      
      {!selectedFile && !isUploading && !url ? (
        <div className="flex flex-col items-center justify-center space-y-4">
          <div className="p-4 bg-muted rounded-full">
            <Upload className="h-6 w-6 text-muted-foreground" />
          </div>
          <div className="text-center">
            <p className="text-sm font-medium mb-1">Click to upload or drag and drop</p>
            <p className="text-xs text-muted-foreground">
              {accept.replace('*/*', 'Any file')} (max {maxSizeMB}MB)
            </p>
          </div>
          <Button onClick={handleTriggerFileInput} variant="outline">
            Select File
          </Button>
        </div>
      ) : (
        <div className="space-y-4">
          {selectedFile && (
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <div className="flex-shrink-0 w-10 h-10 bg-muted rounded flex items-center justify-center">
                  <span className="text-xs">{selectedFile.name.split('.').pop()?.toUpperCase()}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-sm font-medium truncate max-w-[250px]">
                    {selectedFile.name}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {(selectedFile.size / (1024 * 1024)).toFixed(2)} MB
                  </span>
                </div>
              </div>
              
              {!isUploading && !url && (
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={handleCancel}
                  className="text-muted-foreground hover:text-foreground"
                >
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>
          )}
          
          {isUploading && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium">Uploading...</span>
                <span className="text-xs text-muted-foreground">{progress}%</span>
              </div>
              <Progress value={progress} className="h-2" />
              <div className="flex justify-end">
                <Button variant="ghost" size="sm" onClick={cancelUpload}>
                  Cancel
                </Button>
              </div>
            </div>
          )}
          
          {error && !isUploading && (
            <div className="flex items-center p-4 text-destructive bg-destructive/10 rounded-md space-x-2">
              <AlertCircle className="h-5 w-5" />
              <span className="text-sm">{error.message}</span>
              <Button variant="outline" size="sm" onClick={handleTriggerFileInput} className="ml-auto">
                Try Again
              </Button>
            </div>
          )}
          
          {url && !error && !isUploading && (
            <div className="flex items-center p-4 text-green-600 bg-green-50 dark:bg-green-900/10 rounded-md space-x-2">
              <CheckCircle className="h-5 w-5" />
              <span className="text-sm">Upload successful!</span>
            </div>
          )}
          
          {!isUploading && !url && !error && selectedFile && (
            <div className="flex justify-end space-x-2">
              <Button variant="outline" size="sm" onClick={handleCancel}>
                Cancel
              </Button>
              <Button size="sm" onClick={handleUpload}>
                Upload
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
} 