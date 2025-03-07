import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
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

const dialects = [
  'Yoruba',
  'Igbo',
  'Hausa',
  'Swahili',
  'Amharic',
  'Zulu',
  'Xhosa',
  'Twi',
  'Wolof',
  'Oromo',
];

type UserProfile = {
  email: string;
  name: string;
  country: string;
  nativeLanguage: string;
  preferredDialects: string[];
};

export default function Profile() {
  const [userProfile, setUserProfile] = useState<UserProfile>({
    email: '',
    name: '',
    country: '',
    nativeLanguage: '',
    preferredDialects: [],
  });
  const { toast } = useToast();

  const handleSave = () => {
    toast({
      title: 'Profile updated',
      description: 'Your changes have been saved successfully.',
    });
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <Card className="animate-fade-up opacity-0">
        <CardHeader>
          <CardTitle>Profile Settings</CardTitle>
          <CardDescription>
            Manage your account preferences and personal information
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2 animate-fade-up [animation-delay:200ms] opacity-0">
              <Label htmlFor="profile-name">Name</Label>
              <Input
                id="profile-name"
                value={userProfile.name}
                onChange={(e) =>
                  setUserProfile({ ...userProfile, name: e.target.value })
                }
              />
            </div>
            <div className="space-y-2 animate-fade-up [animation-delay:400ms] opacity-0">
              <Label htmlFor="profile-email">Email</Label>
              <Input
                id="profile-email"
                type="email"
                value={userProfile.email}
                onChange={(e) =>
                  setUserProfile({ ...userProfile, email: e.target.value })
                }
              />
            </div>
            <div className="space-y-2 animate-fade-up [animation-delay:600ms] opacity-0">
              <Label htmlFor="profile-country">Country</Label>
              <select
                id="profile-country"
                className="w-full rounded-md border border-input bg-background px-3 py-2"
                value={userProfile.country}
                onChange={(e) =>
                  setUserProfile({ ...userProfile, country: e.target.value })
                }
              >
                <option value="">Select your country...</option>
                {countries.map((country) => (
                  <option key={country} value={country}>
                    {country}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-2 animate-fade-up [animation-delay:800ms] opacity-0">
              <Label htmlFor="profile-language">Native Language</Label>
              <select
                id="profile-language"
                className="w-full rounded-md border border-input bg-background px-3 py-2"
                value={userProfile.nativeLanguage}
                onChange={(e) =>
                  setUserProfile({ ...userProfile, nativeLanguage: e.target.value })
                }
              >
                <option value="">Select your native language...</option>
                {dialects.map((dialect) => (
                  <option key={dialect} value={dialect}>
                    {dialect}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex justify-end space-x-4">
          <Button variant="outline" className="animate-fade-up [animation-delay:1000ms] opacity-0">
            Cancel
          </Button>
          <Button onClick={handleSave} className="animate-fade-up [animation-delay:1000ms] opacity-0">
            Save Changes
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}