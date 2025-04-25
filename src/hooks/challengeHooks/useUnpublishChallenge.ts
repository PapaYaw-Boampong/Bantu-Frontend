import { useMutation, useQueryClient } from '@tanstack/react-query';
import { challengeService } from '@/services/challengeService';

export function useUnpublishChallenge() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => challengeService.unpublish(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: ['challenge', id] });
      queryClient.invalidateQueries({ queryKey: ['challenges'] });
    },
  });
} 