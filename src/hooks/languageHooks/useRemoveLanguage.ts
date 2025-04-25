import { useMutation, useQueryClient } from '@tanstack/react-query';
import { languageService } from '@/services/languageService';


export const useRemoveLanguage = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (language_id: string) => languageService.removeUserLanguage(language_id),
    onSuccess: () => {
       queryClient.invalidateQueries({ queryKey: ['userLanguages'] });
      queryClient.invalidateQueries({ queryKey: ['availableLanguages'] });
    }
  });
};
