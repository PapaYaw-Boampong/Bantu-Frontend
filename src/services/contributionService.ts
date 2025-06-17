import api from '@/lib/api';
import {
  Contribution,
  ContributionCreate,
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
    challengeId?: string,
    sample_text?: string,
  ): Promise<Contribution> {
    const url = `${this.baseUrl}/${contributionType}/`;
    const params = challengeId ? { challenge_id: challengeId } : {};
    
    const res = await api.post(url, data, {
      params: {
        language_id: languageId,
        sample_id: sampleId,
        sample_text: sample_text,
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
}

export const contributionService = new ContributionService();
