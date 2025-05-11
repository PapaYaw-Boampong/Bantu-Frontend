import { useMutation, useQueryClient } from '@tanstack/react-query';
import { evaluationService } from '@/services/evaluationService';

export function useFinalizeABTest() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (abTestId: string) => {
      return await evaluationService.finalizeABTest(abTestId);
    },
    onSuccess: (result) => {
      // Invalidate the AB test that was finalized
      queryClient.invalidateQueries({ queryKey: ['abTest', result.ab_test_id] });
      
      // The finalization likely changed contribution statuses, so invalidate them
      queryClient.invalidateQueries({ queryKey: ['contributions'] });
    },
  });
} 