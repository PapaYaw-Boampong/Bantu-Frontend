import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

type AuthMode = 'signin' | 'signup';

const countries = [
  'Nigeria',
  'Kenya',
  'Ethiopia',
  'South Africa',
  'Ghana',
  'Tanzania',
  'Uganda',
  'Rwanda',
  'Senegal',
  'Zimbabwe',
];

export default function Auth() {
  const [authMode, setAuthMode] = useState<AuthMode>('signin');
  const navigate = useNavigate();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    navigate('/dashboard');
  };

  return (
    <div className="flex items-center justify-center min-h-screen px-4">
      <Card className="w-full max-w-md animate-fade-up opacity-0">
        <CardHeader>
          <div className="flex items-center mb-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate('/')}
              className="mr-2"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <CardTitle>{authMode === 'signin' ? 'Sign In' : 'Sign Up'}</CardTitle>
          </div>
          <CardDescription>
            {authMode === 'signin'
              ? 'Welcome back! Sign in to your account'
              : 'Create a new account to get started'}
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            <div className="space-y-2 animate-fade-up [animation-delay:200ms] opacity-0">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" placeholder="Enter your email" />
            </div>
            <div className="space-y-2 animate-fade-up [animation-delay:400ms] opacity-0">
              <Label htmlFor="password">Password</Label>
              <Input id="password" type="password" placeholder="Enter your password" />
            </div>
            {authMode === 'signup' && (
              <div className="space-y-2 animate-fade-up [animation-delay:600ms] opacity-0">
                <Label htmlFor="country">Country</Label>
                <select
                  id="country"
                  className="w-full rounded-md border border-input bg-background px-3 py-2"
                >
                  <option value="">Select your country...</option>
                  {countries.map((country) => (
                    <option key={country} value={country}>
                      {country}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </CardContent>
          <CardFooter className="flex flex-col space-y-4">
            <Button type="submit" className="w-full animate-fade-up [animation-delay:800ms] opacity-0">
              {authMode === 'signin' ? 'Sign In' : 'Sign Up'}
            </Button>
            <p className="text-sm text-muted-foreground animate-fade-up [animation-delay:1000ms] opacity-0">
              {authMode === 'signin'
                ? "Don't have an account? "
                : 'Already have an account? '}
              <button
                type="button"
                className="text-primary hover:underline"
                onClick={() =>
                  setAuthMode(authMode === 'signin' ? 'signup' : 'signin')
                }
              >
                {authMode === 'signin' ? 'Sign Up' : 'Sign In'}
              </button>
            </p>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}