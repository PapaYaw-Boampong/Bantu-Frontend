import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Trophy, 
  Award, 
  DollarSign, 
  CheckCircle2, 
  Clock, 
  Gift 
} from "lucide-react";

// Mock data - replace with actual API calls
const mockBadges = [
  {
    id: 1,
    name: "Transcription Wizard",
    description: "Awarded for completing 1000 transcriptions",
    icon: "🎤",
    earned: true,
    date: "2024-03-15"
  },
  {
    id: 2,
    name: "Translation Guru",
    description: "Awarded for completing 500 translations",
    icon: "🌐",
    earned: true,
    date: "2024-03-10"
  },
  {
    id: 3,
    name: "Community Champion",
    description: "Awarded for helping 50 community members",
    icon: "🤝",
    earned: false,
    progress: 35
  }
];

const mockCashPrizes = [
  {
    id: 1,
    amount: 50,
    source: "March Challenge Winner",
    status: "pending",
    date: "2024-03-20"
  },
  {
    id: 2,
    amount: 25,
    source: "Weekly Top Contributor",
    status: "claimed",
    date: "2024-03-15"
  }
];

export default function Rewards() {
  const [mobileMoneyDetails, setMobileMoneyDetails] = useState({
    provider: "",
    number: ""
  });

  const handleClaimPrize = (prizeId: number) => {
    // Implement prize claiming logic
    console.log("Claiming prize:", prizeId);
  };

  return (
    <div className="container mx-auto py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Your Rewards</h1>
        <p className="text-muted-foreground">View and manage your earned rewards and prizes</p>
      </div>

      <Tabs defaultValue="badges" className="space-y-4">
        <TabsList>
          <TabsTrigger value="badges">
            <Trophy className="mr-2 h-4 w-4" />
            Badges
          </TabsTrigger>
          <TabsTrigger value="prizes">
            <Gift className="mr-2 h-4 w-4" />
            Cash Prizes
          </TabsTrigger>
        </TabsList>

        <TabsContent value="badges" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {mockBadges.map((badge) => (
              <Card key={badge.id}>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <span className="text-2xl">{badge.icon}</span>
                    {badge.name}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-2">
                    {badge.description}
                  </p>
                  {badge.earned ? (
                    <div className="flex items-center gap-2 text-green-500">
                      <CheckCircle2 className="h-4 w-4" />
                      <span className="text-sm">Earned on {badge.date}</span>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-yellow-500">
                        <Clock className="h-4 w-4" />
                        <span className="text-sm">In Progress</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2.5">
                        <div 
                          className="bg-yellow-500 h-2.5 rounded-full" 
                          style={{ width: `${badge.progress}%` }}
                        ></div>
                      </div>
                      <span className="text-sm text-muted-foreground">
                        {badge.progress}% complete
                      </span>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="prizes" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            {mockCashPrizes.map((prize) => (
              <Card key={prize.id}>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <DollarSign className="h-5 w-5" />
                      <span>${prize.amount}</span>
                    </div>
                    <Badge variant={prize.status === "claimed" ? "default" : "secondary"}>
                      {prize.status}
                    </Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-4">
                    {prize.source} - {prize.date}
                  </p>
                  {prize.status === "pending" && (
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="provider">Mobile Money Provider</Label>
                        <Input
                          id="provider"
                          placeholder="e.g., MTN, Vodafone"
                          value={mobileMoneyDetails.provider}
                          onChange={(e) => setMobileMoneyDetails({
                            ...mobileMoneyDetails,
                            provider: e.target.value
                          })}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="number">Mobile Money Number</Label>
                        <Input
                          id="number"
                          placeholder="Enter your mobile money number"
                          value={mobileMoneyDetails.number}
                          onChange={(e) => setMobileMoneyDetails({
                            ...mobileMoneyDetails,
                            number: e.target.value
                          })}
                        />
                      </div>
                      <Button 
                        className="w-full"
                        onClick={() => handleClaimPrize(prize.id)}
                      >
                        Claim Prize
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
