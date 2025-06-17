import { useMutation, UseMutationResult } from '@tanstack/react-query';
import { sampleService } from '@/services/sampleService';

interface UploadTranslationSeedsCSVResponse {
  success: boolean;
  count: number;
}

export function useUploadTranslationSeedsCSV(): UseMutationResult<
  UploadTranslationSeedsCSVResponse,
  Error,
  File
> {
  return useMutation({
    mutationFn: (file: File) => sampleService.uploadTranslationSeedsCSV(file),
  });
} 