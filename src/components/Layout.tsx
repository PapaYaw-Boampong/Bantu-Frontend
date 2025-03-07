import { useState } from "react";
import { Outlet, useNavigate } from "react-router-dom";
import { Home } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import { useAuth } from "@/hooks/useAuth";
import { ThemeToggle } from "@/components/theme-toggle";

export default function Layout() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(true);
  const navigate = useNavigate();
  const { signOut } = useAuth();

  return (
    <SidebarProvider>
      <div className="bg-background relative flex flex-col min-h-screen min-w-[320px]">
        {/* Header */}
        <header className="fixed top-0 right-0 left-0 border-b bg-background z-40">
          <div className="max-w-6xl mx-auto px-4 py-4 flex justify-between">
            <h2 className="text-xl font-bold text-primary">BANTU ASHESI</h2>
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="icon" onClick={() => navigate("/dashboard")}>
                <Home className="h-8 w-6" />
              </Button>
              <ThemeToggle />
            </div>
          </div>
        </header>

        {/* Main Layout */}
        <div className="w-screen min-h-screen flex flex-col">
          {/* Sidebar Wrapper */}
          <div 
            className={`fixed top-[90px] left-0 bg-sidebar shadow-xlg transition-all duration-50 z-50 rounded-r-lg 
              ${sidebarCollapsed ? "-translate-x-16 hover:translate-x-0 w-16" : "translate-x-0 w-64"}`}
          >
            <AppSidebar collapsed={sidebarCollapsed} onCollapsedChange={setSidebarCollapsed} />
          </div>

          {/* Backdrop overlay when sidebar expands */}
          {!sidebarCollapsed && (
            <div 
              className="fixed inset-0 bg-black bg-opacity-40 z-40"
              onClick={() => setSidebarCollapsed(true)}
            />
          )}

          {/* Main Content */}
          <main className="flex-1 flex justify-center items-start p-2 mt-20 transition-all duration-200">
            <div className="w-full max-w-5xl bg-background px-5 py-3">
              <Outlet />
            </div>
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}