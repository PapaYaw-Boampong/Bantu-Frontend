import { useMutation, useQueryClient } from '@tanstack/react-query';
import { languageService } from '@/services/languageService';

export const useRemoveLanguage = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (languageId: string) => languageService.removeUserLanguage(languageId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['userLanguages'] });
      queryClient.invalidateQueries({ queryKey: ['availableLanguages'] });
    },
  });
};
