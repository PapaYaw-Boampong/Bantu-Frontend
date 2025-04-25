import { AdminPageTitle } from "@/components/admin/admin-page-title";
import { ModelsTable } from "@/components/admin/models-table";
import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";

export default function ModelsPage() {
  return (
    <div className="flex-1 space-y-4 p-0 sm:p-2 md:p-4 w-full">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 animate-fade-up opacity-0">
        <AdminPageTitle 
          title="Model Management" 
          description="Manage AI speech models and their performance metrics."
        />
        <Button className="w-full sm:w-auto">
          <PlusCircle className="mr-2 h-4 w-4" />
          Add Model
        </Button>
      </div>
      
      <div className="animate-fade-up [animation-delay:300ms] opacity-0 w-full overflow-x-auto">
        <ModelsTable />
      </div>
    </div>
  );
} 