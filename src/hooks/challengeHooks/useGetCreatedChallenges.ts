// hooks/useChallenges.ts
import { useQuery } from '@tanstack/react-query';
import { challengeService } from '@/services/challengeService';
import {
  Challenge,
  GetChallenges,
  ChallengeStatus
} from '@/types/challenge';
import { mockUserChallenges } from '@/mocks/challengeMocks';

// Fetch challenges created by the current user (optionally filtered)
export function useGetCreatedChallenges(params: GetChallenges = {}) {
  return useQuery<Challenge[]>({
    queryKey: ['created-challenges', params],
    queryFn: () => challengeService.listCreatedByUser(params),
  });
}
