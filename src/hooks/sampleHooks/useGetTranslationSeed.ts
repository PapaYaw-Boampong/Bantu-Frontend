import { useQuery } from '@tanstack/react-query';
import { sampleService } from '@/services/sampleService';

export function useGetTranslationSeed(seedId?: string) {
  return useQuery({
    queryKey: ['translationSeed', seedId],
    queryFn: async () => {
      if (!seedId) {
        throw new Error('Seed ID is required');
      }
      return await sampleService.getTranslationSeed(seedId);
    },
    enabled: !!seedId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
} 