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
  async createMilestone(data: MilestoneCreate): Promise<Milestone> {
    const res = await api.post(`${this.baseUrl}/milestones`, data);
    return res.data;
  }

  async listMilestones(): Promise<Milestone[]> {
    const res = await api.get(`${this.baseUrl}/milestones`);
    return res.data;
  }

  async getMilestone(id: string): Promise<Milestone> {
    const res = await api.get(`${this.baseUrl}/milestones/${id}`);
    return res.data;
  }

  async updateMilestone(id: string, data: MilestoneUpdate): Promise<Milestone> {
    const res = await api.put(`${this.baseUrl}/milestones/${id}`, data);
    return res.data;
  }

  async deleteMilestone(id: string): Promise<void> {
    await api.delete(`${this.baseUrl}/milestones/${id}`);
  }

  // ===== User Milestones =====
  async awardMilestone(data: { user_id: string; milestone_id: string }): Promise<UserMilestone> {
    const res = await api.post(`${this.baseUrl}/user-milestones`, data);
    return res.data;
  }

  async getUserMilestones(userId: string): Promise<UserMilestone[]> {
    const res = await api.get(`${this.baseUrl}/user-milestones/${userId}`);
    return res.data;
  }

  async getMyMilestones(): Promise<UserMilestone[]> {
    const response = await api.get('/rewards/user-milestones/me');
    return response.data;
  }
  

  async deleteUserMilestone(id: string): Promise<void> {
    await api.delete(`${this.baseUrl}/user-milestones/${id}`);
  }

  // ===== Challenge Rewards =====
  async createChallengeReward(data: ChallengeRewardCreate): Promise<ChallengeReward> {
    const res = await api.post(`${this.baseUrl}/challenge-rewards`, data);
    return res.data;
  }

  async getChallengeReward(id: string): Promise<ChallengeReward> {
    const res = await api.get(`${this.baseUrl}/challenge-rewards/${id}`);
    return res.data;
  }

  async listChallengeRewards(query?: GetRewardsQuery): Promise<ChallengeReward[]> {
    const res = await api.get(`${this.baseUrl}/challenge-rewards`, {
      params: query,
    });
    return res.data;
  }

  async updateChallengeReward(id: string, data: ChallengeRewardUpdate): Promise<ChallengeReward> {
    const res = await api.put(`${this.baseUrl}/challenge-rewards/${id}`, data);
    return res.data;
  }

  async deleteChallengeReward(id: string): Promise<void> {
    await api.delete(`${this.baseUrl}/challenge-rewards/${id}`);
  }

  // ===== User Challenge Rewards =====
  async awardChallengeReward(data: UserChallengeRewardCreate): Promise<UserChallengeReward> {
    const res = await api.post(`${this.baseUrl}/user-challenge-rewards`, data);
    return res.data;
  }

  async getUserChallengeRewards(userId: string): Promise<UserChallengeReward[]> {
    const res = await api.get(`${this.baseUrl}/user-challenge-rewards/${userId}`);
    return res.data;
  }

  async getChallengeRewardWinners(challengeId: string): Promise<UserChallengeReward[]> {
    const res = await api.get(`${this.baseUrl}/challenge-reward-winners/${challengeId}`);
    return res.data;
  }
}

export const rewardService = new RewardService();
