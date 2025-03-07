import { useState } from 'react';
import { Mic, Loader2, AudioWaveform as Waveform, Bot, FileText } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
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

const dialects = [
  'Yoruba',
  'Igbo',
  'Hausa',
  'Swahili',
  'Amharic',
  'Zulu',
  'Xhosa',
  'Twi',
  'Wolof',
  'Oromo',
];

type RecordingStatus = 'idle' | 'recording' | 'processing' | 'done' | 'error';
type InputMode = 'lm' | 'custom';

export default function LetsTalk() {
  const [selectedDialect, setSelectedDialect] = useState('');
  const [recordingStatus, setRecordingStatus] = useState<RecordingStatus>('idle');
  const [transcription, setTranscription] = useState('');
  const [translation, setTranslation] = useState('');
  const [inputMode, setInputMode] = useState<InputMode>('lm');
  const [generatedText, setGeneratedText] = useState('');
  const { toast } = useToast();

  const handleGenerateText = () => {
    // Simulating LM text generation
    setGeneratedText('Me p3 Sika');
  };

  const handleRecord = () => {
    if (!selectedDialect) {
      toast({
        title: 'Please select a dialect',
        description: 'You need to select a dialect before recording.',
        variant: 'destructive',
      });
      return;
    }

    if (inputMode === 'custom' && !transcription) {
      toast({
        title: 'Please enter text',
        description: 'You need to provide the text you want to record.',
        variant: 'destructive',
      });
      return;
    }

    if (recordingStatus === 'idle') {
      setRecordingStatus('recording');
      toast({
        title: 'Recording started',
        description: 'Speak clearly into your microphone.',
      });
    } else if (recordingStatus === 'recording') {
      setRecordingStatus('processing');
      setTimeout(() => {
        setRecordingStatus('done');
        toast({
          title: 'Recording completed',
          description: 'Your audio has been processed successfully.',
        });
      }, 2000);
    }
  };

  const handleReset = () => {
    setRecordingStatus('idle');
    setTranscription('');
    setTranslation('');
    setGeneratedText('');
    toast({
      title: 'Reset complete',
      description: 'All inputs have been cleared.',
    });
  };

  const handleSave = () => {
    toast({
      title: 'Contribution saved',
      description: 'Thank you for your contribution!',
    });
    handleReset();
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <div className="mb-8 animate-fade-up opacity-0">
         <h1 className="text-3xl font-bold pb-3">Translate</h1>
        <div className="flex justify-between items-center mb-4">
         
          <select
            className="rounded-md border border-input bg-background px-3 py-2 min-w-[180px]"
            value={selectedDialect}
            onChange={(e) => setSelectedDialect(e.target.value)}
          >
            <option value="">Select dialect...</option>
            {dialects.map((dialect) => (
              <option key={dialect} value={dialect}>
                {dialect}
              </option>
            ))}
          </select>
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
                <div className="animate-fade-up [animation-delay:800ms] opacity-0">
                  <Label htmlFor="transcription-correction" >
                    Base Text {inputMode === 'lm' ? '(Optional - for corrections)' : ''}
                  </Label>

                  <Textarea
                    id="transcription-correction"
                    placeholder={
                      inputMode === 'lm'
                        ? 'Correct any transcription errors...'
                        : 'Native Text Goes Here'
                    }
                    value={transcription}
              
                    className="h-28 mt-5"
                  />    
                </div>

              </div>
            )}

            {/* <div className="flex justify-center py-8 animate-fade-up [animation-delay:600ms] opacity-0">
              <Button
                size="lg"
                className={`w-24 h-24 rounded-full ${
                  recordingStatus === 'recording'
                    ? 'bg-red-500 hover:bg-red-600'
                    : ''
                }`}
                onClick={handleRecord}
                disabled={recordingStatus === 'processing'}
              >
                {recordingStatus === 'recording' ? (
                  <span className="animate-pulse">
                    <Waveform className="h-8 w-8" />
                  </span>
                ) : recordingStatus === 'processing' ? (
                  <Loader2 className="h-8 w-8 animate-spin" />
                ) : (
                  <Mic className="h-8 w-8" />
                )}
              </Button>
            </div> */}

            <div className="space-y-4">
              
              <div className="animate-fade-up [animation-delay:1000ms] opacity-0">
                <Label htmlFor="translation">Translation</Label>
                <Textarea
                  id="translation"
                  placeholder="Provide an English translation..."
                  value={translation}
                  onChange={(e) => setTranslation(e.target.value)}
                  className="h-32  mt-5"
                />
              </div>
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