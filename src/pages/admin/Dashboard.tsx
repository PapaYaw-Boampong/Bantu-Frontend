import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Bell, Users, FileAudio, Brain, AlertTriangle } from "lucide-react";
import { Overview } from "@/components/admin/overview";
import { RecentActivity } from "@/components/admin/recent-activity";
import { AdminPageTitle } from "@/components/admin/admin-page-title";

export default function AdminDashboardPage() {
  return (
    <div className="flex-1 space-y-8 p-0 sm:p-2 md:p-4 w-full">
      <div className="animate-fade-up opacity-0">
        <AdminPageTitle 
          title="Dashboard" 
          description="Overview of your platform's performance and activity."
        />
      </div>
      
      <Tabs defaultValue="overview" className="space-y-4 w-full">
        <TabsList className="animate-fade-up [animation-delay:100ms] opacity-0">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
        </TabsList>
        
        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
            <Card className="animate-fade-up [animation-delay:200ms] opacity-0">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Total Challenges
                </CardTitle>
                <FileAudio className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">127</div>
                <p className="text-xs text-muted-foreground">
                  +5 from last month
                </p>
              </CardContent>
            </Card>
            
            <Card className="animate-fade-up [animation-delay:300ms] opacity-0">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Active Users
                </CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">2,350</div>
                <p className="text-xs text-muted-foreground">
                  +18% from last month
                </p>
              </CardContent>
            </Card>
            
            <Card className="animate-fade-up [animation-delay:400ms] opacity-0">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Model Accuracy
                </CardTitle>
                <Brain className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">94.2%</div>
                <p className="text-xs text-muted-foreground">
                  +2.1% from last month
                </p>
              </CardContent>
            </Card>
            
            <Card className="animate-fade-up [animation-delay:500ms] opacity-0">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Flagged Content
                </CardTitle>
                <AlertTriangle className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">12</div>
                <p className="text-xs text-muted-foreground">
                  -3 from last month
                </p>
              </CardContent>
            </Card>
          </div>
          
          <div className="grid gap-4 grid-cols-1 lg:grid-cols-7">
            <Card className="col-span-1 lg:col-span-4 animate-fade-up [animation-delay:600ms] opacity-0">
              <CardHeader>
                <CardTitle>Contributions Over Time</CardTitle>
                <CardDescription>
                  Monthly contribution trends across the platform
                </CardDescription>
              </CardHeader>
              <CardContent className="pl-2">
                <Overview />
              </CardContent>
            </Card>
            
            <Card className="col-span-1 lg:col-span-3 animate-fade-up [animation-delay:700ms] opacity-0">
              <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
                <CardDescription>
                  Latest user actions and system events
                </CardDescription>
              </CardHeader>
              <CardContent>
                <RecentActivity />
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        <TabsContent value="analytics" className="space-y-4">
          <Card className="animate-fade-up [animation-delay:200ms] opacity-0">
            <CardHeader>
              <CardTitle>Advanced Analytics</CardTitle>
              <CardDescription>
                Detailed performance metrics and user engagement data
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Advanced analytics content will be displayed here.
              </p>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="notifications" className="space-y-4">
          <Alert className="animate-fade-up [animation-delay:200ms] opacity-0">
            <Bell className="h-4 w-4" />
            <AlertTitle>Flagged Transcription</AlertTitle>
            <AlertDescription>
              Challenge #45 has 3 flagged transcriptions that need review.
            </AlertDescription>
          </Alert>
          
          <Alert className="animate-fade-up [animation-delay:300ms] opacity-0">
            <Bell className="h-4 w-4" />
            <AlertTitle>New User Report</AlertTitle>
            <AlertDescription>
              User "transcriber123" reported an issue with Challenge #78.
            </AlertDescription>
          </Alert>
          
          <Alert className="animate-fade-up [animation-delay:400ms] opacity-0">
            <Bell className="h-4 w-4" />
            <AlertTitle>Model Performance Alert</AlertTitle>
            <AlertDescription>
              Speech model "FastSpeech-v2" is showing decreased accuracy (below 90%).
            </AlertDescription>
          </Alert>
        </TabsContent>
      </Tabs>
    </div>
  );
} 