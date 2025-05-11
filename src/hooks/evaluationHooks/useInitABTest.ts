import { useMutation, useQueryClient } from '@tanstack/react-query';
import { evaluationService } from '@/services/evaluationService';
import { ContributionType } from '@/types/contribution';

interface InitABTestParams {
  instanceId: string;
  contributionType: ContributionType;
  winners?: number;
}

export function useInitABTest() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({
      instanceId,
      contributionType,
      winners = 1,
    }: InitABTestParams) => {
      return await evaluationService.initABTest(
        instanceId,
        contributionType,
        winners
      );
    },
    onSuccess: (newABTest, variables) => {
      // Add the new AB test to the cache
      queryClient.setQueryData(['abTest', newABTest.id], newABTest);
      
      // Update the evaluation instance to include this AB test
      queryClient.setQueryData(
        ['evaluationInstance', variables.instanceId], 
        (oldData: any) => oldData ? {
          ...oldData,
          ab_test: newABTest
        } : undefined
      );
      
      // Invalidate any lists of AB tests
      queryClient.invalidateQueries({ queryKey: ['abTests'] });
    },
  });
} 