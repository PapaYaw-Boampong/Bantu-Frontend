import { useMutation, useQueryClient } from '@tanstack/react-query';
import { contributionService } from '@/services/contributionService';
import { ContributionType } from '@/types/contribution';

export function useFlagContribution() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({
      contributionId,
      contributionType,
    }: {
      contributionId: string;
      contributionType: ContributionType;
    }) => {
      return await contributionService.flagContribution(
        contributionId,
        contributionType
      );
    },
    onSuccess: (_, variables) => {
      // Invalidate the specific contribution that was flagged
      queryClient.invalidateQueries({ 
        queryKey: ['contributions', variables.contributionId] 
      });
      
      // Invalidate overall contribution lists
      queryClient.invalidateQueries({ queryKey: ['contributions'] });
      
      // Invalidate stats since flagged contribution count changed
      queryClient.invalidateQueries({ queryKey: ['contributionStats'] });
    },
  });
} 