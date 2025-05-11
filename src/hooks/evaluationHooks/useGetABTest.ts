import { useQuery } from '@tanstack/react-query';
import { evaluationService } from '@/services/evaluationService';

export function useGetABTest(abTestId?: string) {
  return useQuery({
    queryKey: ['abTest', abTestId],
    queryFn: async () => {
      if (!abTestId) {
        throw new Error('AB Test ID is required');
      }
      return await evaluationService.getABTest(abTestId);
    },
    enabled: !!abTestId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
} 