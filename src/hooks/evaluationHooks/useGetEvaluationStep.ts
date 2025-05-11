import { useQuery } from '@tanstack/react-query';
import { evaluationService } from '@/services/evaluationService';

export function useGetEvaluationStep(stepId?: string) {
  return useQuery({
    queryKey: ['evaluationStep', stepId],
    queryFn: async () => {
      if (!stepId) {
        throw new Error('Step ID is required');
      }
      return await evaluationService.getEvaluationStep(stepId);
    },
    enabled: !!stepId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
} 