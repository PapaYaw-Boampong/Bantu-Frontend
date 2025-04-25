import { AdminPageTitle } from "@/components/admin/admin-page-title";
import { SystemSettings } from "@/components/admin/system-settings";

export default function SettingsPage() {
  return (
    <div className="flex-1 space-y-12 p-0 sm:p-2 md:p-4 w-full">
      <div className="animate-fade-up opacity-0">
        <AdminPageTitle 
          title="System Settings" 
          description="Configure platform settings and behavior."
        />
      </div>
      
      <div className="animate-fade-up [animation-delay:300ms] opacity-0 w-full">
        <SystemSettings />
      </div>
    </div>
  );
} 
