import api from '@/lib/api';

/**
 * Service for managing assets stored in Google Cloud Storage
 */
class StorageService {
  private baseGCSUrl: string;
  
  constructor() {
    // Base URL for Google Cloud Storage bucket
    // This could be loaded from environment variables in a real application
    this.baseGCSUrl = 'https://storage.googleapis.com/project-bantu-assets';
  }

  /**
   * Get the full URL for an asset in Google Cloud Storage
   * @param assetPath - The path to the asset within the bucket
   * @returns The full URL to the asset
   */
  getAssetUrl(assetPath: string): string {
    // Ensure assetPath doesn't start with a slash
    const normalizedPath = assetPath.startsWith('/') ? assetPath.substring(1) : assetPath;
    return `${this.baseGCSUrl}/${normalizedPath}`;
  }

  /**
   * Build a URL structure for a new contribution
   * @param contributionType - The type of contribution (e.g., 'annotation', 'transcription')
   * @param languageId - The language ID
   * @param fileName - The file name
   * @returns The structured path for the asset
   */
  buildAssetPath(contributionType: 'annotation' | 'transcription', languageId: string, fileName: string): string {
    // Create a structured path: contributions/{type}/{languageId}/{timestamp}_{fileName}
    const timestamp = Date.now();
    return `contributions/${contributionType}/${languageId}/${timestamp}_${fileName}`;
  }

  /**
   * Generate a signed URL for uploading a file to Google Cloud Storage
   * @param filePath - The target path for the file in GCS
   * @param contentType - The MIME type of the file
   * @returns A promise resolving to the signed URL for uploading
   */
  async getSignedUploadUrl(filePath: string, contentType: string): Promise<string> {
    const response = await api.get('/storage/signed-upload-url', {
      params: {
        filePath,
        contentType
      }
    });
    
    return response.data.signedUrl;
  }

  /**
   * Upload a file to Google Cloud Storage using a signed URL
   * @param signedUrl - The signed URL for uploading
   * @param file - The file to upload
   * @param contentType - The MIME type of the file
   * @returns A promise that resolves when the upload is complete
   */
  async uploadFileWithSignedUrl(signedUrl: string, file: File, contentType: string): Promise<void> {
    await fetch(signedUrl, {
      method: 'PUT',
      headers: {
        'Content-Type': contentType,
      },
      body: file
    });
  }

  /**
   * Helper method to generate a complete workflow for uploading a file
   * @param file - The file to upload
   * @param contributionType - The type of contribution
   * @param languageId - The language ID
   * @returns A promise resolving to the URL of the uploaded file
   */
  async uploadContributionAsset(
    file: File, 
    contributionType: 'annotation' | 'transcription', 
    languageId: string
  ): Promise<string> {
    // Generate a structured path for the file
    const filePath = this.buildAssetPath(contributionType, languageId, file.name);
    
    // Get a signed URL for uploading
    const signedUrl = await this.getSignedUploadUrl(filePath, file.type);
    
    // Upload the file using the signed URL
    await this.uploadFileWithSignedUrl(signedUrl, file, file.type);
    
    // Return the public URL for the uploaded file
    return this.getAssetUrl(filePath);
  }

  /**
   * Parse a GCS URL to extract the asset path
   * @param url - The full GCS URL
   * @returns The asset path within the bucket
   */
  extractAssetPathFromUrl(url: string): string | null {
    if (!url.startsWith(this.baseGCSUrl)) {
      return null;
    }
    
    return url.substring(this.baseGCSUrl.length + 1); // +1 for the trailing slash
  }
}

// Create and export a singleton instance
export const storageService = new StorageService(); 