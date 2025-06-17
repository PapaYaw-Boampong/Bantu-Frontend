import React, { useState } from 'react';
import { useToast } from '@/components/ui/use-toast';
import { useLanguages } from '@/hooks/languageHooks/useLanguages';
import {
  useUploadAnnotationSeedsCSV,
  useUploadTranscriptionSeedsCSV,
  useUploadTranslationSeedsCSV,
} from '@/hooks/sampleHooks';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Loader2, Upload } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

export default function CSVUpload() {
  const { toast } = useToast();
  const [selectedLanguage, setSelectedLanguage] = useState<string>('');
  const [translationFile, setTranslationFile] = useState<File | null>(null);
  const [transcriptionFile, setTranscriptionFile] = useState<File | null>(null);
  const [annotationFile, setAnnotationFile] = useState<File | null>(null);

  // Get languages for dropdown
  const { data: languages = [], isLoading: isLoadingLanguages } = useLanguages();

  // Upload mutations
  const { mutate: uploadTranslation, isPending: isUploadingTranslation } = useUploadTranslationSeedsCSV();
  const { mutate: uploadTranscription, isPending: isUploadingTranscription } = useUploadTranscriptionSeedsCSV();
  const { mutate: uploadAnnotation, isPending: isUploadingAnnotation } = useUploadAnnotationSeedsCSV();

  // Handle file changes
  const handleTranslationFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setTranslationFile(e.target.files[0]);
    }
  };

  const handleTranscriptionFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setTranscriptionFile(e.target.files[0]);
    }
  };

  const handleAnnotationFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setAnnotationFile(e.target.files[0]);
    }
  };

  // Handle uploads
  const handleTranslationUpload = () => {
    if (!translationFile) {
      toast({
        title: 'Error',
        description: 'Please select a CSV file to upload',
        variant: 'destructive',
      });
      return;
    }

    uploadTranslation(translationFile, {
      onSuccess: (data) => {
        toast({
          title: 'Success',
          description: `Successfully uploaded ${data.count} translation seeds`,
        });
        setTranslationFile(null);
        // Reset the file input
        const input = document.getElementById('translation-file') as HTMLInputElement;
        if (input) input.value = '';
      },
      onError: (error) => {
        toast({
          title: 'Error',
          description: error.message || 'Failed to upload translation seeds',
          variant: 'destructive',
        });
      },
    });
  };

  const handleTranscriptionUpload = () => {
    if (!transcriptionFile || !selectedLanguage) {
      toast({
        title: 'Error',
        description: 'Please select a language and CSV file',
        variant: 'destructive',
      });
      return;
    }

    uploadTranscription({
      file: transcriptionFile,
      languageId: selectedLanguage,
    }, {
      onSuccess: (data) => {
        toast({
          title: 'Success',
          description: `Successfully uploaded ${data.count} transcription samples`,
        });
        setTranscriptionFile(null);
        // Reset the file input
        const input = document.getElementById('transcription-file') as HTMLInputElement;
        if (input) input.value = '';
      },
      onError: (error) => {
        toast({
          title: 'Error',
          description: error.message || 'Failed to upload transcription samples',
          variant: 'destructive',
        });
      },
    });
  };

  const handleAnnotationUpload = () => {
    if (!annotationFile || !selectedLanguage) {
      toast({
        title: 'Error',
        description: 'Please select a language and CSV file',
        variant: 'destructive',
      });
      return;
    }

    uploadAnnotation({
      file: annotationFile,
      languageId: selectedLanguage,
    }, {
      onSuccess: (data) => {
        toast({
          title: 'Success',
          description: `Successfully uploaded ${data.count} annotation seeds`,
        });
        setAnnotationFile(null);
        // Reset the file input
        const input = document.getElementById('annotation-file') as HTMLInputElement;
        if (input) input.value = '';
      },
      onError: (error) => {
        toast({
          title: 'Error',
          description: error.message || 'Failed to upload annotation seeds',
          variant: 'destructive',
        });
      },
    });
  };

  return (
    <div className="container mx-auto py-10">
      <h1 className="text-3xl font-bold mb-6">Upload Seed Data</h1>
      <p className="text-muted-foreground mb-8">
        Use this page to upload CSV files with seed data for different task types.
      </p>

      <Tabs defaultValue="translation" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="translation">Translation Seeds</TabsTrigger>
          <TabsTrigger value="transcription">Transcription Samples</TabsTrigger>
          <TabsTrigger value="annotation">Annotation Seeds</TabsTrigger>
        </TabsList>

        {/* Translation Tab */}
        <TabsContent value="translation">
          <Card>
            <CardHeader>
              <CardTitle>Upload Translation Seeds</CardTitle>
              <CardDescription>
                Upload a CSV file containing translation seed data.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <Alert>
                <AlertDescription>
                  <p className="font-medium mb-2">Required CSV Format:</p>
                  <ul className="list-disc pl-5 space-y-1">
                    <li>
                      <code className="bg-muted px-1">original_text</code> (required): The original text to be translated
                    </li>
                    <li>
                      <code className="bg-muted px-1">category</code> (optional): The category of the text
                    </li>
                    <li>
                      <code className="bg-muted px-1">active</code> (optional): Whether the seed is active (default: true)
                    </li>
                  </ul>
                </AlertDescription>
              </Alert>

              <div>
                <Label htmlFor="translation-file">Select CSV File</Label>
                <div className="mt-2 flex items-center gap-4">
                  <input
                    id="translation-file"
                    type="file"
                    accept=".csv"
                    onChange={handleTranslationFileChange}
                    className="block w-full text-sm text-slate-500
                    file:mr-4 file:py-2 file:px-4
                    file:rounded-md file:border-0
                    file:text-sm file:font-semibold
                    file:bg-primary file:text-primary-foreground
                    hover:file:bg-primary/90"
                  />
                  <Button 
                    onClick={handleTranslationUpload} 
                    disabled={!translationFile || isUploadingTranslation}
                  >
                    {isUploadingTranslation ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Uploading...
                      </>
                    ) : (
                      <>
                        <Upload className="mr-2 h-4 w-4" />
                        Upload
                      </>
                    )}
                  </Button>
                </div>
                {translationFile && (
                  <p className="mt-2 text-sm text-muted-foreground">
                    Selected file: {translationFile.name}
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Transcription Tab */}
        <TabsContent value="transcription">
          <Card>
            <CardHeader>
              <CardTitle>Upload Transcription Samples</CardTitle>
              <CardDescription>
                Upload a CSV file containing transcription sample data.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <Alert>
                <AlertDescription>
                  <p className="font-medium mb-2">Required CSV Format:</p>
                  <ul className="list-disc pl-5 space-y-1">
                    <li>
                      <code className="bg-muted px-1">transcription_text</code> (required): The transcription text
                    </li>
                    <li>
                      <code className="bg-muted px-1">category</code> (optional): The category of the transcription
                    </li>
                    <li>
                      <code className="bg-muted px-1">active</code> (optional): Whether the sample is active (default: false)
                    </li>
                  </ul>
                </AlertDescription>
              </Alert>

              <div className="space-y-4">
                <div>
                  <Label htmlFor="language">Select Language</Label>
                  <Select
                    value={selectedLanguage}
                    onValueChange={setSelectedLanguage}
                    disabled={isLoadingLanguages}
                  >
                    <SelectTrigger id="language" className="mt-2">
                      <SelectValue placeholder="Select language" />
                    </SelectTrigger>
                    <SelectContent>
                      {languages.map((language) => (
                        <SelectItem key={language.id} value={language.id}>
                          {language.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="transcription-file">Select CSV File</Label>
                  <div className="mt-2 flex items-center gap-4">
                    <input
                      id="transcription-file"
                      type="file"
                      accept=".csv"
                      onChange={handleTranscriptionFileChange}
                      className="block w-full text-sm text-slate-500
                      file:mr-4 file:py-2 file:px-4
                      file:rounded-md file:border-0
                      file:text-sm file:font-semibold
                      file:bg-primary file:text-primary-foreground
                      hover:file:bg-primary/90"
                    />
                    <Button 
                      onClick={handleTranscriptionUpload} 
                      disabled={!transcriptionFile || !selectedLanguage || isUploadingTranscription}
                    >
                      {isUploadingTranscription ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Uploading...
                        </>
                      ) : (
                        <>
                          <Upload className="mr-2 h-4 w-4" />
                          Upload
                        </>
                      )}
                    </Button>
                  </div>
                  {transcriptionFile && (
                    <p className="mt-2 text-sm text-muted-foreground">
                      Selected file: {transcriptionFile.name}
                    </p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Annotation Tab */}
        <TabsContent value="annotation">
          <Card>
            <CardHeader>
              <CardTitle>Upload Annotation Seeds</CardTitle>
              <CardDescription>
                Upload a CSV file containing annotation seed data.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <Alert>
                <AlertDescription>
                  <p className="font-medium mb-2">Required CSV Format:</p>
                  <ul className="list-disc pl-5 space-y-1">
                    <li>
                      <code className="bg-muted px-1">image_url</code> (required): URL to the image
                    </li>
                    <li>
                      <code className="bg-muted px-1">seed_text</code> (required): The annotation text
                    </li>
                    <li>
                      <code className="bg-muted px-1">annotations</code> (required): The annotations for the image
                    </li>
                    <li>
                      <code className="bg-muted px-1">category</code> (optional): The category of the annotation
                    </li>
                    <li>
                      <code className="bg-muted px-1">active</code> (optional): Whether the seed is active (default: false)
                    </li>
                  </ul>
                </AlertDescription>
              </Alert>

              <div className="space-y-4">
                <div>
                  <Label htmlFor="language">Select Language</Label>
                  <Select
                    value={selectedLanguage}
                    onValueChange={setSelectedLanguage}
                    disabled={isLoadingLanguages}
                  >
                    <SelectTrigger id="language" className="mt-2">
                      <SelectValue placeholder="Select language" />
                    </SelectTrigger>
                    <SelectContent>
                      {languages.map((language) => (
                        <SelectItem key={language.id} value={language.id}>
                          {language.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="annotation-file">Select CSV File</Label>
                  <div className="mt-2 flex items-center gap-4">
                    <input
                      id="annotation-file"
                      type="file"
                      accept=".csv"
                      onChange={handleAnnotationFileChange}
                      className="block w-full text-sm text-slate-500
                      file:mr-4 file:py-2 file:px-4
                      file:rounded-md file:border-0
                      file:text-sm file:font-semibold
                      file:bg-primary file:text-primary-foreground
                      hover:file:bg-primary/90"
                    />
                    <Button 
                      onClick={handleAnnotationUpload} 
                      disabled={!annotationFile || !selectedLanguage || isUploadingAnnotation}
                    >
                      {isUploadingAnnotation ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Uploading...
                        </>
                      ) : (
                        <>
                          <Upload className="mr-2 h-4 w-4" />
                          Upload
                        </>
                      )}
                    </Button>
                  </div>
                  {annotationFile && (
                    <p className="mt-2 text-sm text-muted-foreground">
                      Selected file: {annotationFile.name}
                    </p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
} 