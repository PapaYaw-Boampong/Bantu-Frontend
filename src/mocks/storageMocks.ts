/**
 * Mock handlers for the Google Cloud Storage API endpoints
 * This file can be used with MSW (Mock Service Worker) for development/testing
 */

import { rest } from 'msw';

/**
 * Generate a fake signed URL for testing
 * In a real environment, this would be created by Google Cloud Storage
 */
const generateFakeSignedUrl = (filePath: string, contentType: string): string => {
  const baseUrl = 'https://storage.googleapis.com/project-bantu-assets';
  const expires = new Date(Date.now() + 15 * 60 * 1000).toISOString(); // 15 minutes
  
  return `${baseUrl}/${filePath}?X-Goog-Algorithm=FAKE&X-Goog-Credential=FAKE&X-Goog-Date=${Date.now()}&X-Goog-Expires=${expires}&X-Goog-SignedHeaders=host&X-Goog-Signature=FAKE_SIGNATURE`;
};

/**
 * Mock handlers for storage API endpoints
 */
export const storageHandlers = [
  // GET /storage/signed-upload-url
  rest.get('/storage/signed-upload-url', (req, res, ctx) => {
    const filePath = req.url.searchParams.get('filePath');
    const contentType = req.url.searchParams.get('contentType');
    
    if (!filePath || !contentType) {
      return res(
        ctx.status(400),
        ctx.json({
          error: 'Missing required parameters: filePath and contentType are required'
        })
      );
    }
    
    // Generate the fake signed URL
    const signedUrl = generateFakeSignedUrl(filePath, contentType);
    const publicUrl = `https://storage.googleapis.com/project-bantu-assets/${filePath}`;
    
    return res(
      ctx.status(200),
      ctx.json({
        signedUrl,
        publicUrl
      })
    );
  }),
  
  // Mock for testing PUT requests to the signed URL
  rest.put('https://storage.googleapis.com/project-bantu-assets/*', (req, res, ctx) => {
    // Simulate a successful upload
    return res(
      ctx.status(200)
    );
  })
];

/**
 * Helper functions for mocking storage behavior in tests
 */
export const storageMocks = {
  /**
   * Mock a successful file upload
   * @param file - The file being uploaded
   * @param contributionType - The type of contribution
   * @param languageId - The language ID
   * @returns An object with the mock URL
   */
  mockSuccessfulUpload: (file: File, contributionType: string, languageId: string) => {
    const timestamp = Date.now();
    const filePath = `contributions/${contributionType}/${languageId}/${timestamp}_${file.name}`;
    return {
      url: `https://storage.googleapis.com/project-bantu-assets/${filePath}`
    };
  },
  
  /**
   * Mock a failed file upload
   * @returns An error object
   */
  mockFailedUpload: () => {
    throw new Error('Upload failed (mocked error)');
  }
}; 