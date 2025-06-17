import { useQuery } from '@tanstack/react-query';
import { sampleService } from '@/services/sampleService';

interface TranslationSamplesParams {
  seedId?: string;
  languageId?: string;
  active?: boolean;
  skip?: number;
  limit?: number;
  buffer?: string;
}

export function useListTranslationSamples({
  seedId,
  languageId,
  active,
  buffer,
  skip = 0,
  limit = 3,
}: TranslationSamplesParams = {}) {
  return useQuery({
    queryKey: ['translationSamples', { seedId, languageId, active, skip, limit }],
    queryFn: async () => {
      return await sampleService.listTranslationSamples(
        seedId,
        languageId,
        active,
        buffer,
        skip,
        limit
      );
    },
    enabled: !!languageId,
    staleTime: 3 * 60 * 1000, // 5 minutes
  });
} 