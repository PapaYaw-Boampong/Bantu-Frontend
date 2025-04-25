// hooks/useUpdateChallenge.ts
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { challengeService } from '@/services/challengeService';
import { ChallengeUpdate } from '@/types/challenge';

export function useUpdateChallenge(id: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: ChallengeUpdate) => challengeService.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({queryKey: ['challenge', id]});
      queryClient.invalidateQueries({queryKey: ['challenges']});
    },
  });
}
