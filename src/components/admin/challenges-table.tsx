"use client";
import { useState } from 'react';
import { MoreHorizontal, Edit, Trash2, Award } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import { useToast } from '@/hooks/use-toast';
import { useChallenges } from '@/hooks/challengeHooks/useChallenges';
import { Challenge, EventType } from '@/types/challenge';

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Badge } from '@/components/ui/badge';

interface ChallengesTableProps {
  challenges: Challenge[];
  loading: boolean;
}

export function ChallengesTable({ challenges, loading }: ChallengesTableProps) {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { endChallenge } = useChallenges();
  const [selectedChallenge, setSelectedChallenge] = useState<Challenge | null>(null);
  const [showEndDialog, setShowEndDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

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

  const handleEndChallenge = async () => {
    if (!selectedChallenge) return;
    
    try {
      await endChallenge(selectedChallenge.id);
      toast({
        title: 'Challenge Ended',
        description: `${selectedChallenge.challenge_name} has been ended successfully.`,
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to end the challenge. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setShowEndDialog(false);
      setSelectedChallenge(null);
    }
  };

  const handleDeleteChallenge = () => {
    // This would connect to the backend in a real implementation
    toast({
      title: 'Not Implemented',
      description: 'Challenge deletion is not implemented in this demo.',
    });
    setShowDeleteDialog(false);
    setSelectedChallenge(null);
  };

  const confirmEndChallenge = (challenge: Challenge) => {
    setSelectedChallenge(challenge);
    setShowEndDialog(true);
  };

  const confirmDeleteChallenge = (challenge: Challenge) => {
    setSelectedChallenge(challenge);
    setShowDeleteDialog(true);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <p className="text-muted-foreground">Loading challenges...</p>
      </div>
    );
  }

  if (!challenges || challenges.length === 0) {
    return (
      <div className="flex justify-center items-center h-64 border rounded-lg">
        <div className="text-center">
          <p className="text-muted-foreground mb-4">No challenges found</p>
          <Button onClick={() => navigate('/user/create-challenge')}>Create Challenge</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Challenge Name</TableHead>
            <TableHead>Type</TableHead>
            <TableHead>Start Date</TableHead>
            <TableHead>End Date</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Participants</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {challenges.map((challenge) => (
            <TableRow key={challenge.id}>
              <TableCell className="font-medium">{challenge.challenge_name}</TableCell>
              <TableCell>
                <Badge variant="outline">{getEventTypeLabel(challenge.event_type)}</Badge>
              </TableCell>
              <TableCell>{format(new Date(challenge.start_date), 'MMM d, yyyy')}</TableCell>
              <TableCell>{format(new Date(challenge.end_date), 'MMM d, yyyy')}</TableCell>
              <TableCell>
                <Badge 
                  variant={challenge.status ? "default" : "secondary"}
                  className={challenge.status ? "bg-green-600" : ""}
                >
                  {challenge.status ? 'Active' : 'Ended'}
                </Badge>
              </TableCell>
              <TableCell>{challenge.participant_count || 0}</TableCell>
              <TableCell className="text-right">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon">
                      <MoreHorizontal className="h-4 w-4" />
                      <span className="sr-only">Open menu</span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => navigate(`/user/challenge/${challenge.id}`)}>
                      View Details
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => navigate(`/user/create-challenge?id=${challenge.id}`)}>
                      <Edit className="mr-2 h-4 w-4" />
                      Edit Challenge
                    </DropdownMenuItem>
                    {challenge.status && (
                      <DropdownMenuItem onClick={() => confirmEndChallenge(challenge)}>
                        <Award className="mr-2 h-4 w-4" />
                        End Challenge
                      </DropdownMenuItem>
                    )}
                    <DropdownMenuItem 
                      onClick={() => confirmDeleteChallenge(challenge)}
                      className="text-red-600"
                    >
                      <Trash2 className="mr-2 h-4 w-4" />
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      {/* End Challenge Confirmation Dialog */}
      <AlertDialog open={showEndDialog} onOpenChange={setShowEndDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>End Challenge</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to end "{selectedChallenge?.challenge_name}"? This will mark the challenge as completed and no further contributions will be accepted.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleEndChallenge}>
              End Challenge
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Delete Challenge Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Challenge</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{selectedChallenge?.challenge_name}"? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteChallenge} className="bg-red-600">
              Delete Challenge
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
} 