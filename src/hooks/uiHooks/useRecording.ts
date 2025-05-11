import { useState } from 'react';

export function useRecording() {
  const [recording, setRecording] = useState<boolean>(false);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [error, setError] = useState<Error | null>(null);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      const audioChunks: BlobPart[] = [];

      mediaRecorder.ondataavailable = (event) => {
        audioChunks.push(event.data);
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunks, { type: 'audio/wav' });
        setAudioBlob(audioBlob);
      };

      mediaRecorder.start();
      setRecording(true);

      return mediaRecorder;
    } catch (e) {
      setError(e as Error);
      throw e;
    }
  };

  const saveRecording = async (
    dialectId: string,
    promptText?: string,
    isGeneratedPrompt: boolean = false
  ): Promise<AudioRecording> => {
    if (!audioBlob) {
      throw new Error('No recording available');
    }

    try {
      // Upload to storage
      const fileName = `${Date.now()}.wav`;
      const filePath = `audio/${fileName}`;
      
      const { error: uploadError } = await supabase.storage
        .from('recordings')
        .upload(filePath, audioBlob);

      if (uploadError) throw uploadError;

      // Save metadata to database
      const { data, error: dbError } = await supabase
        .from('audio_recordings')
        .insert({
          dialect_id: dialectId,
          storage_path: filePath,
          prompt_text: promptText,
          is_generated_prompt: isGeneratedPrompt,
          status: 'pending',
        })
        .select()
        .single();

      if (dbError) throw dbError;
      return data;
    } catch (e) {
      setError(e as Error);
      throw e;
    }
  };

  return {
    recording,
    audioBlob,
    error,
    startRecording,
    saveRecording,
  };
}