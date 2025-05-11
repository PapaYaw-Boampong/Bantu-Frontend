import { useQuery } from '@tanstack/react-query';
import { evaluationService } from '@/services/evaluationService';

export function useGetEvaluationBranch(branchId?: string) {
  return useQuery({
    queryKey: ['evaluationBranch', branchId],
    queryFn: async () => {
      if (!branchId) {
        throw new Error('Branch ID is required');
      }
      return await evaluationService.getEvaluationBranch(branchId);
    },
    enabled: !!branchId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
} 