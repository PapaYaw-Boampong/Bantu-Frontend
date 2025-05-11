import { useState, useEffect } from 'react';
import { useStorageService } from '@/hooks/storageHooks';
import { FileUpload } from '@/components/common/FileUpload';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';

export function StorageDemo() {
  const [selectedLanguage, setSelectedLanguage] = useState<string>('');
  const [selectedType, setSelectedType] = useState<'annotation' | 'transcription'>('annotation');
  const [uploadedUrl, setUploadedUrl] = useState<string | null>(null);
  const [assetPath, setAssetPath] = useState<string>('');
  const [assetUrl, setAssetUrl] = useState<string>('');
  const { getAssetUrl, buildAssetPath } = useStorageService();
  const { toast } = useToast();

  // Languages (simplified example - in a real app, fetch from API)
  const languages = [
    { id: 'en-us', name: 'English (US)' },
    { id: 'fr-fr', name: 'French (France)' },
    { id: 'es-es', name: 'Spanish (Spain)' },
    { id: 'sw-ke', name: 'Swahili (Kenya)' },
  ];

  // Example of building a URL from path
  useEffect(() => {
    if (assetPath) {
      setAssetUrl(getAssetUrl(assetPath));
    }
  }, [assetPath, getAssetUrl]);

  const handleUploadSuccess = (url: string) => {
    setUploadedUrl(url);
    toast({
      title: 'Upload successful',
      description: 'File has been uploaded to Google Cloud Storage',
    });
  };

  const handleUploadError = (error: Error) => {
    toast({
      title: 'Upload failed',
      description: error.message,
      variant: 'destructive',
    });
  };

  const handleGeneratePathExample = () => {
    if (!selectedLanguage) {
      toast({
        title: 'Missing information',
        description: 'Please select a language first',
        variant: 'destructive',
      });
      return;
    }
    
    // Generate an example path
    const examplePath = buildAssetPath(
      selectedType,
      selectedLanguage,
      'example_file.jpg'
    );
    
    setAssetPath(examplePath);
  };

  return (
    <div className="container mx-auto py-8 space-y-8">
      <h1 className="text-3xl font-bold">Google Cloud Storage Integration Demo</h1>
      
      <Tabs defaultValue="upload">
        <TabsList>
          <TabsTrigger value="upload">Upload Files</TabsTrigger>
          <TabsTrigger value="urls">Generate URLs</TabsTrigger>
        </TabsList>
        
        <TabsContent value="upload" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>File Upload</CardTitle>
              <CardDescription>
                Upload files to Google Cloud Storage for use in contributions
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="contribution-type">Contribution Type</Label>
                    <Select 
                      value={selectedType} 
                      onValueChange={(value) => setSelectedType(value as 'annotation' | 'transcription')}
                    >
                      <SelectTrigger id="contribution-type">
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="annotation">Image Annotation</SelectItem>
                        <SelectItem value="transcription">Audio Transcription</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="language">Language</Label>
                    <Select 
                      value={selectedLanguage} 
                      onValueChange={setSelectedLanguage}
                    >
                      <SelectTrigger id="language">
                        <SelectValue placeholder="Select language" />
                      </SelectTrigger>
                      <SelectContent>
                        {languages.map((lang) => (
                          <SelectItem key={lang.id} value={lang.id}>
                            {lang.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                <FileUpload
                  contributionType={selectedType}
                  languageId={selectedLanguage}
                  onSuccess={handleUploadSuccess}
                  onError={handleUploadError}
                  accept={selectedType === 'annotation' ? 'image/*' : 'audio/*'}
                  maxSizeMB={selectedType === 'annotation' ? 10 : 25}
                  className="mt-4"
                />
                
                {uploadedUrl && (
                  <div className="mt-6 p-4 bg-muted rounded-md">
                    <Label>Uploaded File URL</Label>
                    <div className="flex mt-2">
                      <Input 
                        value={uploadedUrl} 
                        readOnly 
                        className="flex-1 font-mono text-xs"
                      />
                      <Button 
                        className="ml-2"
                        onClick={() => {
                          navigator.clipboard.writeText(uploadedUrl);
                          toast({
                            title: 'URL copied',
                            description: 'The URL has been copied to your clipboard'
                          });
                        }}
                      >
                        Copy
                      </Button>
                    </div>
                    
                    {selectedType === 'annotation' && (
                      <div className="mt-4">
                        <Label>Preview</Label>
                        <div className="mt-2 h-48 bg-background rounded flex items-center justify-center overflow-hidden">
                          <img 
                            src={uploadedUrl} 
                            alt="Uploaded file preview" 
                            className="max-h-full max-w-full object-contain"
                          />
                        </div>
                      </div>
                    )}
                    
                    {selectedType === 'transcription' && (
                      <div className="mt-4">
                        <Label>Audio Preview</Label>
                        <div className="mt-2">
                          <audio 
                            src={uploadedUrl} 
                            controls 
                            className="w-full"
                          />
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="urls" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>URL Generation</CardTitle>
              <CardDescription>
                Generate GCS URLs based on asset paths and test URL functionality
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="contribution-type-path">Contribution Type</Label>
                    <Select 
                      value={selectedType} 
                      onValueChange={(value) => setSelectedType(value as 'annotation' | 'transcription')}
                    >
                      <SelectTrigger id="contribution-type-path">
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="annotation">Image Annotation</SelectItem>
                        <SelectItem value="transcription">Audio Transcription</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="language-path">Language</Label>
                    <Select 
                      value={selectedLanguage} 
                      onValueChange={setSelectedLanguage}
                    >
                      <SelectTrigger id="language-path">
                        <SelectValue placeholder="Select language" />
                      </SelectTrigger>
                      <SelectContent>
                        {languages.map((lang) => (
                          <SelectItem key={lang.id} value={lang.id}>
                            {lang.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                <div className="flex space-x-2 items-end">
                  <Button onClick={handleGeneratePathExample}>
                    Generate Example Path
                  </Button>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="asset-path">Asset Path</Label>
                  <Input
                    id="asset-path"
                    value={assetPath}
                    onChange={(e) => setAssetPath(e.target.value)}
                    placeholder="contributions/annotation/en-us/1234567890_example.jpg"
                  />
                </div>
                
                {assetPath && (
                  <div className="space-y-2">
                    <Label htmlFor="asset-url">Generated URL</Label>
                    <Input
                      id="asset-url"
                      value={assetUrl}
                      readOnly
                      className="font-mono text-xs"
                    />
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
} 