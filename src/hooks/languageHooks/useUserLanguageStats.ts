import { useQuery } from '@tanstack/react-query';
import { languageService } from '@/services/languageService';

export interface LanguageStats {
  id: string;
  task_type: string;
  proficiency: string;
  statistics: {
    total_hours_speech: number;
    total_sentences_translated: number;
    total_annotation_tokens: number;
  };
  reputation: {
    contribution_acceptance_score: number;
    evaluation_acceptance_score: number;
  };
  created_at: string;
  updated_at: string;
}

export function useUserLanguageStats(userLanguageId: string) {
  return useQuery<LanguageStats[]>({
    queryKey: ['userLanguageStats', userLanguageId],
    queryFn: () => languageService.getUserLanguageStats(userLanguageId),
    enabled: !!userLanguageId && userLanguageId !== 'general',
  });
} 