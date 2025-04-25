import { useMemo } from 'react';
import { useLanguages } from './useLanguages';
import { useGetUserLanguages } from './useGetUserLanguages';

export const useAvailableLanguages = () => {
  const { data: languages = [], isLoading: loadingLanguages } = useLanguages();
  const { data: userLanguages = [], isLoading: loadingUserLanguages } = useGetUserLanguages();

  const availableLanguages = useMemo(() => {
    const userLanguageIds = userLanguages.map((ul) => ul.language.id);
    return languages.filter((lang) => !userLanguageIds.includes(lang.id));
  }, [languages, userLanguages]);

  return {
    availableLanguages,
    isLoading: loadingLanguages || loadingUserLanguages,
  };
};