import { useQuery } from '@tanstack/react-query';
import { sampleService } from '@/services/sampleService';

export function useGetTranscriptionSample(sampleId?: string) {
  return useQuery({
    queryKey: ['transcriptionSample', sampleId],
    queryFn: async () => {
      if (!sampleId) {
        throw new Error('Sample ID is required');
      }
      return await sampleService.getTranscriptionSample(sampleId);
    },
    enabled: !!sampleId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
} 