import { useMutation, UseMutationResult } from '@tanstack/react-query';
import { sampleService } from '@/services/sampleService';

interface UploadAnnotationSeedsCSVParams {
  file: File;
  languageId: string;
}

interface UploadAnnotationSeedsCSVResponse {
  success: boolean;
  count: number;
}

export function useUploadAnnotationSeedsCSV(): UseMutationResult<
  UploadAnnotationSeedsCSVResponse,
  Error,
  UploadAnnotationSeedsCSVParams
> {
  return useMutation({
    mutationFn: ({ file, languageId }: UploadAnnotationSeedsCSVParams) => 
      sampleService.uploadAnnotationSeedsCSV(file, languageId),
  });
} 