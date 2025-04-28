import api from '@/lib/api';
import {
  Challenge,
  ChallengeCreate,
  ChallengeUpdate,
  ChallengeSummary,
  ChallengeParticipant,
  ChallengeDetailResponse,
  ChallengeRule,
  ChallengeRulesAdd,
  GetChallenges,
  UserChallengeFilter,
  ChallengeSaveRequest,
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
    const res = await api.get(this.baseUrl, { params: filters });
    return res.data;
  }

  async listCreatedByUser(filters?: GetChallenges): Promise<ChallengeSummary[]> {
    const res = await api.get(`${this.baseUrl}/myChallenges`, { params: filters });
    return res.data;
  }

  async getUserChallenges(filters?: UserChallengeFilter): Promise<ChallengeSummary[]> {
    const res = await api.get(`${this.baseUrl}/participating`, { params: filters });
    return res.data;
  }

  // Get full challenge detail
  async get(id: string): Promise<ChallengeDetailResponse> {
    const res = await api.get(`${this.baseUrl}/${id}`);
    return res.data;
  }

  // Update a challenge
  async update(id: string, data: ChallengeUpdate): Promise<Challenge> {
    const res = await api.put(`${this.baseUrl}/${id}`, data);
    return res.data;
  }

  // Delete a challenge
  async delete(id: string): Promise<{ message: string }> {
    const res = await api.delete(`${this.baseUrl}/${id}`);
    return res.data;
  }

  // Join a challenge
  async join(id: string, payload: { user_id: string }): Promise<{ message: string }> {
    const res = await api.post(`${this.baseUrl}/${id}/join`, payload);
    return res.data;
  }

  // Leave a challenge
  async leave(id: string): Promise<{ message: string }> {
    const res = await api.post(`${this.baseUrl}/${id}/leave`);
    return res.data;
  }

  // Get leaderboard participants
  async getLeaderboardPaginated(challengeId: string, skip: number, limit: number) {
    const response = await api.get(`/challenges/${challengeId}/leaderboard`, {
      params: { skip, limit },
    });
    return response.data;
  }

  // Publish challenge
  async publish(id: string): Promise<Challenge> {
    const res = await api.post(`${this.baseUrl}/${id}/publish`);
    return res.data;
  }

  // Unpublish challenge
  async unpublish(id: string): Promise<Challenge> {
    const res = await api.post(`${this.baseUrl}/${id}/unpublish`);
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
    const res = await api.get(`${this.baseUrl}/${id}/participants`, { params: { skip, limit } });
    return res.data;
  }

  // Add rules to a challenge
  async addRules(data: ChallengeRulesAdd): Promise<{ message: string }> {
    const res = await api.post(`${this.baseUrl}/rules/add`, data);
    return res.data;
  }

  // Get challenge summary
  async getSummaries(): Promise<ChallengeSummary[]> {
    const res = await api.get(`${this.baseUrl}/summary`);
    return res.data;
  }

  // (Optional) Get my active participations
  async getMyParticipations(): Promise<ChallengeParticipant[]> {
    const res = await api.get(`${this.baseUrl}/my-participation`);
    return res.data;
  }
}

export const challengeService = new ChallengeService();
