import { useMutation, useQueryClient } from '@tanstack/react-query';
import { contributionService } from '@/services/contributionService';
import { 
  ContributionUpdate, 
  ContributionType 
} from '@/types/contribution';

export function useUpdateContribution() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({
      contributionId,
      contributionType,
      data,
    }: {
      contributionId: string;
      contributionType: ContributionType;
      data: ContributionUpdate;
    }) => {
      return await contributionService.update(
        contributionId,
        contributionType,
        data
      );
    },
    onSuccess: (updatedContribution, variables) => {
      // Invalidate the specific contribution that was updated
      queryClient.invalidateQueries({ 
        queryKey: ['contributions', variables.contributionId] 
      });
      
      // Invalidate overall contribution lists
      queryClient.invalidateQueries({ queryKey: ['contributions'] });
      
      // If status changed (flagged/accepted), invalidate stats
      if (
        'flagged' in variables.data || 
        'accepted' in variables.data ||
        'active' in variables.data
      ) {
        queryClient.invalidateQueries({ queryKey: ['contributionStats'] });
      }
      
      // If this contribution is part of a challenge, invalidate challenge data
      if (updatedContribution.challenge_id) {
        queryClient.invalidateQueries({ 
          queryKey: ['challenges', updatedContribution.challenge_id] 
        });
      }
    },
  });
} 