import { useState } from 'react';
import { storageService } from '@/services/storageService';

interface FileUploadState {
  isUploading: boolean;
  progress: number;
  error: Error | null;
  url: string | null;
}

/**
 * Hook for uploading files to Google Cloud Storage with progress tracking
 */
export function useFileUpload() {
  const [uploadState, setUploadState] = useState<FileUploadState>({
    isUploading: false,
    progress: 0,
    error: null,
    url: null,
  });

  /**
   * Upload a file with progress tracking
   * @param file - The file to upload
   * @param contributionType - The type of contribution ('annotation' or 'transcription')
   * @param languageId - The language ID
   */
  const uploadFile = async (
    file: File,
    contributionType: 'annotation' | 'transcription',
    languageId: string
  ): Promise<string> => {
    // Reset state
    setUploadState({
      isUploading: true,
      progress: 0,
      error: null,
      url: null,
    });

    try {
      // Generate file path
      const filePath = storageService.buildAssetPath(contributionType, languageId, file.name);
      
      // Get a signed URL for upload
      const signedUrl = await storageService.getSignedUploadUrl(filePath, file.type);
      
      // Set progress to show we've got the signed URL
      setUploadState(prev => ({ ...prev, progress: 10 }));
      
      // Upload using XMLHttpRequest to track progress
      await new Promise<void>((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        
        xhr.upload.addEventListener('progress', (event) => {
          if (event.lengthComputable) {
            // Calculate progress (10-90% range, leaving room for pre and post processing)
            const progress = 10 + Math.round((event.loaded / event.total) * 80);
            setUploadState(prev => ({ ...prev, progress }));
          }
        });
        
        xhr.addEventListener('load', () => {
          if (xhr.status >= 200 && xhr.status < 300) {
            setUploadState(prev => ({ ...prev, progress: 90 }));
            resolve();
          } else {
            reject(new Error(`Upload failed with status ${xhr.status}`));
          }
        });
        
        xhr.addEventListener('error', () => {
          reject(new Error('Upload failed'));
        });
        
        xhr.addEventListener('abort', () => {
          reject(new Error('Upload aborted'));
        });
        
        xhr.open('PUT', signedUrl);
        xhr.setRequestHeader('Content-Type', file.type);
        xhr.send(file);
      });
      
      // Get the public URL
      const url = storageService.getAssetUrl(filePath);
      
      // Update state with URL and complete progress
      setUploadState({
        isUploading: false,
        progress: 100,
        error: null,
        url,
      });
      
      return url;
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Unknown error uploading file');
      setUploadState(prev => ({
        ...prev,
        isUploading: false,
        error,
      }));
      throw error;
    }
  };

  /**
   * Cancel the current upload (if possible)
   */
  const cancelUpload = () => {
    // This is a placeholder. In a real implementation, you would need to
    // access the XMLHttpRequest instance and call xhr.abort()
    setUploadState(prev => ({
      ...prev,
      isUploading: false,
      error: new Error('Upload cancelled'),
    }));
  };

  return {
    ...uploadState,
    uploadFile,
    cancelUpload,
  };
} 