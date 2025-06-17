import api from "@/lib/api";
import {
  TranscriptionSampleCreate,
  TranscriptionSample,
  TranslationSample,
  AnnotationSample,
  SamplePriorityUpdate,
  SampleLockUpdate,
  SampleType,
  PaginatedResponse,
} from "@/types/sample";

class SampleService {
  private baseUrl = "/samples";

  // get grouped samples
  async listTranslationSamples(
    seedId?: string,
    languageId?: string,
    active?: boolean,
    buffer?: string,
    skip: number = 0,
    limit: number = 5,

  ): Promise<PaginatedResponse<TranslationSample>> {
    const params = {
      seed_id: seedId,
      language_id: languageId,
      active,
      skip,
      buffer,
      limit,
    };

    const res = await api.get(`${this.baseUrl}/translation/`, { params });
    return res.data;
  }

  async listTranscriptionSamples(
    languageId?: string,
    category?: string,
    active?: boolean,
    buffer?: string,
    skip: number = 0,
    limit: number = 5,
    
  ): Promise<PaginatedResponse<TranscriptionSample>> {
    const params = {
      language_id: languageId,
      category,
      active,
      skip,
      limit,
      buffer
    };

    const res = await api.get(`${this.baseUrl}/transcription/`, { params });
    return res.data;
  }

  async listAnnotationSamples(
    seedId?: string,
    languageId?: string,
    active?: boolean,
    buffer?: string,
    skip: number = 0,
    limit: number = 5,
    
  ): Promise<PaginatedResponse<AnnotationSample>> {
    const params = {
      seed_id: seedId,
      language_id: languageId,
      active,
      skip,
      limit,
      buffer
    };

    const res = await api.get(`${this.baseUrl}/annotation/`, { params });
    return res.data;
  }

  // get a specific sample
  async getTranscriptionSample(id: string): Promise<TranscriptionSample> {
    const res = await api.get(`${this.baseUrl}/transcription/${id}`);
    return res.data;
  }

  async getTranslationSample(id: string): Promise<TranslationSample> {
    const res = await api.get(`${this.baseUrl}/translation/${id}`);
    return res.data;
  }

  async getAnnotationSample(id: string): Promise<AnnotationSample> {
    const res = await api.get(`${this.baseUrl}/annotation/${id}`);
    return res.data;
  }
  
  // ======== COMMON OPERATIONS ========

  async updateSamplePriority(
    sampleType: SampleType,
    sampleId: string,
    data: SamplePriorityUpdate
  ): Promise<any> {
    const res = await api.patch(
      `${this.baseUrl}/${sampleType}/${sampleId}/priority`,
      data
    );
    return res.data;
  }

  async bulkUpdateSampleLock(
    sampleType: SampleType,
    data: SampleLockUpdate
  ): Promise<{
    processed: number;
    message: string;
  }> {
    const res = await api.patch(`${this.baseUrl}/${sampleType}/lock`, data);
    return res.data;
  }

  async deleteSample(
    sampleType: SampleType,
    sampleId: string
  ): Promise<{
    message: string;
  }> {
    const res = await api.delete(`${this.baseUrl}/${sampleType}/${sampleId}`);
    return res.data;
  }

  // ======== CSV UPLOAD OPERATIONS ========
  
  async uploadAnnotationSeedsCSV(
    file: File,
    languageId: string
  ): Promise<{
    success: boolean;
    count: number;
  }> {
    const formData = new FormData();
    formData.append('file', file);
    
    const res = await api.post(
      `${this.baseUrl}/annotation/csv?language_id=${languageId}`, 
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );
    return res.data;
  }

  async uploadTranscriptionSeedsCSV(
    file: File,
    languageId: string
  ): Promise<{
    success: boolean;
    count: number;
  }> {
    const formData = new FormData();
    formData.append('file', file);
    
    const res = await api.post(
      `${this.baseUrl}/transcription/csv?language_id=${languageId}`,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );
    return res.data;
  }

  async uploadTranslationSeedsCSV(
    file: File
  ): Promise<{
    success: boolean;
    count: number;
  }> {
    const formData = new FormData();
    formData.append('file', file);
    
    const res = await api.post(
      `${this.baseUrl}/translation/csv`,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );
    return res.data;
  }
}

export const sampleService = new SampleService();
