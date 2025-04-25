import { Button } from "@/components/ui/button";
import { useNavigate, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/useAuth";
import { useState, useEffect } from "react";

import {
  Calendar,
  CheckCircle2,
  CirclePlus,
  Briefcase,
  Bot,
  User,
  Headphones,
  ArrowLeftRight,
  House,
  FileText,
  LogOut,
  LayoutDashboard,
  FileAudio,
  Users,
  Brain,
  Settings,
  Handshake,
  Trophy,
  Mic,
  Box,
  Languages,
  BaggageClaim,
  BadgeCheckIcon,
  Image,
  OptionIcon,
} from "lucide-react";

interface AppSidebarProps {
  collapsed: boolean;
  onCollapsedChange: (collapsed: boolean) => void;
}

export function AppSidebar({ collapsed, onCollapsedChange }: AppSidebarProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const { signOut, user } = useAuth();
  const [userRole, setUserRole] = useState<number | null>(null);

  useEffect(() => {
    const storedRole = localStorage.getItem('role');
    if (storedRole) {
      setUserRole(Number(storedRole));
    }
  }, []);

  // Determine if user is admin based on role
  const isAdmin = userRole === 3;

  // Base user menu items
  const baseMenuItems = [
    {
      icon: LayoutDashboard,
      label: "Dashboard",
      path: "/dashboard",
    },
    {
      label: "Your Work",
      path: "/user/work",
      icon: CirclePlus,
    },
    {
      icon: Handshake,
      label: "Contribute Data",
      path: "/modeselection",
    },
    {
      icon: Headphones,
      label: "Transcription Validation",
      path: "/transcription",
    },
    {
      icon: ArrowLeftRight,
      label: "Translation Validation",
      path: "/translation",
    },
    {
      icon: Image,
      label: "Img Annotation Valdation",
      path: "/annotation",
    },
    {
      icon: OptionIcon,
      label: "A/B Testing",
      path: "/user/abtesting",
    },
    {
      label: "Sandbox",
      path: "/user/my-challenges",
      icon: Box,
      
    },
    {
      icon: Trophy,
      label: "Public Challenges",
      path: "/user/challenges",
    },
    {
      icon: BadgeCheckIcon,
      label: "Rewards",
      path: "/user/rewards",
    },
    {
      icon: Bot,
      label: "APIs",
      path: "/api",
    },
    {
      icon: FileText,
      label: "Documentation",
      path: "/docs",
    },
    {
      icon: User,
      label: "Profile",
      path: "/profile",
    },
  ];

  // Admin menu items
  const adminMenuItems = [
    {
      icon: LayoutDashboard,
      label: "Admin Dashboard",
      path: "/admin/dashboard",
    },
    {
      icon: FileAudio,
      label: "Challenges",
      path: "/admin/challenges",
    },
    {
      icon: Trophy,
      label: "Rewards",
      path: "/admin/rewards",
    },
    {
      icon: Users,
      label: "Users",
      path: "/admin/users",
    },
    {
      icon: Brain,
      label: "Models",
      path: "/admin/models",
    },
    {
      icon: Languages,
      label: "Languages",
      path: "/admin/languages",
    },
    {
      icon: Settings,
      label: "Settings",
      path: "/admin/settings",
    },
    // // You can still include some base user items if needed
    // {
    //   icon: User,
    //   label: "My Profile",
    //   path: "/profile",
    // },
  ];

  // Use the actual user role from localStorage
  // const displayMenuItems = isAdmin ? adminMenuItems : baseMenuItems;
  const displayMenuItems =baseMenuItems;

  const handleSignOut = () => {
    signOut();
    localStorage.removeItem('role');
    navigate("/");
  };

  // Determine if labels should be shown
  const showLabels = !collapsed;

  return (
    <aside
      className={cn(
        "h-full bg-sidebar border-r z-30 rounded-r-lg shadow-lg overflow-hidden transition-all duration-300",
        collapsed ? "w-16" : "w-64"
      )}
    >
      {/* Menu Items */}
      <nav className="space-y-2 p-4 pt-6">
        {displayMenuItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <Button
              key={item.path}
              variant={isActive ? "secondary" : "ghost"}
              className={cn(
                "w-full justify-start transition-all duration-300",
                collapsed ? "px-2" : "px-4"
              )}
              onClick={() => navigate(item.path)}
            >
              <item.icon
                className={cn("h-5 w-5", showLabels ? "mr-2" : "mr-0")}
              />
              {showLabels && <span>{item.label}</span>}
            </Button>
          );
        })}

        {/* Sign Out Button */}
        <div className="pt-4 mt-4 border-t border-border">
          <Button
            variant="ghost"
            className={cn(
              "w-full justify-start text-destructive hover:text-destructive hover:bg-destructive/10 transition-all duration-300",
              collapsed ? "px-2" : "px-4"
            )}
            onClick={handleSignOut}
          >
            <LogOut className={cn("h-5 w-5", showLabels ? "mr-2" : "mr-0")} />
            {showLabels && <span>Sign Out</span>}
          </Button>
        </div>
      </nav>
    </aside>
  );
}
