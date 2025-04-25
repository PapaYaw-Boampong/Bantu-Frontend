import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Filter, Users, Calendar, Trophy, ArrowRight, Bookmark, BookmarkCheck } from 'lucide-react';
import { useChallenges } from '@/hooks/challengeHooks/useChallenges';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { EventType, Challenge } from '@/types/challenge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { format } from 'date-fns';

export default function PublicChallenges() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { data: challenges = [], isLoading: loading } = useChallenges();

  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<EventType | 'all'>('all');
  const [sortBy, setSortBy] = useState<'newest' | 'popular' | 'ending-soon'>('newest');
  const [joinedChallenges, setJoinedChallenges] = useState<string[]>([]);
  
  useEffect(() => {
    const mockJoinedChallenges = localStorage.getItem('joinedChallenges');
    if (mockJoinedChallenges) {
      setJoinedChallenges(JSON.parse(mockJoinedChallenges));
    }
  }, []);
  
  // Filter challenges based on search and type filter
  const filteredChallenges = challenges.filter(challenge => {
    const matchesSearch = challenge.challenge_name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                         (challenge.description && challenge.description.toLowerCase().includes(searchQuery.toLowerCase()));
    
    if (typeFilter === 'all') return matchesSearch;
    return matchesSearch && challenge.event_type === typeFilter;
  });

  // Sort challenges
  const sortedChallenges = [...filteredChallenges].sort((a, b) => {
    if (sortBy === 'newest') {
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    }
    if (sortBy === 'popular') {
      return (b.participant_count || 0) - (a.participant_count || 0);
    }
    if (sortBy === 'ending-soon') {
      return new Date(a.end_date).getTime() - new Date(b.end_date).getTime();
    }
    return 0;
  });

  const getEventTypeLabel = (type: EventType) => {
    switch (type) {
      case EventType.SAMPLE_REVIEW:
        return 'Evalution';
      case EventType.DATA_COLLECTION:
        return 'Data Collection';
      default:
        return 'Unknown';
    }
  };

  // const handleJoinChallenge = (challenge: Challenge) => {
  //   // In a real app, call an API to join the challenge
  //   if (joinedChallenges.includes(challenge.id)) {
  //     const updated = joinedChallenges.filter(id => id !== challenge.id);
  //     setJoinedChallenges(updated);
  //     localStorage.setItem('joinedChallenges', JSON.stringify(updated));
      
  //     toast({
  //       title: 'Left Challenge',
  //       description: `You have left "${challenge.challenge_name}"`,
  //     });
  //   } else {
  //     const updated = [...joinedChallenges, challenge.id];
  //     setJoinedChallenges(updated);
  //     localStorage.setItem('joinedChallenges', JSON.stringify(updated));
      
  //     toast({
  //       title: 'Joined Challenge',
  //       description: `You have joined "${challenge.challenge_name}"`,
  //     });
  //   }
  // };

  const handleViewChallenge = (challengeId: string) => {
    navigate(`/user/challenge/${challengeId}`);
  };

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Public Challenges</h1>
        <p className="text-muted-foreground mt-1">Browse and join active challenges</p>
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
                  {typeFilter === 'all' ? 'All Types' : getEventTypeLabel(typeFilter as EventType)}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => setTypeFilter('all')}>All Types</DropdownMenuItem>
                <DropdownMenuItem onClick={() => setTypeFilter(EventType.DATA_COLLECTION)}>Data_COLLECTION</DropdownMenuItem>
                <DropdownMenuItem onClick={() => setTypeFilter(EventType.SAMPLE_REVIEW)}>Sample Evalution </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="gap-2">
                  Sort: {sortBy === 'newest' ? 'Newest' : sortBy === 'popular' ? 'Popular' : 'Ending Soon'}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => setSortBy('newest')}>Newest</DropdownMenuItem>
                <DropdownMenuItem onClick={() => setSortBy('popular')}>Popular</DropdownMenuItem>
                <DropdownMenuItem onClick={() => setSortBy('ending-soon')}>Ending Soon</DropdownMenuItem>
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
            {loading ? (
              <div className="flex justify-center py-12">
                <p>Loading challenges...</p>
              </div>
            ) : sortedChallenges.length === 0 ? (
              <div className="text-center py-12">
                <h3 className="text-lg font-medium">No challenges found</h3>
                <p className="text-muted-foreground mt-1">Try adjusting your filters or check back later</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {sortedChallenges.map((challenge) => (
                  <Card key={challenge.id} className="overflow-hidden flex flex-col">
                    <div className="h-2 bg-primary w-full" />
                    <CardContent className="p-6 flex-grow">
                      <div className="flex justify-between items-start mb-4">
                        <Badge variant="outline">
                          {getEventTypeLabel(challenge.event_type)}
                        </Badge>
                        <div className="flex items-center gap-1 text-sm text-muted-foreground">
                          <Users className="h-4 w-4" />
                          <span>{challenge.participant_count || 0}</span>
                        </div>
                      </div>
                      
                      <h3 className="font-semibold text-lg mb-2">{challenge.challenge_name}</h3>
                      <p className="text-sm text-muted-foreground mb-4 line-clamp-3">
                        {challenge.description}
                      </p>
                      
                      <div className="flex items-center gap-1 text-sm text-muted-foreground mt-auto">
                        <Calendar className="h-4 w-4" />
                        <span>Ends: {format(new Date(challenge.end_date), 'MMM d, yyyy')}</span>
                      </div>
                    </CardContent>
                    <CardFooter className="px-6 py-4 bg-muted/50 flex justify-between">
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="gap-2"
                        onClick={() => handleViewChallenge(challenge.id)}
                      >
                        View Details
                        <ArrowRight className="h-4 w-4" />
                      </Button>
                      {/* <Button 
                        variant={joinedChallenges.includes(challenge.id) ? "default" : "outline"}
                        size="sm"
                        className="gap-2"
                        onClick={() => handleJoinChallenge(challenge)}
                      >
                        {joinedChallenges.includes(challenge.id) ? (
                          <>
                            <BookmarkCheck className="h-4 w-4" />
                            Joined
                          </>
                        ) : (
                          <>
                            <Bookmark className="h-4 w-4" />
                            Join
                          </>
                        )}
                      </Button> */}
                    </CardFooter>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="list" className="w-full">
            {loading ? (
              <div className="flex justify-center py-12">
                <p>Loading challenges...</p>
              </div>
            ) : sortedChallenges.length === 0 ? (
              <div className="text-center py-12">
                <h3 className="text-lg font-medium">No challenges found</h3>
                <p className="text-muted-foreground mt-1">Try adjusting your filters or check back later</p>
              </div>
            ) : (
              <div className="border rounded-md overflow-hidden divide-y">
                {sortedChallenges.map((challenge) => (
                  <div key={challenge.id} className="p-4 bg-card hover:bg-accent/5 transition-colors">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-semibold">{challenge.challenge_name}</h3>
                          <Badge variant="outline" className="h-5">
                            {getEventTypeLabel(challenge.event_type)}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground line-clamp-1">{challenge.description}</p>
                      </div>
                      
                      <div className="flex items-center gap-4 ml-auto">
                        <div className="flex flex-col items-center">
                          <div className="flex items-center gap-1 text-sm">
                            <Users className="h-4 w-4" />
                            <span>{challenge.participant_count || 0}</span>
                          </div>
                          <span className="text-xs text-muted-foreground">Participants</span>
                        </div>
                        
                        {/* <div className="flex flex-col items-center">
                          <div className="flex items-center gap-1 text-sm">
                            <Trophy className="h-4 w-4" />
                            <span>{challenge.contribution_count || 0}</span>
                          </div>
                          <span className="text-xs text-muted-foreground">Contributions</span>
                        </div>
                         */}
                        <div className="flex items-center gap-2">
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="gap-1"
                            onClick={() => handleViewChallenge(challenge.id)}
                          >
                            Details
                          </Button>
                          {/* <Button 
                            variant={joinedChallenges.includes(challenge.id) ? "default" : "outline"}
                            size="sm"
                            className="gap-1 min-w-[80px]"
                            onClick={() => handleJoinChallenge(challenge)}
                          >
                            {joinedChallenges.includes(challenge.id) ? (
                              <>
                                <BookmarkCheck className="h-4 w-4" />
                                Joined
                              </>
                            ) : (
                              <>
                                <Bookmark className="h-4 w-4" />
                                Join
                              </>
                            )}
                          </Button> */}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
} 