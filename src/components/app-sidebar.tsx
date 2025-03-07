import { Calendar, CheckCircle2, Mic, Bot, User, ChevronLeft, ChevronRight, House, FileText, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/useAuth";

interface AppSidebarProps {
  collapsed: boolean;
  onCollapsedChange: (collapsed: boolean) => void;
}

export function AppSidebar({ collapsed, onCollapsedChange }: AppSidebarProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const { signOut } = useAuth();

  const menuItems = [
    {
      icon: House,
      label: "DashBoard",
      path: "/dashboard"
    },
    {
      icon: Mic,
      label: "Contribute Data",
      path: "/modeselection"
    },
    {
      icon: CheckCircle2,
      label: "Community Validation",
      path: "/listen"
    },
    {
      icon: Calendar,
      label: "Community Events",
      path: "/events"
    },
    {
      icon: Bot,
      label: "APIs",
      path: "/api"
    },
    {
      icon: FileText,
      label: "Documentation",
      path: "/docs"
    },
    {
      icon: User,
      label: "Profile",
      path: "/profile"
    }
  ];

  const handleSignOut = () => {
    signOut();
    navigate('/');
  };

  return (
    <aside
      className={cn(
        "h-full bg-sidebar transition-all duration-50 border-r z-30 rounded-r-lg shadow-lg",
        collapsed ? "w-16" : "w-64"
      )}
    >
      {/* Collapse Toggle */}
      <Button
        variant="ghost"
        size="icon"
        className="absolute -right-11 top-2 h-9 w-9 rounded-full border bg-background"
        onClick={() => onCollapsedChange(!collapsed)}
      >
        {collapsed ? (
          <ChevronRight className="h-4 w-4" />
        ) : (
          <ChevronLeft className="h-4 w-4" />
        )}
      </Button>

      {/* Menu Items */}
      <nav className="space-y-2 p-4">
        {menuItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <Button
              key={item.path}
              variant={isActive ? "secondary" : "ghost"}
              className={cn(
                "w-full justify-start",
                collapsed ? "px-2" : "px-4"
              )}
              onClick={() => navigate(item.path)}
            >
              <item.icon className={cn(
                "h-5 w-5",
                collapsed ? "mr-0" : "mr-2"
              )} />
              {!collapsed && <span>{item.label}</span>}
            </Button>
          );
        })}
        
        {/* Sign Out Button */}
        <div className="pt-4 mt-4 border-t">
          <Button
            variant="ghost"
            className={cn(
              "w-full justify-start text-red-500 hover:text-red-600 hover:bg-red-100 dark:hover:bg-red-900/20",
              collapsed ? "px-2" : "px-4"
            )}
            onClick={handleSignOut}
          >
            <LogOut className={cn(
              "h-5 w-5",
              collapsed ? "mr-0" : "mr-2"
            )} />
            {!collapsed && <span>Sign Out</span>}
          </Button>
        </div>
      </nav>
    </aside>
  );
}