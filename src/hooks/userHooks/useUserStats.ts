import { useQuery } from '@tanstack/react-query';
import { userService } from '@/services/userService';

export interface UserGeneralStats {
  total_hours_speech: number;
  total_sentences_translated: number;
  total_annotation_tokens: number;
}

export interface UserStats {
  user_id: string;
  username: string;
  general_statistics: UserGeneralStats;
  updated_at: string;
}

export function useUserStats() {
  return useQuery<UserStats>({
    queryKey: ['userStats'],
    queryFn: userService.getUserStats,
  });
} 