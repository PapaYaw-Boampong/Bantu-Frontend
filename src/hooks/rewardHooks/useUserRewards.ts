import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { rewardService } from '@/services/rewardService';

// User milestone badges hook
export const useUserMilestones = () => {
  return useQuery({
    queryKey: ['userMilestones'],
    queryFn: rewardService.getUserMilestones,
  });
};

// User rewards (cash, etc.) hook
export const useUserRewards = () => {
  return useQuery({
    queryKey: ['userRewards'],
    queryFn: rewardService.getUserRewards,
  });
};

// Claim reward mutation hook
export interface PaymentDetails {
  provider: string;
  number: string;
  [key: string]: any;
}

export const useClaimReward = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ rewardId, paymentDetails }: { rewardId: string; paymentDetails: PaymentDetails }) => 
      rewardService.claimReward(rewardId, paymentDetails),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['userRewards'] });
    },
  });
}; 