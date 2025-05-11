import { useState, useEffect } from 'react';
import { userService } from '@/services/userService';
import { languageService } from '@/services/languageService';

import { 
  UserProfile, 
  UserUpdate,
  // UpdateLanguageRequest,
} from '@/types/user';

import { 
  Language,
  UserLanguage, 
  AddLanguageRequest, 
} from '@/types/language';
 
export function useProfile() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [languages, setLanguages] = useState<Language[]>([]);
  const [userLanguages, setUserLanguages] = useState<UserLanguage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch initial data
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [profileData, languagesData, userLanguagesData] = await Promise.all([
          userService.getProfile(),
          languageService.getLanguages(),
          languageService.getUserLanguages()
        ]);
        setProfile(profileData);
        setLanguages(languagesData);
        setUserLanguages(userLanguagesData);
      } catch (err: any) {
        setError(err.response?.data?.detail || 'Failed to fetch profile data');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Update profile
  const updateProfile = async (data: UserUpdate) => {
    try {
      setError(null);
      const updatedProfile = await userService.updateProfile(data);
      setProfile(updatedProfile);
      return updatedProfile;
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to update profile');
      throw err;
    }
  };

  // Add language association
  const addLanguage = async (data: AddLanguageRequest) => {
    try {
      setError(null);
      const newLanguage = await languageService.addUserLanguage(data);
      setUserLanguages(prev => [...prev, newLanguage]);
      return newLanguage;
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to add language');
      throw err;
    }
  };

  // Update language
  // const updateLanguage = async (languageId: string, data: UpdateLanguageRequest) => {
  //   try {
  //     setError(null);
  //     const updatedLanguage = await userService.updateLanguage(languageId, data);
  //     setUserLanguages(prev => 
  //       prev.map(lang => 
  //         lang.language.id === languageId ? updatedLanguage : lang
  //       )
  //     );
  //     return updatedLanguage;
  //   } catch (err: any) {
  //     setError(err.response?.data?.detail || 'Failed to update language');
  //     throw err;
  //   }
  // };

  // Remove language
  const removeLanguage = async (languageId: string) => {
    try {
      setError(null);
      await languageService.removeUserLanguage(languageId);
      setUserLanguages(prev => 
        prev.filter(lang => lang.association_id !== languageId)
      );
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to remove language');
      throw err;
    }
  };

  // Get available languages (languages not yet added by user)
  const getAvailableLanguages = () => {
    const userLanguageIds = userLanguages.map(ul => ul.language.id);
    return languages.filter(lang => !userLanguageIds.includes(lang.id));
  };

  return {
    profile,
    languages,
    userLanguages,
    loading,
    error,
    updateProfile,
    addLanguage,
    // updateLanguage,
    removeLanguage,
    getAvailableLanguages,
  };

}