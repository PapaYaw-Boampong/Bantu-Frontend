import { AdminPageTitle } from "@/components/admin/admin-page-title";
import { UsersTable } from "@/components/admin/users-table";
import { UsersFilter } from "@/components/admin/users-filter";

export default function challegersPage() {
  return (
    <div className="flex-1 space-y-4 p-0 sm:p-2 md:p-4 w-full">
      <div className="animate-fade-up opacity-0">
        <AdminPageTitle 
          title="User Management" 
          description="Manage users, roles, and permissions across the platform."
        />
      </div>
      
      <div className="animate-fade-up [animation-delay:200ms] opacity-0">
        <UsersFilter />
      </div>
      
      <div className="animate-fade-up [animation-delay:400ms] opacity-0 w-full overflow-x-auto">
        <UsersTable />
      </div>
    </div>
  );
} 