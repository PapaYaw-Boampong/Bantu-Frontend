import { useMutation, useQueryClient } from '@tanstack/react-query';
import { evaluationService } from '@/services/evaluationService';

interface AssignABTestParams {
  proficiencyLevel?: number;
  abTestId?: string;
  batch_size?: number;
}

export function useAssignABTests() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({
      proficiencyLevel = 3,
      batch_size = 3,
      abTestId,
    }: AssignABTestParams) => {
      return await evaluationService.assignABTest(
        proficiencyLevel,
        batch_size,
        abTestId
      );
    },
    onSuccess: (assignments) => {
      queryClient.invalidateQueries({ queryKey: ['assignedABTests'] });
     
      if (Array.isArray(assignments)) {
        assignments.forEach((assignment) => {
          if (assignment?.pair_id) {
            queryClient.setQueryData(['abTestAssignment', assignment.pair_id], assignment);
          }
        });
      }
    },

  });

} 
