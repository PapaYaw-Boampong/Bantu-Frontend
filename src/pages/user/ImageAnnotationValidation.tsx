import { useState } from 'react';
import { CheckCircle, XCircle, Flag, Image as ImageIcon } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useGetUserLanguages } from '@/hooks/languageHooks/useGetUserLanguages';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
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

type ValidationStatus = 'pending' | 'correct' | 'wrong' | 'flagged';

export default function ImageAnnotationValidation() {
  const [selectedLanguage, setSelectedLanguage] = useState('');
  const {
    data: userLanguages = [],
    isLoading: languagesLoading,
    isError,
    error,
  } = useGetUserLanguages();
  
  const [validationStatus, setValidationStatus] = useState<ValidationStatus>('pending');
  const [englishAnnotation, setEnglishAnnotation] = useState('');
  const [targetTranslation, setTargetTranslation] = useState('');
  const [flagReason, setFlagReason] = useState('');
  const [flagNote, setFlagNote] = useState('');
  const [showFlagDialog, setShowFlagDialog] = useState(false);
  const [showCorrectionDialog, setShowCorrectionDialog] = useState(false);
  
  
  const { toast } = useToast();

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
        description: 'Moving to next image...',
      });
      // Reset and load next image
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
      title: 'Image Flagged',
      description: 'Thank you for your feedback.',
    });
    // Reset and load next image
    resetState();
  };

  const resetState = () => {
    setValidationStatus('pending');
    setEnglishAnnotation('');
    setTargetTranslation('');
    setFlagReason('');
    setFlagNote('');
    // Load next image here
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
                disabled={languagesLoading}
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
      
      <Card className="animate-fade-up [animation-delay:200ms] opacity-0">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-semibold">Image #{Math.floor(Math.random() * 1000)}</h2>
              <p className="text-sm text-muted-foreground">View the image and verify the annotations</p>
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-6 pt-6">
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
                      size="icon"
                      className="ml-auto h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
                    >
                      <Flag className="h-4 w-4" />
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
              
              <div className="w-full h-64 bg-muted flex items-center justify-center rounded-md">
                <p className="text-muted-foreground">Sample Image</p>
              </div>
            </div>

            {/* Annotations Display */}
            <div className="space-y-4">
              <div>
                <Label>English Annotation</Label>
                <div className="mt-2 p-4 rounded-md bg-muted">
                  <p className="text-lg">{englishAnnotation || "Sample English annotation text..."}</p>
                </div>
              </div>
              
              <div>
                <Label>Target Translation</Label>
                <div className="mt-2 p-4 rounded-md bg-muted">
                  <p className="text-lg">{targetTranslation || "Sample target language translation..."}</p>
                </div>
              </div>
            </div>
          </div>

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
                    value={targetTranslation}
                    onChange={(e) => setTargetTranslation(e.target.value)}
                    className="h-32 mt-2"
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setShowCorrectionDialog(false)}>
                  Cancel
                </Button>
                <Button onClick={() => {
                  setShowCorrectionDialog(false);
                  toast({
                    title: 'Annotations Updated',
                    description: 'Thank you for your contribution.',
                  });
                  resetState();
                }}>
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
          <Button onClick={resetState}>Next</Button>
        </CardFooter>
      </Card>
    </div>
  );
} 