import { useState } from 'react';
import { storageService } from '@/services/storageService';

/**
 * Hook for using the storage service with loading and error states
 */
export function useStorageService() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  /**
   * Upload a file as a contribution asset
   * @param file - The file to upload
   * @param contributionType - The type of contribution ('annotation' or 'transcription')
   * @param languageId - The language ID
   * @returns Promise resolving to the URL of the uploaded file
   */
  const uploadAsset = async (
    file: File,
    contributionType: 'annotation' | 'transcription',
    languageId: string
  ): Promise<string> => {
    setIsLoading(true);
    setError(null);
    
    try {
      const url = await storageService.uploadContributionAsset(file, contributionType, languageId);
      return url;
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Unknown error uploading file'));
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Get the full URL for an asset path
   * @param assetPath - The path to the asset
   * @returns The full URL to the asset
   */
  const getAssetUrl = (assetPath: string): string => {
    return storageService.getAssetUrl(assetPath);
  };

  /**
   * Build a structured asset path for a new contribution
   * @param contributionType - The type of contribution
   * @param languageId - The language ID
   * @param fileName - The file name
   * @returns The structured path for the asset
   */
  const buildAssetPath = (
    contributionType: 'annotation' | 'transcription',
    languageId: string,
    fileName: string
  ): string => {
    return storageService.buildAssetPath(contributionType, languageId, fileName);
  };

  return {
    uploadAsset,
    getAssetUrl,
    buildAssetPath,
    isLoading,
    error,
  };
} 