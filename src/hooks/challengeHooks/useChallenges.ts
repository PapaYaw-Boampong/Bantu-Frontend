// hooks/useChallenges.ts
import { useQuery } from '@tanstack/react-query';
import { challengeService } from '@/services/challengeService';
import {
  ChallengeSummary,
  GetChallenges,
} from '@/types/challenge';
import { mockChallenges } from '@/mocks/challengeMocks';

// Fetch all challenges (optionally filtered)
export function useChallenges(params: GetChallenges = {}) {
  return useQuery<ChallengeSummary[]>({
    queryKey: ['platform-challenges', params],
    queryFn: () => challengeService.list(params),
  });
}
