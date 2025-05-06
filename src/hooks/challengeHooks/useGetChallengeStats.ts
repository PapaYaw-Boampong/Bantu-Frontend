import { useQuery } from '@tanstack/react-query';
import { challengeService } from '@/services/challengeService';
import { ChallengeStatsOut } from '@/types/challenge';

export function useGetChallengeStats(challengeId: string, enabled = true) {
  return useQuery<ChallengeStatsOut, Error>({
    queryKey: ['challenge-stats', challengeId],
    queryFn: () => challengeService.getChallengeStats(challengeId),
    enabled: !!challengeId && enabled,
  });
} 