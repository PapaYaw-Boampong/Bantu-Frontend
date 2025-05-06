import { useState, useEffect } from 'react';
import { useProfile } from '@/hooks/useProfile';
import { useGetUserLanguages } from '@/hooks/languageHooks/useGetUserLanguages';
import { useAvailableLanguages } from '@/hooks/languageHooks/useAvailableLanguages';
import { useAddLanguage } from '@/hooks/languageHooks/useAddLanguage';
import { useRemoveLanguage } from '@/hooks/languageHooks/useRemoveUserLanguage';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Loader2, Plus, Trash2 } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { ProficiencyLevel, AddLanguageRequest, UserLanguage } from '@/types/language';
import { useAuth } from '@/hooks/useAuth';

export default function Profile() {
  const {
    profile,
    loading,
    error,
    updateProfile,
  } = useProfile();

  // fetch user and available languages
  const { data: userLanguages=[] } = useGetUserLanguages();
  const { availableLanguages=[]} = useAvailableLanguages();

  // mutations
  const { mutateAsync: addLanguage, isPending: addingLanguage} = useAddLanguage();
  const { mutateAsync: removeLanguage, isPending: removingLanguage} = useRemoveLanguage();

  const { 
    changePassword 
  } = useAuth();

  const { toast } = useToast();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    fullname: '',
    email: '',
  });

  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const [selectedLanguage, setSelectedLanguage] = useState('');
  const [proficiency, setProficiencyLevel] = useState<ProficiencyLevel | null>(null);

  // Initialize form data when profile loads
  useEffect(() => {
    if (profile) {
      setFormData({
        fullname: profile.fullname,
        email: profile.email,
      });
    }
  }, [profile]);


  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await updateProfile(formData);
      setIsEditing(false);
      toast({
        title: 'Profile updated',
        description: 'Your profile has been successfully updated.',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to update profile. Please try again.',
        variant: 'destructive',
      });
    }
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast({
        title: 'Error',
        description: 'New passwords do not match.',
        variant: 'destructive',
      });
      return;
    }

    try {
      await changePassword(passwordData.currentPassword, passwordData.newPassword);
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      });
      toast({
        title: 'Password updated',
        description: 'Your password has been successfully changed.',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to update password. Please try again.',
        variant: 'destructive',
      });
    }
  };

  const handleAddLanguage = async () => {
    if (!selectedLanguage || !proficiency) {
      toast({
        title: 'Error',
        description: 'Please fill in all fields.',
        variant: 'destructive',
      });
      return;
    }

    try {
      await addLanguage({
        language_id: selectedLanguage,
        proficiency: proficiency,
      });
      setSelectedLanguage('');
      setProficiencyLevel(null);
      toast({
        title: 'Language added',
        description: 'Language has been added to your profile.',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to add language. Please try again.',
        variant: 'destructive',
      });
    }
  };

  const handleRemoveLanguage = async (associationId: string) => {
    try {
      await removeLanguage(associationId);
      toast({
        title: 'Language removed',
        description: 'Language has been removed from your profile.',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to remove language. Please try again.',
        variant: 'destructive',
      });
    }
  };

  if (loading) {
    
    // return (
    //   <div className="flex items-center justify-center min-h-screen">
    //     <Loader2 className="h-8 w-8 animate-spin" />
    //   </div>
    // );
  }

  if (error) {
    // return (
    //   <div className="flex items-center justify-center min-h-screen">
    //     <div className="text-red-500">{error}</div>
    //   </div>
    // );
  }

  return (
    <div className="container mx-auto py-8 space-y-8">
      {/* Profile Information and Password Change - Side by Side */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Profile Information */}
        <Card>
          <CardHeader>
            <CardTitle>Profile Information</CardTitle>
            <CardDescription>
              Update your personal information and email address.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleProfileUpdate} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="fullname">Full Name</Label>
                <Input
                  id="fullname"
                  value={formData.fullname}
                  onChange={(e) => setFormData({ ...formData, fullname: e.target.value })}
                  disabled={!isEditing}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  disabled={!isEditing}
                />
              </div>
              <div className="flex justify-end space-x-4">
                {isEditing ? (
                  <>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setIsEditing(false)}
                    >
                      Cancel
                    </Button>
                    <Button type="submit">Save Changes</Button>
                  </>
                ) : (
                  <Button
                    type="button"
                    onClick={() => setIsEditing(true)}
                  >
                    Edit Profile
                  </Button>
                )}
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Password Change */}
        <Card>
          <CardHeader>
            <CardTitle>Change Password</CardTitle>
            <CardDescription>
              Update your password securely.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handlePasswordChange} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="currentPassword">Current Password</Label>
                <Input
                  id="currentPassword"
                  type="password"
                  value={passwordData.currentPassword}
                  onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="newPassword">New Password</Label>
                <Input
                  id="newPassword"
                  type="password"
                  value={passwordData.newPassword}
                  onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm New Password</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  value={passwordData.confirmPassword}
                  onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                  required
                />
              </div>
              <div className="flex justify-end">
                <Button type="submit">Change Password</Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>

      {/* Languages */}
      <Card>
        <CardHeader>
          <CardTitle>Interested Languages</CardTitle>
          <CardDescription>
            Manage your language preferences and proficiency levels.
          </CardDescription>
        </CardHeader>
        
        <CardContent>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Add Language Form */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
              <div className="space-y-2">
                <Label>Language</Label>
                <Select
                  value={selectedLanguage}
                  onValueChange={setSelectedLanguage}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a language" />
                  </SelectTrigger>
                  <SelectContent>
                    {availableLanguages.map((lang) => (
                      <SelectItem key={lang.id} value={lang.id}>
                        {lang.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Proficiency Level</Label>
                <Select
                  // value={proficiencyLevel}
                  onValueChange={(value: ProficiencyLevel) => setProficiencyLevel(value as ProficiencyLevel)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select level" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={ProficiencyLevel.BEGINNER}>Beginner</SelectItem>
                    <SelectItem value={ProficiencyLevel.INTERMEDIATE}>Intermediate</SelectItem>
                    <SelectItem value={ProficiencyLevel.ADVANCED}>Advanced</SelectItem>
                    <SelectItem value={ProficiencyLevel.NATIVE}>Native</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-end">
                <Button
                  onClick={handleAddLanguage}
                  disabled={addingLanguage}
                  className="w-full"
                >
                  {addingLanguage ? 'Adding…' : <><Plus className="h-4 w-4 mr-2" />Add Language</>}
                </Button>
              </div>
            </div>


            {/* Current Languages List */}
            {userLanguages.length > 0 && (
              <div className="mb-6">
                <h3 className="text-sm font-medium mb-2">Your Languages</h3>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {userLanguages.map((lang) => (
                    <div 
                      key={lang.association_id} 
                      className="flex items-center justify-between p-3 border rounded-md"
                    >
                      <div>
                        <div className="font-medium">{lang.language.name}</div>
                        <div className="text-sm text-muted-foreground">{lang.proficiency}</div>
                      </div>
                      <Button 
                        variant="ghost" 
                        size="icon"
                        onClick={() => handleRemoveLanguage(lang.association_id)}
                        disabled={removingLanguage}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}