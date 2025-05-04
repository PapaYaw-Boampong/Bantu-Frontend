import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ChevronLeft, Calendar, Users, Award, Bookmark, BookmarkCheck, MessageSquare, Share2, Loader2 } from 'lucide-react';
import { useGetDetailedChallenge, DetailedChallengeResponseWrapper } from '@/hooks/challengeHooks/useGetDetailedChallenge';
import { useGetChallengeLeaderboard } from '@/hooks/challengeHooks/useGetChallengeLeaderboard';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { EventType, TaskType, ChallengeStatus, LeaderboardEntry } from '@/types/challenge';
import { format } from 'date-fns';
import { RewardType } from '@/types/rewards';
import { parseRewardFromAPI } from '@/components/challenges/RewardsTab';

export default function ChallengeDetail() {
  const { id = '' } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { data: challengeResponseData, isLoading, error } = useGetDetailedChallenge(id);
  const { data: leaderboardData, isLoading: isLoadingLeaderboard } = useGetChallengeLeaderboard(id);
  
  // Extract challenge data from the wrapper
  const challengeData = challengeResponseData?.challenge;
  const rewardData = challengeResponseData?.reward;
  const rulesData = challengeResponseData?.rules || [];
  
  const [joined, setJoined] = useState(false);
  const [commentText, setCommentText] = useState('');
  const [comments, setComments] = useState([
    {
      id: 1,
      user: { username: 'translator_pro', avatar: '' },
      text: 'This challenge is great for practicing new skills!',
      timestamp: new Date(Date.now() - 86400000 * 2).toISOString(), // 2 days ago
    },
    {
      id: 2,
      user: { username: 'language_lover', avatar: '' },
      text: 'Looking forward to contributing to this challenge.',
      timestamp: new Date(Date.now() - 86400000).toISOString(), // 1 day ago
    },
  ]);

  useEffect(() => {
    if (id) {
      // Check if this challenge is in the joined challenges list
      const joinedChallenges = localStorage.getItem('joinedChallenges');
      if (joinedChallenges) {
        const parsed = JSON.parse(joinedChallenges);
        setJoined(parsed.includes(id));
      }
    }
  }, [id]);

  const handleJoinChallenge = () => {
    if (!challengeData) return;
    
    // Toggle joined state
    const newJoinedState = !joined;
    setJoined(newJoinedState);
    
    // Update localStorage
    const joinedChallenges = localStorage.getItem('joinedChallenges');
    let parsed = joinedChallenges ? JSON.parse(joinedChallenges) : [];
    
    if (newJoinedState) {
      if (!parsed.includes(id)) {
        parsed.push(id);
      }
      toast({
        title: 'Joined Challenge',
        description: `You have joined "${challengeData.challenge_name}"`,
      });
    } else {
      parsed = parsed.filter((challengeId: string) => challengeId !== id);
      toast({
        title: 'Left Challenge',
        description: `You have left "${challengeData.challenge_name}"`,
      });
    }
    
    localStorage.setItem('joinedChallenges', JSON.stringify(parsed));
  };

  const handleStartContributing = () => {
    if (!joined) {
      handleJoinChallenge();
    }
    
    // Navigate to sandbox with pre-selected challenge
    navigate('/user/sandbox', { state: { selectedChallenge: id } });
  };

  const handlePostComment = () => {
    if (!commentText.trim()) return;
    
    const newComment = {
      id: comments.length + 1,
      user: { username: 'current_user', avatar: '' },
      text: commentText,
      timestamp: new Date().toISOString(),
    };
    
    setComments([newComment, ...comments]);
    setCommentText('');
    
    toast({
      title: 'Comment Posted',
      description: 'Your comment has been added to the discussion',
    });
  };

  const getEventTypeLabel = (type: EventType) => {
    switch (type) {
      case EventType.SAMPLE_REVIEW:
        return 'Evaluation';
      case EventType.DATA_COLLECTION:
        return 'Data Collection';
      default:
        return 'Unknown';
    }
  };
  
  const getTaskTypeLabel = (type: TaskType) => {
    switch (type) {
      case TaskType.TRANSCRIPTION:
        return 'Transcription';
      case TaskType.TRANSLATION:
        return 'Translation';
      case TaskType.ANNOTATION:
        return 'Annotation';
      default:
        return 'Unknown';
    }
  };
  
  const getStatusLabel = (status?: ChallengeStatus) => {
    if (!status) return { label: 'Unknown', color: 'bg-gray-400' };
    
    switch (status) {
      case ChallengeStatus.UPCOMING:
        return { label: 'Upcoming', color: 'bg-blue-500' };
      case ChallengeStatus.Active:
        return { label: 'Active', color: 'bg-green-500' };
      case ChallengeStatus.COMPLETED:
        return { label: 'Completed', color: 'bg-purple-500' };
      default:
        return { label: status, color: 'bg-gray-400' };
    }
  };
  
  // Parse rewards data
  const getRewardsSummary = () => {
    if (!rewardData) return "No specific prizes have been listed for this challenge.";
    
    try {
      // We don't need to parse the reward anymore since it's already an object
      const rewardConfig = rewardData; 
      
      if (rewardConfig.reward_type === RewardType.CASH) {
        if (rewardConfig.reward_distribution_type === 'fixed') {
          return `Fixed cash reward of ${rewardConfig.reward_value} ${rewardConfig.currency || 'USD'} for qualifying participants.`;
        } else if (rewardConfig.reward_distribution_type === 'tiered' && rewardConfig.tiers) {
          const tierDescriptions = rewardConfig.tiers.map((tier: any) => 
            `${tier.label}: ${tier.amount} ${rewardConfig.currency || 'USD'}`
          ).join('\n');
          return `Tiered cash rewards based on ranking:\n${tierDescriptions}`;
        }
      } else if (rewardConfig.reward_type === RewardType.BADGE) {
        if (rewardConfig.reward_distribution_type === 'fixed') {
          return `Achievement badge: ${rewardConfig.badge_name || 'Challenge Badge'}\n${rewardConfig.badge_description || 'For completing the challenge'}`;
        } else if (rewardConfig.reward_distribution_type === 'tiered' && rewardConfig.tiers) {
          const tierDescriptions = rewardConfig.tiers.map((tier: any) => 
            `${tier.label}: ${tier.description || 'For achieving this rank'}`
          ).join('\n');
          return `Tiered badge rewards:\n${tierDescriptions}`;
        }
      } else if (rewardConfig.reward_type === RewardType.SWAG) {
        if (rewardConfig.reward_distribution_type === 'fixed') {
          return `SWAG reward: ${rewardConfig.swag_item || 'Merchandise'}\n${rewardConfig.swag_description || 'For participating in the challenge'}`;
        } else if (rewardConfig.reward_distribution_type === 'tiered' && rewardConfig.tiers) {
          const tierDescriptions = rewardConfig.tiers.map((tier: any) => 
            `${tier.label}: ${tier.description || 'For achieving this rank'}`
          ).join('\n');
          return `Tiered SWAG rewards:\n${tierDescriptions}`;
        }
      }
    } catch (error) {
      console.error('Error parsing reward data:', error);
    }
    
    return "Rewards information available upon joining the challenge.";
  };
  
  // Add a helper function to safely format dates
  const safeFormatDate = (dateString: string | undefined) => {
    if (!dateString) return 'N/A';
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return 'N/A';
      return format(date, 'MMM d, yyyy');
    } catch (error) {
      console.error('Error formatting date:', error);
      return 'N/A';
    }
  };

  // Fix the time remaining calculation with a safe version
  const getTimeRemaining = () => {
    if (!challengeData?.end_date) return 0;
    
    try {
      const endDate = new Date(challengeData.end_date);
      const startDate = new Date(challengeData.start_date || Date.now());
      
      if (isNaN(endDate.getTime()) || isNaN(startDate.getTime())) return 0;
      
      const now = new Date();
      return Math.max(0, Math.ceil((endDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)));
    } catch (error) {
      console.error('Error calculating time remaining:', error);
      return 0;
    }
  };
  
  // Calculate the progress percentage safely
  const getTimeProgressPercentage = () => {
    if (!challengeData?.start_date || !challengeData?.end_date) return 0;
    
    try {
      const startDate = new Date(challengeData.start_date);
      const endDate = new Date(challengeData.end_date);
      const now = new Date();
      
      if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) return 0;
      
      const totalDuration = endDate.getTime() - startDate.getTime();
      if (totalDuration <= 0) return 0;
      
      const elapsed = endDate.getTime() - now.getTime();
      return Math.max(0, Math.min(100, (elapsed / totalDuration) * 100));
    } catch (error) {
      console.error('Error calculating progress percentage:', error);
      return 0;
    }
  };
  
  // Calculate participation percentage
  const getParticipationPercentage = () => {
    if (!challengeData?.target_contribution_count || !challengeData?.participant_count) return 0;
    return Math.min(100, (challengeData.participant_count / challengeData.target_contribution_count) * 100);
  };

  if (isLoading || !challengeData) {
    return (
      <div className="container mx-auto py-12 px-4">
        <div className="flex flex-col justify-center items-center h-64">
          <Loader2 className="h-8 w-8 animate-spin mb-4 text-primary" />
          <p>Loading challenge details...</p>
        </div>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="container mx-auto py-8 px-4">
        <div className="flex flex-col justify-center items-center h-64">
          <h2 className="text-xl font-semibold mb-2">Error loading challenge</h2>
          <p className="text-muted-foreground">Unable to load challenge details. Please try again later.</p>
          <Button 
            variant="outline" 
            className="mt-4"
            onClick={() => navigate(-1)}
          >
            <ChevronLeft className="mr-2 h-4 w-4" />
            Go Back
          </Button>
        </div>
      </div>
    );
  }

  // Format rules for display using rulesData directly
  const formattedRules = rulesData.length > 0
    ? rulesData.map((rule: any) => `${rule.rule_title}: ${rule.rule_description}`).join('\n\n')
    : "No specific rules have been provided for this challenge.";

  return (
    <div className="container mx-auto py-8 px-4">
      <Button 
        variant="ghost" 
        className="mb-6"
        onClick={() => navigate(-1)}
      >
        <ChevronLeft className="mr-2 h-4 w-4" />
        Back to Challenges
      </Button>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <div className="mb-6">
            <div className="flex flex-wrap items-start justify-between gap-4 mb-4">
              <div>
                <div className="flex flex-wrap gap-2 mb-2">
                  <Badge variant="outline">
                    {getEventTypeLabel(challengeData.event_type)}
                  </Badge>
                  <Badge variant="outline" className="bg-muted/60">
                    {getTaskTypeLabel(challengeData.task_type)}
                  </Badge>
                  <Badge className={`${getStatusLabel(challengeData.status).color} text-white`}>
                    {getStatusLabel(challengeData.status).label}
                  </Badge>
                  {challengeData.is_published && (
                    <Badge variant="outline" className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300">
                      Published
                    </Badge>
                  )}
                </div>
                <h1 className="text-3xl font-bold">{challengeData.challenge_name}</h1>
              </div>
              
              <div className="flex gap-2">
                <Button variant="outline" size="sm" className="gap-2">
                  <Share2 className="h-4 w-4" />
                  Share
                </Button>
                <Button 
                  variant={joined ? "default" : "outline"}
                  size="sm"
                  className="gap-2"
                  onClick={handleJoinChallenge}
                >
                  {joined ? (
                    <>
                      <BookmarkCheck className="h-4 w-4" />
                      Joined
                    </>
                  ) : (
                    <>
                      <Bookmark className="h-4 w-4" />
                      Join Challenge
                    </>
                  )}
                </Button>
              </div>
            </div>
            
            <div className="flex flex-wrap gap-4 text-sm">
              <div className="flex items-center gap-1 text-muted-foreground">
                <Calendar className="h-4 w-4" />
                <span>
                  {safeFormatDate(challengeData.start_date)} - {safeFormatDate(challengeData.end_date)}
                </span>
              </div>
              <div className="flex items-center gap-1 text-muted-foreground">
                <Users className="h-4 w-4" />
                <span>{challengeData.participant_count || 0} participants</span>
              </div>
              {challengeData.target_contribution_count && (
                <div className="flex items-center gap-1 text-muted-foreground">
                  <Award className="h-4 w-4" />
                  <span>Goal: {challengeData.target_contribution_count} contributions</span>
                </div>
              )}
            </div>
          </div>
          
          <Tabs defaultValue="overview" className="mb-8">
            <TabsList className="mb-6">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="rules">Rules & Criteria</TabsTrigger>
              <TabsTrigger value="prizes">Prizes</TabsTrigger>
              <TabsTrigger value="discussion">Discussion</TabsTrigger>
            </TabsList>
            
            <TabsContent value="overview" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Challenge Description</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="whitespace-pre-line">{challengeData.description}</p>
                </CardContent>
                {challengeData.image_url && (
                  <CardFooter className="flex justify-center p-4">
                    <img 
                      src={challengeData.image_url} 
                      alt={`${challengeData.challenge_name} banner`}
                      className="max-h-64 object-contain rounded-md"
                    />
                  </CardFooter>
                )}
              </Card>
              
              <div className="border rounded-lg p-6 text-center space-y-4 bg-muted/30">
                <h3 className="text-lg font-medium">Ready to contribute?</h3>
                <p className="text-muted-foreground">
                  Join this challenge and start contributing to earn points and rewards.
                </p>
                <Button 
                  size="lg" 
                  onClick={handleStartContributing}
                  disabled={challengeData.status === ChallengeStatus.COMPLETED}
                >
                  {challengeData.status === ChallengeStatus.COMPLETED 
                    ? 'Challenge Completed' 
                    : joined ? 'Continue Contributing' : 'Start Contributing'}
                </Button>
              </div>
            </TabsContent>
            
            <TabsContent value="rules" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Challenge Rules</CardTitle>
                  <CardDescription>
                    Guidelines for participating in this challenge
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="whitespace-pre-line">
                    {formattedRules}
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>Evaluation Criteria</CardTitle>
                  <CardDescription>
                    How your contributions will be evaluated
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="whitespace-pre-line">
                    Contributions will be evaluated based on accuracy, completeness, and adherence to the challenge rules.
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="prizes" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Prizes & Rewards</CardTitle>
                  <CardDescription>
                    What you can earn for participating
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="whitespace-pre-line">
                    {getRewardsSummary()}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="discussion" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Discussion</CardTitle>
                  <CardDescription>
                    Join the conversation about this challenge
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-4">
                    <Textarea
                      placeholder="Share your thoughts or ask a question..."
                      className="min-h-[100px]"
                      value={commentText}
                      onChange={(e) => setCommentText(e.target.value)}
                    />
                    <div className="flex justify-end">
                      <Button onClick={handlePostComment} disabled={!commentText.trim()}>
                        Post Comment
                      </Button>
                    </div>
                  </div>
                  
                  <div className="space-y-6 pt-4">
                    {comments.map((comment) => (
                      <div key={comment.id} className="flex gap-4">
                        <Avatar>
                          <AvatarImage src={comment.user.avatar} />
                          <AvatarFallback>{comment.user.username.charAt(0).toUpperCase()}</AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-medium">{comment.user.username}</span>
                            <span className="text-xs text-muted-foreground">
                              {safeFormatDate(comment.timestamp)}
                            </span>
                          </div>
                          <p>{comment.text}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
        
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Top Contributors</CardTitle>
              <CardDescription>Leaderboard for this challenge</CardDescription>
            </CardHeader>
            <CardContent>
              {isLoadingLeaderboard ? (
                <div className="flex justify-center py-4">
                  <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                </div>
              ) : leaderboardData && leaderboardData.items && leaderboardData.items.length > 0 ? (
                <div className="space-y-4">
                  {leaderboardData.items.slice(0, 5).map((user: LeaderboardEntry, index: number) => (
                    <div key={user.user_id} className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium ${
                          index === 0 ? 'bg-yellow-100 text-yellow-700' :
                          index === 1 ? 'bg-gray-100 text-gray-700' :
                          index === 2 ? 'bg-amber-100 text-amber-700' :
                          'bg-muted text-muted-foreground'
                        }`}>
                          {index + 1}
                        </div>
                        <span className="font-medium">{user.username || user.name}</span>
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {user.points} pts
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-4 text-muted-foreground">
                  No leaderboard data available yet
                </div>
              )}
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Challenge Progress</CardTitle>
              <CardDescription>Current status</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <div className="flex justify-between mb-2">
                  <span className="text-sm">Participation</span>
                  <span className="text-sm text-muted-foreground">
                    {challengeData.participant_count || 0}/{challengeData.target_contribution_count || 100}
                  </span>
                </div>
                <div className="h-2 bg-muted rounded-full overflow-hidden">
                  <div
                    className="h-full bg-primary"
                    style={{
                      width: `${getParticipationPercentage()}%`,
                    }}
                  ></div>
                </div>
              </div>
              
              <div>
                <div className="flex justify-between mb-2">
                  <span className="text-sm">Time Remaining</span>
                  <span className="text-sm text-muted-foreground">
                    {getTimeRemaining()} days
                  </span>
                </div>
                <div className="h-2 bg-muted rounded-full overflow-hidden">
                  <div
                    className="h-full bg-primary"
                    style={{
                      width: `${getTimeProgressPercentage()}%`,
                    }}
                  ></div>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Join Challenge</CardTitle>
              <CardDescription>Start contributing today</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Join this challenge to start contributing and earn points. You can contribute 
                {challengeData.task_type === TaskType.TRANSCRIPTION ? ' by transcribing audio files' : 
                 challengeData.task_type === TaskType.TRANSLATION ? ' by translating text' : 
                 challengeData.task_type === TaskType.ANNOTATION ? ' by annotating content' : 
                 ' by completing tasks'}.
              </p>
              <Button
                className="w-full" 
                onClick={handleStartContributing}
                disabled={challengeData.status === ChallengeStatus.COMPLETED}
              >
                {challengeData.status === ChallengeStatus.COMPLETED 
                  ? 'Challenge Completed' 
                  : joined ? 'Continue Contributing' : 'Join & Start Contributing'}
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
} 