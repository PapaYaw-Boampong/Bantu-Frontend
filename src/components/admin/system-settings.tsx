"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import { Separator } from "@/components/ui/separator";
import { 
  AlertCircle,
  Save,
  RotateCcw
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

export function SystemSettings() {
  // Contribution settings
  const [votingThreshold, setVotingThreshold] = useState(3);
  const [minContributionsForReviewer, setMinContributionsForReviewer] = useState(50);
  const [autoApproveReviewers, setAutoApproveReviewers] = useState(false);
  
  // Flagging settings
  const [flaggingThreshold, setFlaggingThreshold] = useState(2);
  const [autoSuspendThreshold, setAutoSuspendThreshold] = useState(5);
  const [notifyAdminsOnFlag, setNotifyAdminsOnFlag] = useState(true);
  
  // Feature settings
  const [enableCommunityForum, setEnableCommunityForum] = useState(true);
  const [enableUserRanking, setEnableUserRanking] = useState(true);
  const [enableChallengeCreation, setEnableChallengeCreation] = useState(false);
  const [defaultLanguage, setDefaultLanguage] = useState("en");
  
  // Notification settings
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [adminAlerts, setAdminAlerts] = useState(true);
  const [weeklyDigest, setWeeklyDigest] = useState(true);
  
  const handleSaveSettings = () => {
    // In a real app, you would save the settings to the server
    console.log("Saving settings...");
    // Show success message
  };
  
  const handleResetSettings = () => {
    // Reset to default values
    setVotingThreshold(3);
    setMinContributionsForReviewer(50);
    setAutoApproveReviewers(false);
    setFlaggingThreshold(2);
    setAutoSuspendThreshold(5);
    setNotifyAdminsOnFlag(true);
    setEnableCommunityForum(true);
    setEnableUserRanking(true);
    setEnableChallengeCreation(false);
    setDefaultLanguage("en");
    setEmailNotifications(true);
    setAdminAlerts(true);
    setWeeklyDigest(true);
  };
  
  return (
    <Tabs defaultValue="contribution" className="space-y-4">
      <TabsList className="grid w-full grid-cols-4">
        <TabsTrigger value="contribution">Contribution</TabsTrigger>
        <TabsTrigger value="flagging">Flagging</TabsTrigger>
        <TabsTrigger value="features">Features</TabsTrigger>
        <TabsTrigger value="notifications">Notifications</TabsTrigger>
      </TabsList>
      
      <TabsContent value="contribution" className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle>Contribution Settings</CardTitle>
            <CardDescription>
              Configure how user contributions are validated and approved.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="voting-threshold">Voting Threshold</Label>
                <span className="text-sm text-muted-foreground">{votingThreshold} votes</span>
              </div>
              <Slider 
                id="voting-threshold"
                min={1} 
                max={10} 
                step={1} 
                value={[votingThreshold]} 
                onValueChange={(value) => setVotingThreshold(value[0])}
              />
              <p className="text-xs text-muted-foreground">
                Number of votes required to approve a transcription.
              </p>
            </div>
            
            <Separator />
            
            <div className="space-y-2">
              <Label htmlFor="min-contributions">Minimum Contributions for Reviewer Role</Label>
              <Input 
                id="min-contributions"
                type="number" 
                value={minContributionsForReviewer} 
                onChange={(e) => setMinContributionsForReviewer(parseInt(e.target.value))}
              />
              <p className="text-xs text-muted-foreground">
                Minimum number of approved contributions required before a user can be promoted to reviewer.
              </p>
            </div>
            
            <Separator />
            
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="auto-approve">Auto-Approve Reviewer Contributions</Label>
                <p className="text-xs text-muted-foreground">
                  Automatically approve contributions from users with reviewer status.
                </p>
              </div>
              <Switch 
                id="auto-approve"
                checked={autoApproveReviewers} 
                onCheckedChange={setAutoApproveReviewers}
              />
            </div>
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button variant="outline" onClick={handleResetSettings}>
              <RotateCcw className="mr-2 h-4 w-4" />
              Reset to Defaults
            </Button>
            <Button onClick={handleSaveSettings}>
              <Save className="mr-2 h-4 w-4" />
              Save Changes
            </Button>
          </CardFooter>
        </Card>
      </TabsContent>
      
      <TabsContent value="flagging" className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle>Flagging Settings</CardTitle>
            <CardDescription>
              Configure how content flagging and moderation works.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="flagging-threshold">Flagging Threshold</Label>
                <span className="text-sm text-muted-foreground">{flaggingThreshold} flags</span>
              </div>
              <Slider 
                id="flagging-threshold"
                min={1} 
                max={10} 
                step={1} 
                value={[flaggingThreshold]} 
                onValueChange={(value) => setFlaggingThreshold(value[0])}
              />
              <p className="text-xs text-muted-foreground">
                Number of flags required to mark a transcription for review.
              </p>
            </div>
            
            <Separator />
            
            <div className="space-y-2">
              <Label htmlFor="auto-suspend">Auto-Suspend Threshold</Label>
              <Input 
                id="auto-suspend"
                type="number" 
                value={autoSuspendThreshold} 
                onChange={(e) => setAutoSuspendThreshold(parseInt(e.target.value))}
              />
              <p className="text-xs text-muted-foreground">
                Number of flagged contributions before a user is automatically suspended.
              </p>
            </div>
            
            <Separator />
            
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="notify-admins">Notify Admins on Flag</Label>
                <p className="text-xs text-muted-foreground">
                  Send notifications to admins when content is flagged.
                </p>
              </div>
              <Switch 
                id="notify-admins"
                checked={notifyAdminsOnFlag} 
                onCheckedChange={setNotifyAdminsOnFlag}
              />
            </div>
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button variant="outline" onClick={handleResetSettings}>
              <RotateCcw className="mr-2 h-4 w-4" />
              Reset to Defaults
            </Button>
            <Button onClick={handleSaveSettings}>
              <Save className="mr-2 h-4 w-4" />
              Save Changes
            </Button>
          </CardFooter>
        </Card>
      </TabsContent>
      
      <TabsContent value="features" className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle>Feature Settings</CardTitle>
            <CardDescription>
              Enable or disable platform features.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="community-forum">Community Forum</Label>
                <p className="text-xs text-muted-foreground">
                  Enable the community discussion forum.
                </p>
              </div>
              <Switch 
                id="community-forum"
                checked={enableCommunityForum} 
                onCheckedChange={setEnableCommunityForum}
              />
            </div>
            
            <Separator />
            
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="user-ranking">User Ranking System</Label>
                <p className="text-xs text-muted-foreground">
                  Enable the leaderboard and user ranking system.
                </p>
              </div>
              <Switch 
                id="user-ranking"
                checked={enableUserRanking} 
                onCheckedChange={setEnableUserRanking}
              />
            </div>
            
            <Separator />
            
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="challenge-creation">User Challenge Creation</Label>
                <p className="text-xs text-muted-foreground">
                  Allow users to create their own challenges.
                </p>
              </div>
              <Switch 
                id="challenge-creation"
                checked={enableChallengeCreation} 
                onCheckedChange={setEnableChallengeCreation}
              />
            </div>
            
            <Separator />
            
            <div className="space-y-2">
              <Label htmlFor="default-language">Default Language</Label>
              <Select value={defaultLanguage} onValueChange={setDefaultLanguage}>
                <SelectTrigger id="default-language">
                  <SelectValue placeholder="Select language" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="en">English</SelectItem>
                  <SelectItem value="es">Spanish</SelectItem>
                  <SelectItem value="fr">French</SelectItem>
                  <SelectItem value="de">German</SelectItem>
                  <SelectItem value="zh">Chinese</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                Default language for the platform interface.
              </p>
            </div>
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button variant="outline" onClick={handleResetSettings}>
              <RotateCcw className="mr-2 h-4 w-4" />
              Reset to Defaults
            </Button>
            <Button onClick={handleSaveSettings}>
              <Save className="mr-2 h-4 w-4" />
              Save Changes
            </Button>
          </CardFooter>
        </Card>
        
        {enableChallengeCreation && (
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Warning</AlertTitle>
            <AlertDescription>
              Enabling user challenge creation may require additional moderation resources.
            </AlertDescription>
          </Alert>
        )}
      </TabsContent>
      
      <TabsContent value="notifications" className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle>Notification Settings</CardTitle>
            <CardDescription>
              Configure system notifications and alerts.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="email-notifications">Email Notifications</Label>
                <p className="text-xs text-muted-foreground">
                  Send email notifications for important events.
                </p>
              </div>
              <Switch 
                id="email-notifications"
                checked={emailNotifications} 
                onCheckedChange={setEmailNotifications}
              />
            </div>
            
            <Separator />
            
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="admin-alerts">Admin Alerts</Label>
                <p className="text-xs text-muted-foreground">
                  Send alerts to admins for critical system events.
                </p>
              </div>
              <Switch 
                id="admin-alerts"
                checked={adminAlerts} 
                onCheckedChange={setAdminAlerts}
              />
            </div>
            
            <Separator />
            
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="weekly-digest">Weekly Digest</Label>
                <p className="text-xs text-muted-foreground">
                  Send weekly summary reports to admins.
                </p>
              </div>
              <Switch 
                id="weekly-digest"
                checked={weeklyDigest} 
                onCheckedChange={setWeeklyDigest}
              />
            </div>
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button variant="outline" onClick={handleResetSettings}>
              <RotateCcw className="mr-2 h-4 w-4" />
              Reset to Defaults
            </Button>
            <Button onClick={handleSaveSettings}>
              <Save className="mr-2 h-4 w-4" />
              Save Changes
            </Button>
          </CardFooter>
        </Card>
      </TabsContent>
    </Tabs>
  );
} 