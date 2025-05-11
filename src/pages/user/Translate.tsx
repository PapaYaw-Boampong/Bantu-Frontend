import { useState, useEffect } from "react";
import {
  Mic,
  Loader2,
  AudioWaveform as Waveform,
  Bot,
  FileText,
  RefreshCw,
} from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { useGetUserLanguages } from "@/hooks/languageHooks/useGetUserLanguages";
import { useListTranslationSamples } from "@/hooks/sampleHooks/useListTranslationSamples";
import { useCreateContribution } from "@/hooks/contributionHooks/useCreateContribution";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { TranslationSample } from "@/types/sample";
import { ContributionCreate } from "@/types/contribution";
import { Skeleton } from "@/components/ui/skeleton";

// type RecordingStatus = "idle" | "recording" | "processing" | "done" | "error";
type InputMode = "lm" | "custom";

export default function Translate() {
  const {
    data: userLanguages = [],
    isLoading: languagesLoading,
    isError,
  } = useGetUserLanguages();
  const [selectedLanguage, setSelectedLanguage] = useState("");
  // const [recordingStatus, setRecordingStatus] =
  //   useState<RecordingStatus>("idle");
  const [translation, setTranslation] = useState("");
  const [inputMode, setInputMode] = useState<InputMode>("lm");
  const [currentSampleIndex, setCurrentSampleIndex] = useState(0);
  const [currentSample, setCurrentSample] = useState<TranslationSample | null>(
    null
  );
  const [controlledLoading, setControlledLoading] = useState(false);
  const { toast } = useToast();

  // Fetch translation samples based on selected language
  const {
    data: translationSampleResponse,
    isLoading: samplesLoading,
    refetch: refetchSamples,
    isError: sampleError,
  } = useListTranslationSamples({
    languageId: selectedLanguage,
    active: true,
    limit: 3,
  });
  
  const translationSamples = translationSampleResponse?.samples ?? [];
  const totalCount = translationSampleResponse?.count ?? 0;

  // Create contribution mutation
  const createContribution = useCreateContribution();

  // Controlled loading state that persists for at least 5 seconds
  useEffect(() => {
    if (selectedLanguage && (samplesLoading || controlledLoading)) {
      // If we're already in a loading state, make sure it lasts at least 5 seconds
      setControlledLoading(true);
      const timer = setTimeout(() => {
        // Only stop controlled loading if actual loading is also done
        if (!samplesLoading) {
          setControlledLoading(false);
        }
      }, 5000);
      
      return () => clearTimeout(timer);
    }
  }, [samplesLoading, selectedLanguage, controlledLoading]);

  // Update current sample when samples are loaded or when moving to next sample
  useEffect(() => {
    if (!selectedLanguage) {
      setCurrentSample(null);
      setTranslation("");
      return;
    }

    if (
      translationSamples.length > 0 &&
      currentSampleIndex < translationSamples.length
    ) {
      setCurrentSample(translationSamples[currentSampleIndex]);
      // Set the translation from the sample seed
      if (translationSamples[currentSampleIndex].translation_seed_data) {
        setTranslation(
          translationSamples[currentSampleIndex].translation_seed_data?.original_text || ""
        );
      }
    } else {
      setCurrentSample(null);
      setTranslation("");
    }
  }, [translationSamples, currentSampleIndex, selectedLanguage]);

  // Refetch behaviour on language change
  useEffect(() => {
    if (!selectedLanguage) return;
  
    // Set loading state and refetch after a small delay
    setControlledLoading(true);
    const timeout = setTimeout(() => {
      setCurrentSampleIndex(0);
      setTranslation("");
      refetchSamples(); // Your fetch function
    }, 500); // Optional: 500ms delay for UI smoothness

    return () => clearTimeout(timeout);
  }, [selectedLanguage, refetchSamples]);

  const handleNextSample = () => {
    // Set loading state when moving to next sample
    setControlledLoading(true);
    
    if (currentSampleIndex < translationSamples.length - 1) {
      setCurrentSampleIndex(currentSampleIndex + 1);
    } else {
      // We've reached the end of our buffer, get more samples
      refetchSamples();
      setCurrentSampleIndex(0);
    }
    setTranslation("");
  };

  const handleCustomTextChange = (
    e: React.ChangeEvent<HTMLTextAreaElement>
  ) => {
    setTranslation(e.target.value);
  };

  const handleTranslationChange = (
    e: React.ChangeEvent<HTMLTextAreaElement>
  ) => {
    setTranslation(e.target.value);
  };

  const handleReset = () => {
    setTranslation("");
    toast({
      title: "Reset complete",
      description: "Your translation has been cleared.",
    });
  };

  const handleSave = () => {
    if (!selectedLanguage) {
      toast({
        title: "Language required",
        description: "Please select a language before saving.",
        variant: "destructive",
      });
      return;
    }

    if (!translation.trim()) {
      toast({
        title: "Translation required",
        description: "Please provide a translation before saving.",
        variant: "destructive",
      });
      return;
    }

    if (inputMode === "lm" && !currentSample) {
      toast({
        title: "No sample available",
        description: "Please refresh to get a new sample.",
        variant: "destructive",
      });
      return;
    }

    const contributionData: ContributionCreate = {
      target_text: translation,
    };

    if (inputMode === "lm" && currentSample) {
      // Show loading state while saving
      setControlledLoading(true);
      
      // Creating contribution for an existing sample
      createContribution.mutate(
        {
          languageId: selectedLanguage,
          sampleId: currentSample.id,
          contributionType: "translation" as any,
          data: contributionData,
        },
        {
          onSuccess: () => {
            toast({
              title: "Translation saved",
              description: "Thank you for your contribution!",
            });
            setTranslation("");
            handleNextSample();
          },
          onError: (error) => {
            setControlledLoading(false);
            toast({
              title: "Error saving translation",
              description:
                "There was an error saving your translation. Please try again.",
              variant: "destructive",
            });
            console.error("Error saving translation:", error);
          },
        }
      );
    } else {
      toast({
        title: "Custom translations coming soon",
        description: "Custom translation contributions will be available soon.",
      });
    }
  };

  const handleRefreshSamples = () => {
    // Show loading state for at least 5 seconds
    setControlledLoading(true);
    refetchSamples();
    setCurrentSampleIndex(0);
    toast({
      title: "Refreshing samples",
      description: "Loading new translation samples...",
    });
  };

  // Determine if we should show loading state
  const isLoading = samplesLoading || controlledLoading;
  
  // Check if samples should be displayed
  const shouldShowContent = selectedLanguage && !(sampleError && !isLoading);
  const noSamplesAvailable = shouldShowContent && !isLoading && translationSamples.length === 0;

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <div className="mb-8 animate-fade-up opacity-0 [animation-fill-mode:forwards]">
        <h1 className="text-3xl font-bold pb-3">Translate</h1>
        <div className="flex justify-between items-center mb-4">
          <Select
            value={selectedLanguage}
            onValueChange={setSelectedLanguage}
            disabled={languagesLoading}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Select language..." />
            </SelectTrigger>
            <SelectContent>
              {userLanguages.map((lang) => (
                <SelectItem key={lang.language.id} value={lang.language.id}>
                  {lang.language.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Button
            variant="outline"
            size="sm"
            onClick={handleRefreshSamples}
            disabled={!selectedLanguage || isLoading}
          >
            <RefreshCw className="h-4 w-4 mr-1" />
            Refresh Samples
          </Button>
        </div>
      </div>

      <Card className="animate-fade-up opacity-0 [animation-delay:200ms] [animation-fill-mode:forwards]">
        <Tabs
          defaultValue="lm"
          onValueChange={(value) => setInputMode(value as InputMode)}
        >
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="lm" className="flex items-center gap-2">
              <Bot className="h-4 w-4" />
              Use Available Samples
            </TabsTrigger>
            <TabsTrigger value="custom" className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Custom Text
            </TabsTrigger>
          </TabsList>

          <CardContent className="space-y-6 mt-6">
            {inputMode === "lm" && (
              <div className="space-y-4 animate-fade-up opacity-0 [animation-delay:400ms] [animation-fill-mode:forwards]">
                <div className="bg-muted p-4 rounded-lg min-h-[100px] transition-all duration-300">
                  {!selectedLanguage ? (
                    <>
                      <p className="text-lg font-medium">Welcome to Bantu Translate!</p>
                      <p className="text-sm text-muted-foreground">
                        Please select one of your interested languages to get
                        started.
                      </p>
                    </>
                  ) : isLoading ? (
                    <>
                      <div className="flex justify-between items-start">
                        <p className="text-sm text-muted-foreground mb-2">Loading samples...</p>
                        <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                      </div>
                      <div className="space-y-2">
                        <Skeleton className="h-4 w-5/6" />
                        <Skeleton className="h-4 w-4/5" />
                        <Skeleton className="h-4 w-2/3" />
                      </div>
                    </>
                  ) : translationSamples.length > 0 && currentSample ? (
                    <>
                      <p className="text-sm text-muted-foreground mb-2">
                        Original Text ({currentSampleIndex + 1}/
                        {translationSamples.length})
                      </p>
                      <p className="text-lg font-medium transition-opacity duration-300 ease-in-out">
                        {currentSample.translation_seed_data?.original_text}
                      </p>
                    </>
                  ) : (
                    <>
                      <p className="text-sm text-muted-foreground mb-2">
                        No samples available
                      </p>
                      <p className="text-lg">
                        No translation samples available for this language.
                        <Button 
                          variant="link"
                          onClick={handleRefreshSamples} 
                          disabled={isLoading}
                          className="px-2"
                        >
                          Try refreshing
                        </Button>
                      </p>
                    </>
                  )}
                </div>
              </div>
            )}

            {inputMode === "custom" && (
              <div className="space-y-4 animate-fade-up opacity-0 [animation-delay:400ms] [animation-fill-mode:forwards]">
                <div>
                  <Label htmlFor="translation-correction">Base Text</Label>
                  <Textarea
                    id="translation-correction"
                    placeholder="English Text Goes Here..."
                    value={translation}
                    onChange={handleCustomTextChange}
                    className="h-28 mt-5"
                    disabled={!selectedLanguage || isLoading}
                  />
                </div>
              </div>
            )}

            <div className="space-y-4 animate-fade-up opacity-0 [animation-delay:600ms] [animation-fill-mode:forwards]">
              <div>
                <Label htmlFor="translation">Translation</Label>
                <Textarea
                  id="translation"
                  placeholder="Provide an African Language translation..."
                  value={inputMode === "lm" && isLoading ? "" : translation}
                  onChange={handleTranslationChange}
                  className="h-32 mt-5 transition-all duration-300"
                  disabled={!selectedLanguage || (inputMode === "lm" && (isLoading || !currentSample))}
                />
              </div>
            </div>
          </CardContent>

          <CardFooter className="flex justify-between space-x-4">
            <div>
              {inputMode === "lm" && (
                <Button
                  variant="outline"
                  onClick={handleNextSample}
                  disabled={
                    !selectedLanguage ||
                    isLoading ||
                    translationSamples.length === 0
                  }
                  className="animate-fade-up opacity-0 [animation-delay:200ms] [animation-fill-mode:forwards]"
                >
                  Skip
                </Button>
              )}
            </div>
            <div className="flex space-x-2">
              <Button
                variant="outline"
                onClick={handleReset}
                disabled={!selectedLanguage || !translation.trim() || isLoading}
                className="animate-fade-up opacity-0 [animation-delay:200ms] [animation-fill-mode:forwards]"
              >
                Reset
              </Button>
              <Button
                onClick={handleSave}
                disabled={
                  createContribution.isPending || 
                  !selectedLanguage || 
                  !translation.trim() || 
                  isLoading ||
                  (inputMode === "lm" && !currentSample)
                }
                className="animate-fade-up opacity-0 [animation-delay:200ms] [animation-fill-mode:forwards]"
              >
                {createContribution.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  "Save"
                )}
              </Button>
            </div>
          </CardFooter>
        </Tabs>
      </Card>
    </div>
  );
}
