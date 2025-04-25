import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, Trophy, Award, DollarSign, CheckCircle2, Clock } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

// Mock data - replace with actual API calls
const mockMilestoneAwards = [
  {
    id: 1,
    name: "Transcription Wizard",
    description: "Awarded for completing 1000 transcriptions",
    type: "badge",
    requirements: "1000 transcriptions",
    status: "active"
  },
  {
    id: 2,
    name: "Translation Guru",
    description: "Awarded for completing 500 translations",
    type: "badge",
    requirements: "500 translations",
    status: "active"
  },
  {
    id: 3,
    name: "Community Champion",
    description: "Awarded for helping 50 community members",
    type: "badge",
    requirements: "50 community helps",
    status: "draft"
  }
];

const mockRewardClaims = [
  {
    id: 1,
    user: "John Doe",
    challenge: "March Challenge",
    amount: 50,
    status: "pending",
    date: "2024-03-20",
    paymentDetails: {
      provider: "MTN",
      number: "0241234567"
    }
  },
  {
    id: 2,
    user: "Jane Smith",
    challenge: "Weekly Top Contributor",
    amount: 25,
    status: "paid",
    date: "2024-03-15",
    paymentDetails: {
      provider: "Vodafone",
      number: "0207654321"
    }
  }
];

export default function Rewards() {
  const [newAward, setNewAward] = useState({
    name: "",
    description: "",
    type: "badge",
    requirements: "",
    status: "draft"
  });

  const handleAddAward = () => {
    // Implement award addition logic
    console.log("Adding award:", newAward);
  };

  const handleProcessClaim = (claimId: number) => {
    // Implement claim processing logic
    console.log("Processing claim:", claimId);
  };

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
            <Dialog>
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
                    <Label htmlFor="requirements">Requirements</Label>
                    <Input
                      id="requirements"
                      placeholder="e.g., 1000 transcriptions"
                      value={newAward.requirements}
                      onChange={(e) => setNewAward({
                        ...newAward,
                        requirements: e.target.value
                      })}
                    />
                  </div>
                  <Button 
                    className="w-full"
                    onClick={handleAddAward}
                  >
                    Create Award
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          <Card>
            <CardContent className="p-0">
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
                  {mockMilestoneAwards.map((award) => (
                    <TableRow key={award.id}>
                      <TableCell className="font-medium">{award.name}</TableCell>
                      <TableCell>{award.description}</TableCell>
                      <TableCell>{award.requirements}</TableCell>
                      <TableCell>
                        <Badge variant={award.status === "active" ? "default" : "secondary"}>
                          {award.status}
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
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="claims" className="space-y-4">
          <Card>
            <CardContent className="p-0">
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
                  {mockRewardClaims.map((claim) => (
                    <TableRow key={claim.id}>
                      <TableCell className="font-medium">{claim.user}</TableCell>
                      <TableCell>{claim.challenge}</TableCell>
                      <TableCell>${claim.amount}</TableCell>
                      <TableCell>
                        {claim.paymentDetails.provider}: {claim.paymentDetails.number}
                      </TableCell>
                      <TableCell>
                        <Badge variant={claim.status === "paid" ? "default" : "secondary"}>
                          {claim.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        {claim.status === "pending" && (
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => handleProcessClaim(claim.id)}
                          >
                            Process
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
