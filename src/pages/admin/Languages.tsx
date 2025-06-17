import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Plus, Languages as LanguagesIcon, BarChart2, Users, FileText, Loader2, Edit, Check, X } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useToast } from "@/components/ui/use-toast";
import { useLanguages } from "@/hooks/languageHooks/useLanguages";
import { useCreateLanguage } from "@/hooks/languageHooks/useCreateLanguage";
import { useUpdateLanguage } from "@/hooks/languageHooks/useUpdateLanguage";
import { useToggleLanguageActivation } from "@/hooks/languageHooks/useToggleLanStatus";
import { useGetUserLanguages } from "@/hooks/languageHooks/useGetUserLanguages";
import { Language, CreateLanguageRequest, UpdateLanguageRequest } from "@/types/language";
import { Skeleton } from "@/components/ui/skeleton";

export default function Languages() {
  const { toast } = useToast();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingLanguage, setEditingLanguage] = useState<Language | null>(null);
  const [newLanguage, setNewLanguage] = useState<CreateLanguageRequest>({
    name: "",
    code: "",
    description: ""
  });

  // Fetch languages
  const { 
    data: languages = [], 
    isLoading: isLoadingLanguages,
    refetch: refetchLanguages
  } = useLanguages();

  // Fetch users with their languages to count contributors
  const { data: userLanguages = [] } = useGetUserLanguages();

  // Mutations
  const createLanguageMutation = useCreateLanguage();
  const updateLanguageMutation = useUpdateLanguage();
  const toggleLanguageActivationMutation = useToggleLanguageActivation();

  // Count unique users per language
  const getContributorCount = (languageId: string) => {
    return userLanguages.filter(ul => ul.language.id === languageId).length;
  };

  // Handle creating a new language
  const handleAddLanguage = () => {
    if (!newLanguage.name || !newLanguage.code) {
      toast({
        title: "Missing Information",
        description: "Please provide both a language name and code.",
        variant: "destructive",
      });
      return;
    }

    createLanguageMutation.mutate(newLanguage, {
      onSuccess: () => {
        toast({
          title: "Success",
          description: `Language ${newLanguage.name} has been added.`,
        });
        setNewLanguage({ name: "", code: "", description: "" });
        setIsDialogOpen(false);
        refetchLanguages();
      },
      onError: (error: any) => {
        toast({
          title: "Error",
          description: error.message || "Failed to add language.",
          variant: "destructive",
        });
      }
    });
  };

  // Handle editing a language
  const handleUpdateLanguage = () => {
    if (!editingLanguage) return;

    const updateData: UpdateLanguageRequest = {
      name: editingLanguage.name,
      code: editingLanguage.code,
      description: editingLanguage.description
    };

    updateLanguageMutation.mutate({
      id: editingLanguage.id,
      data: updateData
    }, {
      onSuccess: () => {
        toast({
          title: "Success",
          description: `Language ${editingLanguage.name} has been updated.`,
        });
        setEditingLanguage(null);
        setIsDialogOpen(false);
        refetchLanguages();
      },
      onError: (error: any) => {
        toast({
          title: "Error",
          description: error.message || "Failed to update language.",
          variant: "destructive",
        });
      }
    });
  };

  // Handle toggling language activation status
  const handleToggleStatus = (language: Language, activate: boolean) => {
    toggleLanguageActivationMutation.mutate({
      id: language.id,
      is_active: activate
    }, {
      onSuccess: () => {
        toast({
          title: "Success",
          description: `Language ${language.name} has been ${activate ? 'activated' : 'deactivated'}.`,
        });
        refetchLanguages();
      },
      onError: (error: any) => {
        toast({
          title: "Error",
          description: error.message || `Failed to ${activate ? 'activate' : 'deactivate'} language.`,
          variant: "destructive",
        });
      }
    });
  };

  // Open edit dialog
  const openEditDialog = (language: Language) => {
    setEditingLanguage(language);
    setIsDialogOpen(true);
  };

  // Reset form and close dialog
  const handleDialogClose = () => {
    setNewLanguage({ name: "", code: "", description: "" });
    setEditingLanguage(null);
    setIsDialogOpen(false);
  };

  // Calculate statistics
  const totalLanguages = languages.length;
  const totalContributors = new Set(userLanguages.map(ul => ul.association_id)).size;
  // For a real implementation, you would need contribution count from the backend
  const contributionEstimate = totalContributors * 50; // Simple placeholder estimate

  // Loading state component for statistics cards
  const StatCardLoading = () => (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">
          <Skeleton className="h-4 w-24" />
        </CardTitle>
        <Skeleton className="h-4 w-4" />
      </CardHeader>
      <CardContent>
        <Skeleton className="h-8 w-12 mb-1" />
        <Skeleton className="h-3 w-24" />
      </CardContent>
    </Card>
  );

  return (
    <div className="container mx-auto py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Language Management</h1>
        <p className="text-muted-foreground">Manage supported languages and view adoption statistics</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-8">
        {isLoadingLanguages ? (
          <>
            <StatCardLoading />
            <StatCardLoading />
            <StatCardLoading />
            <StatCardLoading />
          </>
        ) : (
          <>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Languages</CardTitle>
                <LanguagesIcon className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{totalLanguages}</div>
                <p className="text-xs text-muted-foreground">
                  Supported languages in the platform
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Active Contributors</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{totalContributors}</div>
                <p className="text-xs text-muted-foreground">
                  Users with language preferences
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Estimated Contributions</CardTitle>
                <FileText className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{contributionEstimate.toLocaleString()}</div>
                <p className="text-xs text-muted-foreground">
                  Approximate data contributions
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Avg. Contributors/Language</CardTitle>
                <BarChart2 className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {totalLanguages ? Math.round(totalContributors / totalLanguages) : 0}
                </div>
                <p className="text-xs text-muted-foreground">
                  Average users per language
                </p>
              </CardContent>
            </Card>
          </>
        )}
      </div>

      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-semibold">Supported Languages</h2>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => {
              setEditingLanguage(null);
              setNewLanguage({ name: "", code: "", description: "" });
            }}>
              <Plus className="mr-2 h-4 w-4" />
              Add Language
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {editingLanguage ? "Edit Language" : "Add New Language"}
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="name">Language Name</Label>
                <Input
                  id="name"
                  placeholder="e.g., English"
                  value={editingLanguage ? editingLanguage.name : newLanguage.name}
                  onChange={(e) => {
                    if (editingLanguage) {
                      setEditingLanguage({ ...editingLanguage, name: e.target.value });
                    } else {
                      setNewLanguage({ ...newLanguage, name: e.target.value });
                    }
                  }}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="code">Language Code</Label>
                <Input
                  id="code"
                  placeholder="e.g., en"
                  value={editingLanguage ? editingLanguage.code : newLanguage.code}
                  onChange={(e) => {
                    if (editingLanguage) {
                      setEditingLanguage({ ...editingLanguage, code: e.target.value });
                    } else {
                      setNewLanguage({ ...newLanguage, code: e.target.value });
                    }
                  }}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Description (Optional)</Label>
                <Input
                  id="description"
                  placeholder="Brief description of the language"
                  value={editingLanguage ? editingLanguage.description || "" : newLanguage.description || ""}
                  onChange={(e) => {
                    if (editingLanguage) {
                      setEditingLanguage({ ...editingLanguage, description: e.target.value });
                    } else {
                      setNewLanguage({ ...newLanguage, description: e.target.value });
                    }
                  }}
                />
              </div>
              <Button 
                className="w-full"
                onClick={editingLanguage ? handleUpdateLanguage : handleAddLanguage}
                disabled={createLanguageMutation.isPending || updateLanguageMutation.isPending}
              >
                {(createLanguageMutation.isPending || updateLanguageMutation.isPending) ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    {editingLanguage ? "Updating..." : "Adding..."}
                  </>
                ) : (
                  editingLanguage ? "Update Language" : "Add Language"
                )}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardContent className="p-0">
          {isLoadingLanguages ? (
            <div className="p-8 flex justify-center">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Language</TableHead>
                  <TableHead>Code</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Contributors</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {languages.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                      No languages found. Add a language to get started.
                    </TableCell>
                  </TableRow>
                ) : (
                  languages.map((language) => (
                    <TableRow key={language.id}>
                      <TableCell className="font-medium">{language.name}</TableCell>
                      <TableCell>{language.code}</TableCell>
                      <TableCell className="max-w-[200px] truncate">
                        {language.description || "-"}
                      </TableCell>
                      <TableCell>{getContributorCount(language.id)}</TableCell>
                      <TableCell>
                        <Badge variant={language ? "secondary":"default" }>
                          {language ? "active" : "inactive"}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right space-x-2">
                        <Button 
                          variant="ghost" 
                          size="icon"
                          onClick={() => openEditDialog(language)}
                          title="Edit language"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        {language ? (
                          <Button 
                            variant="ghost" 
                            size="icon"
                            onClick={() => handleToggleStatus(language, false)}
                            title="Deactivate language"
                            className="text-destructive hover:text-destructive/90"
                            disabled={toggleLanguageActivationMutation.isPending}
                          >
                            {toggleLanguageActivationMutation.isPending ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <X className="h-4 w-4" />
                            )}
                          </Button>
                        ) : (
                          <Button 
                            variant="ghost" 
                            size="icon"
                            onClick={() => handleToggleStatus(language, true)}
                            title="Activate language"
                            className="text-green-600 hover:text-green-500"
                            disabled={toggleLanguageActivationMutation.isPending}
                          >
                            {toggleLanguageActivationMutation.isPending ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <Check className="h-4 w-4" />
                            )}
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
