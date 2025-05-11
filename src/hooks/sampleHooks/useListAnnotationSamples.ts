import { useQuery } from '@tanstack/react-query';
import { sampleService } from '@/services/sampleService';

interface AnnnotationSamplesParams {
  seedId?: string;
  languageId?: string;
  category?: string;
  active?: boolean;
  skip?: number;
  limit?: number;
}

export function useListAnnotationSamples({
  seedId,
  languageId,
  category,
  active,
  skip = 0,
  limit = 20,
}: AnnnotationSamplesParams = {}) {
  return useQuery({
    queryKey: ['translationSeeds', { seedId, languageId, category, active, skip, limit }],
    queryFn: async () => {
      return await sampleService.listAnnotationSamples(
        seedId,
        languageId,
        active,
        skip,
        limit
      );
    },
    enabled: !!languageId,
    staleTime: 3 * 60 * 1000, // 5 minutes
  });
} 
