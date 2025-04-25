// hooks/useChallenges.ts
import { useQuery } from '@tanstack/react-query';
import { challengeService } from '@/services/challengeService';
import {
  ChallengeSummary,
  UserChallengeFilter,
} from '@/types/challenge';

// Fetch all challenges (optionally filtered)
export function useUserChallenges(params: UserChallengeFilter = {}) {
  return useQuery<ChallengeSummary[]>({
    queryKey: ['your-challenges', params],
    queryFn: () => challengeService.getUserChallenges(params),
  });
}
