import { useState, useRef, useEffect, useCallback, forwardRef, useImperativeHandle } from 'react';
import { Mic, Square, Trash2, Play, Pause, Volume2, VolumeX, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { useToast } from '@/hooks/uiHooks/use-toast';
import WaveSurfer from 'wavesurfer.js';
import { cn } from '@/lib/utils';

type RecordingStatus = 'idle' | 'countdown' | 'recording' | 'paused' | 'stopped';
type AudioQuality = 'good' | 'low' | 'high' | 'unknown';

// Add this export type for the ref
export type AudioRecorderRef = {
  reset: () => void;
};

interface AudioRecorderProps {
  onRecordingComplete?: (audioBlob: Blob) => void;
  countdownSeconds?: number;
  disabled?: boolean;
}

// Convert to forwardRef
const AudioRecorder = forwardRef<AudioRecorderRef, AudioRecorderProps>(({
  onRecordingComplete,
  countdownSeconds = 3,
  disabled = false,
}, ref) => {
  const [status, setStatus] = useState<RecordingStatus>('idle');
  const [audioQuality, setAudioQuality] = useState<AudioQuality>('unknown');
  const [countdown, setCountdown] = useState(countdownSeconds);
  const [recordingTime, setRecordingTime] = useState(0);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [volume, setVolume] = useState(0);
  
  const waveformRef = useRef<HTMLDivElement>(null);
  const wavesurferRef = useRef<WaveSurfer | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const audioStreamRef = useRef<MediaStream | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const recordingIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const countdownIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const dataArrayRef = useRef<Uint8Array | null>(null);
  
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
        // responsive: true,
      });

      wavesurfer.on('play', () => setIsPlaying(true));
      wavesurfer.on('pause', () => setIsPlaying(false));
      wavesurfer.on('finish', () => setIsPlaying(false));

      wavesurferRef.current = wavesurfer;
    }

    return () => {
      if (wavesurferRef.current) {
        wavesurferRef.current.destroy();
        wavesurferRef.current = null;
      }
    };
  }, []);

  // Set up keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Space bar to start/stop recording
      if (e.code === 'Space' && !e.repeat) {
        e.preventDefault();
        if (status === 'idle' || status === 'stopped') {
          handleStartRecording();
        } else if (status === 'recording') {
          handleStopRecording();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [status]);

  // Clean up on unmount
  useEffect(() => {
    return () => {
      stopMediaTracks();
      if (recordingIntervalRef.current) {
        clearInterval(recordingIntervalRef.current);
      }
      if (countdownIntervalRef.current) {
        clearInterval(countdownIntervalRef.current);
      }
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, []);

  // Stop media tracks
  const stopMediaTracks = useCallback(() => {
    if (audioStreamRef.current) {
      audioStreamRef.current.getTracks().forEach(track => track.stop());
      audioStreamRef.current = null;
    }
  }, []);

  // Start countdown before recording
  const handleStartRecording = useCallback(() => {
    if (disabled) return;
    
    setStatus('countdown');
    setCountdown(countdownSeconds);
    
    countdownIntervalRef.current = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          clearInterval(countdownIntervalRef.current!);
          startRecording();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  }, [countdownSeconds, disabled]);

  // Start actual recording
  const startRecording = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      audioStreamRef.current = stream;
      
      // Set up audio analyzer
      audioContextRef.current = new AudioContext();
      analyserRef.current = audioContextRef.current.createAnalyser();
      const source = audioContextRef.current.createMediaStreamSource(stream);
      source.connect(analyserRef.current);
      analyserRef.current.fftSize = 256;
      const bufferLength = analyserRef.current.frequencyBinCount;
      dataArrayRef.current = new Uint8Array(bufferLength);
      
      // Start visualizing audio levels
      visualizeAudio();
      
      // Create and start MediaRecorder
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];
      
      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          audioChunksRef.current.push(e.data);
        }
      };
      
      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/wav' });
        setAudioBlob(audioBlob);
        
        if (wavesurferRef.current) {
          const audioUrl = URL.createObjectURL(audioBlob);
          wavesurferRef.current.load(audioUrl);
        }
        
        if (onRecordingComplete) {
          onRecordingComplete(audioBlob);
        }
      };
      
      mediaRecorder.start();
      setStatus('recording');
      setRecordingTime(0);
      
      // Update recording time
      recordingIntervalRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);
      
    } catch (error) {
      console.error('Error accessing microphone:', error);
      toast({
        title: 'Microphone Error',
        description: 'Could not access your microphone. Please check permissions.',
        variant: 'destructive',
      });
      setStatus('idle');
    }
  }, [onRecordingComplete, toast]);

  // Visualize audio levels
  const visualizeAudio = useCallback(() => {
    if (!analyserRef.current || !dataArrayRef.current) return;
    
    const updateAudioLevel = () => {
      if (!analyserRef.current || !dataArrayRef.current) return;
      
      analyserRef.current.getByteFrequencyData(dataArrayRef.current);
      
      // Calculate average volume level
      const average = dataArrayRef.current.reduce((acc, val) => acc + val, 0) / dataArrayRef.current.length;
      const normalizedVolume = Math.min(100, Math.max(0, average / 256 * 100));
      setVolume(normalizedVolume);
      
      // Determine audio quality based on volume
      if (normalizedVolume < 20) {
        setAudioQuality('low');
      } else if (normalizedVolume > 80) {
        setAudioQuality('high');
      } else {
        setAudioQuality('good');
      }
      
      // Update waveform color based on quality
      if (wavesurferRef.current) {
        if (audioQuality === 'low') {
          wavesurferRef.current.setOptions({ waveColor: '#eab308' }); // yellow
        } else if (audioQuality === 'high') {
          wavesurferRef.current.setOptions({ waveColor: '#eab308' }); // yellow
        } else {
          wavesurferRef.current.setOptions({ waveColor: '#22c55e' }); // green
        }
      }
      
      animationFrameRef.current = requestAnimationFrame(updateAudioLevel);
    };
    
    updateAudioLevel();
  }, [audioQuality]);

  // Stop recording
  const handleStopRecording = useCallback(() => {
    if (mediaRecorderRef.current && status === 'recording') {
      mediaRecorderRef.current.stop();
      stopMediaTracks();
      
      if (recordingIntervalRef.current) {
        clearInterval(recordingIntervalRef.current);
      }
      
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      
      setStatus('stopped');
      setVolume(0);
      
      toast({
        title: 'Recording Complete',
        description: `Your ${recordingTime} second recording is ready.`,
      });
    }
  }, [status, recordingTime, stopMediaTracks, toast]);

  // Play/pause recorded audio
  const togglePlayback = useCallback(() => {
    if (wavesurferRef.current) {
      if (isPlaying) {
        wavesurferRef.current.pause();
      } else {
        wavesurferRef.current.play();
      }
    }
  }, [isPlaying]);

  // Delete recording
  const handleDeleteRecording = useCallback(() => {
    setShowDeleteDialog(false);
    
    if (wavesurferRef.current) {
      wavesurferRef.current.empty();
    }
    
    setAudioBlob(null);
    setStatus('idle');
    setRecordingTime(0);
    
    toast({
      title: 'Recording Deleted',
      description: 'Your recording has been deleted.',
    });
  }, [toast]);

  // Format time (seconds to MM:SS)
  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Get waveform color based on recording status and audio quality
  const getWaveformColor = (): string => {
    if (status !== 'recording') return 'bg-blue-500';
    
    switch (audioQuality) {
      case 'low':
        return 'bg-yellow-500';
      case 'high':
        return 'bg-yellow-500';
      case 'good':
        return 'bg-green-500';
      default:
        return 'bg-blue-500';
    }
  };

  // Expose methods to parent component via ref
  useImperativeHandle(ref, () => ({
    reset: () => {
      // Reset the component state
      setStatus('idle');
      setAudioBlob(null);
      setRecordingTime(0);
      setVolume(0);
      setAudioQuality('unknown');
      
      // Stop any active recording
      if (status === 'recording' || status === 'paused') {
        stopMediaTracks();
        if (recordingIntervalRef.current) {
          clearInterval(recordingIntervalRef.current);
          recordingIntervalRef.current = null;
        }
      }
      
      // Clear any ongoing countdown
      if (status === 'countdown' && countdownIntervalRef.current) {
        clearInterval(countdownIntervalRef.current);
        countdownIntervalRef.current = null;
        setCountdown(countdownSeconds);
      }
      
      // Clear audio visualization
      if (wavesurferRef.current) {
        try {
          wavesurferRef.current.empty();
        } catch (e) {
          console.warn('Error clearing waveform:', e);
        }
      }
      
      // Clear audio chunks
      audioChunksRef.current = [];
    }
  }));

  return (
    <div className={cn("space-y-4", disabled && "opacity-70 pointer-events-none")}>
      {/* Countdown overlay */}
      {status === 'countdown' && (
        <div className="absolute inset-0 flex items-center justify-center bg-background/80 z-10 rounded-md">
          <div className="text-6xl font-bold animate-pulse">{countdown}</div>
        </div>
      )}
      
      {/* Recording status */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {status === 'recording' && (
            <div className="flex items-center gap-2">
              <div className="h-3 w-3 rounded-full bg-red-500 animate-pulse" />
              <span className="text-sm font-medium">Recording</span>
            </div>
          )}
          {status === 'stopped' && (
            <div className="flex items-center gap-2">
              <div className="h-3 w-3 rounded-full bg-green-500" />
              <span className="text-sm font-medium">Recorded</span>
            </div>
          )}
        </div>
        
        {status === 'recording' && (
          <div className="text-sm font-medium">{formatTime(recordingTime)}</div>
        )}
      </div>
      
      {/* Waveform visualization */}
      <div className="relative border rounded-md p-4 bg-background">
        <div 
          ref={waveformRef} 
          className={cn(
            "w-full h-20 relative",
            status === 'recording' && "before:absolute before:inset-0 before:bg-red-500/10"
          )}
        />
        
        {status === 'idle' && !audioBlob && (
          <div className="absolute inset-0 flex items-center justify-center text-muted-foreground">
            Press record to start
          </div>
        )}
        
        {/* Volume indicator */}
        {status === 'recording' && (
          <div className="mt-2">
            <div className="flex items-center justify-between mb-1">
              <div className="flex items-center gap-1">
                {volume < 20 ? <VolumeX className="h-4 w-4 text-yellow-500" /> : <Volume2 className="h-4 w-4" />}
                <span className="text-xs">Volume</span>
              </div>
              <span className="text-xs">{Math.round(volume)}%</span>
            </div>
            <Progress value={volume} className="h-1" />
          </div>
        )}
      </div>
      
      {/* Audio quality warnings */}
      <div className="mt-2">
        <Alert 
          variant={status === 'recording' ? 
            (audioQuality === 'low' || audioQuality === 'high' ? 'warning' : 'default') : 
            'default'
          } 
          className={cn(
            "transition-colors duration-200",
            status === 'recording' && audioQuality === 'low' && "bg-yellow-500/10 border-yellow-500",
            status === 'recording' && audioQuality === 'high' && "bg-yellow-500/10 border-yellow-500",
            status === 'recording' && audioQuality === 'good' && "bg-green-500/10 border-green-500"
          )}
        >
          <AlertTriangle className={cn(
            "h-4 w-4",
            status === 'recording' && audioQuality === 'low' && "text-yellow-500",
            status === 'recording' && audioQuality === 'high' && "text-yellow-500",
            status === 'recording' && audioQuality === 'good' && "text-green-500"
          )} />
          <AlertDescription>
            {status === 'recording' ? (
              audioQuality === 'low' ? 'Volume is too low. Please speak louder or move closer to the microphone.' :
              audioQuality === 'high' ? 'Volume is too high. Please speak softer or move away from the microphone.' :
              'Audio quality is good. Keep speaking.'
            ) : (
              'Press record to start speaking'
            )}
          </AlertDescription>
        </Alert>
      </div>
      
      {/* Controls */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {(status === 'idle' || status === 'stopped') && (
            <Button
              onClick={handleStartRecording}
              variant="default"
              size="icon"
              className="h-10 w-10 rounded-full bg-red-500 hover:bg-red-600"
            >
              <Mic className="h-5 w-5" />
            </Button>
          )}
          
          {status === 'recording' && (
            <Button
              onClick={handleStopRecording}
              variant="default"
              size="icon"
              className="h-10 w-10 rounded-full"
            >
              <Square className="h-5 w-5" />
            </Button>
          )}
          
          {status === 'stopped' && audioBlob && (
            <Button
              onClick={togglePlayback}
              variant="outline"
              size="icon"
              className="h-10 w-10 rounded-full"
            >
              {isPlaying ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5" />}
            </Button>
          )}
        </div>
        
        {status === 'stopped' && audioBlob && (
          <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm" className="text-destructive">
                <Trash2 className="h-4 w-4 mr-2" />
                Delete & Re-record
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Delete Recording</DialogTitle>
                <DialogDescription>
                  Are you sure you want to delete this recording? This action cannot be undone.
                </DialogDescription>
              </DialogHeader>
              <DialogFooter>
                <Button variant="outline" onClick={() => setShowDeleteDialog(false)}>
                  Cancel
                </Button>
                <Button variant="destructive" onClick={handleDeleteRecording}>
                  Delete
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        )}
      </div>
      
      {/* Keyboard shortcut hint */}
      <div className="text-xs text-muted-foreground text-center mt-2">
        Press <kbd className="px-1 py-0.5 bg-muted rounded border">Space</kbd> to {status === 'recording' ? 'stop' : 'start'} recording
      </div>
    </div>
  );
});

export default AudioRecorder; 