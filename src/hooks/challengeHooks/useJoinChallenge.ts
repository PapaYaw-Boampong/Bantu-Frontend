import { useMutation, useQueryClient } from '@tanstack/react-query';
import { challengeService } from '@/services/challengeService';

export function useJoinChallenge() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ challengeId, userId }: { challengeId: string; userId: string }) => 
      challengeService.join(challengeId, { user_id: userId }),
    onSuccess: (_, { challengeId }) => {
      queryClient.invalidateQueries({ queryKey: ['challenge', challengeId] });
      queryClient.invalidateQueries({ queryKey: ['your-challenges'] });
    },
  });
} 