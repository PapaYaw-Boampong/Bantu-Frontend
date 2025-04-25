import { useMutation, useQueryClient } from '@tanstack/react-query';
import { languageService } from '@/services/languageService';
import { AddLanguageRequest } from '@/types/language';

export const useAddLanguage = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: AddLanguageRequest) => languageService.addUserLanguage(data),
    onSuccess: () => {
       queryClient.invalidateQueries({ queryKey: ['userLanguages'] });
      queryClient.invalidateQueries({ queryKey: ['availableLanguages'] });
    }
  });
};
