import { useQuery } from '@tanstack/react-query';
import { sampleService } from '@/services/sampleService';

interface TranscriptionSamplesParams {
  languageId?: string;
  category?: string;
  active?: boolean;
  skip?: number;
  limit?: number;
  buffer?: string;
}

export function useListTranscriptionSamples({
  languageId,
  category,
  active,
  buffer,
  skip = 0,
  limit = 3,
}: TranscriptionSamplesParams = {}) {
  return useQuery({
    queryKey: ['transcriptionSamples', { languageId, category, active, skip, limit }],
    queryFn: async () => {
      return await sampleService.listTranscriptionSamples(
        languageId,
        category,
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