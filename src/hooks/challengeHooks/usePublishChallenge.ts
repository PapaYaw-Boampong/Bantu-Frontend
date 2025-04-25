import { useMutation, useQueryClient } from '@tanstack/react-query';
import { challengeService } from '@/services/challengeService';

export function usePublishChallenge() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => challengeService.publish(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: ['challenge', id] });
      queryClient.invalidateQueries({ queryKey: ['challenges'] });
    },
  });
} 