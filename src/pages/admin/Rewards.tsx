import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, Trophy, Award, DollarSign, CheckCircle2, Clock, Loader2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useToast } from "@/components/ui/use-toast";
import { 
  useMilestones, 
  useCreateMilestone, 
  useUpdateMilestone,
  usePendingRewardClaims,
  useProcessRewardClaim
} from "@/hooks/rewardHooks";
import { RewardType } from "@/types/rewards";
import { Skeleton } from "@/components/ui/skeleton";

export default function Rewards() {
  const { toast } = useToast();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newAward, setNewAward] = useState({
    name: "",
    description: "",
    reward_type: RewardType.BADGE,
    reward_value: {},
    required_actions: 100
  });

  // Fetch milestones
  const { 
    data: milestones = [], 
    isLoading: isMilestonesLoading
  } = useMilestones();

  // Fetch pending reward claims
  const {
    data: rewardClaims = [],
    isLoading: isClaimsLoading
  } = usePendingRewardClaims();

  // Mutations
  const createMilestoneMutation = useCreateMilestone();
  const processClaimMutation = useProcessRewardClaim();

  const handleAddAward = () => {
    if (!newAward.name || !newAward.description) {
      toast({
        title: "Missing Information",
        description: "Please provide both a name and description for the award.",
        variant: "destructive",
      });
      return;
    }

    // Create milestone data
    const milestoneData = {
      name: newAward.name,
      description: newAward.description,
      reward_type: newAward.reward_type,
      reward_value: newAward.reward_value,
      required_actions: newAward.required_actions
    };

    createMilestoneMutation.mutate(milestoneData, {
      onSuccess: () => {
        toast({
          title: "Success",
          description: `Milestone "${newAward.name}" has been created.`,
        });
        setNewAward({
          name: "",
          description: "",
          reward_type: RewardType.BADGE,
          reward_value: {},
          required_actions: 100
        });
        setIsDialogOpen(false);
      },
      onError: (error: any) => {
        toast({
          title: "Error",
          description: error.message || "Failed to create milestone.",
          variant: "destructive",
        });
      }
    });
  };

  const handleProcessClaim = (claimId: string, approved: boolean) => {
    processClaimMutation.mutate(
      { claimId, approved },
      {
        onSuccess: () => {
          toast({
            title: "Success",
            description: `Claim has been ${approved ? 'approved' : 'rejected'}.`,
          });
        },
        onError: (error: any) => {
          toast({
            title: "Error",
            description: error.message || `Failed to ${approved ? 'approve' : 'reject'} claim.`,
            variant: "destructive",
          });
        }
      }
    );
  };

  // Show real data with fallback to mock data when empty
  const displayMilestones = milestones.length > 0 
    ? milestones
    : [
        {
          id: "1",
          name: "Transcription Wizard",
          description: "Awarded for completing 1000 transcriptions",
          reward_type: RewardType.BADGE,
          reward_value: { badge_name: "Transcription Wizard" },
          required_actions: 1000
        },
        {
          id: "2",
          name: "Translation Guru",
          description: "Awarded for completing 500 translations",
          reward_type: RewardType.BADGE,
          reward_value: { badge_name: "Translation Guru" },
          required_actions: 500
        }
      ];

  // Show real claims with fallback to mock data when empty
  const displayClaims = rewardClaims.length > 0
    ? rewardClaims
    : [
        {
          id: "1",
          user: { fullname: "John Doe" },
          challenge: { name: "March Challenge" },
          amount: 50,
          status: "pending",
          created_at: "2024-03-20",
          payment_details: {
            provider: "MTN",
            number: "0241234567"
          }
        },
        {
          id: "2",
          user: { fullname: "Jane Smith" },
          challenge: { name: "Weekly Top Contributor" },
          amount: 25,
          status: "paid",
          created_at: "2024-03-15",
          payment_details: {
            provider: "Vodafone",
            number: "0207654321"
          }
        }
      ];

  return (
    <div className="container mx-auto py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Reward Management</h1>
        <p className="text-muted-foreground">Manage milestone awards and process reward claims</p>
      </div>

      <Tabs defaultValue="awards" className="space-y-4">
        <TabsList>
          <TabsTrigger value="awards">
            <Award className="mr-2 h-4 w-4" />
            Milestone Awards
          </TabsTrigger>
          <TabsTrigger value="claims">
            <DollarSign className="mr-2 h-4 w-4" />
            Reward Claims
          </TabsTrigger>
        </TabsList>

        <TabsContent value="awards" className="space-y-4">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-semibold">Milestone Awards</h2>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="mr-2 h-4 w-4" />
                  Add Award
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Create New Award</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Award Name</Label>
                    <Input
                      id="name"
                      placeholder="e.g., Transcription Wizard"
                      value={newAward.name}
                      onChange={(e) => setNewAward({
                        ...newAward,
                        name: e.target.value
                      })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="description">Description</Label>
                    <Input
                      id="description"
                      placeholder="Describe the award and its significance"
                      value={newAward.description}
                      onChange={(e) => setNewAward({
                        ...newAward,
                        description: e.target.value
                      })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="requirements">Required Actions</Label>
                    <Input
                      id="requirements"
                      type="number"
                      placeholder="e.g., 1000"
                      value={newAward.required_actions.toString()}
                      onChange={(e) => setNewAward({
                        ...newAward,
                        required_actions: parseInt(e.target.value) || 0
                      })}
                    />
                  </div>
                  <Button 
                    className="w-full"
                    onClick={handleAddAward}
                    disabled={createMilestoneMutation.isPending}
                  >
                    {createMilestoneMutation.isPending ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Creating...
                      </>
                    ) : (
                      "Create Award"
                    )}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          <Card>
            <CardContent className="p-0">
              {isMilestonesLoading ? (
                <div className="p-4 space-y-4">
                  <Skeleton className="h-12 w-full" />
                  <Skeleton className="h-12 w-full" />
                  <Skeleton className="h-12 w-full" />
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Description</TableHead>
                      <TableHead>Requirements</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {displayMilestones.map((award) => (
                      <TableRow key={award.id}>
                        <TableCell className="font-medium">{award.name}</TableCell>
                        <TableCell>{award.description}</TableCell>
                        <TableCell>{award.required_actions} actions</TableCell>
                        <TableCell>
                          <Badge variant={award? "default" : "secondary"}>
                            {award ? "active" : "draft"}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <Button variant="ghost" size="sm">
                            Edit
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="claims" className="space-y-4">
          <Card>
            <CardContent className="p-0">
              {isClaimsLoading ? (
                <div className="p-4 space-y-4">
                  <Skeleton className="h-12 w-full" />
                  <Skeleton className="h-12 w-full" />
                  <Skeleton className="h-12 w-full" />
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>User</TableHead>
                      <TableHead>Challenge</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Payment Details</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {displayClaims.map((claim) => (
                      <TableRow key={claim.id}>
                        <TableCell className="font-medium">{claim.user?.fullname || claim.user}</TableCell>
                        <TableCell>{claim.challenge?.name || claim.challenge}</TableCell>
                        <TableCell>${claim.amount}</TableCell>
                        <TableCell>
                          {claim.payment_details?.provider}: {claim.payment_details?.number}
                        </TableCell>
                        <TableCell>
                          <Badge variant={claim.status === "paid" ? "default" : "secondary"}>
                            {claim.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          {claim.status === "pending" && (
                            <div className="flex gap-2 justify-end">
                              <Button 
                                variant="ghost" 
                                size="sm"
                                onClick={() => handleProcessClaim(claim.id, true)}
                                disabled={processClaimMutation.isPending}
                              >
                                {processClaimMutation.isPending ? (
                                  <Loader2 className="h-4 w-4 animate-spin" />
                                ) : "Approve"}
                              </Button>
                              <Button 
                                variant="ghost" 
                                size="sm"
                                className="text-destructive"
                                onClick={() => handleProcessClaim(claim.id, false)}
                                disabled={processClaimMutation.isPending}
                              >
                                Reject
                              </Button>
                            </div>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
