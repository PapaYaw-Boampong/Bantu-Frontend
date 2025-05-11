import { useMutation, useQueryClient } from '@tanstack/react-query';
import { evaluationService } from '@/services/evaluationService';
import { EvaluationStepSubmit } from '@/types/evaluation';
import { ContributionType } from '@/types/contribution';

interface SubmitEvaluationStepParams {
  branchId: string;
  instanceId: string;
  languageId: string;
  contributionType: ContributionType;
  data: EvaluationStepSubmit;
}

export function useSubmitEvaluationStep() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({
      branchId,
      instanceId,
      languageId,
      contributionType,
      data,
    }: SubmitEvaluationStepParams) => {
      return await evaluationService.submitEvaluationStep(
        branchId,
        instanceId,
        languageId,
        contributionType,
        data
      );
    },
    onSuccess: (_, variables) => {
      // Invalidate the branch and instance
      queryClient.invalidateQueries({ queryKey: ['evaluationBranch', variables.branchId] });
      queryClient.invalidateQueries({ queryKey: ['evaluationInstance', variables.instanceId] });
      
      // Invalidate any evaluation steps related to this branch
      queryClient.invalidateQueries({ queryKey: ['evaluationSteps', variables.branchId] });
    },
  });
} 