import { useQuery } from '@tanstack/react-query';
import { LeaderboardPage } from '@/types/challenge';
import api from '@/lib/api';
export const useGetChallengeLeaderboard = (challengeId: string) => {
  return useQuery<LeaderboardPage>({
    queryKey: ['challengeLeaderboard', challengeId],
    queryFn: async () => {
      try {
        const response = await api.get(`/challenges/${challengeId}/leaderboard`);
        return response.data;
      } catch (error) {
        console.error('Error fetching challenge leaderboard:', error);
        
        // Return mock data for development purposes
        return {
          items: [
            { user_id: '1', username: 'user1', name: 'User One', points: 890, hours_speech: 0, sentences_translated: 0, tokens_produced: 0, acceptance_rate: 0 },
            { user_id: '2', username: 'translator_pro', name: 'Pro Translator', points: 753, hours_speech: 0, sentences_translated: 0, tokens_produced: 0, acceptance_rate: 0 },
            { user_id: '3', username: 'linguist42', name: 'Jane Linguist', points: 642, hours_speech: 0, sentences_translated: 0, tokens_produced: 0, acceptance_rate: 0 },
            { user_id: '4', username: 'polyglot', name: 'The Polyglot', points: 521, hours_speech: 0, sentences_translated: 0, tokens_produced: 0, acceptance_rate: 0 },
            { user_id: '5', username: 'language_lover', name: 'Lang Lover', points: 410, hours_speech: 0, sentences_translated: 0, tokens_produced: 0, acceptance_rate: 0 },
          ],
          skip: 0,
          limit: 10,
          has_next: false
        };
      }
    },
    enabled: !!challengeId,
  });
}; 