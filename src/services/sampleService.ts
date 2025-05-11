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
    skip: number = 0,
    limit: number = 20
  ): Promise<PaginatedResponse<TranslationSample>> {
    const params = {
      seed_id: seedId,
      language_id: languageId,
      active,
      skip,
      limit,
    };

    const res = await api.get(`${this.baseUrl}/translation/`, { params });
    return res.data;
  }

  async listTranscriptionSamples(
    languageId?: string,
    category?: string,
    active?: boolean,
    skip: number = 0,
    limit: number = 20
  ): Promise<PaginatedResponse<TranscriptionSample>> {
    const params = {
      language_id: languageId,
      category,
      active,
      skip,
      limit,
    };

    const res = await api.get(`${this.baseUrl}/transcription/`, { params });
    return res.data;
  }

  async listAnnotationSamples(
    seedId?: string,
    languageId?: string,
    active?: boolean,
    skip: number = 0,
    limit: number = 20
  ): Promise<PaginatedResponse<AnnotationSample>> {
    const params = {
      seed_id: seedId,
      language_id: languageId,
      active,
      skip,
      limit,
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
}

export const sampleService = new SampleService();
