import { useQuery } from '@tanstack/react-query';
import { challengeService } from '@/services/challengeService';
import { UserChallengeStatsOut } from '@/types/challenge';

export function useGetUserChallengeStats(challengeId: string, enabled = true) {
  return useQuery<UserChallengeStatsOut, Error>({
    queryKey: ['user-challenge-stats', challengeId],
    queryFn: () => challengeService.getUserChallengeStats(challengeId),
    enabled: !!challengeId && enabled,
  });
} 