import { useQuery } from '@tanstack/react-query';
import { sampleService } from '@/services/sampleService';

export function useGetTranslationSample(sampleId?: string) {
  return useQuery({
    queryKey: ['translationSample', sampleId],
    queryFn: async () => {
      if (!sampleId) {
        throw new Error('Sample ID is required');
      }
      return await sampleService.getTranslationSample(sampleId);
    },
    enabled: !!sampleId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
} 