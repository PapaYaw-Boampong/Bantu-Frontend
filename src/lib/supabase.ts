import { createClient } from '@supabase/supabase-js';
import type { Database } from '@/types/supabase';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey);

export type Profile = Database['public']['Tables']['profiles']['Row'];
export type AudioRecording = Database['public']['Tables']['audio_recordings']['Row'];
export type Transcription = Database['public']['Tables']['transcriptions']['Row'];
export type Translation = Database['public']['Tables']['translations']['Row'];
export type Dialect = Database['public']['Tables']['dialects']['Row'];