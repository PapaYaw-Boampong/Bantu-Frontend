import { useMutation, useQueryClient } from '@tanstack/react-query';
import { languageService } from '@/services/languageService';
import { CreateLanguageRequest } from '@/types/language';

export const useCreateLanguage = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateLanguageRequest) => languageService.createLanguage(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['availableLanguages'] });
      queryClient.invalidateQueries({ queryKey: ['languages'] });
    }
  });
};
