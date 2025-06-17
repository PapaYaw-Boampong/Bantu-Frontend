import api from '@/lib/api';
import {
  Milestone,
  MilestoneCreate,
  MilestoneUpdate,
  UserMilestone,
  ChallengeReward,
  ChallengeRewardCreate,
  ChallengeRewardUpdate,
  UserChallengeReward,
  UserChallengeRewardCreate,
  GetRewardsQuery,
} from '@/types/rewards';

class RewardService {
  private baseUrl = '/rewards';

  // ===== Milestones =====
  async getMilestones(): Promise<Milestone[]> {
    const response = await api.get('/rewards/milestones');
    return response.data;
  }

  async createMilestone(data: MilestoneCreate): Promise<Milestone> {
    const response = await api.post('/rewards/milestones', data);
    return response.data;
  }

  async updateMilestone(id: string, data: MilestoneUpdate): Promise<Milestone> {
    const response = await api.put(`/rewards/milestones/${id}`, data);
    return response.data;
  }

  async deleteMilestone(id: string): Promise<void> {
    await api.delete(`/rewards/milestones/${id}`);
  }

  // ===== User Milestones =====
  async awardMilestone(data: { user_id: string; milestone_id: string }): Promise<UserMilestone> {
    const res = await api.post(`${this.baseUrl}/user-milestones`, data);
    return res.data;
  }

  async getUserMilestones(): Promise<UserMilestone[]> {
    const response = await api.get('/rewards/user/milestones');
    return response.data;
  }

  async getMyMilestones(): Promise<UserMilestone[]> {
    const response = await api.get('/rewards/user-milestones/me');
    return response.data;
  }
  

  async deleteUserMilestone(id: string): Promise<void> {
    await api.delete(`${this.baseUrl}/user-milestones/${id}`);
  }

  // ===== Challenge Rewards =====
  async getChallengeRewards(query?: GetRewardsQuery): Promise<ChallengeReward[]> {
    const response = await api.get('/rewards/challenge-rewards', { params: query });
    return response.data;
  }

  async createChallengeReward(data: ChallengeRewardCreate): Promise<ChallengeReward> {
    const response = await api.post('/rewards/challenge-rewards', data);
    return response.data;
  }

  async getChallengeReward(id: string): Promise<ChallengeReward> {
    const res = await api.get(`${this.baseUrl}/challenge-rewards/${id}`);
    return res.data;
  }

  async updateChallengeReward(id: string, data: ChallengeRewardUpdate): Promise<ChallengeReward> {
    const response = await api.put(`/rewards/challenge-rewards/${id}`, data);
    return response.data;
  }

  async deleteChallengeReward(id: string): Promise<void> {
    await api.delete(`/rewards/challenge-rewards/${id}`);
  }

  // ===== User Challenge Rewards =====

  async getUserChallengeRewards(userId: string): Promise<UserChallengeReward[]> {
    const res = await api.get(`${this.baseUrl}/user-challenge-rewards/${userId}`);
    return res.data;
  }

  async getChallengeRewardWinners(challengeId: string): Promise<UserChallengeReward[]> {
    const res = await api.get(`${this.baseUrl}/challenge-reward-winners/${challengeId}`);
    return res.data;
  }

  // Reward Claims Management (Admin)
  async getPendingRewardClaims(): Promise<any[]> {
    const response = await api.get('/rewards/claims/pending');
    return response.data;
  }

  async processRewardClaim(claimId: string, approved: boolean): Promise<any> {
    const response = await api.post(`/rewards/claims/${claimId}/process`, { approved });
    return response.data;
  }

  // User Rewards (User)
  async getUserRewards(): Promise<any[]> {
    const response = await api.get('/rewards/user/rewards');
    return response.data;
  }

  async claimReward(rewardId: string, paymentDetails: any): Promise<any> {
    const response = await api.post(`/rewards/user/rewards/${rewardId}/claim`, paymentDetails);
    return response.data;
  }
}

export const rewardService = new RewardService();
