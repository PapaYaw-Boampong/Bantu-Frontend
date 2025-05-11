import { useMutation, useQueryClient } from '@tanstack/react-query';
import { evaluationService } from '@/services/evaluationService';
import { ABTestVoteSubmit } from '@/types/evaluation';

interface CastABTestVoteParams {
  pairId: string;
  data: ABTestVoteSubmit;
}

export function useCastABTestVote() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ pairId, data }: CastABTestVoteParams) => {
      return await evaluationService.castABTestVote(pairId, data);
    },
    onSuccess: (result, variables) => {
      // Invalidate the pair that was voted on
      queryClient.invalidateQueries({ queryKey: ['abTestPair', variables.pairId] });
      
      // If the test advanced to a new stage or completed, invalidate the AB test
      if (result.advance) {
        queryClient.invalidateQueries({ queryKey: ['abTest', result.advance.ab_test_id] });
        
        // If the test completed, we may need to update contributions too
        if (result.advance.is_complete) {
          queryClient.invalidateQueries({ queryKey: ['contributions'] });
        }
      }
      
      // Remove the assignment from cache since it's been used
      queryClient.removeQueries({ queryKey: ['abTestAssignment', variables.pairId] });
    },
  });
} 