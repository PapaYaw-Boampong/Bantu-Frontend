// Enums for Reward Type and Distribution Type
export enum RewardType {
    CASH = 'cash',
    POINTS = 'points',
    BADGE = 'badge',
    SWAG = 'swag',
  }
  
  export enum DistributionMethod {
    FIXED = 'fixed',
    PERCENTAGE = 'percentage',
    TIERED = 'tiered',
  }
  
  // Milestone Types
  export interface Milestone {
    id: string;
    name: string;
    description?: string;
    reward_type: RewardType;
    reward_value: Record<string, any>;
    required_actions: number;
  }
  
  export interface MilestoneCreate {
    name: string;
    description?: string;
    reward_type: RewardType;
    reward_value: Record<string, any>;
    required_actions: number;
  }
  
  export interface MilestoneUpdate {
    name?: string;
    description?: string;
    reward_type?: RewardType;
    reward_value?: Record<string, any>;
    required_actions?: number;
  }
  
  export interface UserMilestone {
    id: string;
    user_id: string;
    milestone_id: string;
    achieved_at: string;
  }
  
  export interface UserMilestoneCreate {
    user_id: string;
    milestone_id: string;
    achieved_at?: string; // Defaults to current date if not provided
  }
  
  // Challenge Reward Types
  export interface ChallengeReward {
    id: string;
    reward_type: RewardType;
    reward_distribution_type: DistributionMethod;
    reward_value: Record<string, any>;
    created_at: string;
    claimed: boolean;
  }
  
  export interface ChallengeRewardCreate {
    reward_type: RewardType;
    reward_distribution_type: DistributionMethod;
    reward_value: Record<string, any>;
  }
  
  export interface ChallengeRewardUpdate {
    id?: string;
    reward_type?: RewardType;
    reward_value?: string | Record<string, any>; 
    reward_distribution_type?: DistributionMethod;
  }
  
  export interface GetRewardsQuery {
    reward_type?: RewardType;
    skip: number;
    limit: number;
  }
  
  // User Challenge Reward Types
  export interface UserChallengeReward {
    id: string;
    user_id: string;
    reward_id: string;
    rank: number;
    amount?: number; // Derived from reward_value (if necessary)
    claimed: boolean;
    challenge_id: string;
    awarded_at: string;
  }
  
  export interface UserChallengeRewardCreate {
    user_id: string;
    reward_id: string;
    challenge_id: string;
    rank: number;
    awarded_at?: string; // Defaults to current date if not provided
  }
  

  // Define types for reward configuration
export interface RewardConfiguration {
  reward_type: RewardType;
  distribution_method: DistributionMethod;
  amount?: number;
  currency?: string;
  badge_name?: string;
  badge_icon?: string;
  badge_description?: string;
  coupon_code?: string;
  badge_image?: string;
  swag_item?: string;
  swag_description?: string;
  tiers?: {
    rank: number;
    label: string;
    amount: number;
    threshold?: number;
    description?: string;
  }[];
}