import { useQuery } from '@tanstack/react-query';
import { sampleService } from '@/services/sampleService';

interface AnnnotationSamplesParams {
  seedId?: string;
  languageId?: string;
  category?: string;
  active?: boolean;
  skip?: number;
  limit?: number;
  buffer?: string;
}

export function useListAnnotationSamples({
  seedId,
  languageId,
  category,
  active,
  buffer,
  skip = 0,
  limit = 10,
}: AnnnotationSamplesParams = {}) {
  return useQuery({
    queryKey: ['translationSeeds', { seedId, languageId, category, active, skip, limit }],
    queryFn: async () => {
      return await sampleService.listAnnotationSamples(
        seedId,
        languageId,
        active,
        buffer,
        skip,
        limit
      );
    },
    enabled: !!languageId,
    staleTime: Infinity
  });
} 
