import { useState, useRef } from 'react';
import { ThumbsUp, Divide, Flag, Play, Pause, Volume2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
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
import { cn } from "@/lib/utils";
import { Separator } from "@/components/ui/separator";

export type ContributionType = 'translation' | 'transcription' | 'annotation';

interface Contribution {
  id: string;
  content: string;
  // For annotations, we may need to store image URL or other data
  imageUrl?: string;
  audioUrl?: string;
  sourceContent?: string;
}

interface ABTestingProps {
  taskType: ContributionType;
  language: string;
  contributionA: Contribution;
  contributionB: Contribution;
  sourceContent?: string;
  onSubmit: (result: 'A' | 'B' | 'same' | 'flag', reason?: string, notes?: string) => void;
  className?: string;
}

export default function ABTesting({
  taskType,
  language,
  contributionA,
  contributionB,
  sourceContent,
  onSubmit,
  className
}: ABTestingProps) {
  const [selected, setSelected] = useState<'A' | 'B' | 'same' | null>(null);
  const [showFlagDialog, setShowFlagDialog] = useState(false);
  const [flagReason, setFlagReason] = useState('');
  const [flagNote, setFlagNote] = useState('');
  const [playingAudio, setPlayingAudio] = useState<'A' | 'B' | null>(null);
  
  // Audio refs for transcription mode
  const audioRefA = useRef<HTMLAudioElement>(null);
  const audioRefB = useRef<HTMLAudioElement>(null);
  
  const { toast } = useToast();

  const handleSubmit = () => {
    if (!selected) {
      toast({
        title: "Selection required",
        description: "Please select which contribution is better, or if they're the same.",
        variant: "destructive",
      });
      return;
    }
    
    onSubmit(selected, undefined, undefined);
    setSelected(null);
  };

  const handleFlag = () => {
    if (!flagReason) {
      toast({
        title: "Reason required",
        description: "Please select a reason for flagging.",
        variant: "destructive",
      });
      return;
    }
    
    onSubmit('flag', flagReason, flagNote);
    setShowFlagDialog(false);
    setFlagReason('');
    setFlagNote('');
  };

  const handlePlayAudio = (option: 'A' | 'B') => {
    if (option === 'A') {
      if (playingAudio === 'A') {
        // Pause if already playing
        audioRefA.current?.pause();
        setPlayingAudio(null);
      } else {
        // Pause other audio if playing
        audioRefB.current?.pause();
        // Play this audio
        audioRefA.current?.play();
        setPlayingAudio('A');
      }
    } else {
      if (playingAudio === 'B') {
        // Pause if already playing
        audioRefB.current?.pause();
        setPlayingAudio(null);
      } else {
        // Pause other audio if playing
        audioRefA.current?.pause();
        // Play this audio
        audioRefB.current?.play();
        setPlayingAudio('B');
      }
    }
  };

  // Handle audio ending
  const handleAudioEnded = () => {
    setPlayingAudio(null);
  };

  const renderContent = (contribution: Contribution, option: 'A' | 'B') => {
    switch (taskType) {
      case 'translation':
        return (
          <div className="p-4 rounded-md bg-muted h-full break-words whitespace-pre-wrap">
            {contribution.content}
          </div>
        );
      case 'transcription':
        return (
          <div className="p-4 rounded-md bg-muted h-full">
            <div className="flex flex-col space-y-4">
              {/* Audio Player */}
              <div className="flex items-center space-x-3">
                <Button
                  variant="outline"
                  size="icon"
                  className={cn(
                    "h-10 w-10 rounded-full",
                    playingAudio === option && "bg-primary text-primary-foreground"
                  )}
                  onClick={() => handlePlayAudio(option)}
                >
                  {playingAudio === option ? (
                    <Pause className="h-5 w-5" />
                  ) : (
                    <Play className="h-5 w-5" />
                  )}
                </Button>
                <div className="text-sm font-medium">Audio Sample {option}</div>
                <audio 
                  ref={option === 'A' ? audioRefA : audioRefB}
                  src={contribution.audioUrl || "https://assets.mixkit.co/music/preview/mixkit-tech-house-vibes-130.mp3"} 
                  onEnded={handleAudioEnded}
                  className="hidden"
                />
              </div>
              
              {/* Audio Visualization (placeholder) */}
              <div className="w-full h-12 bg-muted-foreground/20 rounded-md flex items-center justify-center">
                <Volume2 className="h-4 w-4 text-muted-foreground" />
              </div>
            </div>
          </div>
        );
      case 'annotation':
        return (
          <div className="space-y-4">
            {contribution.imageUrl && (
              <div className="w-full h-48 bg-muted flex items-center justify-center rounded-md overflow-hidden">
                <img 
                  src={contribution.imageUrl} 
                  alt="Annotation content" 
                  className="w-full h-full object-contain"
                />
              </div>
            )}
            <div className="p-4 rounded-md bg-muted h-full break-words whitespace-pre-wrap">
              {contribution.content}
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <Card className={cn("w-full", className)}>
      <CardHeader>
        <CardTitle className="text-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <span>Compare Contributions ({language})</span>
          <Dialog open={showFlagDialog} onOpenChange={setShowFlagDialog}>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm" className="text-destructive w-full sm:w-auto">
                <Flag className="h-4 w-4 mr-2" />
                Flag Issues
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Flag Contributions</DialogTitle>
                <DialogDescription>
                  Please select the reason for flagging these contributions.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <Select value={flagReason} onValueChange={setFlagReason}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select reason for flagging" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="inappropriate">Inappropriate Content</SelectItem>
                    <SelectItem value="quality">Poor Quality</SelectItem>
                    <SelectItem value="spam">Spam</SelectItem>
                    <SelectItem value="similar">Too Similar to Compare</SelectItem>
                    <SelectItem value="language">Wrong Language</SelectItem>
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
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Source content (always displayed for transcription, optional for others) */}
        {(sourceContent || taskType === 'transcription') && (
          <div className="space-y-2">
            <h3 className="text-sm font-medium">Source Content</h3>
            <div className="p-4 rounded-md bg-muted/50 border border-border">
              <p>{taskType === 'transcription' ? "Listen to both audio samples and compare which one better transcribes this text:" : sourceContent}</p>
              <p className="mt-2 font-medium">{taskType === 'transcription' ? sourceContent : ""}</p>
            </div>
          </div>
        )}
        
        {/* Contributions side by side with vs divider */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-8">
          {/* Option A */}
          <div className="md:col-span-2">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-medium">Option A</h3>
              <Button
                variant={selected === 'A' ? 'default' : 'outline'}
                size="sm"
                className={cn(
                  "w-28",
                  selected === 'A' ? "bg-green-600 hover:bg-green-700" : ""
                )}
                onClick={() => setSelected('A')}
              >
                <ThumbsUp className="h-4 w-4 mr-2" />
                Better
              </Button>
            </div>
            {renderContent(contributionA, 'A')}
          </div>
          
          {/* VS Divider */}
          <div className="md:col-span-1 flex flex-row md:flex-col items-center justify-center">
            <div className="hidden md:flex h-full items-center">
              <Separator orientation="vertical" className="h-full" />
            </div>
            <div className="md:hidden w-full">
              <Separator className="my-4" />
            </div>
            <div className="px-4 py-2 bg-muted rounded-full text-center font-bold text-sm">VS</div>
            <div className="hidden md:flex h-full items-center">
              <Separator orientation="vertical" className="h-full" />
            </div>
            <div className="md:hidden w-full">
              <Separator className="my-4" />
            </div>
          </div>
          
          {/* Option B */}
          <div className="md:col-span-2">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-medium">Option B</h3>
              <Button
                variant={selected === 'B' ? 'default' : 'outline'}
                size="sm"
                className={cn(
                  "w-28",
                  selected === 'B' ? "bg-green-600 hover:bg-green-700" : ""
                )}
                onClick={() => setSelected('B')}
              >
                <ThumbsUp className="h-4 w-4 mr-2" />
                Better
              </Button>
            </div>
            {renderContent(contributionB, 'B')}
          </div>
        </div>
      </CardContent>
      
      <CardFooter className="flex flex-col sm:flex-row justify-between pt-6 gap-4">
        <Button
          variant={selected === 'same' ? 'default' : 'outline'}
          onClick={() => setSelected('same')}
          className="w-full sm:w-auto"
        >
          <Divide className="h-4 w-4 mr-2" />
          Equally Good
        </Button>
        
        <Button 
          onClick={handleSubmit}
          className="w-full sm:w-auto"
        >
          Submit Evaluation
        </Button>
      </CardFooter>
    </Card>
  );
} 