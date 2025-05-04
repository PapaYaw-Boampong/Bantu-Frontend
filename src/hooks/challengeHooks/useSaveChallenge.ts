// hooks/challengeHooks/useSaveChallenge.ts
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { challengeService } from '@/services/challengeService';
import { ChallengeSaveRequest, ChallengeDetailResponse, ChallengeRule } from '@/types/challenge';
import { DetailedChallengeResponse } from './useGetDetailedChallenge';
import { RewardType, DistributionMethod, ChallengeReward } from '@/types/rewards';

export interface ChallengeSaveResponse {
  challenge: {
    id: string;
    challenge_name: string;
    description: string;
    creator_id: string;
    event_type: string;
    task_type: string;
    event_category: string;
    start_date: string;
    end_date: string;
    status: string;
    is_public: boolean;
    is_published: boolean;
    challenge_reward_id: string;
    participation_count: number;
    completion_percent: number;
  };
  reward: {
    id: string;
    reward_type: string; // Actually RewardType enum but comes as string from API
    reward_distribution_type: string; // Actually DistributionMethod enum but comes as string from API
    reward_value: {
      amount: number;
      currency: string;
    };
    created_at: string;
    claimed: boolean;
  };
  rules: Array<{
    id: string;
    rule_title: string;
    rule_description: string;
    is_required: boolean;
  }>;
}

export function useSaveChallenge() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (data: ChallengeSaveRequest) => {
      const response = await challengeService.save(data);
      return response as unknown as ChallengeSaveResponse;
    },
    onSuccess: (response: ChallengeSaveResponse) => {
      // Invalidate the challenges list
      queryClient.invalidateQueries({queryKey: ['challenges']});
      
      if (response && response.challenge && response.challenge.id) {
        const challengeId = response.challenge.id;
        
        // Convert API response types to actual enum types
        const typedReward: ChallengeReward = {
          ...response.reward,
          reward_type: response.reward.reward_type as RewardType,
          reward_distribution_type: response.reward.reward_distribution_type as DistributionMethod
        };
        
        // Convert rule format to match ChallengeRule
        const typedRules: ChallengeRule[] = response.rules.map(rule => ({
          rule_id: rule.id,
          rule_title: rule.rule_title,
          rule_description: rule.rule_description,
          is_required: rule.is_required
        }));
        
        // Format detailed response for cache update
        const detailedResponse: DetailedChallengeResponse = {
          ...(response.challenge as unknown as ChallengeDetailResponse),
          reward: JSON.stringify(response.reward),
          rules: typedRules,
          parsedReward: typedReward,
          parsedRules: typedRules
        };
        
        // Update the cache for this specific challenge
        queryClient.setQueryData(['detailedChallenge', challengeId], detailedResponse);
        
        // Also invalidate the query to ensure fresh data on next fetch
        queryClient.invalidateQueries({queryKey: ['detailedChallenge', challengeId]});
      }
    },
  });
}
