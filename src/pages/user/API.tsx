import { useState, useRef } from 'react';
import { Bot, LanguagesIcon, Mic, Loader2, AudioWaveform as Waveform, Trash2, Upload } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useLanguages } from '@/hooks/languageHooks/useLanguages';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
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

type RecordingStatus = 'idle' | 'recording' | 'processing' | 'done' | 'error';
type ServiceType = 'transcription' | 'translation';
type InputMethod = 'record' | 'upload' | 'text';

export default function API() {
  const { data : Languages = [], isLoading } = useLanguages();
  const [serviceType, setServiceType] = useState<ServiceType>('transcription');
  const [selectedLanguage, setSelectedLanguage] = useState('');
  const [recordingStatus, setRecordingStatus] = useState<RecordingStatus>('idle');
  const [hasRecording, setHasRecording] = useState(false);
  const [inputMethod, setInputMethod] = useState<InputMethod>('record');
  const [result, setResult] = useState('');
  const [inputText, setInputText] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleRecord = () => {
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
        setHasRecording(true);
        setResult(serviceType === 'transcription' 
          ? 'This is a simulated transcription result from your audio recording.'
          : 'This is a simulated translation result from your audio recording.');
        toast({
          title: 'Recording completed',
          description: 'Your audio has been processed successfully.',
        });
      }, 2000);
    }
  };

  const handleDelete = () => {
    setHasRecording(false);
    setRecordingStatus('idle');
    setSelectedFile(null);
    setResult('');
    toast({
      title: 'Recording deleted',
      description: 'Your recording has been removed.',
    });
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      toast({
        title: 'File selected',
        description: `${file.name} has been selected.`,
      });
    }
  };

  const handleProcess = () => {
    if (serviceType === 'transcription') {
      if (inputMethod === 'upload' && !selectedFile) {
        toast({
          title: 'No file selected',
          description: 'Please upload an audio file first.',
          variant: 'destructive',
        });
        return;
      }
      
      if (inputMethod === 'record' && !hasRecording) {
        toast({
          title: 'No recording',
          description: 'Please record audio first.',
          variant: 'destructive',
        });
        return;
      }
    } else if (serviceType === 'translation') {
      if (inputMethod === 'text' && !inputText) {
        toast({
          title: 'No text provided',
          description: 'Please enter text to translate.',
          variant: 'destructive',
        });
        return;
      }
    }

    setRecordingStatus('processing');
    
    setTimeout(() => {
      if (serviceType === 'transcription') {
        setResult(inputMethod === 'upload' 
          ? `Transcription of ${selectedFile?.name}: This is a simulated transcription result.`
          : 'This is a simulated transcription result from your audio recording.');
      } else {
        setResult(`Translation: ${inputText}\n\nTranslated text: This is a simulated translation result.`);
      }
      
      setRecordingStatus('done');
      toast({
        title: 'Processing complete',
        description: `Your ${serviceType} has been processed successfully.`,
      });
    }, 2000);
  };

  const handleReset = () => {
    setHasRecording(false);
    setRecordingStatus('idle');
    setSelectedFile(null);
    setInputText('');
    setResult('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    toast({
      title: 'Reset complete',
      description: 'All inputs have been cleared.',
    });
  };

  return (
    <div className="max-w-4xl mx-auto px-2 py-8">
      <h1 className="text-3xl font-bold mb-8 animate-fade-up">API Services</h1>
      
      <Card className="animate-fade-up [animation-delay:200ms] opacity-0 p-2">
        <CardHeader>
          <CardTitle>Speech and Text Services API</CardTitle>
          <CardDescription>
            Access our speech-to-text and translation services
          </CardDescription>
          <div className="flex items-center gap-3 mb-6">
              <Label htmlFor="language" className="text-sm">Language:</Label>
              <Select 
                value={selectedLanguage} 
                onValueChange={setSelectedLanguage}
                disabled={isLoading}
              >
                <SelectTrigger id="language" className="w-[180px]">
                  <SelectValue placeholder="Select language" />
                </SelectTrigger>
                <SelectContent>
                  {Languages.map((lang) => (
                    <SelectItem key={lang.id} value={lang.id}>
                      {lang.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
        </div>
        </CardHeader>
       

        <Tabs value={serviceType} onValueChange={(value) => setServiceType(value as ServiceType)}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="transcription" className="flex items-center gap-2">
              <Bot className="h-4 w-4" />
              Transcription
            </TabsTrigger>
            <TabsTrigger value="translation" className="flex items-center gap-2">
              <LanguagesIcon className="h-4 w-4" />
              Translation
            </TabsTrigger>
          </TabsList>

          <CardContent className="mt-6 space-y-6">
            {serviceType === 'transcription' && (
              <div className="space-y-4">
                <div className="flex flex-wrap gap-4">
                  <Button 
                    variant={inputMethod === 'record' ? 'default' : 'outline'} 
                    onClick={() => setInputMethod('record')}
                    className="flex items-center gap-2"
                  >
                    <Mic className="h-5 w-5" />
                    Record Audio
                  </Button>
                  <Button 
                    variant={inputMethod === 'upload' ? 'default' : 'outline'} 
                    onClick={() => setInputMethod('upload')}
                    className="flex items-center gap-2"
                  >
                    <Upload className="h-4 w-4" />
                    Upload Audio
                  </Button>
                </div>

                {inputMethod === 'record' && (
                  <div className="flex justify-center py-8 relative">
                    {hasRecording ? (
                      <div className="relative group">
                        <Button
                          size="lg"
                          className="w-24 h-24 rounded-full bg-primary"
                          variant="outline"
                          disabled
                        >
                          <Waveform className="h-8 w-8" />
                        </Button>
                        <Button
                          size="icon"
                          variant="destructive"
                          className="absolute -top-2 -right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                          onClick={handleDelete}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    ) : (
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
                    )}
                  </div>
                )}

                {inputMethod === 'upload' && (
                  <div className="flex flex-col items-center gap-4 py-4">
                    <div className="w-full max-w-md">
                      <Label htmlFor="audio-file">Upload Audio File</Label>
                      <div className="mt-2 flex items-center gap-2">
                        <input
                          ref={fileInputRef}
                          id="audio-file"
                          type="file"
                          accept="audio/*"
                          onChange={handleFileUpload}
                          className="hidden"
                        />
                        <Button 
                          variant="outline" 
                          onClick={() => fileInputRef.current?.click()}
                          className="w-full"
                        >
                          <Upload className="h-4 w-4 mr-2" />
                          Select Audio File
                        </Button>
                        {selectedFile && (
                          <Button
                            size="icon"
                            variant="destructive"
                            onClick={handleDelete}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                      {selectedFile && (
                        <p className="text-sm text-muted-foreground mt-2">
                          Selected: {selectedFile.name}
                        </p>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}

            {serviceType === 'translation' && (
              <div className="space-y-4">
                <div className="flex flex-wrap gap-2">
                  <Button 
                    variant={inputMethod === 'text' ? 'default' : 'outline'} 
                    onClick={() => setInputMethod('text')}
                    className="flex items-center gap-2"
                  >
                    <LanguagesIcon className="h-4 w-4" />
                    Text Input
                  </Button>
                </div>

                {inputMethod === 'text' && (
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="translation-input">Text to Translate</Label>
                      <Textarea
                        id="translation-input"
                        placeholder="Enter text to translate..."
                        className="h-32 mt-2"
                        value={inputText}
                        onChange={(e) => setInputText(e.target.value)}
                      />
                    </div>
                  </div>
                )}
              </div>
            )}

            <div className="space-y-4">
              <div>
                <Label>Result</Label>
                <Textarea
                  placeholder={`Your ${serviceType} will appear here...`}
                  className="h-32 mt-2"
                  readOnly
                  value={result}
                />
              </div>
            </div>
          </CardContent>

          <CardFooter className="flex justify-end space-x-4">
            <Button variant="outline" onClick={handleReset}>Reset</Button>
            <Button onClick={handleProcess}>Process</Button>
          </CardFooter>
        </Tabs>
      </Card>
    </div>
  );
}