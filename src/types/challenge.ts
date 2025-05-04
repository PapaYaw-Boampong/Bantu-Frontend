import { ChallengeReward, ChallengeRewardUpdate } from "@/types/rewards";

export enum EventType {
    DATA_COLLECTION = "data_collection",
    SAMPLE_REVIEW = "data_review"
}


export enum TaskType {
  TRANSCRIPTION = 'transcription',
  TRANSLATION = 'translation',
  ANNOTATION = 'annotation',
}

export enum EventCategory {
  COMPETITION = 'time_based_competition',
  BOUNTY = 'bounty',
}


export enum ChallengeStatus {
  UPCOMING = 'upcoming',
  Active = 'active',
  COMPLETED = 'completed',
}

export interface ChallengeCreate {
  challenge_name: string;
  language_id: string;
  description?: string;
}

export interface Challenge extends ChallengeCreate {
  id: string;
  event_type: EventType;
  task_type: TaskType;
  event_category: EventCategory;
  start_date: string;
  end_date: string;
  status: ChallengeStatus;
  is_public: boolean;
  is_published: boolean;
  challenge_reward?: string;
  participant_count?: number;
  completion_percent?: number;
  created_at?: string;
  image_url?: string;
}

export interface ChallengeUpdate {
  id?: string;
  creator_id?: string;
  challenge_name?: string;
  language_id?: string;
  description?: string;
  event_type?: EventType;
  task_type?: TaskType;
  event_category?: EventCategory;
  start_date?: string;
  end_date?: string;
  challenge_status?: ChallengeStatus;
  is_public?: boolean;
  is_published?: boolean;
  target_contribution_count?: number;
  challenge_reward_id?: string; // Reward is a separate object
}



export interface ChallengeSaveRequest {
  challenge_data: ChallengeUpdate;
  challenge_rules?: ChallengeRule[];
  challenge_reward?: ChallengeRewardUpdate;
}



export interface RewardUpdate {
  id?: string;
  reward_type: string;
  reward_value: number | string;
  reward_distribution_type: string;
  description?: string;
}

export interface ChallengeParticipant {
  user_id: string;
  username: string;
  name: string;
  points: number;
  hours_speech: number;
  sentences_translated: number;
  tokens_produced: number;
  acceptance_rate: number;
}


export interface ChallengeSummary {
  id: string;
  challenge_name: string;
  description?: string;
  event_type: EventType;
  task_type: TaskType;
  event_category: EventCategory;
  start_date: string;
  end_date: string;
  status: ChallengeStatus;
  is_public: boolean;
  is_published: boolean;
  participant_count?: number;
  created_at: string;
  image_url?: string;
}

export interface ChallengeDetailResponse extends ChallengeSummary {
  reward: string;
  created_at: string;
  rules?: ChallengeRule[];
  reward_configuration?: any;
  target_contribution_count?: number;
  language_id: string;
  challenge_reward_id?: string;
}


export interface GetChallenges {
  creator_id?: string;
  language_id?: string;
  status?: ChallengeStatus;
  event_type?: EventType;
  task_type?: TaskType;
  event_category?: EventCategory;
  is_public?: boolean;
  is_published?: boolean;
  skip?: number;
  limit?: number;
}

export interface UserChallengeFilter {
  skip?: number;
  limit?: number;
  status?: ChallengeStatus;
  include_challenge_details?: boolean;
}

export interface ChallengeRule {
  rule_id?: string;
  rule_title: string;
  rule_description: string;
  is_required: boolean;
}

export interface ChallengeRulesAdd {
  challenge_id: string;
  rules: ChallengeRule[];
}


// Define the expected shape of one leaderboard entry
export interface LeaderboardEntry {
  user_id: string;
  username: string;
  name: string;
  points: number;
  hours_speech: number;
  sentences_translated: number;
  tokens_produced: number;
  acceptance_rate: number;
}

// Define the shape of the paginated response
export interface LeaderboardPage {
  items: LeaderboardEntry[];
  skip: number;
  limit: number;
  has_next: boolean;
}
