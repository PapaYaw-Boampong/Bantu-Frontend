import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { rewardService } from '@/services/rewardService';
import { 
  Milestone, 
  MilestoneCreate, 
  MilestoneUpdate,
  ChallengeRewardCreate, 
  ChallengeRewardUpdate 
} from '@/types/rewards';

// Milestone hooks
export const useMilestones = () => {
  return useQuery({
    queryKey: ['milestones'],
    queryFn: rewardService.getMilestones,
  });
};

export const useCreateMilestone = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: MilestoneCreate) => rewardService.createMilestone(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['milestones'] });
    },
  });
};

export const useUpdateMilestone = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: MilestoneUpdate }) => 
      rewardService.updateMilestone(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['milestones'] });
    },
  });
};

export const useDeleteMilestone = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: string) => rewardService.deleteMilestone(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['milestones'] });
    },
  });
};

// Challenge Reward hooks
export const useChallengeRewards = (query?: any) => {
  return useQuery({
    queryKey: ['challengeRewards', query],
    queryFn: () => rewardService.getChallengeRewards(query),
  });
};

export const useCreateChallengeReward = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: ChallengeRewardCreate) => rewardService.createChallengeReward(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['challengeRewards'] });
    },
  });
};

export const useUpdateChallengeReward = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: ChallengeRewardUpdate }) => 
      rewardService.updateChallengeReward(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['challengeRewards'] });
    },
  });
};

export const useDeleteChallengeReward = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: string) => rewardService.deleteChallengeReward(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['challengeRewards'] });
    },
  });
};

// Reward claims hooks
export const usePendingRewardClaims = () => {
  return useQuery({
    queryKey: ['pendingRewardClaims'],
    queryFn: rewardService.getPendingRewardClaims,
  });
};

export const useProcessRewardClaim = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ claimId, approved }: { claimId: string; approved: boolean }) => 
      rewardService.processRewardClaim(claimId, approved),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pendingRewardClaims'] });
    },
  });
}; 