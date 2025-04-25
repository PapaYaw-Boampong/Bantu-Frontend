import { useState } from 'react';
import { Mic, Loader2, AudioWaveform as Waveform, Bot, FileText } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useGetUserLanguages } from '@/hooks/languageHooks/useGetUserLanguages';
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

// Import the AudioRecorder component
import AudioRecorder from '@/components/common/AudioRecorder';

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
  const [translation, setTranslation] = useState('');
  const [inputMode, setInputMode] = useState<InputMode>('lm');
  const [generatedText, setGeneratedText] = useState('');
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const { toast } = useToast();

  const handleGenerateText = () => {
    // Simulating LM text generation
    setGeneratedText('Me p3 Sika');
  };

  const handleReset = () => {
    setRecordingStatus('idle');
    setTranscription('');
    setTranslation('');
    setGeneratedText('');
    setAudioBlob(null);
    toast({
      title: 'Reset complete',
      description: 'All inputs have been cleared.',
    });
  };

  const handleSave = () => {
    if (!selectedLanguage) {
      toast({
        title: 'Please select a language',
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

    toast({
      title: 'Contribution saved',
      description: 'Thank you for your contribution!',
    });
    handleReset();
  };

  const handleRecordingComplete = (blob: Blob) => {
    setAudioBlob(blob);
    setRecordingStatus('done');
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <div className="mb-8 animate-fade-up opacity-0">
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
        </div>
      </div>

      <Card className="animate-fade-up [animation-delay:200ms] opacity-0">
        <Tabs defaultValue="lm" onValueChange={(value) => setInputMode(value as InputMode)}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="lm" className="flex items-center gap-2">
              <Bot className="h-4 w-4" />
              Use Synthetic Data
            </TabsTrigger>
            <TabsTrigger value="custom" className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Custom Text
            </TabsTrigger>
          </TabsList>

          <CardContent className="space-y-6 mt-6">
            {inputMode === 'lm' && (
              <div className="space-y-4 animate-fade-up [animation-delay:400ms] opacity-0">
                <Button
                  onClick={handleGenerateText}
                  className="w-full py-6"
                  variant="outline"
                >
                  <Bot className="h-6 w-6 mr-2" />
                  Generate Text to Speak
                </Button>
                {generatedText && (
                  <div className="bg-muted p-4 rounded-lg">
                    <p className="text-lg font-medium">{generatedText}</p>
                  </div>
                )}
              </div>
            )}

            {inputMode === 'custom' && (
              <div className="space-y-4 animate-fade-up [animation-delay:400ms] opacity-0">
                <div>
                  <Label htmlFor="transcription">Text to Record</Label>
                  <Textarea
                    id="transcription"
                    placeholder="Enter the text you want to record..."
                    value={transcription}
                    onChange={(e) => setTranscription(e.target.value)}
                    className="h-32"
                  />
                </div>
              </div>
            )}

            <div className="py-4 animate-fade-up [animation-delay:600ms] opacity-0">
              {/* Replace the button with AudioRecorder component */}
              <AudioRecorder onRecordingComplete={handleRecordingComplete} />
            </div>
          </CardContent>

          <CardFooter className="flex justify-end space-x-4">
            <Button 
              variant="outline" 
              onClick={handleReset}
              className="animate-fade-up [animation-delay:1200ms] opacity-0"
            >
              Reset
            </Button>
            <Button 
              onClick={handleSave}
              className="animate-fade-up [animation-delay:1200ms] opacity-0"
            >
              Save
            </Button>
          </CardFooter>
        </Tabs>
      </Card>
    </div>
  );
}