import { useMutation, useQueryClient } from '@tanstack/react-query';
import { challengeService } from '@/services/challengeService';

export function useLeaveChallenge() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (challengeId: string) => challengeService.leave(challengeId),
    onSuccess: (_, challengeId) => {
      queryClient.invalidateQueries({ queryKey: ['challenge', challengeId] });
      queryClient.invalidateQueries({ queryKey: ['your-challenges'] });
    },
  });
} 