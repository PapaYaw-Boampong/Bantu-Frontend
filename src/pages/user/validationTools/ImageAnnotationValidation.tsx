import { useState, useEffect } from 'react';
import { CheckCircle, XCircle, Flag, Image as ImageIcon, Loader2 } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { useGetUserLanguages } from '@/hooks/languageHooks/useGetUserLanguages';
import { useAssignEvaluationSteps } from '@/hooks/evaluationHooks/useAssignEvaluationStep';
import { useSubmitEvaluationStep } from '@/hooks/evaluationHooks/useSubmitEvaluationStep';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { mapProficiencyToNumber } from '@/utils/validationUtil';
import { useCreateContribution } from '@/hooks/contributionHooks';
import { ContributionCreate } from '@/types/contribution';
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

import { 
  EvaluationStepSubmit, 
  EvaluationAssignment,
   ABTestAssignment
 } from '@/types/evaluation';
import ABTesting from '@/components/common/ABTesting';

type ValidationStatus = 'pending' | 'correct' | 'wrong' | 'flagged';


export default function ImageAnnotationValidation() {
  const [selectedLanguage, setSelectedLanguage] = useState('');
  const {
    data: userLanguages = [],
    isLoading: languagesLoading,
  } = useGetUserLanguages();

  const getProficiency = (languageId: string): string | undefined => {
    const match = userLanguages.find(lang => lang.language.id === languageId);
    return match?.proficiency;
  };

  const [validationStatus, setValidationStatus] = useState<ValidationStatus>('pending');
  const [englishAnnotation, setEnglishAnnotation] = useState('');
  const [targetAnnotation, setTargetAnnotation] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [flagReason, setFlagReason] = useState('');
  const [flagNote, setFlagNote] = useState('');
  const [showFlagDialog, setShowFlagDialog] = useState(false);
  const [showCorrectionDialog, setShowCorrectionDialog] = useState(false);
  const [currentEvaluationStep, setCurrentEvaluationStep] = useState<EvaluationAssignment | null>(null);
  const [evaluationBuffer, setEvaluationBuffer] = useState<EvaluationAssignment[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isFirstLoad, setIsFirstLoad] = useState(true);
  const [showABTest, setShowABTest] = useState(false);
  const [currentABTest, setCurrentABTest] = useState<ABTestAssignment | null>(null);
  const [abTestWinner, setABTestWinner] = useState<'a' | 'b' | null>(null);

  const { toast } = useToast();

  // Create contribution mutation
  const createContribution = useCreateContribution();

  // Fetch evaluation step
  const assignEvaluationStep = useAssignEvaluationSteps();

  // Submit evaluation step
  const submitEvaluationStep = useSubmitEvaluationStep();

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
      proficiencyLevel: mapProficiencyToNumber(getProficiency(selectedLanguage) || 'beginner'),
      contributionType: 'annotation',
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
            const contributionsObj = firstStep.step_data
              .contributions as Record<string, any>;
            const contributionsArray = Object.values(contributionsObj);

            if (contributionsArray.length >= 2) {
              const [contributionA, contributionB] = contributionsArray;

              const dummyExternalTest: ABTestAssignment = {
                ab_test_id: "dummy-ab-test-id",
                pair_id: "dummy-pair-id",
                vote_id: "dummy-vote-id",
                stage_number: 0,
                a_shown_first: Math.random() < 0.5, // Optional randomization
                option_a: {
                  id: contributionA.id,
                  content:
                    contributionA.target_text ||
                    "Option A",
                },
                option_b: {
                  id: contributionB.id,
                  content:
                    contributionB.target_text ||
                    "Option B",
                },
              };

              loadABTest(dummyExternalTest);
            } else {
              console.warn("Not enough contributions for A/B test");
            }
          } else {
            // Extract data from the step
            if (firstStep.step_data && firstStep.step_data.contributions) {
              const contributionsObj = firstStep.step_data.contributions as Record<string, any>;
              const contributionsArray = Object.values(contributionsObj);

              if (contributionsArray.length > 0) {
                const contribution = contributionsArray[0];
                setEnglishAnnotation(contribution.sample_text || '');
                setTargetAnnotation(contribution.target_text || '');
                setImageUrl(contribution.signed_url || " ");
              }
            }
          }
          setIsLoading(false);
        } else {
          toast({
            title: 'No evaluations available',
            description: 'There are no image annotation evaluations available for this language.',
            variant: 'destructive',
          });
          setIsLoading(false);
        }
      },
      onError: (error) => {
        console.error('Error assigning evaluation step:', error);
        toast({
          title: 'Error',
          description: 'Failed to load image annotation evaluation. Please try again.',
          variant: 'destructive',
        });
        setIsLoading(false);
      }
    });
  };

  const loadABTest = (data: ABTestAssignment) => {
    if (!selectedLanguage) return;

    setIsLoading(true);

    setCurrentABTest(data);
    setShowABTest(true);
    setIsLoading(false);

    setShowABTest(false);
    setIsLoading(false);
  };

  const handleABTestSelection = (selection: "A" | "B" | "same" | null) => {
    if (!currentABTest || !selection || selection === "same") return;

    setIsLoading(true);

    if (selection === "A") {
      setABTestWinner("a");
    } else if (selection === "B") {
      setABTestWinner("b");
    }

    toast({
      title: "Vote submitted",
      description:
        "Your selection has been recorded. Now you can evaluate the translation.",
    });
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
        run_abtest: false,
        abtest_decision: abTestWinner as string,
      });


    } else if (status === 'wrong') {
      setShowCorrectionDialog(true);
    } else if (status === 'flagged') {
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
      contributionType: 'annotation',
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

    setABTestWinner(null);

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
    setEnglishAnnotation('');
    setTargetAnnotation('');
    setImageUrl('');
    setFlagReason('');
    setFlagNote('');
    setShowABTest(false);
    setCurrentABTest(null);
    setABTestWinner(null);
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
        const contributionsObj = nextStep.step_data.contributions as Record<string, any>;
        const contributionsArray = Object.values(contributionsObj);

        if (contributionsArray.length >= 2) {
          const [contributionA, contributionB] = contributionsArray;

          const dummyExternalTest: ABTestAssignment = {
            ab_test_id: "dummy-ab-test-id",
            pair_id: "dummy-pair-id",
            vote_id: "dummy-vote-id",
            stage_number: 0,
            a_shown_first: Math.random() < 0.5, // Optional randomization
            option_a: {
              id: contributionA.id,
              content:
                contributionA.translated_text ||
                contributionA.target_text ||
                "Option A",
            },
            option_b: {
              id: contributionB.id,
              content:
                contributionB.translated_text ||
                contributionB.target_text ||
                "Option B",
            },
          };

          loadABTest(dummyExternalTest);
        } else {
          console.warn("Not enough contributions for A/B test");
        }
      } else {
        // Extract data from the step
        if (nextStep.step_data && nextStep.step_data.contributions) {
          const contributionsObj = nextStep.step_data.contributions as Record<string, any>;
          const contributionsArray = Object.values(contributionsObj);

          if (contributionsArray.length > 0) {
            const contribution = contributionsArray[0];
            setEnglishAnnotation(contribution.sample_text || '');
            setTargetAnnotation(contribution.target_text || '');
            setImageUrl(contribution.signed_url);
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
      contributionType: 'annotation',
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
  
    // 1. Ensure correction input is available
    if (!targetAnnotation) {
      toast({
        title: "Correction missing",
        description: "Please provide a correction before submitting.",
        variant: "destructive",
      });
      return;
    }
  
    // 2. Construct the contributionData using the corrected text
    const contributionData: ContributionCreate = {
      target_text: targetAnnotation,
    };
  
    if (currentEvaluationStep && currentEvaluationStep.step_data.contributions) {

      // 3. Extract the relevant contribution object (e.g., "b_contribution")
      const contribution = currentEvaluationStep.step_data.contributions["b_contribution"];

      if (!contribution) {
        console.error("Missing b_contribution in evaluation step data.");
        return;
      }
  
      const sample_id = contribution.sample_id;
  
      createContribution.mutate(
        {
          languageId: selectedLanguage,
          sampleId: sample_id,
          contributionType: "annotation", 
          contributionData: contributionData
        },
        {
          onSuccess: (result) => {
            toast({
              title: "Correction saved",
              description: "Thank you for your correction!",
            });

            const correctionID = result.id;
            
            // Submit evaluation decision 
            submitEvaluationResponse({
              eval_decision: false,
              run_abtest: true,
              abtest_decision: abTestWinner as string,
              correction_id: correctionID || ""
            });

          },
          onError: (error) => {
            toast({
              title: "Error saving correction",
              description: "There was an error saving your correction. Please try again.",
              variant: "destructive",
            });
            console.error("Error saving annotation correction:", error);
          },
        }
      );
    }
  
  };

  const getLanguageNameById = (id: string): string | undefined => {
    return userLanguages.find(lang => lang.language.id === id)?.language.name;
  };

  // Create JSON string for ABTesting component source content
  const createABTestSourceContent = () => {
    try {
      const jsonData = {
        imageUrl: imageUrl,
        text: englishAnnotation
      };
      return JSON.stringify(jsonData);
    } catch (e) {
      return englishAnnotation;
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-5">Image Annotation Validation</h1>
      <p className="text-muted-foreground mb-6">View the image and verify if the annotations are correct.</p>
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
          <h2 className="text-2xl font-bold mb-3">Compare Annotations</h2>
          <ABTesting
            taskType="annotation"
            language={getLanguageNameById(selectedLanguage) || "Not specified"}
            languageId={selectedLanguage}
            externalTest={currentABTest}
            validationMode={true}
            onVoteSubmitted={handleABTestSelection}
            sourceContent={createABTestSourceContent()}
          />
        </div>
      ) : (
        <Card className="animate-fade-up [animation-delay:200ms] opacity-0 [animation-fill-mode:forwards]">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="mb-2">Image Annotation Evaluation</CardTitle>
                <CardDescription>
                  View the image and verify the annotations are correct
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
            ) :

              isLoading ? (
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
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Image Display */}
                  <div className="relative border rounded-md p-4 bg-background">
                    <div className="flex items-center gap-4 mb-4">
                      <ImageIcon className="h-5 w-5" />
                      <span className="text-sm font-medium">Image to annotate</span>

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
                            <DialogTitle>Flag Image Issue</DialogTitle>
                            <DialogDescription>
                              Please select the reason for flagging this image and provide additional details if needed.
                            </DialogDescription>
                          </DialogHeader>
                          <div className="space-y-4 py-4">
                            <Select value={flagReason} onValueChange={setFlagReason}>
                              <SelectTrigger>
                                <SelectValue placeholder="Select reason for flagging" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="poor_quality">Poor Image Quality</SelectItem>
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

                    <div className="w-full h-64 flex items-center justify-center rounded-md overflow-hidden">
                      {imageUrl ? (
                        <img
                          src={imageUrl}
                          alt="Content to annotate"
                          className="w-full h-full object-contain"
                        />
                      ) : (
                        <p className="text-muted-foreground">No image available</p>
                      )}
                    </div>
                  </div>

                  {/* Annotations Display */}
                  <div className="space-y-4">
                    <div>
                      <Label>English Annotation</Label>
                      <div className="mt-2 p-4 rounded-md bg-muted">
                        <p className="text-lg">{englishAnnotation || "No English annotation available"}</p>
                      </div>
                    </div>

                    <div>
                      <Label>Target Translation</Label>
                      <div className="mt-2 p-4 rounded-md bg-muted">
                        <p className="text-lg">{targetAnnotation || "No target language translation available"}</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

            {/* Correction Dialog */}
            <Dialog open={showCorrectionDialog} onOpenChange={setShowCorrectionDialog}>
              <DialogContent className='rounded-md'>
                <DialogHeader>
                  <DialogTitle>Incorrect Annotations</DialogTitle>
                  <DialogDescription>
                    Please provide the correct annotations for this image.
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div>
                    <Label htmlFor="english-correction">English Annotation</Label>
                    <Textarea
                      id="english-correction"
                      placeholder="Enter the correct English annotation"
                      value={englishAnnotation}
                      onChange={(e) => setEnglishAnnotation(e.target.value)}
                      className="h-32 mt-2"
                    />
                  </div>
                  <div>
                    <Label htmlFor="translation-correction">Target Translation</Label>
                    <Textarea
                      id="translation-correction"
                      placeholder="Enter the correct target language translation"
                      value={targetAnnotation}
                      onChange={(e) => setTargetAnnotation(e.target.value)}
                      className="h-32 mt-2"
                    />
                  </div>
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