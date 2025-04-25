import { useMutation, useQueryClient } from '@tanstack/react-query';
import { languageService } from '@/services/languageService';

type ToggleLanguageActivationInput = {
  id: string;
  is_active: boolean; // true = activate, false = deactivate
};

export const useToggleLanguageActivation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, is_active }: ToggleLanguageActivationInput) => {
      if (is_active) {
        await languageService.activateLanguage(id);
      } else {
        await languageService.deactivateLanguage(id);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['availableLanguages'] });
      queryClient.invalidateQueries({ queryKey: ['languages'] });
    },
  });
};
