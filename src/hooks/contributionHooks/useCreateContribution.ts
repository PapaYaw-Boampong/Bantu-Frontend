import { useMutation, useQueryClient } from '@tanstack/react-query';
import { contributionService } from '@/services/contributionService';
import { storageService } from '@/services/storageService';
import {FileMetadata} from '@/types/storage';
import { v4 as uuidv4 } from 'uuid';
import { 
  ContributionCreate, 
  ContributionType 
} from '@/types/contribution';

type UploadContributionArgs = {
  file?: File;
  languageId: string;
  sampleId: string;
  contributionType: ContributionType;
  contributionData: ContributionCreate;
  challengeId?: string;
  sample_text?: string;
};

export function useCreateContribution() {
  // const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({
      file,
      languageId,
      sampleId,
      contributionType,
      contributionData,
      challengeId,
      sample_text,
    }: UploadContributionArgs) => {

      let contributionId = uuidv4(); // 
      let filename: string | undefined = undefined;

      // If there's a file, upload it
      if (file) {
        const fileExtension = storageService.getExtensionFromMimeType(file.type);
        
        const fileMetadata: FileMetadata = {
          contributionId,
          fileExtension,
          taskType: contributionType,
          timestamp: Date.now(),
        };

        filename = await storageService.uploadFile(file, fileMetadata);
      }


      // Include the filename in contribution data if applicable
      const payload: ContributionCreate = {
        ...contributionData,
        id: contributionId, 
        ...(filename && { filename }),
      };

      return await contributionService.create(
        languageId,
        sampleId,
        contributionType,
        payload,
        challengeId,
        sample_text
      );
    }
  });
} 