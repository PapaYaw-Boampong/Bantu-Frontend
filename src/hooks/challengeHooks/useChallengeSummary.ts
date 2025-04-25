// hooks/useChallengeSummaries.ts
import { useQuery } from '@tanstack/react-query';
import { challengeService } from '@/services/challengeService';
import { ChallengeSummary } from '@/types/challenge';

export function useChallengeSummaries() {
  return useQuery<ChallengeSummary[]>({
    queryKey: ['challengeSummaries'],
    queryFn: challengeService.getSummaries,
  });
}
