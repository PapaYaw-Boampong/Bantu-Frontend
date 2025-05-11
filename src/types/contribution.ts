export type ContributionType = 'transcription' | 'translation' | 'annotation' |  'evaluation' 
export interface ContributionCreate {
  target_text?: string;
  target_url?: string;
  speech_length?: number;
  sample_text?: string;
  img_url?: string;
}

export interface ContributionUpdate {
  target_text?: string;
  speech_length?: number;
  target_url?: string;
  active?: boolean;
  flagged?: boolean;
  accepted?: boolean;
}

export interface ContributionFilter {
  user_id?: string;
  sample_id?: string;
  evaluation_instance_id?: string;
  active?: boolean;
  flagged?: boolean;
  accepted?: boolean;
  created_after?: string;
  created_before?: string;
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
  target_url?: string;
  speech_length?: number;
  active: boolean;
  flagged: boolean;
  accepted: boolean;
  created_at: string;
  updated_at: string;
}
