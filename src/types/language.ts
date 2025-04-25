// Base language interface
export interface Language {
  id: string;
  name: string;
  code: string;
  description?: string;
}

// Types for language operations
export interface CreateLanguageRequest {
  name: string;
  code: string;
  description?: string;
}

export interface UpdateLanguageRequest {
  name?: string;
  code?: string;
  description?: string;
}

// Types for user language preferences
export interface UserLanguage {
  association_id: string;
  proficiency: ProficiencyLevel;
  language: Language;


}

// Types for user language operations
export interface AddLanguageRequest {
  language_id: string;
  proficiency: ProficiencyLevel;
}

export interface UpdateLanguageRequest {
  language_id?: string;
  proficiency_level?: ProficiencyLevel;
}

// Types for admin operations
export interface TopContributor {
  id: string;
  username: string;
  fullname: string;
  reputation_score: number;
  contributions_count: number;
}

// Enums
export enum ProficiencyLevel {
  BEGINNER = 'beginner',
  INTERMEDIATE = 'intermediate',
  ADVANCED = 'advanced',
  NATIVE = 'native'
} 
