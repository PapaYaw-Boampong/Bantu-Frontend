import React from "react";
import {
  Card,
  CardFooter,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {  Users, Calendar, ArrowRight} from 'lucide-react';
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useUserChallenges } from "@/hooks/challengeHooks/useUserChallenges";
import { format } from "date-fns";
import { EventType, TaskType, Challenge, GetChallenges, ChallengeSummary } from '@/types/challenge';

const getEventTypeLabel = (type: EventType): string => {
  switch (type) {
    case EventType.DATA_COLLECTION:
      return "Data Collection";
    case EventType.SAMPLE_REVIEW:
      return "Sample Review";
    default:
      return type;
  }
};

const MyChallenges: React.FC = () => {
  const { data: challenges, isLoading } = useUserChallenges();
  const navigate = useNavigate();

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (!challenges || challenges.length === 0) {
    return (
      <div className="text-center py-10 gap-8">
        <h1 className="text-lg font-medium">No challenges yet</h1>
        <p className="text-muted-foreground">
          You haven't joined any challenges yet.
        </p>
        <Button className="mt-16" onClick={() => navigate("/user/challenges")}>
          Join Some Public Challenges : |
        </Button>
      </div>
    );
  }

  // Generate a background color or pattern when no image is available
  const getBackgroundStyle = (challenge: Challenge | ChallengeSummary) => {
    if (challenge.image_url) {
      return {
        backgroundImage: `url(${challenge.image_url})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      };
    } else {
      // Generate a color based on the challenge name
      const hash = challenge.challenge_name.split('').reduce((acc: number, char: string) => {
        return char.charCodeAt(0) + ((acc << 5) - acc);
      }, 0);
      const h = Math.abs(hash % 360);
      const s = 70 + (hash % 20); // Between 70-90
      const l = 60 + (hash % 15); // Between 60-75
      
      return {
        background: `hsl(${h}, ${s}%, ${l}%)`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      };
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

  const handleViewChallenge = (challengeId: string) => {
    navigate(`/user/challenge/${challengeId}`);
  };

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Welcome to SandBox </h1>
        <p className="text-muted-foreground mt-1">
          Browse through challenges you're actively participating in
        </p>
      </div>
      {/* <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      
      {challenges.map((challenge) => (
        <Card key={challenge.id} className="overflow-hidden">
          <div className="relative h-48 w-full">
            <img
              src={challenge.image_url}
              alt={challenge.challenge_name}
              className="w-full h-full object-cover"
            />
          </div>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-xl">{challenge.challenge_name}</CardTitle>
              <Badge variant={challenge.status === 'active' ? 'default' : 'secondary'}>
                {challenge.status}
              </Badge>
            </div>
            <CardDescription>
              {getEventTypeLabel(challenge.event_type)} • {challenge.participant_count} participants
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">{challenge.description}</p>
            <div className="flex flex-col gap-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Start Date:</span>
                <span>{format(new Date(challenge.start_date), 'MMM d, yyyy')}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">End Date:</span>
                <span>{format(new Date(challenge.end_date), 'MMM d, yyyy')}</span>
              </div>
            </div>
            <Button className="w-full mt-4">View Challenge</Button>
          </CardContent>
        </Card>
      ))}
    </div> */}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {challenges.map((challenge) => (
          <Card key={challenge.id} className="overflow-hidden flex flex-col">
            <div className="h-2 bg-primary w-full" />
            <div
              className="relative h-48 w-full"
              style={getBackgroundStyle(challenge)}
            >
              {!challenge.image_url && (
                <span className="text-white font-bold text-xl">
                  {challenge.challenge_name.substring(0, 2).toUpperCase()}
                </span>
              )}
            </div>
            <CardContent className="p-6 flex-grow">
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center gap-2 flex-wrap">
                  <Badge variant="outline">
                    {getEventTypeLabel(challenge.event_type)}
                  </Badge>
                  <Badge variant="outline" className="bg-muted/60">
                    {getTaskTypeLabel(challenge.task_type)}
                  </Badge>
                </div>
                <div className="flex items-center gap-1 text-sm text-muted-foreground">
                  <Users className="h-4 w-4" />
                  <span>{challenge.participant_count || 0}</span>
                </div>
              </div>

              <h3 className="font-semibold text-lg mb-2">
                {challenge.challenge_name}
              </h3>
              <p className="text-sm text-muted-foreground mb-4 line-clamp-3">
                {challenge.description}
              </p>

              <div className="flex items-center gap-1 text-sm text-muted-foreground mt-auto">
                <Calendar className="h-4 w-4" />
                <span>
                  Ends: {format(new Date(challenge.end_date), "MMM d, yyyy")}
                </span>
              </div>
            </CardContent>
            <CardFooter className="px-6 py-4 bg-muted/50 flex justify-between">
              <Button
                variant="ghost"
                size="sm"
                className="gap-2"
                onClick={() => handleViewChallenge(challenge.id)}
              >
                Jump In 
                <ArrowRight className="h-4 w-4" />
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default MyChallenges;
