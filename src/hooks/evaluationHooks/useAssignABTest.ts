import { useMutation, useQueryClient } from '@tanstack/react-query';
import { evaluationService } from '@/services/evaluationService';

interface AssignABTestParams {
  userId: string;
  proficiencyLevel?: number;
  abTestId?: string;
}

export function useAssignABTest() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({
      userId,
      proficiencyLevel = 1,
      abTestId,
    }: AssignABTestParams) => {
      return await evaluationService.assignABTest(
        userId,
        proficiencyLevel,
        abTestId
      );
    },
    onSuccess: (assignment) => {
      // Invalidate any global lists of assigned AB tests
      queryClient.invalidateQueries({ queryKey: ['assignedABTests'] });
      
      // Cache the assignment for quick access
      if (assignment && assignment.pair_id) {
        queryClient.setQueryData(['abTestAssignment', assignment.pair_id], assignment);
      }
    },
  });
} 