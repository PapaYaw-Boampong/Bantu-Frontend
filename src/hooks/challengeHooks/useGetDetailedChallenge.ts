import { useQuery } from '@tanstack/react-query';
import { DetailedChallengeResponseWrapper } from '@/types/challenge';
import { challengeService } from '@/services/challengeService';

export type { DetailedChallengeResponseWrapper };

export const useGetDetailedChallenge = (challengeId: string) => {
  return useQuery<DetailedChallengeResponseWrapper>({
    queryKey: ['challengeDetail', challengeId],
    queryFn: ({ queryKey }) => {
      const [, id] = queryKey as [string, string];
      return challengeService.get(id);
    },
    enabled: !!challengeId,
  });
};
