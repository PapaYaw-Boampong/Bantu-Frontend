import api from '@/lib/api';
import { 
  EvaluationStepSubmit,
  EvaluationInstanceCreate,
  ABTestVoteSubmit,
  EvaluationInstance,
  EvaluationBranch,
  EvaluationStep,
  ABTest,
  ABTestAssignment,
  EvaluationAssignment
} from '@/types/evaluation';
import { ContributionType } from '@/types/contribution';

class EvaluationService {
  private baseUrl = '/evaluations';

  // Submit an evaluation step
  async submitEvaluationStep(
    branchId: string,
    instanceId: string,
    languageId: string,
    contributionType: ContributionType,
    data: EvaluationStepSubmit
  ): Promise<{ success: boolean }> {
    const res = await api.post(`${this.baseUrl}/step/${branchId}/submit`, data, {
      params: {
        instance_id: instanceId,
        language_id: languageId,
        contribution_type: contributionType
      }
    });
    return res.data;
  }

  // Assign evaluation steps to user
  async assignEvaluationStep(
    proficiencyLevel: number,
    contributionType: ContributionType,
    challengeId?: string,
    languageId?: string,
    numSteps: number = 1
  ): Promise<EvaluationAssignment[]> {
    const params = {
      user_proficiency: proficiencyLevel,
      contribution_type: contributionType,
      challenge_id: challengeId,
      language_id: languageId,
      num_steps: numSteps
    };
    
    const res = await api.get(`${this.baseUrl}/assign`, { params });
    return res.data;
  }

  // Assign A/B test to user
  async assignABTest(
    proficiencyLevel: number = 1,
    abTestId?: string
  ): Promise<ABTestAssignment> {
    const params = {
      ab_test_id: abTestId,
      user_proficiency: proficiencyLevel
    };
    
    const res = await api.get(`${this.baseUrl}/abtest/assign`, { params });
    return res.data;
  }

  // Cast vote for A/B test
  async castABTestVote(
    pairId: string,
    data: ABTestVoteSubmit
  ): Promise<{
    success: boolean;
    can_advance: boolean;
    advance?: {
      ab_test_id: string;
      is_complete: boolean;
      current_stage?: number;
      final_winners?: string[];
    };
  }> {
    const res = await api.post(`${this.baseUrl}/abtest/vote/${pairId}`, data);
    return res.data;
  }

}

export const evaluationService = new EvaluationService();
