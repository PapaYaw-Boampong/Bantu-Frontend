export type ContributionType = 'transcription' | 'translation' | 'annotation' |  'evaluation' 
export interface ContributionCreate {
  id?: string
  target_text?: string;
  file_name?: string;
  speech_length?: number;
  sample_text?: string;
  img_url?: string;
}

export interface ContributionStats {
  total_contributions: number;
  passed_contributions: number;
  flagged_contributions: number;
  contribution_counts: Record<string, number>;
  user_ranking?: number;
}

export interface Contribution {
  id: string;
  user_id: string;
  sample_id?: string;
  language_id: string;
  challenge_id?: string;
  contribution_type: ContributionType;
  target_text?: string;
  signed_url?: string;
  speech_length?: number;
  active: boolean;
  flagged: boolean;
  accepted: boolean;
  created_at: string;
  updated_at: string;
}


export interface ContributionBase {
  id: string;
  user_id: string;
  sample_id: string;
  created_at: string;
  accepted: boolean;
  flagged: boolean;
  ancestors: Record<string, any[]>;
  max_eval_depth: number;
}

export interface AnnotationContributionRead extends ContributionBase {
  target_text: string;
  signed_url?: string;
}

export interface TranscriptionContributionRead extends ContributionBase {
  sample_text: string;
  signed_url?: string;
}

export interface TranslationContributionRead extends ContributionBase {
  target_text: string;
  sample_text: string;
}
