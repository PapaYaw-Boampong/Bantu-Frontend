import { useInfiniteQuery } from '@tanstack/react-query';
import { challengeService } from '@/services/challengeService';
import { LeaderboardPage } from '@/types/challenge';

const LIMIT = 10;

export const useInfiniteChallengeLeaderboard = (challengeId: string) => {
  return useInfiniteQuery<LeaderboardPage, Error, LeaderboardPage, [string, string], number>({
    queryKey: ['challengeLeaderboard', challengeId],
    queryFn: ({ pageParam = 0 }) =>
      challengeService.getLeaderboardPaginated(challengeId, pageParam, LIMIT),
    getNextPageParam: (lastPage) =>
      lastPage.has_next ? lastPage.skip + LIMIT : undefined,
    initialPageParam: 0,
    enabled: !!challengeId,
  });
};