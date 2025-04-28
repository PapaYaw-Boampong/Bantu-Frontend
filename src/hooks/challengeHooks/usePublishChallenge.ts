import { useMutation, useQueryClient } from '@tanstack/react-query';
import { challengeService } from '@/services/challengeService';

export function usePublishChallenge() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: string) => challengeService.publish(id),
    onSuccess: (response, id) => {
      // Invalidate both the challenges list and the specific challenge
      queryClient.invalidateQueries({queryKey: ['challenges']});
      queryClient.invalidateQueries({queryKey: ['challenge', id]});
      
      // Also invalidate user challenges if they exist
      queryClient.invalidateQueries({queryKey: ['user-challenges']});
    },
  });
} 