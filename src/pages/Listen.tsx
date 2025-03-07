import { useState } from 'react';
import { Headphones, CheckCircle, XCircle, Bot, FileText, Flag } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
} from '@/components/ui/card';

import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';


type RecordingStatus = 'idle' | 'recording' | 'processing' | 'done' | 'error';
type InputMode = 'lm' | 'custom';

export default function Listen() {
  const [recordingStatus, setRecordingStatus] = useState<RecordingStatus>('idle');
  const [translation, setTranslation] = useState('');
  const [transcription, setTranscription] = useState('');
  const [inputMode, setInputMode] = useState<InputMode>('lm');
  const { toast } = useToast();

  const handleReset = () => {
    setRecordingStatus('idle');
    setTranslation('');
    setTranscription('');
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

  const handleFlagAudio = () => {
    toast({
      title: 'Audio Flagged',
      description: 'This audio has been flagged for poor quality.',
      variant: 'destructive',
    });
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-5">Help Bantu, How did we do?</h1>
      
      <Card className="animate-fade-up [animation-delay:200ms] opacity-0">
            <Tabs defaultValue="lm" onValueChange={(value) => setInputMode(value as InputMode)}>
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="lm" className="flex items-center gap-2">
                  <Bot className="h-4 w-4" />
                  Transcription
                </TabsTrigger>
                <TabsTrigger value="custom" className="flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  Translation
                </TabsTrigger>
              </TabsList>
    
              <CardContent className="space-y-6 mt-6">
                {inputMode === 'lm' && (
                  <>
                    <div className="relative animate-fade-up [animation-delay:200ms] opacity-0">
                      <div className="flex justify-center">
                        <Button size="lg" className="w-full max-w-md py-8" variant="outline">
                          <Headphones className="h-6 w-6 mr-2" />
                          Play Audio Sample
                        </Button>
                      </div>
                      <Button 
                        size="sm"
                        variant="ghost" 
                        className="absolute top-0 right-0 text-muted-foreground hover:text-destructive"
                        onClick={handleFlagAudio}
                      >
                        <Flag className="h-4 w-4" />
                      </Button>
                    </div>
      
                    <div className="space-y-4">
                      <div className="animate-fade-up [animation-delay:400ms] opacity-0">
                        <Label htmlFor="translation">Transcription</Label>
                        <Textarea
                          id="translation"
                          placeholder="Native language transcription"
                          value={translation}
                          onChange={(e) => setTranslation(e.target.value)}
                          className="h-32"
                        />
                      </div>
                    </div>
                  </>
                )}
      
                {inputMode === 'custom' && (
                  <div className="space-y-4 animate-fade-up [animation-delay:400ms] opacity-0">
                    <div className="animate-fade-up [animation-delay:800ms] opacity-0">
                      <Label htmlFor="transcription-correction">
                        Native Text {inputMode === 'lm' ? '(Optional - for corrections)' : ''}
                      </Label>
      
                      <Textarea
                        id="transcription-correction"
                        placeholder={inputMode === 'lm'
                          ? 'Correct any transcription errors...'
                          : 'Native language>>>'
                        }
                        value={transcription}
                        onChange={(e) => setTranscription(e.target.value)}
                        className="h-28 mt-5"
                      />
                    </div>

                    <div className="animate-fade-up [animation-delay:800ms] opacity-0">
                      <Label htmlFor="transcription-correction">
                        Translation {inputMode === 'lm' ? '(Optional - for corrections)' : ''}
                      </Label>
      
                      <Textarea
                        id="transcription-correction"
                        placeholder={inputMode === 'lm'
                          ? 'Correct any transcription errors...'
                          : 'English Transaltion'
                        }
                        value={transcription}
                        onChange={(e) => setTranscription(e.target.value)}
                        className="h-28 mt-5"
                      />
                    </div>
                  </div>
                )}
              </CardContent>
    
              <CardFooter className="flex flex-wrap justify-between items-center gap-8">
                <div className="flex space-x-4">
                  <Button variant="outline" className="flex items-center space-x-2">
                    <CheckCircle className="h-5 w-5 text-green-600" />
                    <span>Correct</span>
                  </Button>
                  <Button variant="outline" className="flex items-center space-x-2">
                    <XCircle className="h-5 w-5 text-red-600" />
                    <span>Wrong</span>
                  </Button>
                </div>
                <div className="flex space-x-4">
                  <Button variant="outline" onClick={handleReset}>
                    Reset
                  </Button>
                  <Button onClick={handleSave}>Next</Button>
                </div>
                </CardFooter>
          </Tabs>
    </Card>
    </div>
  );
}