import { FileMetadata, UploadProgress, SignedUrlResponse } from '../types/storage';
import { ContributionType } from '@/types/contribution';

import api from '@/lib/api';

class StorageService {
  private baseUrl: string;

  constructor(baseUrl: string = 'storage') {
    this.baseUrl = baseUrl;
  }

  /**
   * Generate filename following the convention:
   * contributions/{task_type}/{contribution_id}/{timestamp}.{ext}
   */
  generateFilename(metadata: FileMetadata): string {
    const timestamp = metadata.timestamp || Date.now();
    return `contributions/${metadata.taskType}/${metadata.contributionId}/${timestamp}.${metadata.fileExtension}`;
  }

  /**
   * Parse filename back to metadata (useful for validation)
   */
  parseFilename(filename: string): FileMetadata | null {
    try {
      const parts = filename.split('/');
      if (parts.length !== 4 || parts[0] !== 'contributions') {
        return null;
      }

      const [, taskType, contributionId, filePart] = parts;
      const lastDotIndex = filePart.lastIndexOf('.');
      
      if (lastDotIndex === -1) return null;
      
      const timestampStr = filePart.substring(0, lastDotIndex);
      const fileExtension = filePart.substring(lastDotIndex + 1);
      const timestamp = parseInt(timestampStr, 10);

      if (!['transcription', 'translation', 'annotation'].includes(taskType)) {
        return null;
      }

      return {
        taskType: taskType as ContributionType,
        contributionId,
        fileExtension,
        timestamp: isNaN(timestamp) ? undefined : timestamp,
      };
    } catch {
      return null;
    }
  }

  /**
   * Request a signed URL for uploading a file
   */
  async getUploadUrl(filename: string, contentType: string): Promise<SignedUrlResponse> {
    const response = await api.post(`${this.baseUrl}/upload-url`, {
      filename,
      content_type: contentType,
    });
    return response.data;
  }


  /**
   * Request a signed URL for downloading a file
   */
  async getDownloadUrl(filename: string): Promise<SignedUrlResponse> {
    const response = await api.post(`${this.baseUrl}/download-url`, {
      filename,
    });
    return response.data;
  }


  /**
   * Upload a file using signed URL
   */
  // async uploadFile(
  //   file: File,
  //   metadata: FileMetadata,
  //   onProgress?: (progress: UploadProgress) => void
  // ): Promise<string> {
  //   const filename = this.generateFilename(metadata);
  //   const contentType = file.type || 'application/octet-stream';

  //   try {
  //     // Get signed URL
  //     const { signed_url } = await this.getUploadUrl(filename, contentType);

  //     // Upload file using signed URL
  //     return new Promise((resolve, reject) => {
  //       const xhr = new XMLHttpRequest();

  //       // Track upload progress
  //       if (onProgress) {
  //         xhr.upload.addEventListener('progress', (e) => {
  //           if (e.lengthComputable) {
  //             onProgress({
  //               loaded: e.loaded,
  //               total: e.total,
  //               percentage: Math.round((e.loaded / e.total) * 100),
  //             });
  //           }
  //         });
  //       }

  //       xhr.addEventListener('load', () => {
  //         if (xhr.status >= 200 && xhr.status < 300) {
  //           resolve(filename);
  //         } else {
  //           reject(new Error(`Upload failed: ${xhr.status} ${xhr.statusText}`));
  //         }
  //       });

  //       xhr.addEventListener('error', () => {
  //         reject(new Error('Upload failed: Network error'));
  //       });

  //       xhr.open('PUT', signed_url);
  //       xhr.setRequestHeader('Content-Type', contentType);
  //       xhr.send(file);
  //     });
  //   } catch (error) {
  //     throw new Error(`Upload failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  //   }
  // }

  async uploadFile(file: File, metadata: FileMetadata): Promise<string> {
    const filename = this.generateFilename(metadata);
    const contentType = file.type || 'application/octet-stream';
  
    try {
      const { signed_url } = await this.getUploadUrl(filename, contentType);
  
      const response = await fetch(signed_url, {
        method: 'PUT',
        headers: {
          'Content-Type': contentType,
        },
        body: file,
      });
  
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Upload failed: ${response.status} - ${errorText}`);
      }
  
      return filename;
    } catch (error) {
      throw new Error(`Upload failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
  


  /**
   * Download a file using signed URL
   */
  async downloadFile(filename: string): Promise<Blob> {
    try {
      // Get signed URL
      const { signed_url } = await this.getDownloadUrl(filename);

      // Download file using signed URL
      const response = await fetch(signed_url);
      
      if (!response.ok) {
        throw new Error(`Download failed: ${response.status} ${response.statusText}`);
      }

      return response.blob();
    } catch (error) {
      throw new Error(`Download failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }


  /**
   * Check if a file exists
   */
  async fileExists(filename: string): Promise<boolean> {
    try {
      const response = await api.get(`${this.baseUrl}/file-exists/${encodeURIComponent(filename)}`);
      return response.data.exists;
    } catch {
      return false;
    }
  }


  /**
   * Get file extension from MIME type
   */
  getExtensionFromMimeType(mimeType: string): string {
    const mimeMap: Record<string, string> = {
      'image/jpeg': 'jpg',
      'image/jpg': 'jpg',
      'image/png': 'png',
      'image/gif': 'gif',
      'image/webp': 'webp',
      'audio/mpeg': 'mp3',
      'audio/wav': 'wav',
      'audio/ogg': 'ogg',
      'audio/mp4': 'm4a',
      'video/mp4': 'mp4',
      'video/webm': 'webm',
      'video/ogg': 'ogv',
      'application/json': 'json',
      'text/plain': 'txt',
      'text/csv': 'csv',
    };

    return mimeMap[mimeType] || 'bin';
  }


  /**
   * Validate file before upload
   */
  static validateFile(file: File, maxSize: number = 50 * 1024 * 1024): string[] {
    const errors: string[] = [];

    if (file.size > maxSize) {
      errors.push(`File size exceeds ${Math.round(maxSize / 1024 / 1024)}MB limit`);
    }

    if (file.size === 0) {
      errors.push('File is empty');
    }

    if (!file.name || file.name.trim() === '') {
      errors.push('File name is required');
    }

    return errors;
  }
  

}

// Create singleton instance
export const storageService = new StorageService();
