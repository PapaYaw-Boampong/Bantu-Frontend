import { useMutation, useQueryClient } from '@tanstack/react-query';
import { sampleService } from '@/services/sampleService';
import { SampleType } from '@/types/sample';

interface DeleteSampleParams {
  sampleType: SampleType;
  sampleId: string;
}

export function useDeleteSample() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ sampleType, sampleId }: DeleteSampleParams) => {
      return await sampleService.deleteSample(sampleType, sampleId);
    },
    onSuccess: (_, variables) => {
      const { sampleType, sampleId } = variables;
      
      // Remove the specific sample from cache
      queryClient.removeQueries({ queryKey: [`${sampleType}Sample`, sampleId] });
      
      // Invalidate lists of samples for this type
      queryClient.invalidateQueries({ queryKey: [`${sampleType}Samples`] });
    },
  });
} 