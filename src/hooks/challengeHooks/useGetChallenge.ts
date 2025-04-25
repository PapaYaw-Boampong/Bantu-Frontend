import { useQuery } from '@tanstack/react-query';
import { challengeService } from '@/services/challengeService';
import { ChallengeDetailResponse } from '@/types/challenge';

export function useGetChallenge(id: string) {
  return useQuery<ChallengeDetailResponse>({
    queryKey: ['challenge', id],
    queryFn: () => challengeService.get(id),
    enabled: !!id,
  });
} 