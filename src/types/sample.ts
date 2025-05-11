export interface SampleBase {
  id: string;
  language_id?: string;
  active: boolean;
  priority?: number;
  created_at?: string;
  evaluation_instance_id?: string;
}

// Transcription
export interface TranscriptionSample extends SampleBase {
  transcription_text: string;
}

export interface TranscriptionSampleCreate {
  language_id: string;
  transcription_text: string;
  category?: string;
  active?: boolean;
  priority?: number;
}

// Translation
export interface TranslationSeed {
  id: string;
  original_text: string;
  category?: string;
  active?: boolean;
  priority?: number;
  created_at?: string;
}
export interface TranslationSample extends SampleBase {
  seed_data_id: string;
  translation_seed_data?: TranslationSeed;
}


//////////////////////////////////////
export interface TranslationSeedCreate {
  original_text: string;
  category?: string;
  active?: boolean;
  priority?: number;
}
export interface TranslationSampleCreate {
  language_id: string;
  seed_data_id: string;
}



// Annotation

export interface AnnotationSeed {
  id: string;
  image_url: string;
  annotation_text: string;
  category?: string;
  active?: boolean;
  created_at?: string;
}
export interface AnnotationSample extends SampleBase {
  seed_data_id: string;
  annotation_seed_data?: AnnotationSeed;
}


//////////////////////////////////////
export interface AnnotationSeedCreate {
  image_url: string;
  annotation_text: string;
  category?: string;
  active?: boolean;
}
export interface AnnotationSampleCreate {
  language_id: string;
  seed_data_id: string;
  active?: boolean;
}





// Bulk Upload
export interface BulkTranscriptionSampleUpload {
  samples: TranscriptionSampleCreate[];
}

export interface TranslationPairUpload {
  seed: TranslationSeedCreate;
  translations: TranslationSampleCreate[];
}
export interface SamplePriorityUpdate {
  priority: number;
}
export interface SampleLockUpdate {
  sample_ids: string[];
  state: boolean;
}

export type SampleType = 'transcription' | 'translation' | 'annotation';


export type PaginatedResponse<T> = {
  samples: T[];
  count: number;
};
