import { useState, useRef, useEffect } from 'react';
import { ThumbsUp, Divide, Flag, Play, Pause, Volume2, Loader2 } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { useAssignABTests } from '@/hooks/evaluationHooks/useAssignABTest';
import { useCastABTestVote } from '@/hooks/evaluationHooks/useCastABTestVote';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { UserLanguage } from '@/types/language';
import { mapProficiencyToNumber } from "@/utils/validationUtil";

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
import { ABTestAssignment } from '@/types/evaluation';
import { getFileUrl } from '@/utils/tempStorageService';

export type ContributionType = 'translation' | 'transcription' | 'annotation';

interface ABTestingProps {
  taskType: ContributionType;
  language: string;
  languageId: string;
  className?: string;

  //validation integration
  externalTest?: ABTestAssignment | null;
  validationMode?: boolean;
  onVoteSubmitted?: (selection: 'A' | 'B' | 'same' | null) => void;
  sourceContent?: string;
  userlanguages?: UserLanguage[]
}

export default function ABTesting({
  taskType,
  language,
  languageId,
  className,
  externalTest = null,
  validationMode = false,
  onVoteSubmitted,
  sourceContent,
  userlanguages
}: ABTestingProps) {
  // State management
  const [selected, setSelected] = useState<'A' | 'B' | 'same' | null>(null);
  const [showFlagDialog, setShowFlagDialog] = useState(false);
  const [flagReason, setFlagReason] = useState('');
  const [flagNote, setFlagNote] = useState('');
  const [playingAudio, setPlayingAudio] = useState<'A' | 'B' | null>(null);
  const [currentTest, setCurrentTest] = useState<ABTestAssignment | null>(null);
  const [testBuffer, setTestBuffer] = useState<ABTestAssignment[]>([]);
  const [hasStarted, setHasStarted] = useState(false);

  const [simplifiedMode, setSimplifiedMode] = useState(false);

  // Buffering Config
  const [bufferLoading, setBufferLoading] = useState(false);
  const bufferSize = 3; // Number of tests to keep in buffer
  const bufferThreshold = 1; // When to trigger refill

  const [isSubmitting, setIsSubmitting] = useState(false);

  // Audio refs for transcription mode
  const audioRefA = useRef<HTMLAudioElement>(null);
  const audioRefB = useRef<HTMLAudioElement>(null);

  const { toast } = useToast();
  // Hooks for AB Test functionality
  const assignABTest = useAssignABTests();
  const castABTestVote = useCastABTestVote();

  // If external test is provided, use it
  useEffect(() => {
    if (externalTest) {
      setCurrentTest(externalTest);
      setHasStarted(true);
      setSimplifiedMode(validationMode);
      return;
    }
    if (!validationMode) {
      setTestBuffer([]);
      setCurrentTest(null);
    }

  }, [externalTest, validationMode]);

  // Handle language/task changes
  useEffect(() => {
    if (validationMode || !languageId || !taskType) return;

    const needsRefill = testBuffer.length <= bufferThreshold;
    const isEmpty = testBuffer.length === 0;

    if (needsRefill || isEmpty) {
      loadABTests();
    }
  }, [languageId, taskType, testBuffer.length, validationMode]);

  const getProficiency = (languageId: string): string | undefined => {
    if (userlanguages) {
      const match = userlanguages.find((lang) => lang.language.id === languageId);
      return match?.proficiency;
    }
    return 'beginner'

  };

  const startTesting = () => {
    if (!languageId || !taskType) {
      toast({
        title: "Missing information",
        description: "Please select both a language and task type to continue.",
        variant: "destructive",
      });
      return;
    }
    setHasStarted(true);
  };

  const loadABTests = async () => {
    if (!languageId || !taskType) return;

    setBufferLoading(true);

    // Load 3 AB tests at once
    try {
      const results = await assignABTest.mutateAsync({
        proficiencyLevel: mapProficiencyToNumber(
          getProficiency(languageId) || "beginner"
        )
      });

      if (results.length > 0) {
        setTestBuffer(prev => [...prev, ...results]);
        if (!currentTest) setCurrentTest(results[0]);

      } else if (testBuffer.length === 0) {
        toast({
          title: "No AB tests available",
          description: "There are no AB tests available for this language right now.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error assigning AB tests:", error);
      toast({
        title: "Error",
        description: "Failed to load AB tests. Please try again.",
        variant: "destructive",
      });
    } finally {
      setBufferLoading(false);
    }
  };

  const handleSubmit = () => {
    if (!selected) {
      toast({
        title: "Selection required",
        description: "Please select which contribution is better, or if they're the same.",
        variant: "destructive",
      });
      return;
    }

    if (!currentTest) {
      toast({
        title: "No test available",
        description: "Please wait for a test to load.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    // If in validation mode, just return the result to parent
    if (validationMode && onVoteSubmitted) {
      onVoteSubmitted(selected);
      // setIsLoading(false);
      return;
    }

    // Determine which contribution IDs to select based on user choice
    const selectedIds = selected === 'A' ? [currentTest.option_a.id] :
      selected === 'B' ? [currentTest.option_b.id] :
        [currentTest.option_a.id, currentTest.option_b.id];

    castABTestVote.mutate({
      pairId: currentTest.pair_id,
      data: {
        selected_contribution_ids: selectedIds,
        contribution_type: taskType,
        language_id: languageId
      }
    }, {
      onSuccess: () => {
        toast({
          title: "Vote submitted",
          description: "Your evaluation has been recorded. Thank you!",
        });
        moveToNextTest();
      },
      onError: (error) => {
        console.error("Error submitting vote:", error);
        toast({
          title: "Error",
          description: "Failed to submit your vote. Please try again.",
          variant: "destructive",
        });
      },
      onSettled: () => {
        setIsSubmitting(false); // Reset submitting state
      }
    });
  };

  const handleFlag = () => {
    if (!flagReason || !currentTest) {
      toast({
        title: "Reason required",
        description: "Please select a reason for flagging.",
        variant: "destructive",
      });
      return;
    }

    if (!currentTest) {
      return;
    }

    // // Handle flagging by not selecting any contribution
    // castABTestVote.mutate({
    //   pairId: currentTest.pair_id,
    //   data: {
    //     selected_contribution_ids: [],
    //     contribution_type: taskType,
    //     language_id: languageId
    //   }
    // }, {
    //   onSuccess: () => {
    //     toast({
    //       title: "Content flagged",
    //       description: "Thank you for your feedback.",
    //     });
    //     setShowFlagDialog(false);
    //     setFlagReason('');
    //     setFlagNote('');
    //     moveToNextTest();
    //   },
    //   onError: (error) => {
    //     console.error("Error flagging content:", error);
    //     toast({
    //       title: "Error",
    //       description: "Failed to submit your flag. Please try again.",
    //       variant: "destructive",
    //     });
    //     setShowFlagDialog(false);
    //   }
    // });
    toast({
            title: "Content flagged",
            description: "Thank you for your feedback.",
          });
  };

  const moveToNextTest = () => {
    const newBuffer = [...testBuffer];
    newBuffer.shift();
    setTestBuffer(newBuffer);
    setSelected(null);
    setPlayingAudio(null);

    if (newBuffer.length <= bufferThreshold && !validationMode) {
      loadABTests();
    }

    setCurrentTest(newBuffer[0] || null);
  };


  const handlePlayAudio = (option: 'A' | 'B') => {
    if (!currentTest) return;

    const audioRef = option === 'A' ? audioRefA : audioRefB;

    // If this option is already playing, pause it
    if (playingAudio === option) {
      audioRef.current?.pause();
      setPlayingAudio(null);
      return;
    }

    // If the other option is playing, pause it
    if (playingAudio) {
      const otherRef = playingAudio === 'A' ? audioRefB : audioRefA;
      otherRef.current?.pause();
    }

    // Get the audio URL using the temporary storage service
    const audioUrl = getFileUrl(currentTest[option === 'A' ? 'option_a' : 'option_b'].content, 'audio');

    // Set the audio source if it's not already set
    if (audioRef.current && audioRef.current.src !== audioUrl) {
      audioRef.current.src = audioUrl;
    }

    // Play this option
    audioRef.current?.play();
    setPlayingAudio(option);
  };

  // Handle audio ending
  const handleAudioEnded = () => {
    setPlayingAudio(null);
  };

  const renderContent = (option: 'A' | 'B') => {
    if (!currentTest) return null;

    const contribution = option === 'A' ? currentTest.option_a : currentTest.option_b;

    switch (taskType) {
      case 'translation':
        return (
          <div className="p-4 rounded-md bg-muted h-full break-words whitespace-pre-wrap">
            {contribution.content}
          </div>
        );
      case 'transcription':
        const audioUrl = contribution.content

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
                  src={audioUrl}
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
        // Parse content for annotation to extract image URL if available
        let imageUrl = '';
        let textContent = contribution.content;

        try {
          const contentData = JSON.parse(contribution.content);
          if (contentData.imageUrl) {
            imageUrl = contentData.imageUrl;
            textContent = contribution.content;
          }
        } catch (e) {
          // If parsing fails, use the content as is
        }
        return (
          <div className="space-y-4">
            {imageUrl && (
              <div className="w-full h-48 bg-muted flex items-center justify-center rounded-md overflow-hidden">
                <img
                  src={imageUrl}
                  alt="Annotation content"
                  className="w-full h-full object-contain"
                />
              </div>
            )}
            <div className="p-4 rounded-md bg-muted h-full break-words whitespace-pre-wrap">
              {textContent}
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
          <span>Compare Contributions</span>
          <Dialog open={showFlagDialog} onOpenChange={setShowFlagDialog}>
            <DialogTrigger asChild>
              <Button 
              variant="outline" 
              size="sm" 
              className="text-destructive w-full sm:w-auto" 
              disabled={!hasStarted || !currentTest || isSubmitting}>
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
        {!languageId || !taskType ? (
          <div className="flex flex-col items-center justify-center py-12">
            <p className="text-muted-foreground mb-4">Welcome to Project Bantu </p>
            <p className="text-muted-foreground mb-4">Select one of your Interested Languages & A Task type to kick start</p>
          </div>
        ) : !hasStarted ? (
          <div className="flex flex-col items-center justify-center py-12">
            <p className="text-muted-foreground mb-4">Ready to start A/B Testing for {language} {taskType}?</p>
            <Button onClick={startTesting}>
              Start A/B Testing
            </Button>
          </div>
        ) : bufferLoading && testBuffer.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
            <p className="text-muted-foreground">Loading comparison tasks...</p>
          </div>
        ) : !currentTest ? (
          <div className="flex flex-col items-center justify-center py-12">
            <p className="text-muted-foreground mb-4">No comparison tasks available.</p>
            <Button onClick={loadABTests} disabled={!languageId || !taskType || validationMode}>
              Try Again
            </Button>
          </div>
        ) : (
          <>
            {/* Source content (displayed for validation flows or transcription) */}
            {(sourceContent || taskType === 'transcription') && (
              <div className="space-y-2">
                <h3 className="text-sm font-medium">Source Content</h3>
                <div className="p-4 rounded-md bg-muted/50 border border-border">
                  {taskType === 'transcription' ? (
                    <>
                      <p>Listen to both audio samples and compare which one better transcribes this text:</p>
                      <p className="mt-2 font-medium">{sourceContent || (currentTest.option_a.content)}</p>
                    </>
                  ) : (
                    <p className="mt-2 font-medium">{sourceContent}</p>
                  )}
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
                {renderContent('A')}
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
                {renderContent('B')}
              </div>
            </div>
          </>
        )}
      </CardContent>

      <CardFooter className="flex flex-col sm:flex-row justify-between pt-10 gap-4">
        {!simplifiedMode && (
          <Button
            variant={selected === 'same' ? 'default' : 'outline'}
            onClick={() => setSelected('same')}
            className="w-full sm:w-auto"
            disabled={!currentTest || !hasStarted || isSubmitting}
          >
            <Divide className="h-4 w-4 mr-2" />
            Equally Good
          </Button>
        )}

        <div className="flex items-center gap-3">
          {testBuffer.length > 0 && !validationMode && (
            <span className="text-sm text-muted-foreground">
              {testBuffer.length} test{testBuffer.length !== 1 ? "s" : ""} left
            </span>
          )}
          <Button
            onClick={handleSubmit}
            className="w-full sm:w-auto"
            disabled={!currentTest || !selected || !hasStarted || isSubmitting}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Submitting...
              </>
            ) : "Submit Evaluation"}
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
}

// Add static properties to the component
ABTesting.setTest = (test: ABTestAssignment, simplified = false) => { }; 