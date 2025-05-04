import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useUserChallenges } from '@/hooks/challengeHooks/useUserChallenges';
import { format } from 'date-fns';
import { EventType } from '@/types/challenge';

const getEventTypeLabel = (type: EventType): string => {
  switch (type) {
    case EventType.DATA_COLLECTION:
      return 'Data Collection';
    case EventType.SAMPLE_REVIEW:
      return 'Sample Review';
    default:
      return type;
  }
};

const MyChallenges: React.FC = () => {
  const { data: challenges, isLoading } = useUserChallenges();

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (!challenges || challenges.length === 0) {
    return (
      <div className="text-center py-10">
        <h3 className="text-lg font-medium">No challenges yet</h3>
        <p className="text-muted-foreground">You haven't created any challenges.</p>
      </div>
    );
  }

  return (

    <div>
         <div className="mb-8">
        <h1 className="text-3xl font-bold">Welcome to SandBox </h1>
        <p className="text-muted-foreground mt-1">Browse through challenges you're actively participating in</p>
    </div>
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      
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
    </div>
    </div>
  );
};

export default MyChallenges; 