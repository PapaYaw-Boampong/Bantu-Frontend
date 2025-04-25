"use client";

import { useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { 
  MoreHorizontal, 
  Pencil, 
  BarChart, 
  Download,
  AlertTriangle
} from "lucide-react";
import { Progress } from "@/components/ui/progress";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

// Mock data for models
const models = [
  {
    id: "M001",
    name: "FastSpeech-v2",
    version: "2.3.1",
    type: "ASR",
    status: "active",
    accuracy: 94.2,
    processingTime: 0.8,
    lastUpdated: "2023-09-15",
    usageCount: 12450,
  },
  {
    id: "M002",
    name: "DeepVoice",
    version: "1.5.0",
    type: "TTS",
    status: "active",
    accuracy: 92.7,
    processingTime: 1.2,
    lastUpdated: "2023-08-22",
    usageCount: 8320,
  },
  {
    id: "M003",
    name: "WaveNet-Pro",
    version: "3.0.2",
    type: "ASR",
    status: "inactive",
    accuracy: 89.5,
    processingTime: 1.5,
    lastUpdated: "2023-07-10",
    usageCount: 5670,
  },
  {
    id: "M004",
    name: "SpeechFlow",
    version: "2.1.0",
    type: "ASR",
    status: "active",
    accuracy: 91.8,
    processingTime: 1.0,
    lastUpdated: "2023-10-01",
    usageCount: 9840,
  },
  {
    id: "M005",
    name: "VoiceTransform",
    version: "1.2.3",
    type: "TTS",
    status: "active",
    accuracy: 93.5,
    processingTime: 0.9,
    lastUpdated: "2023-09-28",
    usageCount: 7620,
  },
  {
    id: "M006",
    name: "AccentDetect",
    version: "1.0.1",
    type: "Classification",
    status: "testing",
    accuracy: 87.2,
    processingTime: 0.7,
    lastUpdated: "2023-10-05",
    usageCount: 2340,
  },
  {
    id: "M007",
    name: "EmotionSpeech",
    version: "2.2.0",
    type: "Classification",
    status: "active",
    accuracy: 90.1,
    processingTime: 1.1,
    lastUpdated: "2023-08-15",
    usageCount: 6120,
  },
];

export function ModelsTable() {
  const [modelStatusDialogOpen, setModelStatusDialogOpen] = useState(false);
  const [selectedModel, setSelectedModel] = useState<string | null>(null);
  const [selectedStatus, setSelectedStatus] = useState<boolean>(true);
  
  const handleStatusToggle = (modelId: string, currentStatus: string) => {
    setSelectedModel(modelId);
    setSelectedStatus(currentStatus !== "active");
    setModelStatusDialogOpen(true);
  };
  
  const handleStatusChange = () => {
    // In a real app, you would update the model's status here
    console.log(`Changing status for model ${selectedModel} to ${selectedStatus ? "active" : "inactive"}`);
    setModelStatusDialogOpen(false);
    setSelectedModel(null);
  };
  
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "active":
        return <Badge className="bg-green-500">Active</Badge>;
      case "inactive":
        return <Badge variant="outline">Inactive</Badge>;
      case "testing":
        return <Badge className="bg-yellow-500">Testing</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };
  
  const getAccuracyIndicator = (accuracy: number) => {
    if (accuracy >= 93) return "bg-green-500";
    if (accuracy >= 90) return "bg-yellow-500";
    return "bg-red-500";
  };
  
  return (
    <div className="space-y-4">
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Accuracy</TableHead>
              <TableHead>Processing Time</TableHead>
              <TableHead>Usage</TableHead>
              <TableHead>Last Updated</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {models.map((model) => (
              <TableRow key={model.id}>
                <TableCell>
                  <div>
                    <p className="font-medium">{model.name}</p>
                    <p className="text-xs text-muted-foreground">v{model.version}</p>
                  </div>
                </TableCell>
                <TableCell>{model.type}</TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    {getStatusBadge(model.status)}
                    <Switch 
                      checked={model.status === "active"}
                      onCheckedChange={() => handleStatusToggle(model.id, model.status)}
                    />
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <Progress 
                      value={model.accuracy} 
                      className={`h-2 w-[60px] ${getAccuracyIndicator(model.accuracy)}`} 
                    />
                    <span className="text-sm">{model.accuracy}%</span>
                    {model.accuracy < 90 && (
                      <AlertTriangle className="h-4 w-4 text-yellow-500" />
                    )}
                  </div>
                </TableCell>
                <TableCell>{model.processingTime}s</TableCell>
                <TableCell>{model.usageCount.toLocaleString()}</TableCell>
                <TableCell>{model.lastUpdated}</TableCell>
                <TableCell className="text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="h-8 w-8 p-0">
                        <span className="sr-only">Open menu</span>
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuLabel>Actions</DropdownMenuLabel>
                      <DropdownMenuItem>
                        <Pencil className="mr-2 h-4 w-4" />
                        Edit model
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        <BarChart className="mr-2 h-4 w-4" />
                        View metrics
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem>
                        <Download className="mr-2 h-4 w-4" />
                        Download model
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
      
      <Dialog open={modelStatusDialogOpen} onOpenChange={setModelStatusDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {selectedStatus ? "Activate Model" : "Deactivate Model"}
            </DialogTitle>
            <DialogDescription>
              {selectedStatus 
                ? "This will make the model available for transcription tasks."
                : "This will make the model unavailable for transcription tasks."}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setModelStatusDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleStatusChange}>
              {selectedStatus ? "Activate Model" : "Deactivate Model"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
} 