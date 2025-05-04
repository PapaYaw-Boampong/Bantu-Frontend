import { useMutation, useQueryClient } from '@tanstack/react-query';
import { challengeService } from '@/services/challengeService';

interface RemoveRuleParams {
  challengeId: string;
  ruleId: string;
}

/**
 * Hook for removing a rule from a challenge
 */
export const useRemoveRule = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ challengeId, ruleId }: RemoveRuleParams) => 
      challengeService.removeRule(challengeId, ruleId),
    
    onSuccess: (_, variables) => {
      // Invalidate the detailed challenge query to trigger a refetch
      queryClient.invalidateQueries({queryKey: ['detailedChallenge', variables.challengeId]});
      
      // Also invalidate the general challenges list
      queryClient.invalidateQueries({queryKey: ['challenges']});
    }
  });
}; 