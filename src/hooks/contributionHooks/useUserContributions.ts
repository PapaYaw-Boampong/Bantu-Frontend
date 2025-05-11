import { useQuery } from '@tanstack/react-query';
import { contributionService } from '@/services/contributionService';
import { ContributionFilter } from '@/types/contribution';

export function useUserContributions(filters?: ContributionFilter) {
  return useQuery({
    queryKey: ['contributions', 'user', filters],
    queryFn: async () => {
      return await contributionService.getUserContributions(filters);
    },
    // Use a reasonable staleTime since contribution data doesn't change that often
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
} 