export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          full_name: string | null
          country: string | null
          native_language: string | null
          preferred_dialects: string[] | null
          contribution_count: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          full_name?: string | null
          country?: string | null
          native_language?: string | null
          preferred_dialects?: string[] | null
          contribution_count?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          full_name?: string | null
          country?: string | null
          native_language?: string | null
          preferred_dialects?: string[] | null
          contribution_count?: number
          created_at?: string
          updated_at?: string
        }
      }
      dialects: {
        Row: {
          id: string
          name: string
          code: string
          description: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          code: string
          description?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          code?: string
          description?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      audio_recordings: {
        Row: {
          id: string
          user_id: string | null
          dialect_id: string | null
          storage_path: string
          duration_seconds: number | null
          status: Database['public']['Enums']['contribution_status']
          is_generated_prompt: boolean
          prompt_text: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id?: string | null
          dialect_id?: string | null
          storage_path: string
          duration_seconds?: number | null
          status?: Database['public']['Enums']['contribution_status']
          is_generated_prompt?: boolean
          prompt_text?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string | null
          dialect_id?: string | null
          storage_path?: string
          duration_seconds?: number | null
          status?: Database['public']['Enums']['contribution_status']
          is_generated_prompt?: boolean
          prompt_text?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      transcriptions: {
        Row: {
          id: string
          recording_id: string
          user_id: string | null
          text: string
          is_asr_generated: boolean
          confidence_score: number | null
          review_status: Database['public']['Enums']['review_status']
          reviewed_by: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          recording_id: string
          user_id?: string | null
          text: string
          is_asr_generated?: boolean
          confidence_score?: number | null
          review_status?: Database['public']['Enums']['review_status']
          reviewed_by?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          recording_id?: string
          user_id?: string | null
          text?: string
          is_asr_generated?: boolean
          confidence_score?: number | null
          review_status?: Database['public']['Enums']['review_status']
          reviewed_by?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      translations: {
        Row: {
          id: string
          transcription_id: string
          user_id: string | null
          text: string
          target_language: string
          is_machine_generated: boolean
          confidence_score: number | null
          review_status: Database['public']['Enums']['review_status']
          reviewed_by: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          transcription_id: string
          user_id?: string | null
          text: string
          target_language?: string
          is_machine_generated?: boolean
          confidence_score?: number | null
          review_status?: Database['public']['Enums']['review_status']
          reviewed_by?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          transcription_id?: string
          user_id?: string | null
          text?: string
          target_language?: string
          is_machine_generated?: boolean
          confidence_score?: number | null
          review_status?: Database['public']['Enums']['review_status']
          reviewed_by?: string | null
          created_at?: string
          updated_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      contribution_status: 'pending' | 'processing' | 'completed' | 'error'
      contribution_type: 'recording' | 'transcription' | 'translation'
      review_status: 'pending' | 'approved' | 'rejected'
    }
  }
}