import { useState } from "react";
import { useChallenge } from "@/hooks/challengeHooks/useChallenges";
import { EventType } from "@/types/challenge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface CreateChallengeDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CreateChallengeDialog({ open, onOpenChange }: CreateChallengeDialogProps) {
  const { createChallenge, loading } = useChallenge();
  const [formData, setFormData] = useState({
    challenge_name: "",
    description: "",
    event_type: EventType.TRANSCRIPTION_CHALLENGE,
    start_date: "",
    end_date: "",
    target_contribution_count: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const startDate = new Date(formData.start_date);
    const endDate = new Date(formData.end_date);
    const now = new Date();

    if (startDate < now) {
      alert("Start date must be in the future");
      return;
    }

    if (endDate <= startDate) {
      alert("End date must be after start date");
      return;
    }

    try {
      const newChallenge = await createChallenge({
        ...formData,
        target_contribution_count: formData.target_contribution_count 
          ? parseInt(formData.target_contribution_count) 
          : undefined,
      });
      
      onOpenChange(false);
      setFormData({
        challenge_name: "",
        description: "",
        event_type: EventType.TRANSCRIPTION_CHALLENGE,
        start_date: "",
        end_date: "",
        target_contribution_count: "",
      });
    } catch (error) {
      console.error("Failed to create challenge:", error);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Create New Challenge</DialogTitle>
            <DialogDescription>
              Fill in the details to create a new challenge.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="challenge_name">Challenge Name</Label>
              <Input
                id="challenge_name"
                value={formData.challenge_name}
                onChange={(e) => setFormData({ ...formData, challenge_name: e.target.value })}
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="event_type">Event Type</Label>
              <Select
                value={formData.event_type}
                onValueChange={(value) => setFormData({ ...formData, event_type: value as EventType })}
              >
                <SelectTrigger id="event_type">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={EventType.TRANSCRIPTION_CHALLENGE}>Transcription</SelectItem>
                  <SelectItem value={EventType.TRANSLATION_CHALLENGE}>Translation</SelectItem>
                  <SelectItem value={EventType.MIXED_CORRECTION}>Both</SelectItem>
                  <SelectItem value={EventType.Data_COLLECTION}>Data Collection</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="start_date">Start Date</Label>
              <Input
                id="start_date"
                type="datetime-local"
                value={formData.start_date}
                onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="end_date">End Date</Label>
              <Input
                id="end_date"
                type="datetime-local"
                value={formData.end_date}
                onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="target_contribution_count">Target Contribution Count (Optional)</Label>
              <Input
                id="target_contribution_count"
                type="number"
                value={formData.target_contribution_count}
                onChange={(e) => setFormData({ ...formData, target_contribution_count: e.target.value })}
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Creating..." : "Create Challenge"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
} 