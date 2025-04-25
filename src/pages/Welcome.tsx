import { useNavigate } from 'react-router-dom';
import { ChevronRight, Info } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useTheme } from '@/components/common/theme-provider';

export default function Welcome() {
  const navigate = useNavigate();
  const { theme } = useTheme();

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-6xl mx-auto px-4 py-4 flex justify-end space-x-4">
        <Button 
          variant="outline"
          onClick={() => navigate('/about')}
          className="flex items-center space-x-2"
        >
          <Info className="h-4 w-4" />
          <span>About</span>
        </Button>
        <Button 
          variant="outline"
          onClick={() => navigate('/auth')}
        >
          Sign In
        </Button>
      </div>
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-88px)] text-center px-4">
        <h1 className={`text-4xl md:text-7xl font-bold mb-8 p-6 bg-clip-text text-transparent animate-fade-up ${
          theme === 'african' 
            ? 'bg-gradient-to-r from-primary to-[#2c6e31]' 
            : 'bg-gradient-to-r from-primary to-purple-600'
        }`}>
          The Bantu Project
        </h1>
        <p className="text-l text-muted-foreground max-w-2xl mb-12 animate-fade-up [animation-delay:200ms] opacity-0">
          Join us in preserving and understanding African languages through advanced
          speech and text recognition technology. Your voice can help bridge linguistic
          divides and protect cultural heritage, making access to technology at the community level a priority.
        </p>
        <Button
          size="lg"
          className="text-lg px-8 py-6 animate-fade-up [animation-delay:400ms] opacity-0"
          onClick={() => navigate('/auth')}
        >
          Get Started
          <ChevronRight className="ml-2 h-5 w-5" />
        </Button>
      </div>
    </div>
  );
}