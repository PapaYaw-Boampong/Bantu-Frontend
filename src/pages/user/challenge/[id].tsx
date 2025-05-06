import { useState, useEffect } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import {
  ChevronLeft,
  Calendar,
  Users,
  Award,
  Bookmark,
  BookmarkCheck,
  MessageSquare,
  Share2,
  Loader2,
  Gift,
  Medal,
  Trophy,
  DollarSign,
  ShoppingBag,
  BadgeCheck,
  Globe,
  Clock,
  Target,
  Info,
  BarChart,
  Activity,
  CheckCircle,
  FileText,
  Timer,
  Percent,
  User,
} from "lucide-react";
import { useGetDetailedChallenge } from "@/hooks/challengeHooks/useGetDetailedChallenge";
import { useGetChallengeLeaderboard } from "@/hooks/challengeHooks/useGetChallengeLeaderboard";
import { useJoinChallenge } from "@/hooks/challengeHooks/useJoinChallenge";
import { useLeaveChallenge } from "@/hooks/challengeHooks/useLeaveChallenge";
import { useUserChallenges } from "@/hooks/challengeHooks/useUserChallenges";
import { useGetChallengeStats } from "@/hooks/challengeHooks/useGetChallengeStats";
import { useLanguages } from "@/hooks/languageHooks/useLanguages";
import { useToast } from '@/components/ui/use-toast';
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  EventType,
  TaskType,
  ChallengeStatus,
  LeaderboardEntry,
  DetailedChallengeResponseWrapper,
} from "@/types/challenge";
import { format } from "date-fns";
import { RewardType } from "@/types/rewards";
import { useGetUserChallengeStats } from "@/hooks/challengeHooks/useGetUserChallengeStats";

// // Extended interface to include additional properties we're using in the UI
// interface ExtendedChallenge {
//   id: string;
//   challenge_name: string;
//   description?: string;
//   event_type: EventType;
//   task_type: TaskType;
//   start_date: string;
//   end_date: string;
//   status: ChallengeStatus;
//   is_public: boolean;
//   is_published: boolean;
//   participant_count?: number;
//   target_contribution_count?: number;
//   image_url?: string;
//   creator_id?: string;
//   // Additional properties we use in the UI
//   source_language?: string;
//   target_language?: string;
//   contribution_count?: number;
//   min_contributions_required?: number;
// }

export default function ChallengeDetail() {
  const { id = "" } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  const { user } = useAuth();
  const {
    data: challengeResponseData,
    isLoading,
    error,
  } = useGetDetailedChallenge(id);
  const { data: leaderboardData, isLoading: isLoadingLeaderboard } =
    useGetChallengeLeaderboard(id);
  const { data: userChallenges, isLoading: isLoadingUserChallenges } =
    useUserChallenges();
  const { data: languages, isLoading: isLoadingLanguages } = useLanguages();
  const { mutateAsync: joinChallenge, isPending: isJoining } =
    useJoinChallenge();
  const { mutateAsync: leaveChallenge, isPending: isLeaving } =
    useLeaveChallenge();

  // Get challenge statistics (only for challenge creator/admin)
  // Since ChallengeDetailResponse doesn't have creator_id directly, we'll assume admin access
  // This would need to be properly implemented in a real app to check challenge ownership

  // Extract challenge data and treat it as the extended type
  const challengeData = challengeResponseData?.challenge;
  const rewardData = challengeResponseData?.reward;
  const rulesData = challengeResponseData?.rules || [];

  const canViewStats = challengeData?.creator_id === user?.id || false; // Convert to boolean to avoid potential null values

  const { data: challengeStats, isLoading: isLoadingStats } =
    useGetChallengeStats(
      id,
      // Only enable this query if the user is an admin AND the challenge is published
      canViewStats && !!challengeResponseData?.challenge?.is_published // Ensure this is also boolean
    );

  const [joined, setJoined] = useState(false);
  const [commentText, setCommentText] = useState("");
  const [comments, setComments] = useState([
    {
      id: 1,
      user: { username: "translator_pro", avatar: "" },
      text: "This challenge is great for practicing new skills!",
      timestamp: new Date(Date.now() - 86400000 * 2).toISOString(), // 2 days ago
    },
    {
      id: 2,
      user: { username: "language_lover", avatar: "" },
      text: "Looking forward to contributing to this challenge.",
      timestamp: new Date(Date.now() - 86400000).toISOString(), // 1 day ago
    },
  ]);

  // Add user stats hook after joined state is declared
  const { data: userStats, isLoading: isLoadingUserStats } =
    useGetUserChallengeStats(
      id,
      joined // Only fetch if user has joined the challenge
    );

  useEffect(() => {
    if (id && userChallenges) {
      // Check if this challenge is in the user's participating challenges list
      const isParticipating = userChallenges.some(
        (challenge) => challenge.id === id
      );
      setJoined(isParticipating);
    }
  }, [id, userChallenges]);

  const handleJoinChallenge = async () => {
    if (!challengeData) return;

    // Check if user is authenticated
    if (!user) {
      // Redirect to login page with return URL
      navigate("/auth", { state: { from: location.pathname } });
      toast({
        title: "Authentication Required",
        description: "Please log in to join challenges",
        variant: "default",
      });
      return;
    }

    // // If we're already in a loading state, don't allow another action
    // if (isJoining || isLeaving) return;

    try {
      if (!joined) {
        // Join the challenge
        const response = await joinChallenge({
          event_id: id,
          user_id: user.id,
        });

        console.log("Join response:", response); // Add debug logging

        // Update local state
        setJoined(true);

        // Use a slight delay for the toast to ensure the state update completes
        setTimeout(() => {
          toast({
            title: "Joined Challenge",
            description: `You have joined "${challengeData.challenge_name}"`,
            duration: 3000, // Specify duration explicitly
          });
        }, 100);
      } else {
        // Leave the challenge
        const response = await leaveChallenge(id);
        console.log("Leave response:", response); // Add debug logging
        // Update local state
        setJoined(false);

        // Use a slight delay for the toast
        setTimeout(() => {
          toast({
            title: "Left Challenge",
            description: `You have left "${challengeData.challenge_name}"`,
            duration: 3000, // Specify duration explicitly
          });
        }, 100);
      }
    } catch (error) {
      console.error("Error joining/leaving challenge:", error);
      toast({
        title: "Error",
        description: "Failed to join or leave the challenge. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleStartContributing = async () => {
    if (!challengeData) return;

    // Check if user is authenticated
    if (!user) {
      // Redirect to login page with return URL
      navigate("/auth", { state: { from: location.pathname } });
      toast({
        title: "Authentication Required",
        description: "Please log in to contribute to challenges",
        variant: "default",
      });
      return;
    }

    if (!joined && !isJoining) {
      // Join the challenge first
      await handleJoinChallenge();
    }

    // Navigate to sandbox with pre-selected challenge
    navigate("/user/sandbox", { state: { selectedChallenge: id } });
  };

  const handlePostComment = () => {
    if (!commentText.trim()) return;

    const newComment = {
      id: comments.length + 1,
      user: { username: "current_user", avatar: "" },
      text: commentText,
      timestamp: new Date().toISOString(),
    };

    setComments([newComment, ...comments]);
    setCommentText("");

    toast({
      title: "Comment Posted",
      description: "Your comment has been added to the discussion",
    });
  };

  const getEventTypeLabel = (type: EventType) => {
    switch (type) {
      case EventType.SAMPLE_REVIEW:
        return "Evaluation";
      case EventType.DATA_COLLECTION:
        return "Data Collection";
      default:
        return "Unknown";
    }
  };

  const getTaskTypeLabel = (type: TaskType) => {
    switch (type) {
      case TaskType.TRANSCRIPTION:
        return "Transcription";
      case TaskType.TRANSLATION:
        return "Translation";
      case TaskType.ANNOTATION:
        return "Annotation";
      default:
        return "Unknown";
    }
  };

  const getStatusLabel = (status?: ChallengeStatus) => {
    if (!status) return { label: "Unknown", color: "bg-gray-400" };

    switch (status) {
      case ChallengeStatus.UPCOMING:
        return { label: "Upcoming", color: "bg-blue-500" };
      case ChallengeStatus.Active:
        return { label: "Active", color: "bg-green-500" };
      case ChallengeStatus.COMPLETED:
        return { label: "Completed", color: "bg-purple-500" };
      default:
        return { label: status, color: "bg-gray-400" };
    }
  };

  // Calculate participation percentage
  const getParticipationPercentage = () => {
    if (
      !challengeData?.target_contribution_count ||
      !challengeData?.participant_count
    )
      return 0;
    return Math.min(
      100,
      (challengeData.participant_count /
        challengeData.target_contribution_count) *
        100
    );
  };

  // Add a helper function to safely format dates
  const safeFormatDate = (dateString: string | undefined) => {
    if (!dateString) return "N/A";
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return "N/A";
      return format(date, "MMM d, yyyy");
    } catch (error) {
      console.error("Error formatting date:", error);
      return "N/A";
    }
  };

  // Calculate remaining time
  const getTimeRemaining = () => {
    if (!challengeData?.end_date) return 0;

    try {
      const endDate = new Date(challengeData.end_date);
      const startDate = new Date(challengeData.start_date || Date.now());

      if (isNaN(endDate.getTime()) || isNaN(startDate.getTime())) return 0;

      const now = new Date();
      return Math.max(
        0,
        Math.ceil((endDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
      );
    } catch (error) {
      console.error("Error calculating time remaining:", error);
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
      console.error("Error calculating progress percentage:", error);
      return 0;
    }
  };

  // Function to get reward summary for overview tab
  const getRewardOverview = () => {
    if (!rewardData) return "Participate to earn rewards";
    const reward = rewardData.reward_value;

    switch (rewardData.reward_type) {
      case RewardType.CASH:
        if (rewardData.reward_distribution_type === "fixed") {
          return (
            <div>
              Cash prize of:{" "}
              <strong style={{ color: "green" }}>
                {reward.amount.toLocaleString()} {reward.currency || "USD"}
              </strong>
            </div>
          );
        } else if (
          rewardData.reward_distribution_type === "tiered" &&
          reward.tiers?.length
        ) {
          const placeSuffix = (i: number) => {
            const j = i + 1;
            if (j === 1) return "1st";
            if (j === 2) return "2nd";
            if (j === 3) return "3rd";
            return `${j}th`;
          };

          const sortedTiers = [...reward.tiers].sort((a, b) => a.rank - b.rank);

          return (
            <div>
              {sortedTiers.map((tier) => (
                <div key={tier.rank}>
                  {placeSuffix(tier.rank)}:{" "}
                  <strong style={{ color: "green" }}>
                    {tier.amount.toLocaleString()}{" "}
                    {tier.currency || reward.currency || "USD"}
                  </strong>
                </div>
              ))}
            </div>
          );
        }
        return "Cash prizes available";

      case RewardType.BADGE:
        if (rewardData.reward_distribution_type === "fixed") {
          return `${reward.badge_name || "Achievement badge"} for completion`;
        } else if (rewardData.reward_distribution_type === "tiered") {
          return "Tiered achievement badges";
        }
        return "Badge rewards available";

      case RewardType.SWAG:
        if (rewardData.reward_distribution_type === "fixed") {
          return `${
            rewardData.swag_item || "SWAG merchandise"
          } for participants`;
        } else if (rewardData.reward_distribution_type === "tiered") {
          return "Tiered SWAG rewards";
        }
        return "SWAG rewards available";

      default:
        return "Participate to earn rewards";
    }
  };

  // Function to get language info
  const getLanguageInfo = () => {
    if (!challengeData || !challengeData.language_id) {
      return null;
    }

    // Only try to find languages if the languages data is loaded
    if (languages && languages.length > 0) {
      const Language = languages.find(
        (lang) => lang.id === challengeData.language_id
      );
      return Language?.name;
    }
    // If we don't have language data, return the language code as fallback
    return challengeData.language_id || null;
  };

  const loading =
    isLoading ||
    isLoadingUserChallenges ||
    // isJoining ||
    // isLeaving ||
    isLoadingLanguages ||
    (canViewStats && isLoadingStats);

  if (!challengeData || loading) {
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
          <h2 className="text-xl font-semibold mb-2">
            Error loading challenge
          </h2>
          <p className="text-muted-foreground">
            Unable to load challenge details. Please try again later.
          </p>
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
  const formattedRules =
    rulesData.length > 0
      ? rulesData
          .map((rule: any) => `${rule.rule_title}: ${rule.rule_description}`)
          .join("\n\n")
      : "No specific rules have been provided for this challenge.";

  return (
    <div className="container mx-auto py-8 px-4">
      <Button
        variant="ghost"
        className="mb-6"
        onClick={() => navigate("/user/challenges")}
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
                  <Badge
                    className={`${
                      getStatusLabel(challengeData.status).color
                    } text-white`}
                  >
                    {getStatusLabel(challengeData.status).label}
                  </Badge>
                  {challengeData.is_published && (
                    <Badge
                      variant="outline"
                      className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300"
                    >
                      Published
                    </Badge>
                  )}
                </div>
                <h1 className="text-3xl font-bold">
                  {challengeData.challenge_name}
                </h1>
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
                  disabled={isJoining || isLeaving}
                >
                  {isJoining || isLeaving ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      {joined ? "Leaving..." : "Joining..."}
                    </>
                  ) : joined ? (
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

            {/* <div className="flex flex-wrap gap-4 text-sm">
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
            </div> */}
          </div>

          <Tabs defaultValue="overview" className="mb-8">
            <TabsList className="mb-6">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="rules">Rules & Criteria</TabsTrigger>
              <TabsTrigger value="prizes">Prizes</TabsTrigger>
              <TabsTrigger value="discussion">Discussion</TabsTrigger>
              {canViewStats && challengeData?.is_published && (
                <TabsTrigger value="statistics">Statistics</TabsTrigger>
              )}
              {joined && <TabsTrigger value="mystats">My Stats</TabsTrigger>}
            </TabsList>

            <TabsContent value="overview" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Challenge Description</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="whitespace-pre-line">
                    {challengeData.description}
                  </p>
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

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle>Challenge Details</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex items-start gap-3">
                        <Calendar className="h-5 w-5 text-muted-foreground mt-0.5" />
                        <div>
                          <h4 className="font-medium">Timeline</h4>
                          <p className="text-sm text-muted-foreground">
                            Starts: {safeFormatDate(challengeData.start_date)}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            Ends: {safeFormatDate(challengeData.end_date)}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            Duration:{" "}
                            {challengeData.start_date && challengeData.end_date
                              ? Math.ceil(
                                  (new Date(challengeData.end_date).getTime() -
                                    new Date(
                                      challengeData.start_date
                                    ).getTime()) /
                                    (1000 * 60 * 60 * 24)
                                )
                              : "N/A"}{" "}
                            days
                          </p>
                        </div>
                      </div>

                      {getLanguageInfo() && (
                        <div className="flex items-start gap-3">
                          <Globe className="h-5 w-5 text-muted-foreground mt-0.5" />
                          <div>
                            <h4 className="font-medium">Language</h4>
                            <p className="text-sm text-muted-foreground">
                              {getLanguageInfo()}
                            </p>
                          </div>
                        </div>
                      )}

                      <div className="flex items-start gap-3">
                        <Target className="h-5 w-5 text-muted-foreground mt-0.5" />
                        <div>
                          <h4 className="font-medium">Goal</h4>
                          <p className="text-sm text-muted-foreground">
                            {challengeData.target_contribution_count
                              ? `${challengeData.target_contribution_count} contributions`
                              : "No specific target set"}
                          </p>
                          {/* <p className="text-sm text-muted-foreground">
                            Currently: {challengeData. || 0} contributions
                          </p> */}
                        </div>
                      </div>

                      <div className="flex items-start gap-3">
                        <Users className="h-5 w-5 text-muted-foreground mt-0.5" />
                        <div>
                          <h4 className="font-medium">Participation</h4>
                          <p className="text-sm text-muted-foreground">
                            {challengeData.participant_count || 0} participants
                            joined
                          </p>
                          {/* <p className="text-sm text-muted-foreground">
                            {challengeData.min_contributions_required ? `Minimum ${challengeData.min_contributions_required} contributions required` : 'No minimum required contributions'}
                          </p> */}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle>Rewards Overview</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex items-start gap-3">
                        <Award className="h-5 w-5 text-muted-foreground mt-0.5" />
                        <div>
                          <h4 className="font-medium">Reward Type</h4>
                          <p className="text-sm text-muted-foreground">
                            {rewardData ? (
                              <>
                                {rewardData.reward_type === RewardType.CASH && (
                                  <span className="flex items-center gap-1 mt-1">
                                    <DollarSign className="h-4 w-4 text-amber-500" />
                                    Cash Reward
                                  </span>
                                )}
                                {rewardData.reward_type ===
                                  RewardType.BADGE && (
                                  <span className="flex items-center gap-1 mt-1">
                                    <BadgeCheck className="h-4 w-4 text-blue-500" />
                                    Badge Reward
                                  </span>
                                )}
                                {rewardData.reward_type === RewardType.SWAG && (
                                  <span className="flex items-center gap-1 mt-1">
                                    <ShoppingBag className="h-4 w-4 text-purple-500" />
                                    SWAG Reward
                                  </span>
                                )}
                              </>
                            ) : (
                              "No specific rewards defined"
                            )}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-start gap-3">
                        <Gift className="h-5 w-5 text-muted-foreground mt-0.5" />
                        <div>
                          <h4 className="font-medium">What You Can Earn</h4>
                          <p className="text-sm text-muted-foreground">
                            {getRewardOverview()}
                          </p>
                          <p className="text-sm text-muted-foreground mt-1">
                            Distribution:{" "}
                            {rewardData?.reward_distribution_type === "fixed"
                              ? "Single Bounty- Winner Takes All"
                              : rewardData?.reward_distribution_type ===
                                "tiered"
                              ? "Tiered based on ranking"
                              : "Not specified"}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-start gap-3">
                        <Info className="h-5 w-5 text-muted-foreground mt-0.5" />
                        <div>
                          <h4 className="font-medium">How to Qualify</h4>
                          <p className="text-sm text-muted-foreground">
                            The accuracy and community acceptance of your
                            contributions results in point accumulation and
                            proficiency leveling.
                          </p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              <div className="border rounded-lg p-6 text-center space-y-4 bg-muted/30">
                <h3 className="text-lg font-medium">Ready to contribute?</h3>
                <p className="text-muted-foreground">
                  Join this challenge and start contributing to earn points and
                  rewards.
                </p>
                <Button
                  size="lg"
                  onClick={handleStartContributing}
                  disabled={challengeData.status === ChallengeStatus.COMPLETED}
                >
                  {challengeData.status === ChallengeStatus.COMPLETED
                    ? "Challenge Completed"
                    : joined
                    ? "Continue Contributing"
                    : "Start Contributing"}
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
                  <div className="whitespace-pre-line">{formattedRules}</div>
                </CardContent>
              </Card>

              {/* <Card>
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
              </Card> */}
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
                  {!rewardData ? (
                    <p>
                      No specific prizes have been listed for this challenge.
                    </p>
                  ) : (
                    <div className="space-y-6">
                      {/* Cash Reward Section */}
                      {rewardData.reward_type === RewardType.CASH && (
                        <div className="space-y-4">
                          <div className="flex items-center gap-2">
                            <DollarSign className="h-5 w-5 text-amber-500" />
                            <h3 className="text-lg font-medium">Cash Reward</h3>
                          </div>

                          {rewardData.reward_distribution_type === "fixed" ? (
                            <div className="bg-muted/30 p-4 rounded-md">
                              <div className="flex items-center justify-between">
                                <span>Fixed Prize</span>
                                <span className="font-medium text-lg">
                                  {rewardData.reward_value.amount}{" "}
                                  {rewardData.reward_value.currency || "USD"}
                                </span>
                              </div>
                              <p className="text-sm text-muted-foreground mt-2">
                                Winner Takes All
                              </p>
                            </div>
                          ) : rewardData.reward_distribution_type ===
                              "tiered" && rewardData.reward_value ? (
                            <div className="space-y-2">
                              {/* Iterate over the tiers object */}
                              {Object.keys(rewardData.reward_value).map(
                                (tierKey: string, index: number) => {
                                  const tier = rewardData.reward_value[tierKey];
                                  return (
                                    <div
                                      key={index}
                                      className="bg-muted/30 p-4 rounded-md flex items-center justify-between"
                                    >
                                      <div className="flex items-center gap-2">
                                        {index === 0 ? (
                                          <Trophy className="h-5 w-5 text-yellow-500" />
                                        ) : index === 1 ? (
                                          <Medal className="h-5 w-5 text-gray-400" />
                                        ) : index === 2 ? (
                                          <Medal className="h-5 w-5 text-amber-700" />
                                        ) : (
                                          <Award className="h-5 w-5 text-primary" />
                                        )}
                                        <span>
                                          {tier.label || `Rank ${index + 1}`}
                                        </span>
                                      </div>
                                      <span className="font-medium">
                                        {tier.amount} {tier.currency || "USD"}
                                      </span>
                                    </div>
                                  );
                                }
                              )}
                            </div>
                          ) : (
                            <p>
                              Cash reward details will be available upon
                              joining.
                            </p>
                          )}
                        </div>
                      )}

                      {/* Badge Reward Section */}
                      {rewardData.reward_type === RewardType.BADGE && (
                        <div className="space-y-4">
                          <div className="flex items-center gap-2">
                            <BadgeCheck className="h-5 w-5 text-blue-500" />
                            <h3 className="text-lg font-medium">
                              Badge Reward
                            </h3>
                          </div>
                          {rewardData.reward_distribution_type === "fixed" ? (
                            <div className="bg-muted/30 p-4 rounded-md">
                              <div className="flex flex-col">
                                <span className="font-medium text-lg">
                                  {rewardData.badge_name || "Challenge Badge"}
                                </span>
                                <span className="text-sm text-muted-foreground">
                                  {rewardData.badge_description ||
                                    "For completing the challenge"}
                                </span>
                              </div>
                            </div>
                          ) : rewardData.reward_distribution_type ===
                              "tiered" && rewardData.reward_value ? (
                            <div className="space-y-2">
                              {/* Iterate over the badge tiers */}
                              {Object.keys(rewardData.reward_value)
                                .filter((key) => key !== "icon")
                                .map((tierKey: string, index: number) => {
                                  const tier = rewardData.reward_value[tierKey];
                                  return (
                                    <div
                                      key={index}
                                      className="bg-muted/30 p-4 rounded-md flex items-center justify-between"
                                    >
                                      <div className="flex items-center gap-2 mb-1">
                                        {index === 0 ? (
                                          <Trophy className="h-5 w-5 text-yellow-500" />
                                        ) : index === 1 ? (
                                          <Medal className="h-5 w-5 text-gray-400" />
                                        ) : index === 2 ? (
                                          <Medal className="h-5 w-5 text-amber-700" />
                                        ) : (
                                          <Award className="h-5 w-5 text-primary" />
                                        )}
                                        <span className="font-medium">
                                          {tier.name || `Rank ${index + 1}`}
                                        </span>
                                      </div>
                                      <p className="text-sm pl-7">
                                        {tier.description ||
                                          `Badge for achieving ${
                                            tier.name || `rank ${index + 1}`
                                          }`}
                                      </p>
                                    </div>
                                  );
                                })}
                            </div>
                          ) : (
                            <p>
                              Badge reward details will be available upon
                              joining.
                            </p>
                          )}
                        </div>
                      )}

                      {/* SWAG Reward Section */}
                      {rewardData.reward_type === RewardType.SWAG && (
                        <div className="space-y-4">
                          <div className="flex items-center gap-2">
                            <ShoppingBag className="h-5 w-5 text-purple-500" />
                            <h3 className="text-lg font-medium">SWAG Reward</h3>
                          </div>
                          {rewardData.reward_distribution_type === "fixed" ? (
                            <div className="bg-muted/30 p-4 rounded-md">
                              <div className="flex flex-col">
                                <span className="font-medium text-lg">
                                  {rewardData.swag_item || "Merchandise"}
                                </span>
                                <span className="text-sm text-muted-foreground">
                                  {rewardData.swag_description ||
                                    "For participating in the challenge"}
                                </span>
                              </div>
                            </div>
                          ) : rewardData.reward_distribution_type ===
                              "tiered" && rewardData.tiers ? (
                            <div className="space-y-2">
                              {rewardData.tiers.map(
                                (tier: any, index: number) => (
                                  <div
                                    key={index}
                                    className="bg-muted/30 p-4 rounded-md"
                                  >
                                    <div className="flex items-center gap-2 mb-1">
                                      {index === 0 ? (
                                        <Trophy className="h-5 w-5 text-yellow-500" />
                                      ) : index === 1 ? (
                                        <Medal className="h-5 w-5 text-gray-400" />
                                      ) : index === 2 ? (
                                        <Medal className="h-5 w-5 text-amber-700" />
                                      ) : (
                                        <Gift className="h-5 w-5 text-primary" />
                                      )}
                                      <span className="font-medium">
                                        {tier.name || `Rank ${index + 1}`}
                                      </span>
                                    </div>
                                    <div className="text-sm pl-7">
                                      <p>{tier.item || "SWAG Item"}</p>
                                      {tier.description && (
                                        <p className="text-muted-foreground">
                                          {tier.description}
                                        </p>
                                      )}
                                      {/* {tier.coupon_code && (
                                        <span className="mt-1 text-xs bg-secondary p-1 rounded inline-block">
                                          Coupon: {tier.coupon_code}
                                        </span>
                                      )} */}
                                    </div>
                                  </div>
                                )
                              )}
                            </div>
                          ) : (
                            <p>
                              SWAG reward details will be available upon
                              joining.
                            </p>
                          )}
                        </div>
                      )}

                      {/* Additional Information */}
                      {rewardData.additional_info && (
                        <div className="mt-4 pt-4 border-t">
                          <h4 className="font-medium mb-2">
                            Additional Information
                          </h4>
                          <p className="text-sm text-muted-foreground">
                            {rewardData.additional_info}
                          </p>
                        </div>
                      )}
                    </div>
                  )}
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
                      <Button
                        onClick={handlePostComment}
                        disabled={!commentText.trim()}
                      >
                        Post Comment
                      </Button>
                    </div>
                  </div>

                  <div className="space-y-6 pt-4">
                    {comments.map((comment) => (
                      <div key={comment.id} className="flex gap-4">
                        <Avatar>
                          <AvatarImage src={comment.user.avatar} />
                          <AvatarFallback>
                            {comment.user.username.charAt(0).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-medium">
                              {comment.user.username}
                            </span>
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

            {canViewStats && challengeData?.is_published && (
              <TabsContent value="statistics" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <BarChart className="h-5 w-5" />
                      Challenge Statistics
                    </CardTitle>
                    <CardDescription>
                      Key metrics and performance data for this challenge
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {isLoadingStats ? (
                      <div className="flex justify-center p-8">
                        <Loader2 className="h-8 w-8 animate-spin text-primary" />
                      </div>
                    ) : !challengeStats ? (
                      <div className="text-center py-8 text-muted-foreground">
                        <p>No statistics available for this challenge yet.</p>
                      </div>
                    ) : (
                      <div className="space-y-8">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <Card className="bg-muted/40">
                            <CardContent className="pt-6">
                              <div className="flex items-start gap-3">
                                <Users className="h-8 w-8 text-blue-500" />
                                <div>
                                  <p className="text-sm text-muted-foreground">
                                    Participants
                                  </p>
                                  <p className="text-2xl font-bold">
                                    {challengeStats.participant_count}
                                  </p>
                                </div>
                              </div>
                            </CardContent>
                          </Card>

                          <Card className="bg-muted/40">
                            <CardContent className="pt-6">
                              <div className="flex items-start gap-3">
                                <FileText className="h-8 w-8 text-green-500" />
                                <div>
                                  <p className="text-sm text-muted-foreground">
                                    Contributions
                                  </p>
                                  <p className="text-2xl font-bold">
                                    {challengeStats.contribution_count}
                                  </p>
                                </div>
                              </div>
                            </CardContent>
                          </Card>

                          <Card className="bg-muted/40">
                            <CardContent className="pt-6">
                              <div className="flex items-start gap-3">
                                <CheckCircle className="h-8 w-8 text-amber-500" />
                                <div>
                                  <p className="text-sm text-muted-foreground">
                                    Evaluations
                                  </p>
                                  <p className="text-2xl font-bold">
                                    {challengeStats.evaluation_count}
                                  </p>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        </div>

                        <div className="grid grid-cols-1 gap-4">
                          <Card className="bg-muted/40">
                            <CardHeader className="pb-2">
                              <CardTitle className="text-base">
                                Completion Progress
                              </CardTitle>
                            </CardHeader>
                            <CardContent>
                              <div className="flex items-center justify-between mb-2">
                                <span className="text-sm text-muted-foreground">
                                  Progress
                                </span>
                                <span className="text-sm font-medium">
                                  {challengeStats.completion_percent}%
                                </span>
                              </div>
                              <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
                                <div
                                  className="h-full bg-primary rounded-full"
                                  style={{
                                    width: `${challengeStats.completion_percent}%`,
                                  }}
                                />
                              </div>
                            </CardContent>
                          </Card>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <Card className="bg-muted/40">
                            <CardHeader className="pb-2">
                              <CardTitle className="text-base">
                                Quality Metrics
                              </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                              {challengeStats.avg_contribution_acceptance_score !==
                                undefined && (
                                <div>
                                  <div className="flex justify-between text-sm mb-1">
                                    <span className="text-muted-foreground">
                                      Avg. Contribution Score
                                    </span>
                                    <span className="font-medium">
                                      {(
                                        challengeStats.avg_contribution_acceptance_score *
                                        100
                                      ).toFixed(1)}
                                      %
                                    </span>
                                  </div>
                                  <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
                                    <div
                                      className="h-full bg-blue-500 rounded-full"
                                      style={{
                                        width: `${
                                          challengeStats.avg_contribution_acceptance_score *
                                          100
                                        }%`,
                                      }}
                                    />
                                  </div>
                                </div>
                              )}

                              {challengeStats.avg_evaluation_acceptance_score !==
                                undefined && (
                                <div>
                                  <div className="flex justify-between text-sm mb-1">
                                    <span className="text-muted-foreground">
                                      Avg. Evaluation Score
                                    </span>
                                    <span className="font-medium">
                                      {(
                                        challengeStats.avg_evaluation_acceptance_score *
                                        100
                                      ).toFixed(1)}
                                      %
                                    </span>
                                  </div>
                                  <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
                                    <div
                                      className="h-full bg-green-500 rounded-full"
                                      style={{
                                        width: `${
                                          challengeStats.avg_evaluation_acceptance_score *
                                          100
                                        }%`,
                                      }}
                                    />
                                  </div>
                                </div>
                              )}
                            </CardContent>
                          </Card>

                          <Card className="bg-muted/40">
                            <CardHeader className="pb-2">
                              <CardTitle className="text-base">
                                Task-Specific Metrics
                              </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                              {challengeStats.task_type === "transcription" &&
                                challengeStats.total_hours_speech !==
                                  undefined && (
                                  <div className="flex items-center justify-between">
                                    <span className="flex items-center gap-2 text-sm text-muted-foreground">
                                      <Timer className="h-4 w-4" />
                                      Total Hours of Speech
                                    </span>
                                    <span className="font-medium">
                                      {challengeStats.total_hours_speech.toFixed(
                                        1
                                      )}{" "}
                                      hours
                                    </span>
                                  </div>
                                )}

                              {challengeStats.task_type === "translation" &&
                                challengeStats.total_sentences_translated !==
                                  undefined && (
                                  <div className="flex items-center justify-between">
                                    <span className="flex items-center gap-2 text-sm text-muted-foreground">
                                      <FileText className="h-4 w-4" />
                                      Total Sentences Translated
                                    </span>
                                    <span className="font-medium">
                                      {challengeStats.total_sentences_translated.toLocaleString()}
                                    </span>
                                  </div>
                                )}

                              {challengeStats.task_type === "annotation" &&
                                challengeStats.total_tokens_produced !==
                                  undefined && (
                                  <div className="flex items-center justify-between">
                                    <span className="flex items-center gap-2 text-sm text-muted-foreground">
                                      <FileText className="h-4 w-4" />
                                      Total Tokens Produced
                                    </span>
                                    <span className="font-medium">
                                      {challengeStats.total_tokens_produced.toLocaleString()}
                                    </span>
                                  </div>
                                )}

                              <div className="flex items-center justify-between">
                                <span className="flex items-center gap-2 text-sm text-muted-foreground">
                                  <Activity className="h-4 w-4" />
                                  Last Updated
                                </span>
                                <span className="font-medium">
                                  {safeFormatDate(challengeStats.updated_at)}
                                </span>
                              </div>
                            </CardContent>
                          </Card>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
            )}

            {joined && (
              <TabsContent value="mystats" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <User className="h-5 w-5" />
                      My Challenge Statistics
                    </CardTitle>
                    <CardDescription>
                      Your performance and contributions in this challenge
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {isLoadingUserStats ? (
                      <div className="flex justify-center p-8">
                        <Loader2 className="h-8 w-8 animate-spin text-primary" />
                      </div>
                    ) : !userStats ? (
                      <div className="text-center py-8 text-muted-foreground">
                        <p>No statistics available yet.</p>
                      </div>
                    ) : (
                      <div className="space-y-8">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <Card className="bg-muted/40">
                            <CardContent className="pt-6">
                              <div className="flex items-start gap-3">
                                <Award className="h-8 w-8 text-amber-500" />
                                <div>
                                  <p className="text-sm text-muted-foreground">
                                    Total Points
                                  </p>
                                  <p className="text-2xl font-bold">
                                    {userStats.total_points}
                                  </p>
                                </div>
                              </div>
                            </CardContent>
                          </Card>

                          <Card className="bg-muted/40">
                            <CardContent className="pt-6">
                              <div className="flex items-start gap-3">
                                <FileText className="h-8 w-8 text-green-500" />
                                <div>
                                  <p className="text-sm text-muted-foreground">
                                    Contributions
                                  </p>
                                  <p className="text-2xl font-bold">
                                    {userStats.contribution_count}
                                  </p>
                                  <p className="text-sm text-muted-foreground">
                                    {userStats.accepted_contributions} accepted
                                  </p>
                                </div>
                              </div>
                            </CardContent>
                          </Card>

                          <Card className="bg-muted/40">
                            <CardContent className="pt-6">
                              <div className="flex items-start gap-3">
                                <CheckCircle className="h-8 w-8 text-blue-500" />
                                <div>
                                  <p className="text-sm text-muted-foreground">
                                    Evaluations
                                  </p>
                                  <p className="text-2xl font-bold">
                                    {userStats.evaluation_count}
                                  </p>
                                  <p className="text-sm text-muted-foreground">
                                    {userStats.accepted_evaluations} accepted
                                  </p>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <Card className="bg-muted/40">
                            <CardHeader className="pb-2">
                              <CardTitle className="text-base">
                                Acceptance Rates
                              </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                              {userStats.contribution_acceptance_score !==
                                undefined && (
                                <div>
                                  <div className="flex justify-between text-sm mb-1">
                                    <span className="text-muted-foreground">
                                      Contribution Acceptance
                                    </span>
                                    <span className="font-medium">
                                      {(
                                        userStats.contribution_acceptance_score *
                                        100
                                      ).toFixed(1)}
                                      %
                                    </span>
                                  </div>
                                  <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
                                    <div
                                      className="h-full bg-blue-500 rounded-full"
                                      style={{
                                        width: `${
                                          userStats.contribution_acceptance_score *
                                          100
                                        }%`,
                                      }}
                                    />
                                  </div>
                                </div>
                              )}

                              {userStats.evaluation_acceptance_score !==
                                undefined && (
                                <div>
                                  <div className="flex justify-between text-sm mb-1">
                                    <span className="text-muted-foreground">
                                      Evaluation Acceptance
                                    </span>
                                    <span className="font-medium">
                                      {(
                                        userStats.evaluation_acceptance_score *
                                        100
                                      ).toFixed(1)}
                                      %
                                    </span>
                                  </div>
                                  <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
                                    <div
                                      className="h-full bg-green-500 rounded-full"
                                      style={{
                                        width: `${
                                          userStats.evaluation_acceptance_score *
                                          100
                                        }%`,
                                      }}
                                    />
                                  </div>
                                </div>
                              )}
                            </CardContent>
                          </Card>

                          <Card className="bg-muted/40">
                            <CardHeader className="pb-2">
                              <CardTitle className="text-base">
                                Task-Specific Metrics
                              </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                              {challengeData.task_type === "transcription" &&
                                userStats.total_hours_speech !== undefined && (
                                  <div className="flex items-center justify-between">
                                    <span className="flex items-center gap-2 text-sm text-muted-foreground">
                                      <Timer className="h-4 w-4" />
                                      Total Hours of Speech
                                    </span>
                                    <span className="font-medium">
                                      {userStats.total_hours_speech.toFixed(1)}{" "}
                                      hours
                                    </span>
                                  </div>
                                )}

                              {challengeData.task_type === "translation" &&
                                userStats.total_sentences_translated !==
                                  undefined && (
                                  <div className="flex items-center justify-between">
                                    <span className="flex items-center gap-2 text-sm text-muted-foreground">
                                      <FileText className="h-4 w-4" />
                                      Total Sentences Translated
                                    </span>
                                    <span className="font-medium">
                                      {userStats.total_sentences_translated.toLocaleString()}
                                    </span>
                                  </div>
                                )}

                              {challengeData.task_type === "annotation" &&
                                userStats.total_tokens_produced !==
                                  undefined && (
                                  <div className="flex items-center justify-between">
                                    <span className="flex items-center gap-2 text-sm text-muted-foreground">
                                      <FileText className="h-4 w-4" />
                                      Total Tokens Produced
                                    </span>
                                    <span className="font-medium">
                                      {userStats.total_tokens_produced.toLocaleString()}
                                    </span>
                                  </div>
                                )}

                              <div className="flex items-center justify-between">
                                <span className="flex items-center gap-2 text-sm text-muted-foreground">
                                  <Activity className="h-4 w-4" />
                                  Last Updated
                                </span>
                                <span className="font-medium">
                                  {safeFormatDate(userStats.updated_at)}
                                </span>
                              </div>
                            </CardContent>
                          </Card>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
            )}
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
              ) : leaderboardData &&
                leaderboardData.items &&
                leaderboardData.items.length > 0 ? (
                <div className="space-y-4">
                  {leaderboardData.items
                    .slice(0, 5)
                    .map((user: LeaderboardEntry, index: number) => (
                      <div
                        key={user.user_id}
                        className="flex items-center justify-between"
                      >
                        <div className="flex items-center gap-3">
                          <div
                            className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium ${
                              index === 0
                                ? "bg-yellow-100 text-yellow-700"
                                : index === 1
                                ? "bg-gray-100 text-gray-700"
                                : index === 2
                                ? "bg-amber-100 text-amber-700"
                                : "bg-muted text-muted-foreground"
                            }`}
                          >
                            {index + 1}
                          </div>
                          <span className="font-medium">
                            {user.username || user.name}
                          </span>
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
                    {challengeData.participant_count || 0}/
                    {challengeData.target_contribution_count || 100}
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
                Join this challenge to start contributing and earn points. You
                can contribute
                {challengeData.task_type === TaskType.TRANSCRIPTION
                  ? " by transcribing audio files"
                  : challengeData.task_type === TaskType.TRANSLATION
                  ? " by translating text"
                  : challengeData.task_type === TaskType.ANNOTATION
                  ? " by annotating content"
                  : " by completing tasks"}
                .
              </p>
              <Button
                className="w-full"
                onClick={handleStartContributing}
                disabled={
                  challengeData.status === ChallengeStatus.COMPLETED ||
                  isJoining ||
                  isLeaving
                }
              >
                {isJoining || isLeaving ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    {joined ? "Leaving..." : "Joining..."}
                  </>
                ) : challengeData.status === ChallengeStatus.COMPLETED ? (
                  "Challenge Completed"
                ) : joined ? (
                  "Continue Contributing"
                ) : (
                  "Join & Start Contributing"
                )}
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
