import { UserLanguage } from './language';

// Base user interface
export interface User {
  id: string;
  username: string;
  email: string;
  fullname: string;
  country: string;
  role: number;
  is_active: boolean;
  created_at: string;
  updated_at: string | null;
}

// User profile with additional fields
export interface UserProfile extends User {
  reputation_score: number;
  contributions_count: number;
  languages: UserLanguage[];
}

// Types for user profile updates
export interface UserUpdate {
  username?: string;
  email?: string;
  fullname?: string;
}

