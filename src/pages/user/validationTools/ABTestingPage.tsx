import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useToast } from '@/components/ui/use-toast';
import { useGetUserLanguages } from '@/hooks/languageHooks/useGetUserLanguages';
import ABTesting, { ContributionType } from '@/components/common/ABTesting';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ChevronLeft, HelpCircle } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

export default function ABTestingPage() {
  const navigate = useNavigate();
  const { toast } = useToast();

  const {
    challengeId,
    taskType: paramTaskType
  } = useParams<{ challengeId?: string, taskType?: string }>();

  const [taskType, setTaskType] = useState<ContributionType>(
    (paramTaskType as ContributionType) || 'translation'
  );


  // Language aid 
  const {
    data: userLanguages = [],
    isLoading: languagesLoading,
  } = useGetUserLanguages();
  const [selectedLanguage, setSelectedLanguage] = useState('');

  // help dialog 
  const [showHelpDialog, setShowHelpDialog] = useState(false);

  const getLanguageNameById = (id: string): string | undefined => {
    return userLanguages.find(lang => lang.language.id === id)?.language.name;
  };

  // const currentPair = ABTestBuffer[currentPairIndex];

  useEffect(() => {
    // When taskType is changed, add a helpful toast message about the flow
    if (taskType === 'transcription') {
      toast({
        title: "Transcription Evaluation Mode",
        description: "Listen to both audio recordings and select which better represents the text shown.",
      });
    } else if (taskType === 'annotation'){
      toast({
        title: "Annotation Evaluation Mode",
        description: " Study the provided images closely and select the annotation that better represents the text's intended description.",
      });

    }
    else if (taskType === 'translation'){
      toast({
        title: "Translation Evaluation Mode",
        description: "Study the text provided closely and select the translation that better represents the text's intended translation ",
      });
      
    }

    // Reset pair 
  }, [taskType, toast]);


  return (
    <div className="container max-w-7xl mx-auto py-8 px-4 space-y-8">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button variant="ghost" onClick={() => navigate(-1)}>
            <ChevronLeft className="h-5 w-5 mr-2" />
            Back
          </Button>
          <h1 className="text-3xl font-bold">A/B Testing Evaluation</h1>
        </div>

        <Button variant="outline" onClick={() => setShowHelpDialog(true)}>
          <HelpCircle className="h-4 w-4 mr-2" />
          Help
        </Button>
      </div>

      <div className="flex flex-col md:flex-row gap-6 md:items-end">
        {/* Task Selection */}

        <div className="space-y-2">
          <Label htmlFor="task-type">Task Type</Label>
          <Select
            value={taskType}
            onValueChange={(value) => setTaskType(value as ContributionType)}
          >
            <SelectTrigger id="task-type" className="w-[200px]">
              <SelectValue placeholder="Select task type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="translation">Translation</SelectItem>
              <SelectItem value="transcription">Transcription</SelectItem>
              <SelectItem value="annotation">Image Annotation</SelectItem>
            </SelectContent>
          </Select>
        </div>


        {/* Language Selection */}
        <div className="space-y-2">
          <Label htmlFor="language">Target Language</Label>
          <Select
            value={selectedLanguage}
            onValueChange={setSelectedLanguage}
            disabled={languagesLoading}
          >
            <SelectTrigger id="language" className="w-[200px]">
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

        {/* <div className="text-sm text-muted-foreground">
          Pair {currentPairIndex + 1} of {testBuffer.length}
        </div> */}
      </div>

      {selectedLanguage && taskType ? (
        <ABTesting
          taskType={taskType}
          languageId={selectedLanguage}
          language={getLanguageNameById(selectedLanguage) || "Not specified"}
          userlanguages={userLanguages}
          className="animate-fade-in opacity-0"
        />
      ) : (
        <div className="flex flex-col items-center justify-center py-12">
          <p className="text-muted-foreground">
            Please select a language and task type to begin evaluations
          </p>
        </div>
      )}

      {/* Help Dialog */}
      <Dialog open={showHelpDialog} onOpenChange={setShowHelpDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>A/B Testing Help</DialogTitle>
            <DialogDescription>
              How to evaluate contributions
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <h3 className="font-medium">Evaluating Contributions</h3>
            <ul className="list-disc space-y-2 ml-5 text-sm text-muted-foreground">
              <li> both contributions (A and B) carefully.</li>
              <li>Select which contribution is better based on:</li>
              <ul className="list-circle ml-5 mt-1 space-y-1">
                <li>Accuracy (correctness of the translation/transcription)</li>
                <li>Fluency (how natural it sounds)</li>
                <li>Completeness (includes all information)</li>
              </ul>
              <li>If both are equally good, select "Equally Good".</li>
              <li>If you find issues with both contributions, use the "Flag Issues" button.</li>
            </ul>

            <h3 className="font-medium mt-4">Task Types</h3>
            <ul className="list-disc space-y-2 ml-5 text-sm text-muted-foreground">
              <li><strong>Translation:</strong> Compare translations between languages.</li>
              <li><strong>Transcription:</strong> Compare transcriptions of audio content.</li>
              <li><strong>Image Annotation:</strong> Compare descriptions of images.</li>
            </ul>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
} 