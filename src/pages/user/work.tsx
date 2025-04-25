import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Edit, Trash2, Search, Plus, Filter } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { EventType, Challenge } from '@/types/challenge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { format } from 'date-fns';
import { useUserChallenges } from '@/hooks/challengeHooks/useUserChallenges';
import { useDeleteChallenge } from '@/hooks/challengeHooks/useDeleteChallenge';

export default function YourWork() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);
  const [activeFilter, setActiveFilter] = useState<'all' | 'active' | 'upcoming' | 'completed'>('all');
  const [sortBy, setSortBy] = useState<'newest' | 'popular' | 'deadline'>('newest');

  const { data: challenges = [], isLoading } = useUserChallenges();
  const deleteMutation = useDeleteChallenge();

  const filteredChallenges = challenges.filter(challenge => {
    const matchesSearch = challenge.challenge_name
      .toLowerCase()
      .includes(searchQuery.toLowerCase());
  
    // 'all' means no status filter
    if (activeFilter === 'all') return matchesSearch;

    // Normalize both challenge status and activeFilter to lowercase for comparison
    const challengeStatus = challenge.status.toLowerCase(); 
    const filterStatus = activeFilter.toLowerCase(); // Normalize activeFilter to lowercase


    // Match challenge.status (e.g., 'active', 'draft', 'ended') with selected filter
    return matchesSearch && challengeStatus === filterStatus;
  });
  

  const sortedChallenges = [...filteredChallenges].sort((a, b) => {
    if (sortBy === 'newest') return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    if (sortBy === 'popular') return (b.participant_count || 0) - (a.participant_count || 0);
    if (sortBy === 'deadline') return new Date(a.end_date).getTime() - new Date(b.end_date).getTime();
    return 0;
  });

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

  const handleCreateChallenge = () => navigate('/user/create-challenge');
  const handleEditChallenge = (id: string) => navigate(`/user/edit-challenge/${id}`);

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold">Your Work</h1>
          <p className="text-muted-foreground mt-1">Manage your challenges and projects</p>
        </div>
        <Button onClick={handleCreateChallenge} className="mt-4 sm:mt-0">
          <Plus className="mr-2 h-4 w-4" />
          Create Challenge
        </Button>
      </div>

      <div className="grid gap-6">
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
          <div className="relative flex-1">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search challenges..."
              className="pl-8"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <div className="flex gap-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="gap-2">
                  <Filter className="h-4 w-4" />
                  Filter
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => setActiveFilter('all')}>All Challenges</DropdownMenuItem>
                <DropdownMenuItem onClick={() => setActiveFilter('active')}>Upcoming</DropdownMenuItem>
                <DropdownMenuItem onClick={() => setActiveFilter('upcoming')}>Active Only</DropdownMenuItem>
                <DropdownMenuItem onClick={() => setActiveFilter('completed')}>Ended Only</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="gap-2">
                  Sort: {sortBy === 'newest' ? 'Newest' : sortBy === 'popular' ? 'Most Popular' : 'Deadline Soon'}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => setSortBy('newest')}>Newest</DropdownMenuItem>
                <DropdownMenuItem onClick={() => setSortBy('popular')}>Most Popular</DropdownMenuItem>
                <DropdownMenuItem onClick={() => setSortBy('deadline')}>Deadline Soon</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        <Tabs defaultValue="grid" className="w-full">
          <TabsList className="mb-4">
            <TabsTrigger value="grid">Grid View</TabsTrigger>
            <TabsTrigger value="list">List View</TabsTrigger>
          </TabsList>

          <TabsContent value="grid" className="w-full">
            {isLoading ? (
              <div className="flex justify-center py-12">
                <p>Loading your challenges...</p>
              </div>
            ) : sortedChallenges.length === 0 ? (
              <div className="text-center py-12">
                <h3 className="text-lg font-medium">You don't have any challenges yet</h3>
                <p className="text-muted-foreground mt-1">Create a challenge to get started</p>
                <Button onClick={handleCreateChallenge} className="mt-4">
                  <Plus className="mr-2 h-4 w-4" />
                  Create Your First Challenge
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {sortedChallenges.map((challenge) => (
                  <Card key={challenge.id} className="overflow-hidden">
                    <div className="h-3 bg-primary w-full" />
                    <CardContent className="p-6">
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <h3 className="font-semibold text-lg line-clamp-1">{challenge.challenge_name}</h3>
                          <p className="text-sm text-muted-foreground mt-1">{getEventTypeLabel(challenge.event_type)}</p>
                        </div>
                        <Badge variant={challenge.status ? "default" : "secondary"}>
                          {challenge.status? "Active" : "Ended"}
                        </Badge>
                      </div>

                      <p className="text-sm line-clamp-2 h-10 mb-4">{challenge.description}</p>

                      <div className="grid grid-cols-2 gap-2 text-xs">
                        <div>
                          <p className="text-muted-foreground">Start Date</p>
                          <p>{format(new Date(challenge.start_date), 'MMM d, yyyy')}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">End Date</p>
                          <p>{format(new Date(challenge.end_date), 'MMM d, yyyy')}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Participants</p>
                          <p>{challenge.participant_count || 0}</p>
                        </div>
                      </div>
                    </CardContent>
                    <CardFooter className="px-6 py-4 bg-muted/50 flex justify-between">
                      <Button variant="outline" size="sm" className="w-[48%]" onClick={() => handleEditChallenge(challenge.id)}>
                        <Edit className="mr-2 h-4 w-4" />
                        Edit
                      </Button>
                      <Dialog open={confirmDelete === challenge.id} onOpenChange={(open) => !open && setConfirmDelete(null)}>
                        <DialogTrigger asChild>
                          <Button
                            variant="outline"
                            size="sm"
                            className="w-[48%] text-destructive hover:text-destructive"
                            onClick={() => setConfirmDelete(challenge.id)}
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Delete
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Are you sure you want to delete this challenge?</DialogTitle>
                            <DialogDescription>
                              This action cannot be undone. This will permanently delete the challenge and all associated data.
                            </DialogDescription>
                          </DialogHeader>
                          <DialogFooter>
                            <Button variant="outline" onClick={() => setConfirmDelete(null)}>
                              Cancel
                            </Button>
                            <Button
                              variant="destructive"
                              onClick={() => {
                                deleteMutation.mutate(challenge.id);
                                setConfirmDelete(null);
                              }}
                            >
                              Delete
                            </Button>
                          </DialogFooter>
                        </DialogContent>
                      </Dialog>
                    </CardFooter>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
