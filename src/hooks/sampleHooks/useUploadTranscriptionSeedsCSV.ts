import { useMutation, UseMutationResult } from '@tanstack/react-query';
import { sampleService } from '@/services/sampleService';

interface UploadTranscriptionSeedsCSVParams {
  file: File;
  languageId: string;
}

interface UploadTranscriptionSeedsCSVResponse {
  success: boolean;
  count: number;
}

export function useUploadTranscriptionSeedsCSV(): UseMutationResult<
  UploadTranscriptionSeedsCSVResponse,
  Error,
  UploadTranscriptionSeedsCSVParams
> {
  return useMutation({
    mutationFn: ({ file, languageId }: UploadTranscriptionSeedsCSVParams) => 
      sampleService.uploadTranscriptionSeedsCSV(file, languageId),
  });
} 