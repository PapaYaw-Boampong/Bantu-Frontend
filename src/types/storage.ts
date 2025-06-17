import { ContributionType } from './contribution';
export interface FileMetadata {
  taskType: ContributionType;
  contributionId: string;
  fileExtension: string;
  timestamp?: number;
}

export interface SignedUrlResponse {
  signed_url: string;
  expires_at: string;
  filename: string;
}

export interface UploadProgress {
  loaded: number;
  total: number;
  percentage: number;
}