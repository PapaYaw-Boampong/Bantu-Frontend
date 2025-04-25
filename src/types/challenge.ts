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
  COMPETITION = 'competition',
  TRAINING = 'training',
  CROWDSOURCING = 'crowdsourcing',
}

export enum ChallengeStatus {
  UPCOMING = 'upcoming',
  ONGOING = 'ongoing',
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
}

export interface ChallengeUpdate {
  challenge_name?: string;
  language_id?: string;
  description?: string;
  event_type?: EventType;
  task_type?: TaskType;
  event_category?: EventCategory;
  start_date?: string;
  end_date?: string;
  status?: ChallengeStatus;
  is_public?: boolean;
  is_published?: boolean;
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
}

export interface ChallengeDetailResponse extends ChallengeSummary {
  reward: string;
  created_at: string;
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
