import { useQuery } from '@tanstack/react-query';
import { ChallengeDetailResponse } from '@/types/challenge';
import api from '@/lib/api';

export interface DetailedChallengeResponseWrapper {
  challenge: ChallengeDetailResponse;
  reward: any;
  rules: any[];
}

export const useGetDetailedChallenge = (challengeId: string) => {
  return useQuery<DetailedChallengeResponseWrapper>({
    queryKey: ['challengeDetail', challengeId],
    queryFn: async () => {
      const response = await api.get(`/challenges/${challengeId}`);
      return response.data;
    },
    enabled: !!challengeId,
  });
}; 