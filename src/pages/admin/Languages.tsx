import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Plus, Languages as LanguagesIcon, BarChart2, Users, FileText } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

// Mock data - replace with actual API calls
const mockLanguages = [
  {
    id: 1,
    name: "English",
    code: "en",
    speakers: 1500,
    contributions: 25000,
    status: "active"
  },
  {
    id: 2,
    name: "French",
    code: "fr",
    speakers: 800,
    contributions: 12000,
    status: "active"
  },
  {
    id: 3,
    name: "Spanish",
    code: "es",
    speakers: 1200,
    contributions: 18000,
    status: "active"
  },
  {
    id: 4,
    name: "Swahili",
    code: "sw",
    speakers: 500,
    contributions: 8000,
    status: "beta"
  }
];

export default function Languages() {
  const [newLanguage, setNewLanguage] = useState({
    name: "",
    code: "",
    status: "beta"
  });

  const handleAddLanguage = () => {
    // Implement language addition logic
    console.log("Adding language:", newLanguage);
  };

  return (
    <div className="container mx-auto py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Language Management</h1>
        <p className="text-muted-foreground">Manage supported languages and view adoption statistics</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Languages</CardTitle>
            <LanguagesIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{mockLanguages.length}</div>
            <p className="text-xs text-muted-foreground">
              +2 from last month
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Contributors</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {mockLanguages.reduce((sum, lang) => sum + lang.speakers, 0)}
            </div>
            <p className="text-xs text-muted-foreground">
              +12% from last month
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Contributions</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {mockLanguages.reduce((sum, lang) => sum + lang.contributions, 0).toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">
              +8% from last month
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average Growth</CardTitle>
            <BarChart2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">+15%</div>
            <p className="text-xs text-muted-foreground">
              Across all languages
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-semibold">Supported Languages</h2>
        <Dialog>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Add Language
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Language</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="name">Language Name</Label>
                <Input
                  id="name"
                  placeholder="e.g., English"
                  value={newLanguage.name}
                  onChange={(e) => setNewLanguage({
                    ...newLanguage,
                    name: e.target.value
                  })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="code">Language Code</Label>
                <Input
                  id="code"
                  placeholder="e.g., en"
                  value={newLanguage.code}
                  onChange={(e) => setNewLanguage({
                    ...newLanguage,
                    code: e.target.value
                  })}
                />
              </div>
              <Button 
                className="w-full"
                onClick={handleAddLanguage}
              >
                Add Language
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
                <TableHead>Language</TableHead>
                <TableHead>Code</TableHead>
                <TableHead>Contributors</TableHead>
                <TableHead>Contributions</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {mockLanguages.map((language) => (
                <TableRow key={language.id}>
                  <TableCell className="font-medium">{language.name}</TableCell>
                  <TableCell>{language.code}</TableCell>
                  <TableCell>{language.speakers.toLocaleString()}</TableCell>
                  <TableCell>{language.contributions.toLocaleString()}</TableCell>
                  <TableCell>
                    <Badge variant={language.status === "active" ? "default" : "secondary"}>
                      {language.status}
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
    </div>
  );
}
