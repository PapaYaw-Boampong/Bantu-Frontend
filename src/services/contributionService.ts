import api from '@/lib/api';
import {
  Contribution,
  ContributionCreate,
  ContributionUpdate,
  ContributionFilter,
  ContributionStats,
  ContributionType
} from '@/types/contribution';

class ContributionService {
  private baseUrl = '/contributions';

  // Create a new contribution
  async create(
    languageId: string,
    sampleId: string,
    contributionType: ContributionType,
    data: ContributionCreate,
    challengeId?: string
  ): Promise<Contribution> {
    const url = `${this.baseUrl}/${contributionType}/`;
    const params = challengeId ? { challenge_id: challengeId } : {};
    
    const res = await api.post(url, data, {
      params: {
        language_id: languageId,
        sample_id: sampleId,
        ...params
      }
    });
    return res.data;
  }

  // Create a custom contribution
  async createCustom(
    languageId: string,
    contributionType: ContributionType,
    data: ContributionCreate,
    challengeId?: string
  ): Promise<Contribution> {
    const url = `${this.baseUrl}/${contributionType}/custom/`;
    const params = challengeId ? { challenge_id: challengeId } : {};
    
    const res = await api.post(url, data, {
      params: {
        language_id: languageId,
        ...params
      }
    });
    return res.data;
  }

  // Get contribution statistics
  async getStats(
    contributionType?: ContributionType,
    userId?: string
  ): Promise<ContributionStats> {
    const params: Record<string, string | undefined> = {};
    
    if (contributionType) {
      params.contribution_type = contributionType;
    }
    
    if (userId) {
      params.user_id = userId;
    }
    
    const res = await api.get(`${this.baseUrl}/stats/`, { params });
    return res.data;
  }

  // Flag a contribution for review
  async flagContribution(
    contributionId: string,
    contributionType: ContributionType
  ): Promise<{ message: string }> {
    const res = await api.patch(
      `${this.baseUrl}/${contributionType}/${contributionId}/flag`
    );
    return res.data;
  }

  // Get user contributions (this endpoint was not in the backend code but would be useful)
  async getUserContributions(filters?: ContributionFilter): Promise<Contribution[]> {
    const res = await api.get(`${this.baseUrl}/user/`, { params: filters });
    return res.data;
  }

  // Update a contribution (this endpoint was not in the backend code but would be useful)
  async update(
    contributionId: string,
    contributionType: ContributionType,
    data: ContributionUpdate
  ): Promise<Contribution> {
    const res = await api.patch(
      `${this.baseUrl}/${contributionType}/${contributionId}`,
      data
    );
    return res.data;
  }
}

export const contributionService = new ContributionService();
