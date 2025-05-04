// hooks/useDeleteChallenge.ts
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { challengeService } from '@/services/challengeService';

export function useDeleteChallenge() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => challengeService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({queryKey: ['challenges']});
      queryClient.invalidateQueries({queryKey: ['your-challenges']});
    },
  });
}
