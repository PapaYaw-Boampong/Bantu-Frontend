// /hooks/language/useLanguages.ts
import { useQuery } from '@tanstack/react-query';
import { languageService } from '@/services/languageService';

export const useLanguages = () => {
  return useQuery({
    queryKey: ['languages'],
    queryFn: languageService.getLanguages,
  });
};
