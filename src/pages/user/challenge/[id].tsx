import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ChevronLeft, Calendar, Users, Award, Bookmark, BookmarkCheck, MessageSquare, Share2 } from 'lucide-react';
import { useGetChallenge } from '@/hooks/challengeHooks/useGetChallenge';
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
} from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { EventType } from '@/types/challenge';
import { format } from 'date-fns';

export default function ChallengeDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  // const { getChallenge: challenge, isLoading, error } = useGetChallenge(id);

  const [challenge, setChallenge] = useState<any>(null);
  const [joined, setJoined] = useState(false);
  const [commentText, setCommentText] = useState('');
  
  // Mockup leaderboard data
  const leaderboard = [
    { id: 1, username: 'user1', contributions: 245, points: 890 },
    { id: 2, username: 'translator_pro', contributions: 187, points: 753 },
    { id: 3, username: 'linguist42', contributions: 156, points: 642 },
    { id: 4, username: 'polyglot', contributions: 134, points: 521 },
    { id: 5, username: 'language_lover', contributions: 98, points: 410 },
  ];
  
  // Mockup comments
  const [comments, setComments] = useState([
    {
      id: 1,
      user: { username: 'translator_pro', avatar: '' },
      text: 'This challenge is great for practicing medical terminology!',
      timestamp: new Date(Date.now() - 86400000 * 2).toISOString(), // 2 days ago
    },
    {
      id: 2,
      user: { username: 'linguist42', avatar: '' },
      text: 'The audio quality is excellent. Makes it easier to transcribe accurately.',
      timestamp: new Date(Date.now() - 86400000).toISOString(), // 1 day ago
    },
  ]);

  useEffect(() => {
    if (id) {
      const fetchChallengeDetails = async () => {
        try {
          // For testing, directly mock the challenge data
          setChallenge({
            challenge_name: "Mock Medical Transcription Challenge",
            description: "Transcribe clinical conversations accurately to support training of medical ASR models.",
            event_type: EventType.DATA_COLLECTION,
            start_date: new Date().toISOString(),
            end_date: new Date(Date.now() + 7 * 86400000).toISOString(),
            participant_count: 42,
            target_contribution_count: 500,
            rules: "1. Only native speakers.\n2. Use high-quality audio.\n3. No background noise.",
            evaluation_criteria: "Accuracy, Clarity, Relevance",
            prizes: "Top 3 contributors get $100, $75, and $50 respectively.",
          });
  
          setJoined(true); // optionally simulate auto-joining
  
          const joinedChallenges = localStorage.getItem('joinedChallenges');
          if (joinedChallenges) {
            const parsed = JSON.parse(joinedChallenges);
            setJoined(parsed.includes(id));
          }
        } catch (error) {
          console.error('Failed to fetch challenge details:', error);
          toast({
            title: 'Error',
            description: 'Failed to load challenge details',
            variant: 'destructive',
          });
        }
      };
  
      fetchChallengeDetails();
    }
  }, [id, toast]);

  const handleJoinChallenge = () => {
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
        description: `You have joined "${challenge.challenge_name}"`,
      });
    } else {
      parsed = parsed.filter((challengeId: string) => challengeId !== id);
      toast({
        title: 'Left Challenge',
        description: `You have left "${challenge.challenge_name}"`,
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
        return 'Sample Review';
      case EventType.DATA_COLLECTION:
        return 'Data Collection';
      default:
        return 'Unknown';
    }
  };

  if (isLoading || !challenge) {

    return (
      <div className="container mx-auto py-8 px-4">
        <div className="flex justify-center items-center h-64">
          <p>Loading challenge details...</p>
        </div>
      </div>
    );
  }

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
                <Badge variant="outline" className="mb-2">
                  {getEventTypeLabel(challenge.event_type)}
                </Badge>
                <h1 className="text-3xl font-bold">{challenge.challenge_name}</h1>
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
                  {format(new Date(challenge.start_date), 'MMM d, yyyy')} - {format(new Date(challenge.end_date), 'MMM d, yyyy')}
                </span>
              </div>
              <div className="flex items-center gap-1 text-muted-foreground">
                <Users className="h-4 w-4" />
                <span>{challenge.participant_count || 0} participants</span>
              </div>
              {challenge.target_contribution_count && (
                <div className="flex items-center gap-1 text-muted-foreground">
                  <Award className="h-4 w-4" />
                  <span>Goal: {challenge.target_contribution_count} contributions</span>
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
                  <p className="whitespace-pre-line">{challenge.description}</p>
                </CardContent>
              </Card>
              
              <div className="border rounded-lg p-6 text-center space-y-4 bg-muted/30">
                <h3 className="text-lg font-medium">Ready to contribute?</h3>
                <p className="text-muted-foreground">
                  Join this challenge and start contributing to earn points and rewards.
                </p>
                <Button size="lg" onClick={handleStartContributing}>
                  Start Contributing
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
                    {challenge.rules || "No specific rules have been provided for this challenge."}
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
                    {challenge.evaluation_criteria || "No specific evaluation criteria have been provided for this challenge."}
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
                    {challenge.prizes || "No specific prizes have been listed for this challenge."}
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
                              {format(new Date(comment.timestamp), 'MMM d, yyyy')}
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
              <div className="space-y-4">
                {leaderboard.map((user, index) => (
                  <div key={user.id} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium ${
                        index === 0 ? 'bg-yellow-100 text-yellow-700' :
                        index === 1 ? 'bg-gray-100 text-gray-700' :
                        index === 2 ? 'bg-amber-100 text-amber-700' :
                        'bg-muted text-muted-foreground'
                      }`}>
                        {index + 1}
                      </div>
                      <span className="font-medium">{user.username}</span>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {user.points} pts
                    </div>
                  </div>
                ))}
              </div>
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
                    {challenge.participant_count || 0}/{challenge.target_contribution_count || 100}
                  </span>
                </div>
                <div className="h-2 bg-muted rounded-full overflow-hidden">
                  <div
                    className="h-full bg-primary"
                    style={{
                      width: `${Math.min(
                        100,
                        ((challenge.participant_count || 0) / (challenge.target_contribution_count || 100)) * 100
                      )}%`,
                    }}
                  ></div>
                </div>
              </div>
              
              <div>
                <div className="flex justify-between mb-2">
                  <span className="text-sm">Time Remaining</span>
                  <span className="text-sm text-muted-foreground">
                    {Math.max(0, Math.ceil((new Date(challenge.end_date).getTime() - Date.now()) / (1000 * 60 * 60 * 24)))} days
                  </span>
                </div>
                <div className="h-2 bg-muted rounded-full overflow-hidden">
                  <div
                    className="h-full bg-primary"
                    style={{
                      width: `${Math.max(
                        0,
                        Math.min(
                          100,
                          ((new Date(challenge.end_date).getTime() - Date.now()) /
                            (new Date(challenge.end_date).getTime() - new Date(challenge.start_date).getTime())) * 100
                        )
                      )}%`,
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
                Join this challenge to start contributing and earning points. You can contribute by transcribing audio files, translating text, or validating others' work.
              </p>
              <Button
                className="w-full" 
                onClick={handleStartContributing}
              >
                {joined ? 'Continue Contributing' : 'Join & Start Contributing'}
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
} 