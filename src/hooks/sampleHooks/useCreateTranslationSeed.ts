import { useMutation, useQueryClient } from '@tanstack/react-query';
import { sampleService } from '@/services/sampleService';
import { 
  TranslationSeedCreate,
  TranslationSeed
} from '@/types/sample';

export function useCreateTranslationSeed() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (data: TranslationSeedCreate) => {
      return await sampleService.createTranslationSeed(data);
    },
    onSuccess: (newSeed: TranslationSeed) => {
      // Add the new seed to the cache
      queryClient.setQueryData(['translationSeed', newSeed.id], newSeed);
      
      // Invalidate the list of translation seeds
      queryClient.invalidateQueries({ queryKey: ['translationSeeds'] });
      
      // If category-specific lists exist, invalidate them too
      if (newSeed.category) {
        queryClient.invalidateQueries({ 
          queryKey: ['translationSeeds', { category: newSeed.category }] 
        });
      }
    },
  });
} 