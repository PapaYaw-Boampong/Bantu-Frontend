import { useMutation, useQueryClient } from '@tanstack/react-query';
import { evaluationService } from '@/services/evaluationService';
import { 
  EvaluationInstanceCreate,
  EvaluationInstance
} from '@/types/evaluation';

export function useCreateEvaluationInstance() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (data: EvaluationInstanceCreate) => {
      return await evaluationService.createEvaluationInstance(data);
    },
    onSuccess: (newInstance: EvaluationInstance) => {
      // Add the new instance to the cache
      queryClient.setQueryData(['evaluationInstance', newInstance.id], newInstance);
      
      // Invalidate any lists of evaluation instances
      queryClient.invalidateQueries({ queryKey: ['evaluationInstances'] });
    },
  });
} 