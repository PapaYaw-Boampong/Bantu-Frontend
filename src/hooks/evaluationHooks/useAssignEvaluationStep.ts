import { useMutation, useQueryClient } from '@tanstack/react-query';
import { evaluationService } from '@/services/evaluationService';
import { ContributionType } from '@/types/contribution';

interface AssignEvaluationStepParams {
  proficiencyLevel: number;
  contributionType: ContributionType;
  challengeId?: string;
  languageId?: string;
  numSteps?: number;
}

export function useAssignEvaluationSteps() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({
      proficiencyLevel,
      contributionType,
      challengeId,
      languageId,
      numSteps = 3,
    }: AssignEvaluationStepParams) => {
      return await evaluationService.assignEvaluationStep(
        proficiencyLevel,
        contributionType,
        challengeId,
        languageId,
        numSteps
      );
    },
    onSuccess: (assignments) => {
      // Invalidate any global lists of assigned evaluations
      queryClient.invalidateQueries({ queryKey: ['assignedEvaluations'] });
      
      // Update or add each assigned step to the cache
      assignments.forEach(assignment => {
        queryClient.setQueryData(['evaluationStep', assignment.step_id], {
          id: assignment.step_id,
          branch_id: assignment.branch_id,
          head: assignment.head,
          is_complete: false,
          step_number: assignment.depth,
        });
      });
    },
  });
} 


