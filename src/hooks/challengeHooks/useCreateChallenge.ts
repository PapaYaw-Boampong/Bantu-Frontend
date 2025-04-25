// hooks/useCreateChallenge.ts
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { challengeService } from '@/services/challengeService';
import { ChallengeCreate } from '@/types/challenge';

export function useCreateChallenge() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: ChallengeCreate) => challengeService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({queryKey: ['challenges']});
    },
  });
}
