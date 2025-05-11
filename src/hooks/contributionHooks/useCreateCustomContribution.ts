import { useMutation, useQueryClient } from '@tanstack/react-query';
import { contributionService } from '@/services/contributionService';
import { 
  Contribution, 
  ContributionCreate, 
  ContributionType 
} from '@/types/contribution';

export function useCreateCustomContribution() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({
      languageId,
      contributionType,
      data,
      challengeId,
    }: {
      languageId: string;
      contributionType: ContributionType;
      data: ContributionCreate;
      challengeId?: string;
    }) => {
      return await contributionService.createCustom(
        languageId,
        contributionType,
        data,
        challengeId
      );
    },
    onSuccess: (newContribution: Contribution) => {
      // Invalidate relevant queries
      queryClient.invalidateQueries({ queryKey: ['contributions'] });
      queryClient.invalidateQueries({ queryKey: ['contributionStats'] });
      
      // If this contribution is part of a challenge, invalidate challenge data
      if (newContribution.challenge_id) {
        queryClient.invalidateQueries({ 
          queryKey: ['challenges', newContribution.challenge_id] 
        });
      }
    },
  });
} 