import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useToast } from '@/hooks/uiHooks/use-toast';
import { useChallenges } from '@/hooks/challengeHooks/useChallenges';
import { useLanguage } from '@/hooks/languageHooks/useLanguage';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Slider } from '@/components/ui/slider';
import { Play, Pause, SkipBack, SkipForward, Save, CheckCircle, XCircle, Flag, HelpCircle, Scale } from 'lucide-react';
import { EventType } from '@/types/challenge';
import AudioRecorder from '@/components/common/AudioRecorder';
import TokenizedWords from '@/components/common/TokenizedWords';
import ABTesting, { ContributionType } from '@/components/common/ABTesting';

// Mock data for audio samples
const mockAudioSamples = [
  { id: '1', title: 'Medical Terminology 1', language: 'English', duration: '1:24', difficulty: 'Medium' },
  { id: '2', title: 'Patient Instructions', language: 'English', duration: '2:08', difficulty: 'Easy' },
  { id: '3', title: 'Diagnosis Report', language: 'English', duration: '3:17', difficulty: 'Hard' },
];

// Mock data for text samples
const mockTextSamples = [
  { id: '1', title: 'Medical Terms', sourceLanguage: 'English', targetLanguage: 'Spanish', wordCount: 245, difficulty: 'Medium' },
  { id: '2', title: 'Patient Guide', sourceLanguage: 'English', targetLanguage: 'French', wordCount: 189, difficulty: 'Easy' },
  { id: '3', title: 'Research Paper', sourceLanguage: 'English', targetLanguage: 'German', wordCount: 312, difficulty: 'Hard' },
];

// Mock data for image samples
const mockImageSamples = [
  { id: '1', title: 'Medical Equipment', language: 'English', type: 'evaluation', difficulty: 'Medium' },
  { id: '2', title: 'Patient Care', language: 'English', type: 'contribution', difficulty: 'Easy' },
  { id: '3', title: 'Hospital Scene', language: 'English', type: 'evaluation', difficulty: 'Hard' },
];

type TaskType = 'transcription_evaluation' | 'transcription_contribution' | 
                'translation_evaluation' | 'translation_contribution' |
                'annotation_evaluation' | 'annotation_contribution' |
                'ab_testing';

type ValidationStatus = 'pending' | 'correct' | 'wrong' | 'flagged';

interface WorkspaceManagerProps {
  challengeId?: string;
  initialTaskType?: TaskType;
}

export default function WorkspaceManager({ challengeId, initialTaskType = 'transcription_evaluation' }: WorkspaceManagerProps) {
  const location = useLocation();
  const { toast } = useToast();
  const { getChallenge } = useChallenges();
  // const { languages, loading: languagesLoading } = useLanguage();
  
  const [taskType, setTaskType] = useState<TaskType>(initialTaskType);
  const [selectedLanguage, setSelectedLanguage] = useState('');
  const [selectedSample, setSelectedSample] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [validationStatus, setValidationStatus] = useState<ValidationStatus>('pending');
  const [transcription, setTranscription] = useState('');
  const [translation, setTranslation] = useState('');
  const [englishAnnotation, setEnglishAnnotation] = useState('');
  const [targetAnnotation, setTargetAnnotation] = useState('');
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [showFlagDialog, setShowFlagDialog] = useState(false);
  const [showCorrectionDialog, setShowCorrectionDialog] = useState(false);
  const [flagReason, setFlagReason] = useState('');
  const [flagNote, setFlagNote] = useState('');
  const [showHelp, setShowHelp] = useState(false);
  
  // Add AB Testing specific state
  const [abTestingMode, setAbTestingMode] = useState<ContributionType>('translation');
  const [abTestingPairs, setAbTestingPairs] = useState<any[]>([]);
  const [currentAbPairIndex, setCurrentAbPairIndex] = useState(0);
  
  // Add mock AB testing data - in a real app this would come from an API
  const mockAbTestingPairs = {
    translation: [
      {
        id: '1',
        sourceContent: 'The medication should be taken twice daily with food.',
        pairA: { id: 'a1', content: 'El medicamento debe tomarse dos veces al día con comida.' },
        pairB: { id: 'b1', content: 'La medicación debe ser tomada dos veces diariamente con alimentos.' }
      },
      {
        id: '2',
        sourceContent: 'Please inform your doctor if you experience any side effects.',
        pairA: { id: 'a2', content: 'Por favor informe a su médico si experimenta algún efecto secundario.' },
        pairB: { id: 'b2', content: 'Informe a su doctor si presenta cualquier efecto secundario.' }
      }
    ],
    transcription: [
      {
        id: '1',
        sourceContent: 'Take the blue pill every morning before breakfast.',
        pairA: { 
          id: 'a1', 
          content: 'Audio recording of medication instructions',
          audioUrl: 'https://assets.mixkit.co/music/preview/mixkit-tech-house-vibes-130.mp3'
        },
        pairB: { 
          id: 'b1', 
          content: 'Audio recording of medication instructions',
          audioUrl: 'https://assets.mixkit.co/music/preview/mixkit-trip-hop-vibes-149.mp3'
        }
      }
    ],
    annotation: [
      {
        id: '1',
        sourceContent: '[Medical scan image]',
        imageUrl: 'https://placehold.co/600x400?text=Medical+Scan',
        pairA: { 
          id: 'a1', 
          content: 'Brain MRI scan showing frontal lobe activity',
          imageUrl: 'https://placehold.co/600x400?text=Medical+Scan'
        },
        pairB: { 
          id: 'b1', 
          content: 'MRI of the brain highlighting increased frontal cortex activity',
          imageUrl: 'https://placehold.co/600x400?text=Medical+Scan'
        }
      }
    ]
  };
  
  // Initialize AB testing pairs based on the selected mode
  useEffect(() => {
    if (taskType === 'ab_testing') {
      setAbTestingPairs(mockAbTestingPairs[abTestingMode] || []);
      setCurrentAbPairIndex(0);
    }
  }, [taskType, abTestingMode]);
  
  // AB Testing submission handler
  const handleAbTestingSubmit = (result: 'A' | 'B' | 'same' | 'flag', reason?: string, notes?: string) => {
    // In a real app, this would submit the result to an API
    toast({
      title: 'Evaluation Submitted',
      description: result === 'flag' 
        ? 'Issues flagged. Thank you for your feedback.'
        : 'Your evaluation has been recorded.',
    });
    
    // Move to next pair if available
    if (currentAbPairIndex < abTestingPairs.length - 1) {
      setCurrentAbPairIndex(currentAbPairIndex + 1);
    } else {
      // End of pairs
      toast({
        title: 'Task Complete',
        description: 'You have completed all pairs for this task.',
      });
      // In a real app, you might navigate away or show a summary
    }
  };
  
  // Load challenge from location state if provided
  useEffect(() => {
    const fetchChallengeDetails = async () => {
      const locationState = location.state as any;
      const selectedId = challengeId || locationState?.selectedChallenge;
      
      if (selectedId) {
        setLoading(true);
        try {
          const data = await getChallenge(selectedId);
          // Set task type based on challenge type
          if (data.event_type === EventType.TRANSCRIPTION_CHALLENGE) {
            // Determine if it's evaluation or contribution
            setTaskType(data.is_evaluation ? 'transcription_evaluation' : 'transcription_contribution');
          } else if (data.event_type === EventType.TRANSLATION_CHALLENGE) {
            setTaskType(data.is_evaluation ? 'translation_evaluation' : 'translation_contribution');
          } else if (data.event_type === EventType.ANNOTATION_CHALLENGE) {
            setTaskType(data.is_evaluation ? 'annotation_evaluation' : 'annotation_contribution');
          }
        } catch (error) {
          console.error('Failed to fetch challenge details:', error);
          toast({
            title: 'Error',
            description: 'Failed to load challenge details',
            variant: 'destructive',
          });
        } finally {
          setLoading(false);
        }
      }
    };
    
    fetchChallengeDetails();
  }, [location.state, challengeId, getChallenge, toast]);

  const handleSelectSample = (sample: any) => {
    setSelectedSample(sample);
    setValidationStatus('pending');
    setTranscription('');
    setTranslation('');
    setEnglishAnnotation('');
    setTargetAnnotation('');
    setAudioBlob(null);
    
    // Mock loading sample data
    toast({
      title: 'Sample Loaded',
      description: `Now working on: ${sample.title}`,
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

    setValidationStatus(status);
    if (status === 'correct') {
      toast({
        title: 'Validation Complete',
        description: 'Moving to next sample...',
      });
      // Reset and load next sample
      resetState();
    } else if (status === 'wrong') {
      setShowCorrectionDialog(true);
    }
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
        title: 'Flag Reason Required',
        description: 'Please select a reason for flagging.',
        variant: 'destructive',
      });
      return;
    }
    
    setValidationStatus('flagged');
    setShowFlagDialog(false);
    toast({
      title: 'Sample Flagged',
      description: 'Thank you for your feedback.',
    });
    // Reset and load next sample
    resetState();
  };

  const handleRecordingComplete = (blob: Blob) => {
    setAudioBlob(blob);
    toast({
      title: 'Recording Complete',
      description: 'Your audio recording is ready.',
    });
  };

  const handleSubmit = () => {
    if (!selectedLanguage) {
      toast({
        title: 'Please select a language',
        description: 'You need to select a language before submitting.',
        variant: 'destructive',
      });
      return;
    }

    if (!selectedSample) {
      toast({
        title: 'Please select a sample',
        description: 'You need to select a sample before submitting.',
        variant: 'destructive',
      });
      return;
    }

    // Validate based on task type
    if (taskType.includes('transcription') && !transcription) {
      toast({
        title: 'Transcription Required',
        description: 'Please provide a transcription before submitting.',
        variant: 'destructive',
      });
      return;
    }

    if (taskType.includes('translation') && !translation) {
      toast({
        title: 'Translation Required',
        description: 'Please provide a translation before submitting.',
        variant: 'destructive',
      });
      return;
    }

    if (taskType.includes('annotation')) {
      if (!englishAnnotation || !targetAnnotation) {
        toast({
          title: 'Annotations Required',
          description: 'Please provide both English and target language annotations.',
          variant: 'destructive',
        });
        return;
      }
    }

    if (taskType.includes('contribution') && !audioBlob) {
      toast({
        title: 'Recording Required',
        description: 'Please record audio before submitting.',
        variant: 'destructive',
      });
      return;
    }

    toast({
      title: 'Submission Successful',
      description: 'Your work has been submitted successfully.',
    });
    
    // Reset the workspace
    resetState();
  };

  const resetState = () => {
    setSelectedSample(null);
    setValidationStatus('pending');
    setTranscription('');
    setTranslation('');
    setEnglishAnnotation('');
    setTargetAnnotation('');
    setAudioBlob(null);
    setFlagReason('');
    setFlagNote('');
  };

  const renderSampleList = () => {
    if (taskType === 'ab_testing') {
      return (
        <div className="space-y-4">
          <div className="p-4 border rounded-md bg-muted/30">
            <h3 className="font-medium mb-2">A/B Testing</h3>
            <p className="text-sm text-muted-foreground">
              Compare two contributions side-by-side and evaluate which one is better,
              or if they are equally good. This helps improve the quality of our models.
            </p>
          </div>
          
          <div className="space-y-2">
            {abTestingPairs.map((pair, index) => (
              <div
                key={pair.id}
                className={`p-3 border rounded-md cursor-pointer hover:bg-muted transition-colors ${
                  currentAbPairIndex === index ? 'border-primary bg-muted/50' : ''
                }`}
                onClick={() => setCurrentAbPairIndex(index)}
              >
                <div className="flex justify-between items-center">
                  <span className="font-medium">Pair #{index + 1}</span>
                </div>
                <div className="flex gap-2 text-xs text-muted-foreground mt-1">
                  <span>{abTestingMode}</span>
                  <span>•</span>
                  <span>Comparison Task</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      );
    }
    
    switch (taskType) {
      case 'transcription_evaluation':

      case 'transcription_contribution':
        return (
          <div className="space-y-2">
            {mockAudioSamples.map((audio) => (
              <div
                key={audio.id}
                className={`p-3 border rounded-md cursor-pointer hover:bg-muted transition-colors ${
                  selectedSample?.id === audio.id ? 'border-primary bg-muted/50' : ''
                }`}
                onClick={() => handleSelectSample(audio)}
              >
                <div className="flex justify-between items-center">
                  <span className="font-medium">{audio.title}</span>
                  <span className="text-xs text-muted-foreground">{audio.duration}</span>
                </div>
                <div className="flex gap-2 text-xs text-muted-foreground mt-1">
                  <span>{audio.language}</span>
                  <span>•</span>
                  <span>{audio.difficulty}</span>
                </div>
              </div>
            ))}
          </div>
        );
      
      case 'translation_evaluation':

      case 'translation_contribution':
        return (
          <div className="space-y-2">
            {mockTextSamples.map((text) => (
              <div
                key={text.id}
                className={`p-3 border rounded-md cursor-pointer hover:bg-muted transition-colors ${
                  selectedSample?.id === text.id ? 'border-primary bg-muted/50' : ''
                }`}
                onClick={() => handleSelectSample(text)}
              >
                <div className="flex justify-between items-center">
                  <span className="font-medium">{text.title}</span>
                  <span className="text-xs text-muted-foreground">{text.wordCount} words</span>
                </div>
                <div className="flex gap-2 text-xs text-muted-foreground mt-1">
                  <span>{text.sourceLanguage} → {text.targetLanguage}</span>
                  <span>•</span>
                  <span>{text.difficulty}</span>
                </div>
              </div>
            ))}
          </div>
        );
      
      case 'annotation_evaluation':

      case 'annotation_contribution':
        return (
          <div className="space-y-2">
            {mockImageSamples.map((image) => (
              <div
                key={image.id}
                className={`p-3 border rounded-md cursor-pointer hover:bg-muted transition-colors ${
                  selectedSample?.id === image.id ? 'border-primary bg-muted/50' : ''
                }`}
                onClick={() => handleSelectSample(image)}
              >
                <div className="flex justify-between items-center">
                  <span className="font-medium">{image.title}</span>
                  <span className="text-xs text-muted-foreground">{image.type}</span>
                </div>
                <div className="flex gap-2 text-xs text-muted-foreground mt-1">
                  <span>{image.language}</span>
                  <span>•</span>
                  <span>{image.difficulty}</span>
                </div>
              </div>
            ))}
          </div>
        );
      
      default:
        return null;
    }
  };

  const renderWorkArea = () => {
    if (!selectedSample && taskType !== 'ab_testing') {
      return (
        <div className="h-[300px] flex items-center justify-center text-muted-foreground">
          Select a sample from the list to begin
        </div>
      );
    }

    switch (taskType) {
      case 'transcription_evaluation':
        return (
          <div className="space-y-6">
            <div className="space-y-2">
              <Label>Audio Sample</Label>
              <div className="p-4 border rounded-md bg-muted/30">
                <div className="flex items-center gap-4 mb-4">
                  <Button variant="outline" size="icon">
                    <Play className="h-4 w-4" />
                  </Button>
                  <span className="text-sm font-medium">Listen to the audio</span>
                </div>
                <div className="h-[100px] bg-muted rounded-md flex items-center justify-center">
                  <div className="text-muted-foreground">Audio Waveform Visualization</div>
                </div>
              </div>
            </div>
            
            <div className="space-y-2">
              <Label>Transcription</Label>
              <div className="p-4 border rounded-md bg-muted">
                <p className="text-lg">{transcription || "Sample transcription text..."}</p>
              </div>
            </div>
            
            <div className="flex justify-between">
              <div className="flex space-x-4">
                <Button
                  variant="outline"
                  className="flex items-center space-x-2"
                  onClick={() => handleValidation('correct')}
                >
                  <CheckCircle className="h-5 w-5 text-green-600" />
                  <span>Correct</span>
                </Button>
                <Button
                  variant="outline"
                  className="flex items-center space-x-2"
                  onClick={() => handleValidation('wrong')}
                >
                  <XCircle className="h-5 w-5 text-red-600" />
                  <span>Wrong</span>
                </Button>
              </div>
              <Button variant="outline" onClick={() => setShowFlagDialog(true)}>
                <Flag className="h-4 w-4 mr-2" />
                Flag Issue
              </Button>
            </div>
          </div>
        );
      
      case 'transcription_contribution':
        return (
          <div className="space-y-6">
            <div className="space-y-2">
              <Label>Text to Record</Label>
              <div className="p-4 border rounded-md bg-muted/30">
                <p className="text-lg">Sample text to record: "This is a sample text for recording."</p>
              </div>
            </div>
            
            <div className="space-y-2">
              <Label>Record Your Audio</Label>
              <AudioRecorder onRecordingComplete={handleRecordingComplete} />
            </div>
            
            <div className="flex justify-end">
              <Button onClick={handleSubmit} disabled={!audioBlob}>
                <Save className="mr-2 h-4 w-4" />
                Submit Recording
              </Button>
            </div>
          </div>
        );
      
      case 'translation_evaluation':
        return (
          <div className="space-y-6">
            <div className="space-y-2">
              <Label>Source Text</Label>
              <div className="p-4 border rounded-md bg-muted/30">
                <p className="text-lg">This is the source text that needs to be translated.</p>
              </div>
            </div>
            
            <div className="space-y-2">
              <Label>Translation</Label>
              <div className="p-4 border rounded-md bg-muted">
                <p className="text-lg">{translation || "Sample translation text..."}</p>
              </div>
            </div>
            
            <div className="flex justify-between">
              <div className="flex space-x-4">
                <Button
                  variant="outline"
                  className="flex items-center space-x-2"
                  onClick={() => handleValidation('correct')}
                >
                  <CheckCircle className="h-5 w-5 text-green-600" />
                  <span>Correct</span>
                </Button>
                <Button
                  variant="outline"
                  className="flex items-center space-x-2"
                  onClick={() => handleValidation('wrong')}
                >
                  <XCircle className="h-5 w-5 text-red-600" />
                  <span>Wrong</span>
                </Button>
              </div>
              <Button variant="outline" onClick={() => setShowFlagDialog(true)}>
                <Flag className="h-4 w-4 mr-2" />
                Flag Issue
              </Button>
            </div>
          </div>
        );
      
      case 'translation_contribution':
        return (
          <div className="space-y-6">
            <div className="space-y-2">
              <Label>Source Text</Label>
              <div className="p-4 border rounded-md bg-muted/30">
                <p className="text-lg">This is the source text that needs to be translated.</p>
              </div>
            </div>
            
            <div className="space-y-2">
              <Label>Your Translation</Label>
              <Textarea
                placeholder="Enter your translation here..."
                value={translation}
                onChange={(e) => setTranslation(e.target.value)}
                className="min-h-[200px]"
              />
            </div>
            
            <div className="flex justify-end">
              <Button onClick={handleSubmit} disabled={!translation.trim()}>
                <Save className="mr-2 h-4 w-4" />
                Submit Translation
              </Button>
            </div>
          </div>
        );
      
      case 'annotation_evaluation':
        return (
          <div className="space-y-6">
            <div className="space-y-2">
              <Label>Image</Label>
              <div className="p-4 border rounded-md bg-muted/30">
                <div className="w-full h-64 bg-muted flex items-center justify-center rounded-md">
                  <p className="text-muted-foreground">Sample Image</p>
                </div>
              </div>
            </div>
            
            <div className="space-y-2">
              <Label>English Annotation</Label>
              <div className="p-4 border rounded-md bg-muted">
                <p className="text-lg">{englishAnnotation || "Sample English annotation..."}</p>
              </div>
            </div>
            
            <div className="space-y-2">
              <Label>Target Language Annotation</Label>
              <div className="p-4 border rounded-md bg-muted">
                <p className="text-lg">{targetAnnotation || "Sample target language annotation..."}</p>
              </div>
            </div>
            
            <div className="flex justify-between">
              <div className="flex space-x-4">
                <Button
                  variant="outline"
                  className="flex items-center space-x-2"
                  onClick={() => handleValidation('correct')}
                >
                  <CheckCircle className="h-5 w-5 text-green-600" />
                  <span>Correct</span>
                </Button>
                <Button
                  variant="outline"
                  className="flex items-center space-x-2"
                  onClick={() => handleValidation('wrong')}
                >
                  <XCircle className="h-5 w-5 text-red-600" />
                  <span>Wrong</span>
                </Button>
              </div>
              <Button variant="outline" onClick={() => setShowFlagDialog(true)}>
                <Flag className="h-4 w-4 mr-2" />
                Flag Issue
              </Button>
            </div>
          </div>
        );
      
      case 'annotation_contribution':
        return (
          <div className="space-y-6">
            <div className="space-y-2">
              <Label>Image</Label>
              <div className="p-4 border rounded-md bg-muted/30">
                <div className="w-full h-64 bg-muted flex items-center justify-center rounded-md">
                  <p className="text-muted-foreground">Sample Image</p>
                </div>
              </div>
            </div>
            
            <div className="space-y-2">
              <Label>English Annotation</Label>
              <div className="p-4 border rounded-md bg-muted/30">
                <p className="text-lg">Sample English annotation for the image.</p>
              </div>
            </div>
            
            <div className="space-y-2">
              <Label>Your Target Language Annotation</Label>
              <Textarea
                placeholder="Enter your annotation in the target language..."
                value={targetAnnotation}
                onChange={(e) => setTargetAnnotation(e.target.value)}
                className="min-h-[200px]"
              />
            </div>
            
            <div className="flex justify-end">
              <Button onClick={handleSubmit} disabled={!targetAnnotation.trim()}>
                <Save className="mr-2 h-4 w-4" />
                Submit Annotation
              </Button>
            </div>
          </div>
        );
      
      case 'ab_testing':
        const currentPair = abTestingPairs[currentAbPairIndex];
        
        if (!currentPair) {
          return (
            <div className="h-[300px] flex items-center justify-center text-muted-foreground">
              No pairs available for comparison
            </div>
          );
        }
        
        return (
          <div className="space-y-6">
            <div className="flex justify-between items-center mb-4">
              <div className="space-x-2">
                <Label>Task Type:</Label>
                <Select value={abTestingMode} onValueChange={(value) => setAbTestingMode(value as ContributionType)}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Select task type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="translation">Translation</SelectItem>
                    <SelectItem value="transcription">Transcription</SelectItem>
                    <SelectItem value="annotation">Annotation</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="text-sm text-muted-foreground">
                Pair {currentAbPairIndex + 1} of {abTestingPairs.length}
              </div>
            </div>
            
            <ABTesting
              taskType={abTestingMode}
              language={selectedLanguage || "Not specified"}
              contributionA={currentPair.pairA}
              contributionB={currentPair.pairB}
              sourceContent={currentPair.sourceContent}
              onSubmit={handleAbTestingSubmit}
            />
          </div>
        );
      
      default:
        return null;
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold mb-2">
            {taskType === 'transcription_evaluation' && 'Transcription Evaluation'}
            {taskType === 'transcription_contribution' && 'Transcription Contribution'}
            {taskType === 'translation_evaluation' && 'Translation Evaluation'}
            {taskType === 'translation_contribution' && 'Translation Contribution'}
            {taskType === 'annotation_evaluation' && 'Image Annotation Evaluation'}
            {taskType === 'annotation_contribution' && 'Image Annotation Contribution'}
            {taskType === 'ab_testing' && 'A/B Testing Evaluation'}
          </h2>
          <p className="text-muted-foreground">
            {taskType === 'ab_testing' 
              ? 'Compare two contributions and determine which one is better'
              : taskType.includes('evaluation') 
                ? 'Evaluate the provided content for accuracy and quality'
                : 'Contribute your own content to help build the dataset'}
          </p>
        </div>
        <div className="flex items-center gap-4">
          <Select 
            value={taskType} 
            onValueChange={(value) => setTaskType(value as TaskType)}
          >
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="Select task type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="transcription_evaluation">Transcription Evaluation</SelectItem>
              <SelectItem value="transcription_contribution">Transcription Contribution</SelectItem>
              <SelectItem value="translation_evaluation">Translation Evaluation</SelectItem>
              <SelectItem value="translation_contribution">Translation Contribution</SelectItem>
              <SelectItem value="annotation_evaluation">Annotation Evaluation</SelectItem>
              <SelectItem value="annotation_contribution">Annotation Contribution</SelectItem>
              <SelectItem value="ab_testing">A/B Testing</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" size="sm" onClick={() => setShowHelp(true)}>
            <HelpCircle className="mr-2 h-4 w-4" />
            Help
          </Button>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        {/* Sample selection panel */}
        <div className="md:col-span-4 space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Select Sample</CardTitle>
              <CardDescription>Choose a sample to work on</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Input placeholder="Search samples..." className="mb-4" />
              {renderSampleList()}
            </CardContent>
          </Card>
        </div>
        
        {/* Work area */}
        <div className="md:col-span-8 space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>
                {selectedSample ? selectedSample.title : 'Work Area'}
              </CardTitle>
              <CardDescription>
                {selectedSample 
                  ? `${selectedSample.language || selectedSample.sourceLanguage} • ${selectedSample.difficulty}` 
                  : 'Select a sample to begin'}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {renderWorkArea()}
            </CardContent>
          </Card>
        </div>
      </div>
      
      {/* Flag Dialog */}
      <AlertDialog open={showFlagDialog} onOpenChange={setShowFlagDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Flag Sample Issue</AlertDialogTitle>
            <AlertDialogDescription>
              Please select the reason for flagging this sample and provide additional details if needed.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="space-y-4 py-4">
            <Select value={flagReason} onValueChange={setFlagReason}>
              <SelectTrigger>
                <SelectValue placeholder="Select reason for flagging" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="poor_quality">Poor Quality</SelectItem>
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
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleFlag}>
              Submit Flag
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      
      {/* Correction Dialog */}
      <AlertDialog open={showCorrectionDialog} onOpenChange={setShowCorrectionDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Provide Correction</AlertDialogTitle>
            <AlertDialogDescription>
              Please provide the correct content for this sample.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="space-y-4 py-4">
            {taskType === 'transcription_evaluation' && (
              <Textarea
                placeholder="Enter the correct transcription"
                value={transcription}
                onChange={(e) => setTranscription(e.target.value)}
                className="h-32"
              />
            )}
            
            {taskType === 'translation_evaluation' && (
              <Textarea
                placeholder="Enter the correct translation"
                value={translation}
                onChange={(e) => setTranslation(e.target.value)}
                className="h-32"
              />
            )}
            
            {taskType === 'annotation_evaluation' && (
              <>
                <Textarea
                  placeholder="Enter the correct English annotation"
                  value={englishAnnotation}
                  onChange={(e) => setEnglishAnnotation(e.target.value)}
                  className="h-32"
                />
                <Textarea
                  placeholder="Enter the correct target language annotation"
                  value={targetAnnotation}
                  onChange={(e) => setTargetAnnotation(e.target.value)}
                  className="h-32"
                />
              </>
            )}
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={() => {
              setShowCorrectionDialog(false);
              toast({
                title: 'Correction Submitted',
                description: 'Thank you for your contribution.',
              });
              resetState();
            }}>
              Submit Correction
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      
      {/* Help Dialog */}
      <Dialog open={showHelp} onOpenChange={setShowHelp}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Workspace Help</DialogTitle>
            <DialogDescription>
              How to use the workspace effectively
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <h3 className="font-medium mb-2">Transcription</h3>
              <p className="text-sm text-muted-foreground">
                1. Select an audio sample from the list on the left.<br />
                2. Use the audio player controls to listen to the audio.<br />
                3. Type your transcription in the text area.<br />
                4. Click "Submit Transcription" when you're finished.
              </p>
            </div>
            
            <div>
              <h3 className="font-medium mb-2">Translation</h3>
              <p className="text-sm text-muted-foreground">
                1. Select a text sample from the list on the left.<br />
                2. Read the source text carefully.<br />
                3. Type your translation in the text area below.<br />
                4. Click "Submit Translation" when you're finished.
              </p>
            </div>
            
            <div>
              <h3 className="font-medium mb-2">Image Annotation</h3>
              <p className="text-sm text-muted-foreground">
                1. Select an image sample from the list on the left.<br />
                2. View the image and any existing annotations.<br />
                3. Provide your annotation in the target language.<br />
                4. Click "Submit Annotation" when you're finished.
              </p>
            </div>
            
            <div>
              <h3 className="font-medium mb-2">Keyboard Shortcuts</h3>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div>
                  <span className="font-mono bg-muted px-1 rounded">Space</span>
                  <span className="text-muted-foreground ml-2">Play/Pause audio</span>
                </div>
                <div>
                  <span className="font-mono bg-muted px-1 rounded">Ctrl+S</span>
                  <span className="text-muted-foreground ml-2">Save draft</span>
                </div>
                <div>
                  <span className="font-mono bg-muted px-1 rounded">Ctrl+Enter</span>
                  <span className="text-muted-foreground ml-2">Submit work</span>
                </div>
                <div>
                  <span className="font-mono bg-muted px-1 rounded">Esc</span>
                  <span className="text-muted-foreground ml-2">Close dialogs</span>
                </div>
              </div>
            </div>
            
            <div>
              <h3 className="font-medium mb-2">Tips</h3>
              <ul className="list-disc pl-5 text-sm space-y-1 text-muted-foreground">
                <li>You can pause and resume your work at any time. Drafts are saved automatically.</li>
                <li>For transcription, it's often helpful to listen to short segments repeatedly.</li>
                <li>For translation, focus on meaning rather than word-for-word translation.</li>
                <li>If you're stuck, you can skip the current sample and come back to it later.</li>
              </ul>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
} 