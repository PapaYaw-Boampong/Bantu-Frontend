import { useState, useEffect, useRef } from 'react';
import { Mic, Loader2, AudioWaveform as Waveform, Bot, FileText, RefreshCw } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { useGetUserLanguages } from '@/hooks/languageHooks/useGetUserLanguages';
import { useListTranscriptionSamples } from '@/hooks/sampleHooks/useListTranscriptionSamples';
import { useCreateContribution } from '@/hooks/contributionHooks/useCreateContribution';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Card,
  CardContent,
  CardFooter,
} from '@/components/ui/card';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

// Import the AudioRecorder component with its ref type
import AudioRecorder, { AudioRecorderRef } from '@/components/common/AudioRecorder';
import { TranscriptionSample } from '@/types/sample';
import { ContributionCreate } from '@/types/contribution';
import { Skeleton } from '@/components/ui/skeleton';

type RecordingStatus = 'idle' | 'recording' | 'processing' | 'done' | 'error';
type InputMode = 'lm' | 'custom';

export default function LetsTalk() {
  const { 
    data: userLanguages=[],
    isLoading: languagesLoading,
    isError,
  } = useGetUserLanguages();
  const [selectedLanguage, setSelectedLanguage] = useState('');
  const [recordingStatus, setRecordingStatus] = useState<RecordingStatus>('idle');
  const [transcription, setTranscription] = useState('');
  const [inputMode, setInputMode] = useState<InputMode>('lm');
  const [currentSampleIndex, setCurrentSampleIndex] = useState(0);
  const [currentSample, setCurrentSample] = useState<TranscriptionSample | null>(null);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [controlledLoading, setControlledLoading] = useState(false);
  const { toast } = useToast();

  // Add a ref for the AudioRecorder component
  const audioRecorderRef = useRef<AudioRecorderRef>(null);

  // Fetch transcription samples based on selected language
  const {
    data: transcriptionSampleResponse,
    isLoading: samplesLoading,
    refetch: refetchSamples,
    isError: sampleError,
  } = useListTranscriptionSamples({
    languageId: selectedLanguage,
    active: true,
    limit: 3,
  });
  
  const transcriptionSamples = transcriptionSampleResponse?.samples ?? [];
  const totalCount = transcriptionSampleResponse?.count ?? 0;

  // Create contribution mutation
  const createContribution = useCreateContribution();

  // Controlled loading state that persists for at least 5 seconds
  useEffect(() => {
    if (selectedLanguage && (samplesLoading || controlledLoading)) {
      // If we're already in a loading state, make sure it lasts at least 5 seconds
      setControlledLoading(true);
      const timer = setTimeout(() => {
        // Only stop controlled loading if actual loading is also done
        if (!samplesLoading) {
          setControlledLoading(false);
        }
      }, 5000);
      
      return () => clearTimeout(timer);
    }
  }, [samplesLoading, selectedLanguage, controlledLoading]);

  // Update current sample when samples are loaded or when moving to next sample
  useEffect(() => {
    if (transcriptionSamples.length > 0 && currentSampleIndex < transcriptionSamples.length) {
      setCurrentSample(transcriptionSamples[currentSampleIndex]);
      // Set the transcription from the sample
      setTranscription(transcriptionSamples[currentSampleIndex].transcription_text || '');
    } else {
      setCurrentSample(null);
      setTranscription('');
    }
  }, [transcriptionSamples, currentSampleIndex]);

  // Handle language change
  useEffect(() => {
    if (selectedLanguage) {
      // Set loading state and reset
      setControlledLoading(true);
      setCurrentSampleIndex(0);
      setAudioBlob(null);
      setRecordingStatus('idle');
      
      // Reset the audio recorder
      if (audioRecorderRef.current) {
        audioRecorderRef.current.reset();
      }
    }
  }, [selectedLanguage]);

  const handleNextSample = () => {
    // Set loading state when moving to next sample
    setControlledLoading(true);
    
    // Reset the audio recorder
    if (audioRecorderRef.current) {
      audioRecorderRef.current.reset();
    }
    
    if (currentSampleIndex < transcriptionSamples.length - 1) {
      setCurrentSampleIndex(currentSampleIndex + 1);
    } else {
      // We've reached the end of our buffer, get more samples
      refetchSamples();
      setCurrentSampleIndex(0);
    }
    setAudioBlob(null);
    setRecordingStatus('idle');
  };

  const handleCustomTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setTranscription(e.target.value);
  };

  const handleReset = () => {
    // Reset the audio recorder
    if (audioRecorderRef.current) {
      audioRecorderRef.current.reset();
    }
    
    setRecordingStatus('idle');
    setAudioBlob(null);
    toast({
      title: 'Reset complete',
      description: 'Recording has been cleared.',
    });
  };

  const handleSave = () => {
    if (!selectedLanguage) {
      toast({
        title: 'Language required',
        description: 'You need to select a language before saving.',
        variant: 'destructive',
      });
      return;
    }

    if (!audioBlob) {
      toast({
        title: 'No recording found',
        description: 'Please record audio before saving.',
        variant: 'destructive',
      });
      return;
    }

    if (inputMode === 'custom' && !transcription.trim()) {
      toast({
        title: 'Text required',
        description: 'Please provide text for your recording.',
        variant: 'destructive',
      });
      return;
    }

    if (inputMode === 'lm' && !currentSample) {
      toast({
        title: 'No sample available',
        description: 'Please refresh to get a new sample.',
        variant: 'destructive',
      });
      return;
    }

    // Create a form data object to upload the audio file
    const formData = new FormData();
    formData.append('audio', audioBlob, 'recording.webm');

    // In a real implementation, you would upload the audio file to a server
    // and get back a URL that you can use in the contribution

    const contributionData: ContributionCreate = {
      target_url: 'placeholder-for-audio-url', // This would be the URL from your backend
      speech_length: parseFloat((audioBlob.size / 1024).toFixed(2)), // Convert string to number
    };

    if (inputMode === 'lm' && currentSample) {
      // Show loading state while saving
      setControlledLoading(true);
      
      // Creating contribution for an existing sample
      createContribution.mutate({
        languageId: selectedLanguage,
        sampleId: currentSample.id,
        contributionType: 'transcription' as any, // Type assertion to bypass the type error
        data: contributionData,
      }, {
        onSuccess: () => {
          toast({
            title: 'Recording saved',
            description: 'Thank you for your contribution!',
          });
          setAudioBlob(null);
          setRecordingStatus('idle');
          
          // Reset the audio recorder
          if (audioRecorderRef.current) {
            audioRecorderRef.current.reset();
          }
          
          handleNextSample();
        },
        onError: (error) => {
          setControlledLoading(false);
          toast({
            title: 'Error saving recording',
            description: 'There was an error saving your recording. Please try again.',
            variant: 'destructive',
          });
          console.error('Error saving recording:', error);
        }
      });
    } else if (inputMode === 'custom') {
      // For custom text, we'd need to create a custom contribution
      // This would typically use a different endpoint/hook
      toast({
        title: 'Custom recordings coming soon',
        description: 'Custom recording contributions will be available soon.',
      });
    }
  };

  const handleRecordingComplete = (blob: Blob) => {
    setAudioBlob(blob);
    setRecordingStatus('done');
  };

  const handleRefreshSamples = () => {
    // Show loading state for at least 5 seconds
    setControlledLoading(true);
    refetchSamples();
    setCurrentSampleIndex(0);
    
    // Reset audio state
    setAudioBlob(null);
    setRecordingStatus('idle');
    
    // Reset the audio recorder
    if (audioRecorderRef.current) {
      audioRecorderRef.current.reset();
    }
    
    toast({
      title: 'Refreshing samples',
      description: 'Loading new transcription samples...',
    });
  };

  // Handle input mode change
  const handleInputModeChange = (value: string) => {
    // Reset audio recorder when changing input modes
    if (value !== inputMode) {
      setInputMode(value as InputMode);
      setAudioBlob(null);
      setRecordingStatus('idle');
      
      // Reset the audio recorder
      if (audioRecorderRef.current) {
        audioRecorderRef.current.reset();
      }
    }
  };

  // Determine if we should show loading state
  const isLoading = samplesLoading || controlledLoading;
  
  // Check if samples should be displayed
  const shouldShowContent = selectedLanguage && !(sampleError && !isLoading);
  const noSamplesAvailable = inputMode === 'lm' && shouldShowContent && !isLoading && transcriptionSamples.length === 0;

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <div className="mb-8 animate-fade-up opacity-0 [animation-fill-mode:forwards]">
        <h1 className="text-3xl font-bold pb-4">Let's Talk</h1>
        <div className="flex justify-between items-center mb-4">
          <Select
            value={selectedLanguage}
            onValueChange={setSelectedLanguage}
            disabled={languagesLoading}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Select language..." />
            </SelectTrigger>
            <SelectContent>
              {userLanguages.map((lang) => (
                <SelectItem key={lang.language.id} value={lang.language.id}>
                  {lang.language.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleRefreshSamples}
            disabled={!selectedLanguage || isLoading}
          >
            <RefreshCw className="h-4 w-4 mr-1" />
            Refresh Samples
          </Button>
        </div>
      </div>

      <Card className="animate-fade-up opacity-0 [animation-delay:200ms] [animation-fill-mode:forwards]">
        <Tabs defaultValue="lm" onValueChange={handleInputModeChange}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="lm" className="flex items-center gap-2">
              <Bot className="h-4 w-4" />
              Use Available Samples
            </TabsTrigger>
            <TabsTrigger value="custom" className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Custom Text
            </TabsTrigger>
          </TabsList>

          <CardContent className="space-y-6 mt-6">
            {inputMode === 'lm' && (
              <div className="space-y-4 animate-fade-up opacity-0 [animation-delay:400ms] [animation-fill-mode:forwards]">
                {!shouldShowContent ? (
                  <div className="bg-muted p-4 rounded-lg">
                    <p className="text-sm text-muted-foreground mb-2">Select a language</p>
                    <p className="text-lg">Please select a language to view samples.</p>
                  </div>
                ) : noSamplesAvailable ? (
                  <div className="bg-muted p-4 rounded-lg">
                    <p className="text-sm text-muted-foreground mb-2">No samples available</p>
                    <p className="text-lg">
                      No transcription samples available for this language.
                      <Button 
                        variant="link"
                        onClick={handleRefreshSamples} 
                        disabled={isLoading}
                        className="px-2"
                      >
                        Try refreshing
                      </Button>
                    </p>
                  </div>
                ) : (
                  <div className="bg-muted p-4 rounded-lg min-h-[100px] transition-all duration-300">
                    <div className="flex justify-between items-start">
                      <p className="text-sm text-muted-foreground mb-2">
                        Sample Text {!isLoading && transcriptionSamples.length > 0 && (
                          <>({currentSampleIndex + 1}/{transcriptionSamples.length})</>
                        )}
                      </p>
                      {isLoading && <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />}
                    </div>
                    {isLoading ? (
                      <div className="space-y-2 pt-2">
                        <Skeleton className="h-4 w-5/6" />
                        <Skeleton className="h-4 w-3/4" />
                      </div>
                    ) : (
                      <p className="text-lg font-medium transition-opacity duration-300 ease-in-out">{currentSample?.transcription_text}</p>
                    )}
                  </div>
                )}
              </div>
            )}

            {inputMode === 'custom' && (
              <div className="space-y-4 animate-fade-up opacity-0 [animation-delay:400ms] [animation-fill-mode:forwards]">
                <div>
                  <Label htmlFor="transcription">Text to Record</Label>
                  <Textarea
                    id="transcription"
                    placeholder="Enter the AFRICAN LANGUAGE you want to record..."
                    value={transcription}
                    onChange={handleCustomTextChange}
                    className="h-28 transition-all duration-300"
                    disabled={!selectedLanguage || isLoading}
                  />
                </div>
              </div>
            )}

            <div className="py-4 animate-fade-up opacity-0 [animation-delay:600ms] [animation-fill-mode:forwards]">
              {/* AudioRecorder component with ref */}
              <AudioRecorder 
                ref={audioRecorderRef}
                onRecordingComplete={handleRecordingComplete} 
                disabled={!selectedLanguage || isLoading || (inputMode === 'lm' && !currentSample && !isLoading)}
              />
              
              {/* Audio playback if recording is done
              {audioBlob && (
                <div className="mt-4 transition-all duration-300">
                  <audio src={URL.createObjectURL(audioBlob)} controls className="w-full" />
                </div>
              )} */}
            </div>
          </CardContent>

          <CardFooter className="flex justify-between space-x-4">
            <div>
              {inputMode === 'lm' && (
                <Button 
                  variant="outline" 
                  onClick={handleNextSample}
                  disabled={!selectedLanguage || isLoading || transcriptionSamples.length === 0}
                  className="animate-fade-up opacity-0 [animation-delay:200ms] [animation-fill-mode:forwards]"
                >
                  Skip
                </Button>
              )}
            </div>
            <div className="flex space-x-2">
              <Button 
                variant="outline" 
                onClick={handleReset}
                disabled={!audioBlob || isLoading}
                className="animate-fade-up opacity-0 [animation-delay:200ms] [animation-fill-mode:forwards]"
              >
                Reset
              </Button>
              <Button 
                onClick={handleSave}
                disabled={createContribution.isPending || !audioBlob || isLoading || (inputMode === 'lm' && !currentSample)}
                className="animate-fade-up opacity-0 [animation-delay:200ms] [animation-fill-mode:forwards]"
              >
                {createContribution.isPending || isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : 'Save'}
              </Button>
            </div>
          </CardFooter>
        </Tabs>
      </Card>
    </div>
  );
}