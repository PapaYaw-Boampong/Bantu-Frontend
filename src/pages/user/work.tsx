import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Edit, Trash2, Search, Plus, Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  EventType,
  Challenge,
  ChallengeStatus,
  GetChallenges,
  TaskType,
} from "@/types/challenge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { format } from "date-fns";
import { useUserChallenges } from "@/hooks/challengeHooks/useUserChallenges";
import { useGetCreatedChallenges } from "@/hooks/challengeHooks/useGetCreatedChallenges";
import { useDeleteChallenge } from "@/hooks/challengeHooks/useDeleteChallenge";
import { challengeService } from "@/services/challengeService";
import { useQuery } from "@tanstack/react-query";
import { useQueryClient } from "@tanstack/react-query";
import { useLanguages } from "@/hooks/languageHooks/useLanguages";
import { Language } from "@/types/language";
import { useToast } from '@/components/ui/use-toast';

import { Calendar, Users } from "lucide-react";

export default function YourWork() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState("");
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);
  const [activeFilter, setActiveFilter] = useState<
    "all" | "active" | "upcoming" | "completed"
  >("all");
  const [sortBy, setSortBy] = useState<"newest" | "popular" | "deadline">(
    "newest"
  );
  const [languageFilter, setLanguageFilter] = useState<string | null>(null);
  const [taskTypeFilter, setTaskTypeFilter] = useState<TaskType | null>(null);

  const { data: languages = [], isLoading: isLoadingLanguages } =
    useLanguages();

  // Create filter parameters for the API
  const filterParams: GetChallenges = {
    // Map UI filter values to API status values
    ...(activeFilter === "active" && { status: "active" as ChallengeStatus }),
    ...(activeFilter === "upcoming" && {
      status: "upcoming" as ChallengeStatus,
    }),
    ...(activeFilter === "completed" && {
      status: "completed" as ChallengeStatus,
    }),
    ...(languageFilter && { language_id: languageFilter }),
    ...(taskTypeFilter && { task_type: taskTypeFilter }),
  };
  console.log("Filter Params:", filterParams);

  const { data: challenges = [], isLoading } =
    useGetCreatedChallenges(filterParams);

  const deleteMutation = useDeleteChallenge();
  const queryClient = useQueryClient();

  const filteredChallenges = challenges.filter((challenge) => {
    // Apply search filter client-side
    return challenge.challenge_name
      .toLowerCase()
      .includes(searchQuery.toLowerCase());
  });

  const sortedChallenges = [...filteredChallenges].sort((a, b) => {
    if (sortBy === "newest")
      return (
        new Date(b.created_at || "").getTime() -
        new Date(a.created_at || "").getTime()
      );
    if (sortBy === "popular")
      return (b.participant_count || 0) - (a.participant_count || 0);
    if (sortBy === "deadline")
      return new Date(a.end_date).getTime() - new Date(b.end_date).getTime();
    return 0;
  });

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

  const handleCreateChallenge = () => navigate("/user/create-challenge");

  const handleEditChallenge = (id: string) =>
    navigate(`/user/create-challenge?id=${id}`);

  const handleDeleteChallenge = (challenge: Challenge) => {
    // Prevent deletion of published challenges that haven't ended yet
    if (challenge.is_published && challenge.status === ChallengeStatus.Active) {
      toast({
        title: "Cannot Delete Challenge",
        description:
          "Published challenges that are still active cannot be deleted.",
        variant: "destructive",
      });
      return;
    }

    setConfirmDelete(challenge.id);
  };

  // Generate a background color or pattern when no image is available
  const getBackgroundStyle = (challenge: Challenge) => {
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

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold">Your Work</h1>
          <p className="text-muted-foreground mt-1">
            Manage your challenges and projects
          </p>
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

          <div className="flex gap-2 flex-wrap">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="gap-2">
                  <Filter className="h-4 w-4" />
                  Status:{" "}
                  {activeFilter === "all"
                    ? "All"
                    : activeFilter.charAt(0).toUpperCase() +
                      activeFilter.slice(1)}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => setActiveFilter("all")}>
                  All Challenges
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setActiveFilter("active")}>
                  Active Challenges
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setActiveFilter("upcoming")}>
                  Upcoming Challenges
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setActiveFilter("completed")}>
                  Completed Challenges
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="gap-2">
                  Language:{" "}
                  {languageFilter
                    ? languages.find((l) => l.id === languageFilter)?.name ||
                      "Loading..."
                    : "All"}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => setLanguageFilter(null)}>
                  All Languages
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                {isLoadingLanguages ? (
                  <DropdownMenuItem disabled>
                    Loading languages...
                  </DropdownMenuItem>
                ) : (
                  languages.map((language: Language) => (
                    <DropdownMenuItem
                      key={language.id}
                      onClick={() => setLanguageFilter(language.id)}
                    >
                      {language.name}
                    </DropdownMenuItem>
                  ))
                )}
              </DropdownMenuContent>
            </DropdownMenu>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="gap-2">
                  Task:{" "}
                  {taskTypeFilter ? getTaskTypeLabel(taskTypeFilter) : "All"}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => setTaskTypeFilter(null)}>
                  All Tasks
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                {Object.values(TaskType).map((type) => (
                  <DropdownMenuItem
                    key={type}
                    onClick={() => setTaskTypeFilter(type)}
                  >
                    {getTaskTypeLabel(type)}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="gap-2">
                  Sort:{" "}
                  {sortBy === "newest"
                    ? "Newest"
                    : sortBy === "popular"
                    ? "Most Popular"
                    : "Deadline Soon"}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => setSortBy("newest")}>
                  Newest
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setSortBy("popular")}>
                  Most Popular
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setSortBy("deadline")}>
                  Deadline Soon
                </DropdownMenuItem>
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
                <h3 className="text-lg font-medium">
                  You don't have any challenges yet
                </h3>
                <p className="text-muted-foreground mt-1">
                  Create a challenge to get started
                </p>
                <Button onClick={handleCreateChallenge} className="mt-4">
                  <Plus className="mr-2 h-4 w-4" />
                  Create Your First Challenge
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {sortedChallenges.map((challenge) => (
                  <Card key={challenge.id} className="overflow-hidden">
                    <div className="h-4 bg-primary w-full" />
                    <div className="relative h-32 w-full" style={getBackgroundStyle(challenge)}>
                      {!challenge.image_url && (
                        <span className="text-white font-bold text-xl">
                          {challenge.challenge_name.substring(0, 2).toUpperCase()}
                        </span>
                      )}
                      {challenge.is_published && (
                        <div className="absolute top-2 right-2">
                          <Badge className="bg-green-600">Published</Badge>
                        </div>
                      )}
                    </div>
                    <CardContent className="p-6">
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <h3 className="font-semibold text-lg line-clamp-1">
                            {challenge.challenge_name}
                          </h3>
                          <p className="text-sm text-muted-foreground mt-1">
                            {getEventTypeLabel(challenge.event_type)} •{" "}
                            {getTaskTypeLabel(challenge.task_type)}
                          </p>
                        </div>
                        <Badge
                          variant={challenge.status ? "default" : "secondary"}
                        >
                          {challenge.status ? "Active" : "Ended"}
                        </Badge>
                      </div>

                      <p className="text-sm line-clamp-2 h-10 mb-4">
                        {challenge.description}
                      </p>

                      <div className="grid grid-cols-2 gap-2 text-xs">
                        <div>
                          <p className="text-muted-foreground">Start Date</p>
                          <p>
                            {format(
                              new Date(challenge.start_date),
                              "MMM d, yyyy"
                            )}
                          </p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">End Date</p>
                          <p>
                            {format(
                              new Date(challenge.end_date),
                              "MMM d, yyyy"
                            )}
                          </p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Participants</p>
                          <p>{challenge.participant_count || 0}</p>
                        </div>
                      </div>
                    </CardContent>
                    <CardFooter className="px-6 py-4 bg-muted/50 flex justify-between">
                      <Button
                        variant="outline"
                        size="sm"
                        className="w-[48%]"
                        onClick={() => handleEditChallenge(challenge.id)}
                      >
                        <Edit className="mr-2 h-4 w-4" />
                        Edit
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="w-[48%] text-destructive hover:text-destructive"
                        onClick={() => handleDeleteChallenge(challenge)}
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
                        Delete
                      </Button>
                    </CardFooter>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          {/* <TabsContent value="list" className="w-full">
            <div className="text-center py-8">
              <p>Switch to Grid View for a more visual experience</p>
            </div>
          </TabsContent> */}

          <TabsContent value="list" className="w-full">
            {isLoading ? (
              <div className="flex justify-center py-12">
                <p>Loading your challenges...</p>
              </div>
            ) : sortedChallenges.length === 0 ? (
              <div className="text-center py-12">
                <h3 className="text-lg font-medium">
                  You don't have any challenges yet
                </h3>
                <p className="text-muted-foreground mt-1">
                  Create a challenge to get started
                </p>
                <Button onClick={handleCreateChallenge} className="mt-4">
                  <Plus className="mr-2 h-4 w-4" />
                  Create Your First Challenge
                </Button>
              </div>
            ) : (
              <div className="space-y-6">
                {sortedChallenges.map((challenge) => (
                  <Card
                    key={challenge.id}
                    className="overflow-hidden shadow-md hover:shadow-lg transition-shadow"
                  >
                    <div className="p-6 flex flex-col md:flex-row md:justify-between md:items-start gap-2">
                      <div>
                        <h3 className="text-xl font-bold">
                          {challenge.challenge_name}
                        </h3>
                        <p className="text-sm text-muted-foreground mt-1">
                          {getEventTypeLabel(challenge.event_type)} •{" "}
                          {getTaskTypeLabel(challenge.task_type)}
                        </p>
                      </div>
                      <Badge
                        variant={challenge.status ? "default" : "secondary"}
                      >
                        {challenge.status ? "Active" : "Ended"}
                      </Badge>
                    </div>

                    <CardContent className="px-6 pb-4">
                      <p className="text-sm leading-relaxed text-muted-foreground line-clamp-3">
                        {challenge.description}
                      </p>
                    </CardContent>

              

                    <CardFooter className="px-6 py-4 flex flex-col md:flex-row md:justify-between md:items-center gap-4">
                      {/* Metadata */}
                      <div className="flex flex-wrap items-center gap-6 text-xs text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Calendar className="h-4 w-4" />
                          <span>
                            Start:{" "}
                            {format(
                              new Date(challenge.start_date),
                              "MMM d, yyyy"
                            )}
                          </span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Calendar className="h-4 w-4" />
                          <span>
                            End:{" "}
                            {format(
                              new Date(challenge.end_date),
                              "MMM d, yyyy"
                            )}
                          </span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Users className="h-4 w-4" />
                          <span>
                            {challenge.participant_count || 0} Participants
                          </span>
                        </div>
                        {challenge.is_published && (
                          <Badge className="bg-green-600">Published</Badge>
                        )}
                      </div>

                      {/* Actions */}
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEditChallenge(challenge.id)}
                        >
                          <Edit className="mr-2 h-4 w-4" />
                          Edit
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="text-destructive hover:text-destructive"
                          onClick={() => handleDeleteChallenge(challenge)}
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          Delete
                        </Button>
                      </div>
                    </CardFooter>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>

      <Dialog
        open={!!confirmDelete}
        onOpenChange={(open) => !open && setConfirmDelete(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Challenge</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this challenge? This action cannot
              be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setConfirmDelete(null)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() => {
                if (confirmDelete) {
                  deleteMutation.mutate(confirmDelete, {
                    onSuccess: () => {
                      toast({
                        title: "Challenge Deleted",
                        description:
                          "Your challenge has been permanently deleted.",
                      });
                      setConfirmDelete(null);
                      queryClient.invalidateQueries({
                        queryKey: ["created-challenges"],
                      });
                    },
                    onError: (error) => {
                      toast({
                        title: "Error",
                        description:
                          "Failed to delete challenge. Please try again.",
                        variant: "destructive",
                      });
                      setConfirmDelete(null);
                    },
                  });
                }
              }}
            >
              {deleteMutation.isPending ? "Deleting..." : "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
