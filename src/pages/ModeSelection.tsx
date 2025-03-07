import { useNavigate } from 'react-router-dom';
import { Mic, Languages, Headphones, AudioWaveform as Waveform } from 'lucide-react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

export default function ModeSelection() {
  const navigate = useNavigate();

  return (
    <div className="max-w-6xl mx-auto px-4 py-12">
      <h2 className="text-3xl font-bold text-center mb-4 animate-fade-up">
        Choose Your Mode
      </h2>
      <p className="text-muted-foreground text-center mb-12 max-w-2xl mx-auto animate-fade-up [animation-delay:200ms] opacity-0">
        Select how you'd like to contribute to our African languages database.
        You can either record your own voice or help translate existing recordings.
      </p>
      <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
        <Card
          className="relative overflow-hidden transition-all hover:shadow-lg cursor-pointer animate-fade-up [animation-delay:400ms] opacity-0"
          onClick={() => navigate('/lets-talk')}
        >
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Mic className="h-6 w-6" />
              <span>Let's Talk</span>
            </CardTitle>
            <CardDescription>
              Record your voice and contribute translations to help preserve your
              dialect
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="absolute bottom-0 right-0 p-4 opacity-10">
              <Waveform className="h-24 w-24" />
            </div>
          </CardContent>
        </Card>

        <Card
          className="relative overflow-hidden transition-all hover:shadow-lg cursor-pointer animate-fade-up [animation-delay:600ms] opacity-0"
          onClick={() => navigate('/translate')}
        >
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Headphones className="h-6 w-6" />
              <span>Translate</span>
            </CardTitle>
            <CardDescription>
              Using text snippets, help provide accurate translations
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="absolute bottom-0 right-0 p-4 opacity-10">
              <Languages className="h-24 w-24" />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}