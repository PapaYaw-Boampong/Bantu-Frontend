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
  DialogTrigger,
} from '@/components/ui/dialog';

// Mock data for demonstration
const MOCK_CONTRIBUTIONS = {
  translation: [
    {
      id: '1',
      sourceContent: 'This is a sample text to translate into another language. It contains several sentences with different structures.',
      pairA: {
        id: 'a1',
        content: 'Este es un texto de muestra para traducir a otro idioma. Contiene varias oraciones con diferentes estructuras.'
      },
      pairB: {
        id: 'b1',
        content: 'Este es un texto de ejemplo para traducir a otro idioma. Tiene múltiples frases con estructuras variadas.'
      }
    },
    {
      id: '2',
      sourceContent: 'The patient should take the medication three times daily, preferably after meals.',
      pairA: {
        id: 'a2',
        content: 'El paciente debe tomar la medicación tres veces al día, preferiblemente después de las comidas.'
      },
      pairB: {
        id: 'b2',
        content: 'El paciente debería tomar el medicamento tres veces por día, preferentemente después de comer.'
      }
    }
  ],
  transcription: [
    {
      id: '1',
      sourceContent: 'Take one tablet by mouth daily. Avoid exposure to sunlight while using this medication.',
      pairA: {
        id: 'a1',
        audioUrl: 'https://assets.mixkit.co/music/preview/mixkit-tech-house-vibes-130.mp3',
        content: 'Audio recording of medical instructions'
      },
      pairB: {
        id: 'b1',
        audioUrl: 'https://assets.mixkit.co/music/preview/mixkit-trip-hop-vibes-149.mp3',
        content: 'Audio recording of medical instructions'
      }
    },
    {
      id: '2',
      sourceContent: "I've been experiencing the symptoms for about two weeks now, mainly in the mornings.",
      pairA: {
        id: 'a2',
        audioUrl: 'https://assets.mixkit.co/music/preview/mixkit-forest-treasure-138.mp3',
        content: 'Audio recording of patient interview'
      },
      pairB: {
        id: 'b2',
        audioUrl: 'https://assets.mixkit.co/music/preview/mixkit-serene-view-443.mp3',
        content: 'Audio recording of patient interview'
      }
    }
  ],
  annotation: [
    {
      id: '1',
      sourceContent: '[Medical equipment image]',
      imageUrl: 'https://placehold.co/600x400?text=Medical+Equipment',
      pairA: {
        id: 'a1',
        content: 'X-ray machine with control panel on the right side',
        imageUrl: 'https://placehold.co/600x400?text=Medical+Equipment'
      },
      pairB: {
        id: 'b1',
        content: 'Radiographic imaging device with operator controls positioned on right',
        imageUrl: 'https://placehold.co/600x400?text=Medical+Equipment'
      }
    },
    {
      id: '2',
      sourceContent: '[Medical procedure image]',
      imageUrl: 'https://placehold.co/600x400?text=Medical+Procedure',
      pairA: {
        id: 'a2',
        content: 'Nurse administering intravenous medication to patient',
        imageUrl: 'https://placehold.co/600x400?text=Medical+Procedure'
      },
      pairB: {
        id: 'b2',
        content: "Healthcare provider inserting IV medication into patient's arm",
        imageUrl: 'https://placehold.co/600x400?text=Medical+Procedure'
      }
    }
  ]
};

export default function ABTestingPage() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const {
    data: userLanguages = [],
    isLoading: languagesLoading,
    isError,
    error,
  } = useGetUserLanguages();

  const { challengeId, taskType: paramTaskType } = useParams<{ challengeId?: string, taskType?: string }>();
  const [taskType, setTaskType] = useState<ContributionType>((paramTaskType as ContributionType) || 'translation');
  const [selectedLanguage, setSelectedLanguage] = useState('');
  const [currentPairIndex, setCurrentPairIndex] = useState(0);
  const [showHelpDialog, setShowHelpDialog] = useState(false);
  const [results, setResults] = useState<Array<{pairId: string, choice: 'A' | 'B' | 'same' | 'flag', reason?: string}>>([]);
  const getLanguageNameById = (id: string): string | undefined => {
    return userLanguages.find(lang => lang.language.id === id)?.language.name;
  };
  
  // Get the appropriate data set based on task type
  const contributions = MOCK_CONTRIBUTIONS[taskType] || [];
  const currentPair = contributions[currentPairIndex];
  
  useEffect(() => {
    // When taskType is changed, add a helpful toast message about the flow
    if (taskType === 'transcription') {
      toast({
        title: "Transcription Evaluation Mode",
        description: "Listen to both audio recordings and select which better represents the text shown.",
      });
    }
    // Reset pair index when task type changes
    setCurrentPairIndex(0);
  }, [taskType, toast]);
  
  const handleSubmit = (result: 'A' | 'B' | 'same' | 'flag', reason?: string, notes?: string) => {
    // In a real app, this would send data to an API
    setResults([...results, {
      pairId: currentPair.id,
      choice: result,
      reason: reason
    }]);
    
    toast({
      title: "Evaluation Submitted",
      description: result === 'flag' 
        ? "Issue flagged. Thank you for your feedback." 
        : "Evaluation recorded. Thank you for your input."
    });
    
    // Move to next pair
    if (currentPairIndex < contributions.length - 1) {
      setCurrentPairIndex(currentPairIndex + 1);
    } else {
      // End of contributions
      toast({
        title: "Task Complete",
        description: "You've completed all pairs for this task type."
      });
      // In a real app, you might navigate away or show a summary
      setCurrentPairIndex(0);
    }
  };
  
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
        
        <div className="text-sm text-muted-foreground">
          Pair {currentPairIndex + 1} of {contributions.length}
        </div>
      </div>
      
      {currentPair && (
        <ABTesting
          taskType={taskType}
          languageId={selectedLanguage || "Not specified"}
          language={getLanguageNameById(selectedLanguage) || "Not specified"}
        


          className="animate-fade-in opacity-0"
        />
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