import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { userService } from '@/services/userService';
import { languageService } from '@/services/languageService';

import { 
  UserProfile, 
  UserUpdate,
} from '@/types/user';

import { 
  Language,
  UserLanguage, 
  AddLanguageRequest, 
} from '@/types/language';
 
export function useProfile() {
  const queryClient = useQueryClient();

  // Fetch user profile data
  const { 
    data: profile,
    isLoading: profileLoading,
    isError: profileError,
    error: profileErrorData
  } = useQuery({
    queryKey: ['profile'],
    queryFn: userService.getProfile,
  });

  // Fetch languages data
  const { 
    data: languages = [],
    isLoading: languagesLoading, 
  } = useQuery({
    queryKey: ['languages'],
    queryFn: languageService.getLanguages,
  });

  // Fetch user languages
  const { 
    data: userLanguages = [],
    isLoading: userLanguagesLoading,
    refetch: refetchUserLanguages,
  } = useQuery({
    queryKey: ['userLanguages'],
    queryFn: languageService.getUserLanguages,
  });

  // Update profile mutation
  const updateProfileMutation = useMutation({
    mutationFn: (data: UserUpdate) => userService.updateProfile(data),
    onSuccess: (updatedProfile) => {
      queryClient.setQueryData(['profile'], updatedProfile);
    },
  });

  // Add language mutation
  const addLanguageMutation = useMutation({
    mutationFn: (data: AddLanguageRequest) => languageService.addUserLanguage(data),
    onSuccess: (newLanguage) => {
      queryClient.setQueryData(['userLanguages'], (old: UserLanguage[] = []) => [...old, newLanguage]);
    },
  });

  // Remove language mutation
  const removeLanguageMutation = useMutation({
    mutationFn: (languageId: string) => languageService.removeUserLanguage(languageId),
    onSuccess: (_, languageId) => {
      queryClient.setQueryData(['userLanguages'], (old: UserLanguage[] = []) => 
        old.filter(lang => lang.association_id !== languageId)
      );
    },
  });

  // Get available languages (languages not yet added by user)
  const getAvailableLanguages = () => {
    const userLanguageIds = userLanguages.map(ul => ul.language.id);
    return languages.filter(lang => !userLanguageIds.includes(lang.id));
  };

  return {
    profile,
    languages,
    userLanguages,
    loading: profileLoading || languagesLoading || userLanguagesLoading,
    error: profileError ? (profileErrorData as Error).message || 'Failed to fetch profile data' : null,
    updateProfile: updateProfileMutation.mutate,
    addLanguage: addLanguageMutation.mutate,
    removeLanguage: removeLanguageMutation.mutate,
    getAvailableLanguages,
  };
}