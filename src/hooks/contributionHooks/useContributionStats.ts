import { useQuery } from '@tanstack/react-query';
import { contributionService } from '@/services/contributionService';
import { ContributionType } from '@/types/contribution';

export function useContributionStats(
  contributionType?: ContributionType,
  userId?: string
) {
  return useQuery({
    queryKey: ['contributionStats', contributionType, userId],
    queryFn: async () => {
      return await contributionService.getStats(contributionType, userId);
    },
    // Stats could change frequently, so use a reasonable staleTime
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
} 