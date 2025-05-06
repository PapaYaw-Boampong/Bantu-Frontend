import api from '@/lib/api';
import {
  Challenge,
  ChallengeCreate,
  ChallengeUpdate,
  ChallengeSummary,
  ChallengeParticipant,
  DetailedChallengeResponseWrapper,
  ChallengeRule,
  ChallengeRulesAdd,
  GetChallenges,
  UserChallengeFilter,
  ChallengeSaveRequest,
  ChallengeStatsOut,
  UserChallengeStatsOut,
} from '@/types/challenge';

import { ChallengeStatus } from '@/types/challenge'; // if ChallengeStatus is exported separately

class ChallengeService {
  private baseUrl = '/challenges';

  // Create a new challenge
  async save(data: ChallengeSaveRequest): Promise<Challenge> {
    const res = await api.post(`${this.baseUrl}/save`, data);
    return res.data;
  }

  // List challenges
  async list(filters?: GetChallenges): Promise<ChallengeSummary[]> {
    const res = await api.get(`${this.baseUrl}/all`, { params: filters });
    return res.data;
  }

  async listCreatedByUser(filters?: GetChallenges): Promise<Challenge[]> {
    const res = await api.get(`${this.baseUrl}/mystuff`, { params: filters });
    return res.data;
  }

  async getUserChallenges(filters?: UserChallengeFilter): Promise<ChallengeSummary[]> {
    const res = await api.get(`${this.baseUrl}/participating`, { params: filters });
    return res.data;
  }

  // Get full challenge detail
  async get(id: string): Promise<DetailedChallengeResponseWrapper> {
    const res = await api.get(`${this.baseUrl}/detailed/${id}`);
    return res.data;
  }

  // Update a challenge
  async update(id: string, data: ChallengeUpdate): Promise<Challenge> {
    const res = await api.put(`${this.baseUrl}/update/${id}`, data);
    return res.data;
  }

  // Delete a challenge
  async delete(id: string): Promise<{ message: string }> {
    const res = await api.delete(`${this.baseUrl}/delete/${id}`);
    return res.data;
  }

  // Join a challenge

  async join(payload: { event_id: string; user_id: string }): Promise<{ message: string }> {
    const res = await api.post(`${this.baseUrl}/join`, payload);
    return res.data;
  }


  // Leave a challenge
  async leave(id: string): Promise<{ message: string }> {
    const res = await api.post(`${this.baseUrl}/leave/${id}`);
    return res.data;
  }

  // Get leaderboard participants
  async getLeaderboardPaginated(challengeId: string, skip: number, limit: number) {
    const response = await api.get(`/leaderboard/${challengeId}`, {
      params: { skip, limit },
    });
    return response.data;
  }

  // Publish challenge
  async publish(id: string): Promise<Challenge> {
    const res = await api.post(`${this.baseUrl}/publish/${id}`);
    return res.data;
  }

  // Unpublish challenge
  async unpublish(id: string): Promise<Challenge> {
    const res = await api.post(`${this.baseUrl}/unpublish/${id}`);
    return res.data;
  }

  // Admin: Update challenge status manually
  async updateStatus(id: string, status: ChallengeStatus): Promise<Challenge> {
    const res = await api.put(`${this.baseUrl}/${id}/status`, { status });
    return res.data;
  }

  // Admin: Trigger evaluation
  async evaluateStatus(id: string): Promise<Challenge> {
    const res = await api.post(`${this.baseUrl}/${id}/evaluate-status`);
    return res.data;
  }

  // Get participants list
  async getParticipants(id: string, skip = 0, limit = 10): Promise<ChallengeParticipant[]> {
    const res = await api.get(`${this.baseUrl}/participants/${id}`, { params: { skip, limit } });
    return res.data;
  }

  // Add rules to a challenge
  async addRules(data: ChallengeRulesAdd): Promise<{ message: string }> {
    const res = await api.post(`${this.baseUrl}/rules/add`, data);
    return res.data;
  }

  // Remove a rule from a challenge
  async removeRule(challengeId: string, ruleId: string): Promise<{ message: string }> {
    const res = await api.delete(`${this.baseUrl}/${challengeId}/rules/${ruleId}`);
    return res.data;
  }

  // Get challenge summary
  async getSummaries(): Promise<ChallengeSummary[]> {
    const res = await api.get(`${this.baseUrl}/summary`);
    return res.data;
  }

  // Get challenge statistics (admin/creator view)
  async getChallengeStats(challengeId: string): Promise<ChallengeStatsOut> {
    const res = await api.get(`${this.baseUrl}/${challengeId}/stats`);
    return res.data;
  }


   // Get challenge statistics (user view)
   async getUserChallengeStats(challengeId: string): Promise<UserChallengeStatsOut> {
    const res = await api.get(`${this.baseUrl}/${challengeId}/userstats`);
    return res.data;
  }


  // (Optional) Get my active participations
  async getMyParticipations(): Promise<ChallengeParticipant[]> {
    const res = await api.get(`${this.baseUrl}/my-participation`);
    return res.data;
  }
}

export const challengeService = new ChallengeService();
