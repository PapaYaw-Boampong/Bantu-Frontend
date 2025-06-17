import { useState, useEffect, useRef, useCallback } from 'react';
import { RefreshCw, Loader2, Eye, EyeOff } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { useGetUserLanguages } from '@/hooks/languageHooks/useGetUserLanguages';
import { useListAnnotationSamples } from '@/hooks/sampleHooks/useListAnnotationSamples';
import { useCreateContribution } from '@/hooks/contributionHooks/useCreateContribution';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { triggerControlledLoading } from "@/utils/controlledLoading";
import {
  Card,
  CardContent,
  CardFooter,
} from '@/components/ui/card';

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

import { AnnotationSample } from '@/types/sample';
import { ContributionCreate } from '@/types/contribution';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';

export default function Annotate() {
  const {
    data: userLanguages = [],
    isLoading: languagesLoading,
  } = useGetUserLanguages();
  const [selectedLanguage, setSelectedLanguage] = useState('');
  const [targetAnnotation, setTargetAnnotation] = useState('');
  const [currentSample, setCurrentSample] = useState<AnnotationSample | null>(null);
  const [controlledLoading, setControlledLoading] = useState(false);
  const [showHint, setShowHint] = useState(false);
  const { toast } = useToast();

  const [annotationSamples, setAnnotationSamples] = useState<AnnotationSample[]>([]);
  const [currentSampleIndex, setCurrentSampleIndex] = useState(0);
  const BUFFER_LIMIT = 20;


  const isFetchingSamples = useRef(false);

  const safeRefetchSamples = () => {
    if (!isFetchingSamples.current) {
      isFetchingSamples.current = true;
      refetchSamples().finally(() => {
        isFetchingSamples.current = false;
      });
    }
  };

  const getBufferedSampleIds = (): string[] => {
    return annotationSamples.map((sample) => sample.id);
  };

  // Fetch annotation samples based on selected language
  const {
    data: annotationSampleResponse,
    isLoading: samplesLoading,
    refetch: refetchSamples,
    isError: sampleError,
  } = useListAnnotationSamples({
    languageId: selectedLanguage,
    active: true,
    limit: 3,
    buffer: getBufferedSampleIds().join(",")
  });


  const isLoadingRef = useCallback(() => samplesLoading, [samplesLoading]);
  const isLoading = samplesLoading || controlledLoading;

  const createContribution = useCreateContribution();

  // mount ref for suppressing initial fire
  const hasMounted = useRef(false);

  // language update side effect
  useEffect(() => {

    // if (!hasMounted.current) {
    //   hasMounted.current = true;
    //   return;
    // }

    if (!selectedLanguage) {

      toast({
        title: "Missing language selection",
        description: "select a language to contribute",
        variant: "warning"
      });

      return
    };

    triggerControlledLoading(setControlledLoading, isLoadingRef, () => {
      setAnnotationSamples([]);
      setCurrentSampleIndex(0);
      setTargetAnnotation('');
      safeRefetchSamples();
      setShowHint(false);
      toast({
        title: "Language Update Detected",
        description: "Contributions from now on are targeted towards the selected language",
        variant: "info"
      });
    });

  }, [selectedLanguage]);


  // Buffer management side effect
  useEffect(() => {
    if (annotationSampleResponse?.samples?.length) {
      setAnnotationSamples(prev => {
        const updated = [...prev, ...annotationSampleResponse.samples];
        return updated.slice(0, BUFFER_LIMIT); // Keep within buffer size
      });
      setControlledLoading(false);
    }
  }, [annotationSampleResponse]);


  // Current sample update side effect
  useEffect(() => {
    
    if (annotationSamples.length > 0) {
      const sample = annotationSamples[currentSampleIndex] || null;
      setCurrentSample(sample);
      setTargetAnnotation("");
    }

  }, [annotationSamples, currentSampleIndex]);


  const handleNextSample = () => {
    triggerControlledLoading(setControlledLoading, isLoadingRef, () => {
      setAnnotationSamples(prev => prev.slice(1));
      setTargetAnnotation("");

      if (annotationSamples.length <= 2) {
        safeRefetchSamples();
      }
    });
  };

  const toggleHint = () => {
    setShowHint(!showHint);
  };

  const handleSave = () => {
    if (!selectedLanguage) {
      toast({
        title: 'Language required',
        description: 'You need to select a language before saving.',
        variant: 'destructive',
      });
      return;
    }

    if (!targetAnnotation) {
      toast({
        title: 'Annotation required',
        description: 'You need to provide an annotation before saving.',
        variant: 'destructive',
      });
      return;
    }

    if (!currentSample) {
      toast({
        title: 'No sample available',
        description: 'Please refresh to get a new sample.',
        variant: 'destructive',
      });
      return;
    }

    const contributionData: ContributionCreate = {
      target_text: targetAnnotation,
    };

    // Show loading state while saving
    setControlledLoading(true);

    createContribution.mutate({
      languageId: selectedLanguage,
      sampleId: currentSample.id,
      contributionType: 'annotation',
      contributionData: contributionData,
    }, {
      onSuccess: () => {
        toast({
          title: 'Annotation saved',
          description: 'Thank you for your contribution!',
          variant: "success"
        });
        setTargetAnnotation('');
        handleNextSample();

        setControlledLoading(false);
      },
      onError: (error) => {
        setControlledLoading(false);
        toast({
          title: 'Error saving annotation',
          description: 'There was an error saving your annotation. Please try again.',
          variant: 'destructive',
        });
        console.error('Error saving annotation:', error);
      }
    });
  };

  const handleRefreshSamples = () => {
    triggerControlledLoading(setControlledLoading, isLoadingRef, () => {
      setShowHint(false);

      // Clear existing buffer and reset index
      setAnnotationSamples([]);
      setCurrentSampleIndex(0);

      // Refetch samples
      safeRefetchSamples();

      toast({
        title: 'Refreshing samples',
        description: 'Loading new annotation samples...',
        variant: "info"
      });
    });
  };

  // Check if samples should be displayed
  const shouldShowContent = selectedLanguage && !(sampleError && !isLoading);
  const noSamplesAvailable = shouldShowContent && !isLoading && annotationSamples.length === 0;

  return (
    <div className="max-w-6xl mx-auto px-4 py-12">
      <div className="mb-8 animate-fade-up opacity-0 [animation-fill-mode:forwards]">
        <h1 className="text-3xl font-bold pb-3">Annotate</h1>
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
        <CardContent className="mt-6">
          {!shouldShowContent ? (
            <div className="py-16 text-center">
              <p className="text-lg text-muted-foreground mb-4">
                Select a language to view annotation samples
              </p>
            </div>
          ) : noSamplesAvailable ? (
            <div className="py-16 text-center">
              <p className="text-lg text-muted-foreground mb-4">
                No annotation samples available for this language
              </p>
              <Button
                onClick={handleRefreshSamples}
                disabled={isLoading}
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Try Refreshing
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-8">
              {/* Left side - Image */}
              <div className="animate-fade-up opacity-0 [animation-delay:400ms] [animation-fill-mode:forwards]">
                <p className="text-sm text-muted-foreground mb-2">
                  Sample Image {!isLoading && annotationSamples.length > 0 && (
                    <>({currentSampleIndex + 1}/{annotationSamples.length})</>
                  )}
                </p>
                <div className="w-full h-[500px] bg-muted flex items-center justify-center rounded-md overflow-hidden relative">
                  {isLoading ? (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                    </div>
                  ) : currentSample?.annotation_seed_data?.image_url ? (
                    <img
                      src={currentSample.annotation_seed_data.image_url}
                      alt="Sample image"
                      className="max-w-full max-h-full object-contain transition-opacity duration-300"
                    />
                  ) : (
                    <div className="text-muted-foreground">No image available</div>
                  )}
                </div>
              </div>

              {/* Right side - Text fields */}
              <div className="space-y-6 animate-fade-up opacity-0 [animation-delay:600ms] [animation-fill-mode:forwards]">
                {/* English Annotation - Now with blur and hint button */}
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <Label>English Annotation</Label>
                    {!isLoading && currentSample && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={toggleHint}
                        className="flex items-center gap-1 text-xs"
                      >
                        {showHint ? (
                          <>
                            <EyeOff className="h-3.5 w-3.5" />
                            Hide Hint
                          </>
                        ) : (
                          <>
                            <Eye className="h-3.5 w-3.5" />
                            Show Hint
                          </>
                        )}
                      </Button>
                    )}
                  </div>
                  <div className={cn(
                    "p-4 border rounded-md bg-muted/30 min-h-[100px] relative transition-all duration-300",
                    !showHint && !isLoading && "hover:border-primary/50"
                  )}>
                    {isLoading ? (
                      <div className="space-y-2">
                        <Skeleton className="h-4 w-3/4" />
                        <Skeleton className="h-4 w-5/6" />
                        <Skeleton className="h-4 w-2/3" />
                      </div>
                    ) : (
                      <>
                        <div className={cn(
                          "transition-all duration-300",
                          !showHint && "blur-md select-none"
                        )}>
                          <p className="text-lg transition-opacity duration-300 ease-in-out">
                            {currentSample?.annotation_seed_data?.annotation_text || "No annotation available"}
                          </p>
                        </div>
                        {!showHint && (
                          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                            <p className="text-muted-foreground text-sm">Click "Show Hint" to reveal the English annotation</p>
                          </div>
                        )}
                      </>
                    )}
                  </div>
                </div>

                {/* Target Translation */}
                <div className="space-y-2">
                  <Label>Target Translation</Label>
                  <Textarea
                    placeholder="Provide a translation in the target language..."
                    value={targetAnnotation}
                    onChange={(e) => setTargetAnnotation(e.target.value)}
                    className="h-32 transition-all duration-300"
                    disabled={isLoading || !currentSample}
                  />
                </div>

                {/* Buttons */}
                <div className="flex justify-between">
                  <Button
                    variant="outline"
                    onClick={handleNextSample}
                    disabled={isLoading || !currentSample}
                    className="animate-fade-up opacity-0 [animation-delay:200ms] [animation-fill-mode:forwards]"
                  >
                    Skip
                  </Button>
                  <Button
                    onClick={handleSave}
                    disabled={createContribution.isPending || isLoading || !currentSample || !targetAnnotation}
                    className="animate-fade-up opacity-0 [animation-delay:200ms] [animation-fill-mode:forwards]"
                  >
                    {createContribution.isPending || isLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Saving...
                      </>
                    ) : 'Save'}
                  </Button>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
} 