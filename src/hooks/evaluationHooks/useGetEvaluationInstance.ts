import { useQuery } from '@tanstack/react-query';
import { evaluationService } from '@/services/evaluationService';

export function useGetEvaluationInstance(instanceId?: string) {
  return useQuery({
    queryKey: ['evaluationInstance', instanceId],
    queryFn: async () => {
      if (!instanceId) {
        throw new Error('Instance ID is required');
      }
      return await evaluationService.getEvaluationInstance(instanceId);
    },
    enabled: !!instanceId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
} 