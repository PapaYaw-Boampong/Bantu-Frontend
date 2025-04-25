import { useMutation, useQueryClient } from '@tanstack/react-query';
import { languageService } from '@/services/languageService';
import { UpdateLanguageRequest } from '@/types/language';
type UpdateLanguageInput = {
    id: string;
    data: UpdateLanguageRequest;
  };
  

export const useUpdateLanguage = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({data, id } : UpdateLanguageInput) => languageService.updateLanguage(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['availableLanguages'] });
        queryClient.invalidateQueries({ queryKey: ['languages'] });
        queryClient.invalidateQueries({ queryKey: ['userLanguages'] });
    }
  });
};
