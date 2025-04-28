// hooks/challengeHooks/useSaveChallenge.ts
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { challengeService } from '@/services/challengeService';
import { ChallengeSaveRequest} from '@/types/challenge';

export function useSaveChallenge() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: ChallengeSaveRequest) => {
      return challengeService.save(data);
    },
    onSuccess: (response) => {
      // Invalidate both the challenges list and the specific challenge
      queryClient.invalidateQueries({queryKey: ['challenges']});
      
      // If the response contains an id, also invalidate that specific challenge
      if (response && response.id) {
        queryClient.invalidateQueries({queryKey: ['challenge', response.id]});
      }
    },
  });
}
