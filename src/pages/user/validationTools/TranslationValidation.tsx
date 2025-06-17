import { useState, useEffect } from "react";
import {
  CheckCircle,
  XCircle,
  Flag,
  Edit,
  Type,
  GripVertical,
  Loader2,
} from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { useGetUserLanguages } from "@/hooks/languageHooks/useGetUserLanguages";
import { useAssignEvaluationSteps } from "@/hooks/evaluationHooks/useAssignEvaluationStep";
import { useSubmitEvaluationStep } from "@/hooks/evaluationHooks/useSubmitEvaluationStep";

import { useGetTranslationSample } from "@/hooks/sampleHooks/useGetTranslationSample";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { mapProficiencyToNumber } from "@/utils/validationUtil";
import { useCreateContribution } from "@/hooks/contributionHooks";
import { ContributionCreate } from '@/types/contribution';
import { TranslationContributionRead } from "@/types/contribution";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

// Import the TokenizedWords component
import TokenizedWords from "@/components/common/TokenizedWords";
import ABTesting from "@/components/common/ABTesting";
import {
  EvaluationStepSubmit,
  EvaluationAssignment,
  ABTestAssignment,
} from "@/types/evaluation";

type ValidationStatus = "pending" | "correct" | "wrong" | "flagged";

export default function TranslationValidation() {
  const { data: userLanguages = [], isLoading: languagesLoading } =
    useGetUserLanguages();

  const [validationStatus, setValidationStatus] =
    useState<ValidationStatus>("pending");
  const [sourceText, setSourceText] = useState("");
  const [translation, setTranslation] = useState("");
  const [flagReason, setFlagReason] = useState("");
  const [flagNote, setFlagNote] = useState("");
  const [showFlagDialog, setShowFlagDialog] = useState(false);
  const [showCorrectionDialog, setShowCorrectionDialog] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState("");
  const [editMode, setEditMode] = useState<"text" | "tokenized">("text");
  const [currentEvaluationStep, setCurrentEvaluationStep] = useState<EvaluationAssignment | null>(null);
  const [evaluationBuffer, setEvaluationBuffer] = useState<EvaluationAssignment[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isFirstLoad, setIsFirstLoad] = useState(true);
  const [showABTest, setShowABTest] = useState(false);
  const [currentABTest, setCurrentABTest] = useState<ABTestAssignment | null>(
    null
  );
  const [abTestWinner, setABTestWinner] = useState<"a" | "b" | null>(null);
  const [isLoadingSample, setIsLoadingSample] = useState(false);

  const { toast } = useToast();

  // Fetch evaluation step
  const assignEvaluationStep = useAssignEvaluationSteps();

  // Submit evaluation step
  const submitEvaluationStep = useSubmitEvaluationStep();

  // correction contribution creation 
  const createContribution = useCreateContribution();

  // Get sample API hook
  const getTranslationSample = useGetTranslationSample;

  const getProficiency = (languageId: string): string | undefined => {
    const match = userLanguages.find((lang) => lang.language.id === languageId);
    return match?.proficiency;
  };

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
    assignEvaluationStep.mutate(
      {
        challengeId: undefined,
        languageId: selectedLanguage,
        proficiencyLevel: mapProficiencyToNumber(
          getProficiency(selectedLanguage) || "beginner"
        ),
        contributionType: "translation",
        numSteps: 3,
      },

      {
        onSuccess: (data) => {
          if (data && data.length > 0) {
            // Store evaluation steps in buffer
            setEvaluationBuffer(data);

            // Set the first step as current
            const firstStep = data[0];
            setCurrentEvaluationStep(firstStep);

            // AB Test essentials are present
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
                const contributionsObj = firstStep.step_data
                  .contributions as Record<string, any>;
                const contributionsArray = Object.values(contributionsObj);

                if (contributionsArray.length > 0) {
                  const contribution = contributionsArray[0];
                  console.log("Initial evaluation contribution:", contribution);
                  setSourceText(
                    contribution.sample_text ||
                    "No source text available"
                  );
                  setTranslation(
                    contribution.target_text ||
                    ""
                  );

                  // If we don't have sample_text but have sample_id, fetch the sample data
                  if (!contribution.sample_text && contribution.sample_id) {
                    fetchSampleData(contribution);
                  }
                }
              }
            }
            setIsLoading(false);
          } else {
            toast({
              title: "No evaluations available",
              description:
                "There are no translation evaluations available for this language.",
              variant: "destructive",
            });
            setIsLoading(false);
          }
        },
        onError: (error) => {
          console.error("Error assigning evaluation step:", error);
          toast({
            title: "Error",
            description:
              "Failed to load translation evaluation. Please try again.",
            variant: "destructive",
          });
          setIsLoading(false);
        },
      }
    );
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
        title: "Please select a language",
        description: "You need to select a language before validating.",
        variant: "destructive",
      });
      return;
    }

    if (!currentEvaluationStep) {
      toast({
        title: "No evaluation step",
        description:
          "Please wait for an evaluation to load or refresh the page.",
        variant: "destructive",
      });
      return;
    }

    setValidationStatus(status);

    if (status === "correct") {
      submitEvaluationResponse({
        eval_decision: true,
        run_abtest: false,
        abtest_decision: abTestWinner as string,
      });
    } else if (status === "wrong") {
      setShowCorrectionDialog(true);
    } else if (status === "flagged") {
      // This will be handled in handleFlag
      setShowFlagDialog(true);
    }

    setABTestWinner(null);
  };

  const submitEvaluationResponse = (data: EvaluationStepSubmit) => {
    if (!currentEvaluationStep) return;

    setIsLoading(true);

    submitEvaluationStep.mutate(
      {
        branchId: currentEvaluationStep.branch_id,
        instanceId: currentEvaluationStep.step_id,
        languageId: selectedLanguage,
        contributionType: "translation",
        data: data,
      },
      {
        onSuccess: () => {
          toast({
            title: "Evaluation submitted",
            description: "Thank you for your contribution!",
          });
          moveToNextEvaluation();
        },
        onError: (error) => {
          console.error("Error submitting evaluation:", error);
          toast({
            title: "Error",
            description: "Failed to submit evaluation. Please try again.",
            variant: "destructive",
          });
          setIsLoading(false);
        },
      }
    );
  };

  const handleFlag = () => {
    if (!selectedLanguage) {
      toast({
        title: "Please select a language",
        description: "You need to select a language before flagging.",
        variant: "destructive",
      });
      return;
    }

    if (!flagReason) {
      toast({
        title: "Reason required",
        description: "Please select a reason for flagging.",
        variant: "destructive",
      });
      return;
    }

    setValidationStatus("flagged");
    setShowFlagDialog(false);

    // For flagged items, we'll use false as the decision with a comment
    submitEvaluationResponse({
      eval_decision: false,
      run_abtest: false,
    });
  };

  const resetState = () => {
    setValidationStatus("pending");
    setSourceText("");
    setTranslation("");
    setFlagReason("");
    setFlagNote("");
    setShowABTest(false);
    setCurrentABTest(null);
    setABTestWinner(null);
  };

  const fetchMoreEvaluations = () => {
    if (!selectedLanguage) return;

    assignEvaluationStep.mutate(
      {
        challengeId: undefined,
        languageId: selectedLanguage,
        proficiencyLevel: mapProficiencyToNumber(
          getProficiency(selectedLanguage) || "beginner"
        ),
        contributionType: "translation",
        numSteps: 3,
      },
      {
        onSuccess: (data) => {
          if (data && data.length > 0) {
            // Add new evaluations to the buffer
            setEvaluationBuffer((prevBuffer) => [...prevBuffer, ...data]);
          }
        },
        onError: (error) => {
          console.error("Error fetching more evaluation steps:", error);
        },
      }
    );
  };

  // Function to fetch sample data if we have a sample_id but no sample_text
  const fetchSampleData = (contribution: any) => {
    if (!contribution.sample_id || contribution.sample_text) return;

    const { data: sampleData, isLoading } = getTranslationSample(
      contribution.sample_id
    );

    if (isLoading) {
      setIsLoadingSample(true);
      return;
    }

    setIsLoadingSample(false);

    if (sampleData && sampleData.translation_seed_data) {
      setSourceText(
        sampleData.translation_seed_data.original_text ||
        "No source text available"
      );
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
        const contributionsObj = nextStep.step_data.contributions as Record<
          string,
          any
        >;
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
        if (nextStep.step_data && nextStep.step_data.contributions) {
          const contributionsObj = nextStep.step_data.contributions as Record<
            string,
            any
          >;
          const contributionsArray = Object.values(contributionsObj);

          if (contributionsArray.length > 0) {
            const contribution = contributionsArray[0];
            console.log("Next evaluation contribution:", contribution);
            setSourceText(
              contribution.sample_text ||
              "No source text available"
            );
            setTranslation(
              contribution.target_text || ""
            );

            // If we don't have sample_text but have sample_id, fetch the sample data
            if (!contribution.sample_text && contribution.sample_id) {
              fetchSampleData(contribution);
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
    if (!translation) {
      toast({
        title: "Correction missing",
        description: "Please provide a correction before submitting.",
        variant: "destructive",
      });
      return;
    }

    // 2. Construct the contributionData using the corrected text
    const contributionData: ContributionCreate = {
      target_text: translation,
    };

    if (currentEvaluationStep && currentEvaluationStep.step_data.contributions) {


      const rawContribution = currentEvaluationStep.step_data.contributions["b_contribution"];


      if (!rawContribution || !("sample_text" in rawContribution)) {
        console.error("Expected a translation contribution with sample_text.");
        return;
      }

      const contribution = rawContribution as TranslationContributionRead;
      if (!contribution) {
        console.error("Missing b_contribution in evaluation step data.");
        return;
      }

      const sample_id = contribution.sample_id;
      const sample_text = contribution.sample_text;

      createContribution.mutate(
        {
          languageId: selectedLanguage,
          sampleId: sample_id,
          sample_text: sample_text,
          contributionType: "translation",
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
            console.error("Error saving translation correction:", error);
          },
        }
      );
    }
  };

  const getLanguageNameById = (id: string): string | undefined => {
    return userLanguages.find((lang) => lang.language.id === id)?.language.name;
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-5">Translation Validation</h1>
      <p className="text-muted-foreground mb-6">
        Review and validate the translation for accuracy and quality.
      </p>

      <div className="flex items-center gap-3 mb-6">
        <Label htmlFor="language" className="text-sm">
          Language:
        </Label>
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
          <h2 className="text-2xl font-bold mb-3">Compare Translations</h2>
          <ABTesting
            taskType="translation"
            language={getLanguageNameById(selectedLanguage) || "Not specified"}
            languageId={selectedLanguage}
            externalTest={currentABTest}
            validationMode={true}
            onVoteSubmitted={handleABTestSelection}
            sourceContent={sourceText}
          />
        </div>
      ) : (
        <Card className="animate-fade-up [animation-delay:200ms] opacity-0 [animation-fill-mode:forwards]">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="mb-2">Translation Evaluation</CardTitle>
                <CardDescription>
                  Compare the source text with its translation and validate for
                  correctness
                </CardDescription>
              </div>
            </div>
          </CardHeader>

          <CardContent className="space-y-6">
            {!selectedLanguage ? (
              <div className="flex flex-col items-center justify-center py-12">
                <p className="text-muted-foreground mb-4">
                  Welcome to Project Bantu{" "}
                </p>
                <p className="text-muted-foreground mb-4">
                  Select one of your Interested Languages to kick start{" "}
                </p>

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
                <p className="text-muted-foreground">
                  Loading evaluation task...
                </p>
              </div>
            ) : !currentEvaluationStep ? (
              <div className="flex flex-col items-center justify-center py-12">
                <p className="text-muted-foreground mb-4">
                  No evaluation task available.
                </p>
                <Button
                  onClick={loadEvaluationSteps}
                  disabled={!selectedLanguage}
                >
                  Try Again
                </Button>
              </div>
            ) : (
              <>
                {/* Source Text and Translation Display */}
                <div className="space-y-6">
                  {/* Source Text (English) */}
                  <div>
                    <Label className="text-base font-medium">
                      Source Text (English)
                    </Label>
                    <div className="mt-2 p-4 rounded-md bg-muted">
                      <p className="text-lg">{sourceText}</p>
                    </div>
                  </div>

                  {/* Translation */}
                  <div className="relative">
                    <div className="flex items-center justify-between">
                      <Label className="text-base font-medium">
                        Translation
                      </Label>

                      {/* Flag Button */}
                      <Dialog
                        open={showFlagDialog}
                        onOpenChange={setShowFlagDialog}
                      >
                        <DialogTrigger asChild>
                          <Button
                            variant="outline"
                            size="sm"
                            className="h-8 text-destructive hover:text-destructive hover:bg-destructive/10"
                          >
                            <Flag className="h-4 w-4 mr-2" />
                            Flag Issue
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Flag Translation Issue</DialogTitle>
                            <DialogDescription>
                              Please select the reason for flagging this
                              translation and provide additional details if
                              needed.
                            </DialogDescription>
                          </DialogHeader>
                          <div className="space-y-4 py-4">
                            <Select
                              value={flagReason}
                              onValueChange={setFlagReason}
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Select reason for flagging" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="inaccurate">
                                  Inaccurate Translation
                                </SelectItem>
                                <SelectItem value="grammar">
                                  Grammatical Errors
                                </SelectItem>
                                <SelectItem value="inappropriate">
                                  Inappropriate Content
                                </SelectItem>
                                <SelectItem value="wrong_dialect">
                                  Wrong Dialect
                                </SelectItem>
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
                            <Button
                              variant="outline"
                              onClick={() => setShowFlagDialog(false)}
                            >
                              Cancel
                            </Button>
                            <Button variant="destructive" onClick={handleFlag}>
                              Submit Flag
                            </Button>
                          </DialogFooter>
                        </DialogContent>
                      </Dialog>
                    </div>

                    <div className="mt-2 p-4 rounded-md bg-muted">
                      <p className="text-lg">{translation}</p>
                    </div>
                  </div>
                </div>

                {/* Correction Dialog */}
                <Dialog
                  open={showCorrectionDialog}
                  onOpenChange={setShowCorrectionDialog}
                >
                  <DialogContent className="max-w-2xl rounded-md flex-wrap">
                    <DialogHeader>
                      <DialogTitle>Edit Translation</DialogTitle>
                      <DialogDescription>
                        Please provide the correct translation for this text.
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                      <div>
                        <Label>Source Text (English)</Label>
                        <div className="mt-2 p-3 rounded-md bg-muted">
                          <p>{sourceText}</p>
                        </div>
                      </div>

                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <Label>Edit Translation</Label>
                          <div className="flex items-center gap-2">
                            <Button
                              variant={
                                editMode === "text" ? "default" : "outline"
                              }
                              size="sm"
                              onClick={() => setEditMode("text")}
                            >
                              <Type className="h-4 w-4 mr-2" />
                              Type
                            </Button>
                            <Button
                              variant={
                                editMode === "tokenized" ? "default" : "outline"
                              }
                              size="sm"
                              onClick={() => setEditMode("tokenized")}
                            >
                              <GripVertical className="h-4 w-4 mr-2" />
                              Drag & Drop
                            </Button>
                          </div>
                        </div>
                        <div className="mt-2 p-3 rounded-md border">
                          {editMode === "text" ? (
                            <Textarea
                              value={translation}
                              onChange={(e) => setTranslation(e.target.value)}
                              className="min-h-[100px] resize-none"
                              placeholder="Enter the correct translation..."
                            />
                          ) : (
                            <TokenizedWords
                              text={translation}
                              onChange={setTranslation}
                            />
                          )}
                        </div>
                      </div>
                    </div>
                    <DialogFooter>
                      <Button
                        variant="outline"
                        onClick={() => setShowCorrectionDialog(false)}
                      >
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
                onClick={() => handleValidation("correct")}
                disabled={isLoading || !currentEvaluationStep}
              >
                <CheckCircle className="h-5 w-5 text-green-600" />
                <span>Correct</span>
              </Button>
              <Button
                variant="outline"
                className="flex items-center space-x-2"
                onClick={() => handleValidation("wrong")}
                disabled={isLoading || !currentEvaluationStep}
              >
                <XCircle className="h-5 w-5 text-red-600" />
                <span>Wrong</span>
              </Button>
            </div>
            <div className="flex items-center gap-3">
              {evaluationBuffer.length > 0 && (
                <span className="text-sm text-muted-foreground">
                  {evaluationBuffer.length} evaluation
                  {evaluationBuffer.length !== 1 ? "s" : ""} left
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
                ) : (
                  "Next"
                )}
              </Button>
            </div>
          </CardFooter>
        </Card>
      )}
    </div>
  );
}
