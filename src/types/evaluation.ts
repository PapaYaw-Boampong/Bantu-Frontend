import { ContributionType } from './contribution';
import { 
  AnnotationContributionRead,
  TranscriptionContributionRead,
  TranslationContributionRead
} from './contribution';

export interface EvaluationStepSubmit {
  eval_decision?: boolean;
  correction_id?: string;
  run_abtest: boolean;
  abtest_decision?: string;

}

export interface EvaluationInstanceCreate {
  sample_id: string;
  contribution_type: ContributionType;
  num_branches: number;
}

export interface EvaluationFilter {
  is_complete?: boolean;
  challenge_id?: string;
  language_id?: string;
}

export interface ABTestVoteSubmit {
  selected_contribution_ids: string[];
  contribution_type: ContributionType;
  challenge_id?: string;
  language_id?: string;
}



export interface EvaluationStep {
  id: string;
  branch_id: string;
  instance_id?: string;
  contribution_id?: string; 
  a_contribution_id?: string;
  b_contribution_id?: string;
  next_alt_contribution_id?: string;
  user_id?: string;
  evaluation_decision?: boolean;
  abtest_decision?: 'a' | 'b';
  is_complete: boolean;
  head: boolean;
  step_number: number;
  run_abtest: boolean;
  assigned_at?: string;
}


export type ContributionVariant =
  | AnnotationContributionRead
  | TranscriptionContributionRead
  | TranslationContributionRead;

export interface ModifiedEvaluationStep {
  step_id: string;
  branch_id: string;
  abtest_decision?: 'a' | 'b';
  step_number: number;
  run_ab_test: boolean;
  assigned_at?: string;

  contributions?: {
    a_contribution?: ContributionVariant;
    b_contribution: ContributionVariant;
  };
}


export interface EvaluationBranch {
  id: string;
  instance_id: string;
  current_contribution_id?: string;
  depth: number;
  max_depth: number;
  is_complete: boolean;
  event_id?: string;
  steps?: EvaluationStep[];
}

export interface EvaluationInstance {
  id: string;
  num_branches: number;
  is_complete: boolean;
  num_completed_branches: number;
  ab_test?: ABTest;
  branches?: EvaluationBranch[];
  task_type?: ContributionType;
}

export interface ABTestPair {
  id: string;
  ab_test_id: string;
  stage_number: number;
  contribution_a_id: string;
  contribution_b_id: string;
  winner_ids: string[];
  is_complete: boolean;
  votes?: ABTestVote[];
  min_votes_required: number;
  metrics: Record<string, any>;
}

export interface ABTestVote {
  id: string;
  pair_id: string;
  user_id: string;
  selected_contribution_ids: string[];
  vote_assigned_at?: string;
  vote_submitted_at?: string;
  user_proficiency?: number;
  a_shown_first?: boolean;
  pair?: ABTestPair;
}

export interface ABTest {
  id: string;
  instance_id: string;
  target_winner_count: number;
  stage_count: number;
  current_stage: number;
  test_depth: number;
  min_stage_depth?: number;
  min_votes_threshold?: number;
  is_complete: boolean;
  completed_at?: string;
  final_winner_ids?: string[];
  contribution_type?: ContributionType;
}

export interface ABTestAssignment {
  ab_test_id: string;
  pair_id: string;
  vote_id: string;
  stage_number: number;
  option_a: {
    id: string;
    content: string;
  };
  option_b: {
    id: string;
    content: string;
  };
  a_shown_first: boolean;
}

export interface EvaluationAssignment {
  task_type: string;
  branch_id: string;
  depth: number;
  max_depth: number;
  step_id: string;
  head: boolean;
  note: string;
  step_data: ModifiedEvaluationStep;
}
