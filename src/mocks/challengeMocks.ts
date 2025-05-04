import { ChallengeSummary, EventType, ChallengeStatus, EventCategory, TaskType } from '@/types/challenge';

export const mockChallenges: ChallengeSummary[] = [
  {
    id: '1',
    challenge_name: 'Data Collection: Voice Samples',
    description: 'Help us collect voice samples for our speech recognition model. Record yourself reading short sentences in your native language.',
    event_type: EventType.DATA_COLLECTION,
    task_type: TaskType.TRANSCRIPTION,
    event_category: EventCategory.BOUNTY,
    start_date: '2024-03-01',
    end_date: '2024-04-30',
    status: ChallengeStatus.Active,
    is_public: true,
    is_published: true,
    participant_count: 156,
    created_at: '2024-02-15',
    image_url: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=400&h=200&fit=crop'
  },

  {
    id: '4',
    challenge_name: 'Sample Review: Translation Accuracy',
    description: 'Review and validate the accuracy of machine translations. Help improve our translation quality.',
    event_type: EventType.SAMPLE_REVIEW,
    task_type: TaskType.TRANSLATION,
    event_category: EventCategory.COMPETITION,
    start_date: '2024-04-01',
    end_date: '2024-06-30',
    status: ChallengeStatus.UPCOMING,
    is_public: true,
    is_published: true,
    participant_count: 45,
    created_at: '2024-03-01',
    image_url: 'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=400&h=200&fit=crop'
  },
  {
    id: '6',
    challenge_name: 'Sample Review: Voice Clarity',
    description: 'Evaluate the clarity and quality of recorded voice samples for our speech recognition training.',
    event_type: EventType.SAMPLE_REVIEW,
    task_type: TaskType.TRANSCRIPTION,
    event_category: EventCategory.COMPETITION,
    start_date: '2024-04-15',
    end_date: '2024-07-15',
    status: ChallengeStatus.UPCOMING,
    is_public: true,
    is_published: true,
    participant_count: 67,
    created_at: '2024-03-10',
    image_url: 'https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?w=400&h=200&fit=crop'
  }
];

export const mockUserChallenges: ChallengeSummary[] = [
  {
    id: '7',
    challenge_name: 'My Voice Collection Project',
    description: 'Personal project for collecting voice samples in multiple languages.',
    event_type: EventType.DATA_COLLECTION,
    task_type: TaskType.TRANSCRIPTION,
    event_category: EventCategory.BOUNTY,
    start_date: '2024-03-01',
    end_date: '2024-04-30',
    status: ChallengeStatus.Active,
    is_public: false,
    is_published: true,
    participant_count: 12,
    created_at: '2024-02-20',
    image_url: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=400&h=200&fit=crop'
  },
  {
    id: '8',
    challenge_name: 'Translation Quality Review',
    description: 'Internal project for reviewing translation quality across different languages.',
    event_type: EventType.SAMPLE_REVIEW,
    task_type: TaskType.TRANSLATION,
    event_category: EventCategory.COMPETITION,
    start_date: '2024-04-01',
    end_date: '2024-06-30',
    status: ChallengeStatus.UPCOMING,
    is_public: false,
    is_published: true,
    participant_count: 8,
    created_at: '2024-03-15',
    image_url: 'https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?w=400&h=200&fit=crop'
  },
]; 