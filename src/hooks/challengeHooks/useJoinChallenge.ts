import { useMutation, useQueryClient } from '@tanstack/react-query';
import { challengeService } from '@/services/challengeService';

export function useJoinChallenge() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ event_id, user_id }: { event_id: string; user_id: string }) => 
      challengeService.join({ event_id, user_id }),
    onSuccess: (_, { event_id }) => {
      queryClient.invalidateQueries({ queryKey: ['challenge', event_id] });
      queryClient.invalidateQueries({ queryKey: ['your-challenges'] });
    },
  });
}