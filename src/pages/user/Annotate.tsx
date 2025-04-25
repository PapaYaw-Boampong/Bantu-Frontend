import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { useGetUserLanguages } from '@/hooks/languageHooks/useGetUserLanguages';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
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

// Mock data for demonstration
const MOCK_IMAGE = {
  url: 'https://example.com/sample-image.jpg',
  englishAnnotation: 'A medical professional examining a patient in a modern hospital setting',
};

export default function Annotate() {
  const {
    data: userLanguages = [],
    isLoading: languagesLoading,
    isError,
    error,
  } = useGetUserLanguages();
  const [selectedLanguage, setSelectedLanguage] = useState('');
  const [targetTranslation, setTargetTranslation] = useState('');
  const { toast } = useToast();

  const handleSave = () => {
    if (!selectedLanguage) {
      toast({
        title: 'Please select a language',
        description: 'You need to select a language before saving.',
        variant: 'destructive',
      });
      return;
    }

    if (!targetTranslation) {
      toast({
        title: 'Please provide a translation',
        description: 'You need to provide a translation before saving.',
        variant: 'destructive',
      });
      return;
    }

    toast({
      title: 'Annotation saved',
      description: 'Thank you for your contribution!',
    });
    setTargetTranslation('');
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-12">
      <div className="mb-8 animate-fade-up opacity-0">
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
        </div>
      </div>

      <Card className="animate-fade-up [animation-delay:200ms] opacity-0">
        <CardContent className="mt-6">
          <div className="grid grid-cols-2 gap-8">
            {/* Left side - Image */}
            <div className="animate-fade-up [animation-delay:400ms] opacity-0">
              <div className="w-full h-[500px] bg-muted flex items-center justify-center rounded-md overflow-hidden">
                <img 
                  src={MOCK_IMAGE.url} 
                  alt="Sample image" 
                  className="max-w-full max-h-full object-contain"
                />
              </div>
            </div>

            {/* Right side - Text fields */}
            <div className="space-y-6 animate-fade-up [animation-delay:600ms] opacity-0">
              {/* English Annotation */}
              <div className="space-y-2">
                <Label>English Annotation</Label>
                <div className="p-4 border rounded-md bg-muted/30">
                  <p className="text-lg">{MOCK_IMAGE.englishAnnotation}</p>
                </div>
              </div>
              
              {/* Target Translation */}
              <div className="space-y-2">
                <Label>Target Translation</Label>
                <Textarea
                  placeholder="Provide a translation in the target language..."
                  value={targetTranslation}
                  onChange={(e) => setTargetTranslation(e.target.value)}
                  className="h-32"
                />
              </div>

              {/* Save Button */}
              <div className="flex justify-end">
                <Button onClick={handleSave}>
                  Save
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 