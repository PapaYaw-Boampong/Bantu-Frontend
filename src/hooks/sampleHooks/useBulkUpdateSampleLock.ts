import { useMutation, useQueryClient } from '@tanstack/react-query';
import { sampleService } from '@/services/sampleService';
import { SampleLockUpdate, SampleType } from '@/types/sample';

interface BulkUpdateSampleLockParams {
  sampleType: SampleType;
  data: SampleLockUpdate;
}

export function useBulkUpdateSampleLock() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ sampleType, data }: BulkUpdateSampleLockParams) => {
      return await sampleService.bulkUpdateSampleLock(sampleType, data);
    },
    onSuccess: (_, variables) => {
      const { sampleType, data } = variables;
      
      // Invalidate each specific sample in cache
      data.sample_ids.forEach(sampleId => {
        queryClient.invalidateQueries({ queryKey: [`${sampleType}Sample`, sampleId] });
      });
      
      // Invalidate lists of samples for this type
      queryClient.invalidateQueries({ queryKey: [`${sampleType}Samples`] });
    },
  });
} 