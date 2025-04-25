import { useState } from 'react';
import { FileText, Code, Copy, Check, Terminal, Globe } from 'lucide-react';
import { useLanguages } from '@/hooks/languageHooks/useLanguages';
import { Button } from '@/components/ui/button';
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

export default function Docs() {
  const { data : Languages = [], isLoading } = useLanguages();

  if (isLoading) {
    return <p>Loading languages...</p>;
  }
  const [copiedEndpoint, setCopiedEndpoint] = useState<string | null>(null);

  const copyToClipboard = (text: string, endpoint: string) => {
    navigator.clipboard.writeText(text);
    setCopiedEndpoint(endpoint);
    setTimeout(() => setCopiedEndpoint(null), 2000);
  };

  const endpoints = [
    {
      id: 'transcribe',
      name: 'Transcription API',
      url: '/api/transcribe',
      method: 'POST',
      description: 'Convert audio to text in various African languages',
      requestExample: `{
  "audioUrl": "https://storage.example.com/audio.wav",
  "language": "yor" // Language code (e.g., yor for Yoruba)
}`,
      responseExample: `{
  "transcription": "Báwo ni o ṣe wà?",
  "confidence": 0.92
}`
    },
    {
      id: 'translate',
      name: 'Translation API',
      url: '/api/translate',
      method: 'POST',
      description: 'Translate text between African languages and English',
      requestExample: `{
  "text": "Báwo ni o ṣe wà?",
  "sourceLang": "yor", // Source language code
  "targetLang": "en"   // Target language code
}`,
      responseExample: `{
  "translation": "How are you?",
  "confidence": 0.89
}`
    }
  ];

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-2 animate-fade-up">API Documentation</h1>
      <p className="text-muted-foreground mb-8 animate-fade-up [animation-delay:200ms] opacity-0">
        Integrate with our speech and translation services for African languages
      </p>

      <Tabs defaultValue="overview" className="animate-fade-up [animation-delay:400ms] opacity-0">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="overview" className="flex items-center gap-2 text-sm">
            <FileText className="h-5 w-5" />
            <span className="hidden md:inline">Overview</span>
          </TabsTrigger>
          <TabsTrigger value="endpoints" className="flex items-center gap-2 text-sm">
            <Terminal className="h-5 w-5" />
            <span className="hidden md:inline">Endpoints</span>
          </TabsTrigger>
          <TabsTrigger value="languages" className="flex items-center gap-2 text-sm">
            <Globe className="h-5 w-5" />
            <span className="hidden md:inline">Supported Languages</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="mt-6 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Getting Started</CardTitle>
              <CardDescription>
                Learn how to integrate with the Bantu Project API
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="text-lg font-medium mb-2">Authentication</h3>
                <p className="text-muted-foreground mb-4">
                  All API requests require authentication using a Bearer token. You can obtain an API key by registering on our platform.
                </p>
                <div className="bg-muted p-4 rounded-md">
                  <code className="text-sm">
                    Authorization: Bearer YOUR_API_KEY
                  </code>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-medium mb-2">Rate Limits</h3>
                <p className="text-muted-foreground">
                  Free tier: 100 requests per day<br />
                  Standard tier: 1,000 requests per day<br />
                  Premium tier: 10,000 requests per day
                </p>
              </div>

              <div>
                <h3 className="text-lg font-medium mb-2">Error Handling</h3>
                <p className="text-muted-foreground mb-4">
                  The API uses standard HTTP status codes to indicate success or failure of requests.
                </p>
                <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                  <li><span className="font-medium">200 OK</span> - Request succeeded</li>
                  <li><span className="font-medium">400 Bad Request</span> - Invalid request parameters</li>
                  <li><span className="font-medium">401 Unauthorized</span> - Missing or invalid API key</li>
                  <li><span className="font-medium">429 Too Many Requests</span> - Rate limit exceeded</li>
                  <li><span className="font-medium">500 Server Error</span> - Internal server error</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="endpoints" className="mt-6 space-y-6">
          {endpoints.map((endpoint) => (
            <Card key={endpoint.id}>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle>{endpoint.name}</CardTitle>
                    <CardDescription>
                      {endpoint.method} {endpoint.url}
                    </CardDescription>
                  </div>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => copyToClipboard(`${endpoint.method} ${endpoint.url}`, endpoint.id)}
                    className="flex items-center gap-1"
                  >
                    {copiedEndpoint === endpoint.id ? (
                      <>
                        <Check className="h-3.5 w-3.5" />
                        <span>Copied</span>
                      </>
                    ) : (
                      <>
                        <Copy className="h-3.5 w-3.5" />
                        <span>Copy</span>
                      </>
                    )}
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-muted-foreground">{endpoint.description}</p>
                
                <div>
                  <h4 className="text-sm font-medium mb-2 flex items-center">
                    <Code className="h-4 w-4 mr-2" />
                    Request Example
                  </h4>
                  <div className="bg-muted p-4 rounded-md relative">
                    <pre className="text-xs overflow-x-auto">{endpoint.requestExample}</pre>
                    <Button 
                      variant="ghost" 
                      size="icon"
                      className="absolute top-2 right-2 h-6 w-6"
                      onClick={() => copyToClipboard(endpoint.requestExample, `${endpoint.id}-req`)}
                    >
                      {copiedEndpoint === `${endpoint.id}-req` ? (
                        <Check className="h-3.5 w-3.5" />
                      ) : (
                        <Copy className="h-3.5 w-3.5" />
                      )}
                    </Button>
                  </div>
                </div>

                <div>
                  <h4 className="text-sm font-medium mb-2 flex items-center">
                    <Code className="h-4 w-4 mr-2" />
                    Response Example
                  </h4>
                  <div className="bg-muted p-4 rounded-md relative">
                    <pre className="text-xs overflow-x-auto">{endpoint.responseExample}</pre>
                    <Button 
                      variant="ghost" 
                      size="icon"
                      className="absolute top-2 right-2 h-6 w-6"
                      onClick={() => copyToClipboard(endpoint.responseExample, `${endpoint.id}-res`)}
                    >
                      {copiedEndpoint === `${endpoint.id}-res` ? (
                        <Check className="h-3.5 w-3.5" />
                      ) : (
                        <Copy className="h-3.5 w-3.5" />
                      )}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="languages" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Supported Languages</CardTitle>
              <CardDescription>
                Languages currently supported by our transcription and translation APIs
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {Languages.map((lang) => (
                  <div key={lang.id} className="flex items-center p-3 border rounded-md">
                    <div className="mr-3 bg-primary/10 p-2 rounded-full">
                      <Globe className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <h4 className="font-medium">{lang.name}</h4>
                      <p className="text-xs text-muted-foreground">
                        Code: <code>{lang.code}</code>
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}