import { useState } from 'react';
import { CheckCircle, XCircle, Flag, Edit, Type, GripVertical } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useGetUserLanguages } from '@/hooks/languageHooks/useGetUserLanguages';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Card,
  CardContent,
  CardDescription,
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

// Import the TokenizedWords component
import TokenizedWords from '@/components/common/TokenizedWords';

type ValidationStatus = 'pending' | 'correct' | 'wrong' | 'flagged';

export default function TranslationValidation() {
  const { 
    data: userLanguages=[],
    isLoading: languagesLoading,
    isError,
  } = useGetUserLanguages();
  const [validationStatus, setValidationStatus] = useState<ValidationStatus>('pending');
  const [sourceText, setSourceText] = useState('This is an example English text that needs to be translated.');
  const [translation, setTranslation] = useState('Èyí jẹ́ àpẹẹrẹ ọ̀rọ̀ Gẹ̀ẹ́sì tí ó nílò láti túmọ̀.');
  const [flagReason, setFlagReason] = useState('');
  const [flagNote, setFlagNote] = useState('');
  const [showFlagDialog, setShowFlagDialog] = useState(false);
  const [showCorrectionDialog, setShowCorrectionDialog] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState('');
  const [editMode, setEditMode] = useState<'text' | 'tokenized'>('text');
  
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
        description: 'Moving to next translation...',
      });
      // Reset and load next translation pair
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
      title: 'Translation Flagged',
      description: 'Thank you for your feedback.',
    });
    // Reset and load next translation
    resetState();
  };

  const resetState = () => {
    setValidationStatus('pending');
    // In a real app, you would load the next translation pair here
    setSourceText('Here is another English text example for translation.');
    setTranslation('Èyí ni àpẹẹrẹ ọ̀rọ̀ Gẹ̀ẹ́sì mìíràn fún ìtumọ̀.');
    setFlagReason('');
    setFlagNote('');
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-5">Translation Validation</h1>
      <p className="text-muted-foreground mb-6">Review and validate the translation for accuracy and quality.</p>

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
              <CardTitle>Translation Pair #{Math.floor(Math.random() * 1000)}</CardTitle>
              <CardDescription>
                Compare the source text with its translation and validate for correctness
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-6">
          {/* Source Text and Translation Display */}
          <div className="space-y-6">
            {/* Source Text (English) */}
            <div>
              <Label className="text-base font-medium">Source Text (English)</Label>
              <div className="mt-2 p-4 rounded-md bg-muted">
                <p className="text-lg">{sourceText}</p>
              </div>
            </div>
            
            {/* Translation */}
            <div className="relative">
              <div className="flex items-center justify-between">
                <Label className="text-base font-medium">Translation</Label>
                
                {/* Flag Button */}
                <Dialog open={showFlagDialog} onOpenChange={setShowFlagDialog}>
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
                        Please select the reason for flagging this translation and provide additional details if needed.
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                      <Select value={flagReason} onValueChange={setFlagReason}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select reason for flagging" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="inaccurate">Inaccurate Translation</SelectItem>
                          <SelectItem value="grammar">Grammatical Errors</SelectItem>
                          <SelectItem value="inappropriate">Inappropriate Content</SelectItem>
                          <SelectItem value="wrong_dialect">Wrong Dialect</SelectItem>
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
              
              <div className="mt-2 p-4 rounded-md bg-muted">
                <p className="text-lg">{translation}</p>
              </div>
            </div>
          </div>

          {/* Correction Dialog */}
          <Dialog open={showCorrectionDialog} onOpenChange={setShowCorrectionDialog}>
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
                        variant={editMode === 'text' ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setEditMode('text')}
                      >
                        <Type className="h-4 w-4 mr-2" />
                        Type
                      </Button>
                      <Button
                        variant={editMode === 'tokenized' ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setEditMode('tokenized')}
                      >
                        <GripVertical className="h-4 w-4 mr-2" />
                        Drag & Drop
                      </Button>
                    </div>
                  </div>
                  <div className="mt-2 p-3 rounded-md border">
                    {editMode === 'text' ? (
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
                <Button variant="outline" onClick={() => setShowCorrectionDialog(false)}>
                  Cancel
                </Button>
                <Button onClick={() => {
                  setShowCorrectionDialog(false);
                  toast({
                    title: 'Translation Updated',
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