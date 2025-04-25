import api from '@/lib/api';
import { 
  Language,
  CreateLanguageRequest,
  UserLanguage,
  AddLanguageRequest,
  TopContributor,
  UpdateLanguageRequest,

} from '@/types/language';

class LanguageService {

  // Admin: Create new language
  async createLanguage(data: CreateLanguageRequest): Promise<Language> {
    const response = await api.post('/language/new', data);
    return response.data;
  }

  // Admin: Update a language
  async updateLanguage(languageId: string, data: UpdateLanguageRequest): Promise<UserLanguage> {
    const response = await api.put(`/${languageId}`, data);
    return response.data;
  }

  // Admin: deactivate a language
  async deactivateLanguage(languageId: string): Promise<void> {
    await api.put(`/language/deactivate/${languageId}`);
  }

  // Admin: activate a language
  async activateLanguage(languageId: string): Promise<void> {
    await api.put(`/language/activate/${languageId}`);
  }

  // Admin Methods
  async getTopContributors(timePeriod?: number, limit: number = 10): Promise<TopContributor[]> {
    const response = await api.get('/users/top-contributors', {
      params: { time_period: timePeriod, limit },
    });
    return response.data;
  }



  // General Methods

  // Fetch all supported languages
  async getLanguages(): Promise<Language[]> {
    const response = await api.get('/language/languages');
    return response.data;
  }

  // Get language by ID
  async getLanguageById(id: string): Promise<Language> {
    const response = await api.get(`/language/${id}`);
    return response.data;
  }

  




  // Language-related User Methods
  async getUserLanguages(): Promise<UserLanguage[]> {
    const response = await api.get('/language/userlanguages/me');
    return response.data;
  }

  // Assign a language to the current user
  async addUserLanguage(data: AddLanguageRequest): Promise<UserLanguage> {
    const response = await api.post('/language/userlanguages/add', data);
    return response.data;
  }
  
  // Remove user-language relationship
  async removeUserLanguage(language_id : string): Promise<void> {
    await api.delete(`/language/userlanguages/${language_id}`);
  }
  

}

export const languageService = new LanguageService(); 