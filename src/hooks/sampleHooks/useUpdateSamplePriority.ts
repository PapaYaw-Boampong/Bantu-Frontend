import { useMutation, useQueryClient } from '@tanstack/react-query';
import { sampleService } from '@/services/sampleService';
import { SamplePriorityUpdate, SampleType } from '@/types/sample';

interface UpdateSamplePriorityParams {
  sampleType: SampleType;
  sampleId: string;
  data: SamplePriorityUpdate;
}

export function useUpdateSamplePriority() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ sampleType, sampleId, data }: UpdateSamplePriorityParams) => {
      return await sampleService.updateSamplePriority(sampleType, sampleId, data);
    },
    onSuccess: (_, variables) => {
      const { sampleType, sampleId } = variables;
      
      // Invalidate the specific sample in cache
      queryClient.invalidateQueries({ queryKey: [`${sampleType}Sample`, sampleId] });
      
      // Invalidate lists of samples for this type
      queryClient.invalidateQueries({ queryKey: [`${sampleType}Samples`] });
    },
  });
} 