import { useMutation, useQueryClient } from '@tanstack/react-query';
import { challengeService } from '@/services/challengeService';
import { ChallengeRulesAdd } from '@/types/challenge';

export function useAddChallengeRules() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: ChallengeRulesAdd) => challengeService.addRules(data),
    onSuccess: (_, data) => {
      queryClient.invalidateQueries({ queryKey: ['challenge', data.challenge_id] });
    },
  });
} 