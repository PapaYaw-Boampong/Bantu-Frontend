import { useMutation, useQueryClient } from '@tanstack/react-query';
import { contributionService } from '@/services/contributionService';
import { 
  Contribution, 
  ContributionCreate, 
  ContributionType 
} from '@/types/contribution';

export function useCreateContribution() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({
      languageId,
      sampleId,
      contributionType,
      data,
      challengeId,
    }: {
      languageId: string;
      sampleId: string;
      contributionType: ContributionType;
      data: ContributionCreate;
      challengeId?: string;
    }) => {
      return await contributionService.create(
        languageId,
        sampleId,
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