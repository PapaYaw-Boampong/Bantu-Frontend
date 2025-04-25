import { useQuery } from '@tanstack/react-query';
import { languageService } from '@/services/languageService';

export const useGetUserLanguages = () => {
  return useQuery({
    queryKey: ['userLanguages'],
    queryFn: languageService.getUserLanguages,
  });
};
