import { useState, useRef, useEffect } from 'react';
import { CheckCircle, XCircle, Play, Pause, Flag } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { useGetUserLanguages } from '@/hooks/languageHooks/useGetUserLanguages';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import WaveSurfer from 'wavesurfer.js';

type ValidationStatus = 'pending' | 'correct' | 'wrong' | 'flagged';

export default function TranscriptionValidation() {
  const { 
    data: userLanguages=[],
    isLoading: languagesLoading,
    isError,
  } = useGetUserLanguages();
  const [isPlaying, setIsPlaying] = useState(false);
  const [validationStatus, setValidationStatus] = useState<ValidationStatus>('pending');
  const [transcription, setTranscription] = useState('');
  const [flagReason, setFlagReason] = useState('');
  const [flagNote, setFlagNote] = useState('');
  const [showFlagDialog, setShowFlagDialog] = useState(false);
  const [showCorrectionDialog, setShowCorrectionDialog] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState('');
  
  const waveformRef = useRef<HTMLDivElement>(null);
  const wavesurferRef = useRef<WaveSurfer | null>(null);
  const { toast } = useToast();

  // Initialize WaveSurfer
  useEffect(() => {
    if (waveformRef.current && !wavesurferRef.current) {
      const wavesurfer = WaveSurfer.create({
        container: waveformRef.current,
        waveColor: '#4a5568',
        progressColor: '#2563eb',
        cursorColor: 'transparent',
        barWidth: 2,
        barGap: 1,
        barRadius: 3,
        height: 80,
      });

      wavesurfer.on('play', () => setIsPlaying(true));
      wavesurfer.on('pause', () => setIsPlaying(false));
      wavesurfer.on('finish', () => setIsPlaying(false));

      // Load sample audio (replace with actual audio URL)
      wavesurfer.load('/sample-audio.wav');

      wavesurferRef.current = wavesurfer;
    }

    return () => {
      if (wavesurferRef.current) {
        wavesurferRef.current.destroy();
        wavesurferRef.current = null;
      }
    };
  }, []);

  const togglePlayback = () => {
    if (wavesurferRef.current) {
      if (isPlaying) {
        wavesurferRef.current.pause();
      } else {
        wavesurferRef.current.play();
      }
    }
  };

  const handleValidation = (status: ValidationStatus) => {
    if (!selectedLanguage) {
      toast({
        title: 'Please select a language',
        description: 'You need to select a language before validating.',
        variant: 'destructive',
      });
      return;
    }

    setValidationStatus(status);
    if (status === 'correct') {
      toast({
        title: 'Validation Complete',
        description: 'Moving to next audio...',
      });
      // Reset and load next audio
      resetState();
    } else if (status === 'wrong') {
      setShowCorrectionDialog(true);
    }
  };

  const handleFlag = () => {
    if (!selectedLanguage) {
      toast({
        title: 'Please select a language',
        description: 'You need to select a language before flagging.',
        variant: 'destructive',
      });
      return;
    }

    if (!flagReason) {
      toast({
        title: 'Flag Reason Required',
        description: 'Please select a reason for flagging.',
        variant: 'destructive',
      });
      return;
    }
    
    setValidationStatus('flagged');
    setShowFlagDialog(false);
    toast({
      title: 'Audio Flagged',
      description: 'Thank you for your feedback.',
    });
    // Reset and load next audio
    resetState();
  };

  const resetState = () => {
    setValidationStatus('pending');
    setTranscription('');
    setFlagReason('');
    setFlagNote('');
    // Load next audio here
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-5">Transcription Validation</h1>
      <p className="text-muted-foreground mb-6">Listen to the audio and verify if the transcription is correct.</p>
      <div className="flex items-center gap-3 mb-6">
              <Label htmlFor="language" className="text-sm">Language:</Label>
              <Select 
                value={selectedLanguage} 
                onValueChange={setSelectedLanguage}
                disabled={languagesLoading}
              >
                <SelectTrigger id="language" className="w-[180px]">
                  <SelectValue placeholder="Select language" />
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
      
      <Card className="animate-fade-up [animation-delay:200ms] opacity-0">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-semibold">Audio #{Math.floor(Math.random() * 1000)}</h2>
              <p className="text-sm text-muted-foreground">Listen to the audio and verify the transcription</p>
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-6 pt-6">
          {/* Audio Player with Waveform */}
          <div className="relative border rounded-md p-4 bg-background">
            <div className="flex items-center gap-4 mb-4">
              <Button
                onClick={togglePlayback}
                variant="outline"
                size="icon"
                className="h-10 w-10 rounded-full"
              >
                {isPlaying ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5" />}
              </Button>
              <span className="text-sm font-medium">Listen to the audio</span>
              
              {/* Flag Button */}
              <Dialog open={showFlagDialog} onOpenChange={setShowFlagDialog}>
                <DialogTrigger asChild>
                  <Button 
                    variant="outline" 
                    size="icon"
                    className="ml-auto h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
                  >
                    <Flag className="h-4 w-4" />
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Flag Audio Issue</DialogTitle>
                    <DialogDescription>
                      Please select the reason for flagging this audio and provide additional details if needed.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4 py-4">
                    <Select value={flagReason} onValueChange={setFlagReason}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select reason for flagging" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="poor_quality">Poor Audio Quality</SelectItem>
                        <SelectItem value="background_noise">Excessive Background Noise</SelectItem>
                        <SelectItem value="inappropriate">Inappropriate Content</SelectItem>
                        <SelectItem value="wrong_language">Wrong Language</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                    <Textarea
                      placeholder="Additional notes (optional)"
                      value={flagNote}
                      onChange={(e) => setFlagNote(e.target.value)}
                      className="h-20"
                    />
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setShowFlagDialog(false)}>
                      Cancel
                    </Button>
                    <Button variant="destructive" onClick={handleFlag}>
                      Submit Flag
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
            
            <div ref={waveformRef} className="w-full h-20" />
          </div>

          {/* Transcription Display */}
          <div className="space-y-4">
            <div>
              <Label>Transcription</Label>
              <div className="mt-2 p-4 rounded-md bg-muted">
                <p className="text-lg">{transcription || "Sample transcription text..."}</p>
              </div>
            </div>
          </div>

          {/* Correction Dialog */}
          <Dialog open={showCorrectionDialog} onOpenChange={setShowCorrectionDialog}>
            <DialogContent className='rounded-md'>
              <DialogHeader>
                <DialogTitle>Incorrect Transcription</DialogTitle>
                <DialogDescription>
                  Please provide the correct transcription for this audio.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <Textarea
                  placeholder="Enter the correct transcription"
                  value={transcription}
                  onChange={(e) => setTranscription(e.target.value)}
                  className="h-32"
                />
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setShowCorrectionDialog(false)}>
                  Cancel
                </Button>
                <Button onClick={() => {
                  setShowCorrectionDialog(false);
                  toast({
                    title: 'Transcription Updated',
                    description: 'Thank you for your contribution.',
                  });
                  resetState();
                }}>
                  Submit Correction
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </CardContent>

        <CardFooter className="flex justify-between flex-wrap items-center gap-8">
          <div className="flex space-x-4">
            <Button
              variant="outline"
              className="flex items-center space-x-2"
              onClick={() => handleValidation('correct')}
            >
              <CheckCircle className="h-5 w-5 text-green-600" />
              <span>Correct</span>
            </Button>
            <Button
              variant="outline"
              className="flex items-center space-x-2"
              onClick={() => handleValidation('wrong')}
            >
              <XCircle className="h-5 w-5 text-red-600" />
              <span>Wrong</span>
            </Button>
          </div>
          <Button onClick={resetState}>Next</Button>
        </CardFooter>
      </Card>
    </div>
  );
} 