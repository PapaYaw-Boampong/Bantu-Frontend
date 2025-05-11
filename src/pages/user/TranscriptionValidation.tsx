import { useState, useRef, useEffect } from 'react';
import { CheckCircle, XCircle, Play, Pause, Flag, Loader2 } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { useGetUserLanguages } from '@/hooks/languageHooks/useGetUserLanguages';
import { useAssignEvaluationSteps } from '@/hooks/evaluationHooks/useAssignEvaluationStep';
import { useSubmitEvaluationStep } from '@/hooks/evaluationHooks/useSubmitEvaluationStep';
import { useAssignABTest } from '@/hooks/evaluationHooks/useAssignABTest';
import { useCastABTestVote } from '@/hooks/evaluationHooks/useCastABTestVote';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
  CardDescription
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
import { EvaluationStepSubmit, EvaluationAssignment, ABTestAssignment } from '@/types/evaluation';
import ABTesting from '@/components/common/ABTesting';

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
  const [audioUrl, setAudioUrl] = useState('');
  const [flagReason, setFlagReason] = useState('');
  const [flagNote, setFlagNote] = useState('');
  const [showFlagDialog, setShowFlagDialog] = useState(false);
  const [showCorrectionDialog, setShowCorrectionDialog] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState('');
  const [currentEvaluationStep, setCurrentEvaluationStep] = useState<EvaluationAssignment | null>(null);
  const [evaluationBuffer, setEvaluationBuffer] = useState<EvaluationAssignment[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isFirstLoad, setIsFirstLoad] = useState(true);
  const [showABTest, setShowABTest] = useState(false);
  const [currentABTest, setCurrentABTest] = useState<ABTestAssignment | null>(null);
  const [abTestWinner, setABTestWinner] = useState<'A' | 'B' | null>(null);
  
  const waveformRef = useRef<HTMLDivElement>(null);
  const wavesurferRef = useRef<WaveSurfer | null>(null);
  const { toast } = useToast();

  // Fetch evaluation step
  const assignEvaluationStep = useAssignEvaluationSteps();
  
  // Submit evaluation step
  const submitEvaluationStep = useSubmitEvaluationStep();
  
  // AB Test hooks
  const assignABTest = useAssignABTest();
  const castABTestVote = useCastABTestVote();

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

      wavesurferRef.current = wavesurfer;
    }

    return () => {
      if (wavesurferRef.current) {
        wavesurferRef.current.destroy();
        wavesurferRef.current = null;
      }
    };
  }, []);

  // Load evaluation steps when language is selected
  useEffect(() => {
    if (selectedLanguage && isFirstLoad) {
      loadEvaluationSteps();
      setIsFirstLoad(false);
    }
  }, [selectedLanguage]);

  const loadEvaluationSteps = () => {
    if (!selectedLanguage) return;
    
    setIsLoading(true);
    assignEvaluationStep.mutate({
      challengeId: undefined,
      languageId: selectedLanguage,
      proficiencyLevel: 1, // Default proficiency
      contributionType: 'transcription',
      numSteps: 3
    }, {
      onSuccess: (data) => {
        if (data && data.length > 0) {
          // Store evaluation steps in buffer
          setEvaluationBuffer(data);
          
          // Set the first step as current
          const firstStep = data[0];
          setCurrentEvaluationStep(firstStep);
          
          // Check if AB Test is needed for this step
          if (firstStep.step_data.run_ab_test) {
            loadABTest();
          } else {
            // Extract data from the step
            if (firstStep.step_data && firstStep.step_data.contributions) {
              const contributionsObj = firstStep.step_data.contributions as Record<string, any>;
              const contributionsArray = Object.values(contributionsObj);
              
              if (contributionsArray.length > 0) {
                const contribution = contributionsArray[0];
                setTranscription(contribution.target_text || '');
                setAudioUrl(contribution.target_url || '');
                
                // Load audio if URL is available
                if (contribution.target_url && wavesurferRef.current) {
                  wavesurferRef.current.load(contribution.target_url);
                }
              }
            }
          }
          setIsLoading(false);
        } else {
          toast({
            title: 'No evaluations available',
            description: 'There are no transcription evaluations available for this language.',
            variant: 'destructive',
          });
          setIsLoading(false);
        }
      },
      onError: (error) => {
        console.error('Error assigning evaluation step:', error);
        toast({
          title: 'Error',
          description: 'Failed to load transcription evaluation. Please try again.',
          variant: 'destructive',
        });
        setIsLoading(false);
      }
    });
  };

  const loadABTest = () => {
    if (!selectedLanguage) return;
    
    setIsLoading(true);
    assignABTest.mutate({
      userId: 'current',
      proficiencyLevel: 1
    }, {
      onSuccess: (result) => {
        if (result) {
          setCurrentABTest(result);
          setShowABTest(true);
          setIsLoading(false);
        } else {
          toast({
            title: 'No AB tests available',
            description: 'There are no AB tests available for this language right now.',
            variant: 'destructive',
          });
          setIsLoading(false);
        }
      },
      onError: (error) => {
        console.error('Error assigning AB test:', error);
        toast({
          title: 'Error',
          description: 'Failed to load AB test. Continuing with regular evaluation.',
          variant: 'destructive',
        });
        setShowABTest(false);
        setIsLoading(false);
      }
    });
  };

  const handleABTestSelection = (selection: 'A' | 'B' | 'same' | null) => {
    if (!currentABTest || !selection || selection === 'same') return;
    
    setIsLoading(true);
    
    // Determine which contribution IDs to select based on user choice
    let selectedIds: string[] = [];
    
    if (selection === 'A') {
      selectedIds = [currentABTest.option_a.id];
      setABTestWinner('A');
    } else if (selection === 'B') {
      selectedIds = [currentABTest.option_b.id];
      setABTestWinner('B');
    }
    
    castABTestVote.mutate({
      pairId: currentABTest.pair_id,
      data: {
        selected_contribution_ids: selectedIds,
        contribution_type: 'transcription',
        language_id: selectedLanguage
      }
    }, {
      onSuccess: (result) => {
        toast({
          title: 'Vote submitted',
          description: 'Your selection has been recorded. Now you can evaluate the transcription.',
        });
        
        // Move back to the evaluation view
        setShowABTest(false);
        
        // Extract data from the step
        if (currentEvaluationStep?.step_data && currentEvaluationStep.step_data.contributions) {
          const contributionsObj = currentEvaluationStep.step_data.contributions as Record<string, any>;
          const contributionsArray = Object.values(contributionsObj);
          
          if (contributionsArray.length > 0) {
            const contribution = contributionsArray[0];
            setTranscription(contribution.target_text || '');
            setAudioUrl(contribution.target_url || '');
            
            // Load audio if URL is available
            if (contribution.target_url && wavesurferRef.current) {
              wavesurferRef.current.load(contribution.target_url);
            }
          }
        }
        
        setIsLoading(false);
      },
      onError: (error) => {
        console.error('Error submitting vote:', error);
        toast({
          title: 'Error',
          description: 'Failed to submit your vote. Please try again.',
          variant: 'destructive',
        });
        setIsLoading(false);
      }
    });
  };

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

    if (!currentEvaluationStep) {
      toast({
        title: 'No evaluation step',
        description: 'Please wait for an evaluation to load or refresh the page.',
        variant: 'destructive',
      });
      return;
    }

    setValidationStatus(status);
    
    if (status === 'correct') {
      submitEvaluationResponse({
        eval_decision: true,
        run_abtest: false
      });
    } else if (status === 'wrong') {
      setShowCorrectionDialog(true);
    } else if (status === 'flagged') {
      // This will be handled in handleFlag
      setShowFlagDialog(true);
    }
  };

  const submitEvaluationResponse = (data: EvaluationStepSubmit) => {
    if (!currentEvaluationStep) return;
    
    setIsLoading(true);
    
    submitEvaluationStep.mutate({
      branchId: currentEvaluationStep.branch_id,
      instanceId: currentEvaluationStep.step_id,
      languageId: selectedLanguage,
      contributionType: 'transcription',
      data: data
    }, {
      onSuccess: () => {
        toast({
          title: 'Evaluation submitted',
          description: 'Thank you for your contribution!',
        });
        moveToNextEvaluation();
      },
      onError: (error) => {
        console.error('Error submitting evaluation:', error);
        toast({
          title: 'Error',
          description: 'Failed to submit evaluation. Please try again.',
          variant: 'destructive',
        });
        setIsLoading(false);
      }
    });
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
        title: 'Reason required',
        description: 'Please select a reason for flagging.',
        variant: 'destructive',
      });
      return;
    }
    
    setValidationStatus('flagged');
    setShowFlagDialog(false);
    
    // For flagged items, we'll use false as the decision with a comment
    submitEvaluationResponse({
      eval_decision: false,
      run_abtest: false
    });
  };

  const resetState = () => {
    setValidationStatus('pending');
    setTranscription('');
    setAudioUrl('');
    setFlagReason('');
    setFlagNote('');
    setShowABTest(false);
    setCurrentABTest(null);
    setABTestWinner(null);
    
    if (wavesurferRef.current) {
      wavesurferRef.current.empty();
    }
  };

  const moveToNextEvaluation = () => {
    // Remove the current evaluation step from the buffer
    const updatedBuffer = [...evaluationBuffer];
    updatedBuffer.shift();
    setEvaluationBuffer(updatedBuffer);
    
    // Reset current state
    resetState();
    
    // If buffer is getting low (1 or 0 items left), fetch more evaluations
    if (updatedBuffer.length <= 1) {
      fetchMoreEvaluations();
    }
    
    // If there are still steps in the buffer, move to the next one
    if (updatedBuffer.length > 0) {
      const nextStep = updatedBuffer[0];
      setCurrentEvaluationStep(nextStep);
      
      // Check if AB Test is needed for this step
      if (nextStep.step_data.run_ab_test) {
        loadABTest();
      } else {
        // Extract data from the step
        if (nextStep.step_data && nextStep.step_data.contributions) {
          const contributionsObj = nextStep.step_data.contributions as Record<string, any>;
          const contributionsArray = Object.values(contributionsObj);
          
          if (contributionsArray.length > 0) {
            const contribution = contributionsArray[0];
            setTranscription(contribution.target_text || '');
            
            // Load audio if URL is available
            if (contribution.target_url && wavesurferRef.current) {
              setAudioUrl(contribution.target_url);
              wavesurferRef.current.load(contribution.target_url);
            }
          }
        }
      }
      setIsLoading(false);
    } else {
      setCurrentEvaluationStep(null);
      setIsLoading(false);
    }
  };

  const fetchMoreEvaluations = () => {
    if (!selectedLanguage) return;
    
    assignEvaluationStep.mutate({
      challengeId: undefined,
      languageId: selectedLanguage,
      proficiencyLevel: 1,
      contributionType: 'transcription',
      numSteps: 3
    }, {
      onSuccess: (data) => {
        if (data && data.length > 0) {
          // Add new evaluations to the buffer
          setEvaluationBuffer(prevBuffer => [...prevBuffer, ...data]);
        }
      },
      onError: (error) => {
        console.error('Error fetching more evaluation steps:', error);
      }
    });
  };

  const fetchNextEvaluation = () => {
    if (evaluationBuffer.length > 0) {
      moveToNextEvaluation();
    } else {
      loadEvaluationSteps();
    }
  };

  const handleSubmitCorrection = () => {
    setShowCorrectionDialog(false);
    
    submitEvaluationResponse({
      eval_decision: false,
      run_abtest: false
    });
  };

  const getLanguageNameById = (id: string): string | undefined => {
    return userLanguages.find(lang => lang.language.id === id)?.language.name;
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
          disabled={languagesLoading || isLoading}
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
      
      {showABTest && currentABTest ? (
        <div className="mb-6">
          <h2 className="text-2xl font-bold mb-3">Compare Transcriptions</h2>
          <ABTesting
            taskType="transcription"
            language={getLanguageNameById(selectedLanguage) || "Not specified"}
            languageId={selectedLanguage}
            externalTest={currentABTest}
            validationMode={true}
            onVoteSubmitted={handleABTestSelection}
            sourceContent={transcription}
          />
        </div>
      ) : (
        <Card className="animate-fade-up [animation-delay:200ms] opacity-0 [animation-fill-mode:forwards]">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="mb-2">Transcription Evaluation</CardTitle>
                <CardDescription>
                  Listen to the audio and verify if the transcription is correct
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          
          <CardContent className="space-y-6 pt-6">
            {!selectedLanguage ? (
              <div className="flex flex-col items-center justify-center py-12">
                <p className="text-muted-foreground mb-4">Welcome to Project Bantu </p>
                <p className="text-muted-foreground mb-4">Select one of your Interested Languages to kick start </p>

                <Button
                  onClick={loadEvaluationSteps}
                  disabled={!selectedLanguage}
                >
                  Try Again
                </Button>
              </div>
            ) : isLoading ? (
              <div className="flex flex-col items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
                <p className="text-muted-foreground">Loading evaluation task...</p>
              </div>
            ) : !currentEvaluationStep ? (
              <div className="flex flex-col items-center justify-center py-12">
                <p className="text-muted-foreground mb-4">No evaluation task available.</p>
                <Button onClick={loadEvaluationSteps} disabled={!selectedLanguage}>
                  Try Again
                </Button>
              </div>
            ) : (
              <>
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
                          size="sm"
                          className="ml-auto h-8 text-destructive hover:text-destructive hover:bg-destructive/10"
                        >
                          <Flag className="h-4 w-4 mr-2" />
                          Flag Issue
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
                      <p className="text-lg">{transcription || "No transcription available"}</p>
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
                      <Button onClick={handleSubmitCorrection}>
                        Submit Correction
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </>
            )}
          </CardContent>

          <CardFooter className="flex justify-between flex-wrap items-center gap-8">
            <div className="flex space-x-4">
              <Button
                variant="outline"
                className="flex items-center space-x-2"
                onClick={() => handleValidation('correct')}
                disabled={isLoading || !currentEvaluationStep}
              >
                <CheckCircle className="h-5 w-5 text-green-600" />
                <span>Correct</span>
              </Button>
              <Button
                variant="outline"
                className="flex items-center space-x-2"
                onClick={() => handleValidation('wrong')}
                disabled={isLoading || !currentEvaluationStep}
              >
                <XCircle className="h-5 w-5 text-red-600" />
                <span>Wrong</span>
              </Button>
            </div>
            <div className="flex items-center gap-3">
              {evaluationBuffer.length > 0 && (
                <span className="text-sm text-muted-foreground">
                  {evaluationBuffer.length} evaluation{evaluationBuffer.length !== 1 ? 's' : ''} left
                </span>
              )}
              <Button 
                onClick={fetchNextEvaluation}
                disabled={isLoading || !selectedLanguage}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Loading...
                  </>
                ) : 'Next'}
              </Button>
            </div>
          </CardFooter>
        </Card>
      )}
    </div>
  );
} 