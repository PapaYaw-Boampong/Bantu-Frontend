import { useMutation, useQueryClient } from '@tanstack/react-query';
import { evaluationService } from '@/services/evaluationService';
import { ContributionType } from '@/types/contribution';

interface AdvanceABTestParams {
  abTestId: string;
  contributionType: ContributionType;
}

export function useAdvanceABTest() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ abTestId, contributionType }: AdvanceABTestParams) => {
      return await evaluationService.advanceABTest(abTestId, contributionType);
    },
    onSuccess: (result) => {
      // Invalidate the AB test that was advanced
      queryClient.invalidateQueries({ queryKey: ['abTest', result.ab_test_id] });
      
      // If the AB test completed, update contributions as well
      if (result.is_complete) {
        queryClient.invalidateQueries({ queryKey: ['contributions'] });
      }
    },
  });
} 