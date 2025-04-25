import { useState, useEffect } from "react";
import { Outlet, useNavigate } from "react-router-dom";
import { Home, Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/common/app-sidebar";
// import { useAuth } from "@/hooks/useAuth";
import { ThemeToggle } from "@/components/common/theme-toggle";

export default function Layout() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const [isHovering, setIsHovering] = useState(false);
  const navigate = useNavigate();
  // const { signOut } = useAuth();

  // Check if screen is mobile size
  useEffect(() => {
    const checkIfMobile = () => {
      const isMobileView = window.innerWidth < 768;
      setIsMobile(isMobileView);
      if (isMobileView) {
        setSidebarCollapsed(true);
        setIsHovering(false);
      }
    };
    
    // Initial check
    checkIfMobile();
    
    // Add event listener
    window.addEventListener('resize', checkIfMobile);
    
    // Cleanup
    return () => window.removeEventListener('resize', checkIfMobile);
  }, []);

  const toggleSidebar = () => {
    setSidebarCollapsed(!sidebarCollapsed);
    if (sidebarCollapsed) {
      setIsHovering(false);
    }
  };

  const handleSidebarHover = (hovering: boolean) => {
    if (!isMobile && sidebarCollapsed) {
      setIsHovering(hovering);
    }
  };

  // Determine sidebar width for spacing
  const sidebarWidth = isMobile 
    ? 0 
    : (sidebarCollapsed 
        ? (isHovering ? 256 : 64) 
        : 256);

  return (
    <SidebarProvider>
      <div className="bg-background w-full min-h-screen">
        {/* Header */}
        <header className="fixed top-0 right-0 left-0 border-b bg-background z-50">
          <div className="w-full px-4 py-3 flex justify-between">
            <div className="flex items-center gap-3">
              {/* Always visible on mobile, conditionally visible on desktop */}
              {(isMobile || !sidebarCollapsed) && (
                <Button 
                  variant={sidebarCollapsed ? "outline" : "secondary"} 
                  size="icon" 
                  onClick={toggleSidebar}
                  className="transition-all duration-300"
                  aria-label={sidebarCollapsed ? "Open sidebar" : "Close sidebar"}
                >
                  {sidebarCollapsed ? (
                    <Menu className="h-5 w-5" />
                  ) : (
                    <X className="h-5 w-5" />
                  )}
                </Button>
              )}
              <h2 className="text-xl font-bold text-primary">BANTU ASHESI</h2>
            </div>
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="icon" onClick={() => navigate("/dashboard")}>
                <Home className="h-6 w-6" />
              </Button>
              <ThemeToggle />
            </div>
          </div>
        </header>

        {/* Sidebar Wrapper - different behavior for mobile vs desktop */}
        <div 
          className={`fixed top-[73px] left-0 bg-sidebar shadow-xlg transition-all duration-300 z-40 rounded-r-lg 
            ${isMobile 
              ? "-translate-x-full" 
              : (sidebarCollapsed ? "translate-x-0" : "translate-x-0")
            } 
            ${isMobile && !sidebarCollapsed ? "!translate-x-0" : ""}
            ${isMobile ? "w-[240px]" : (sidebarCollapsed ? (isHovering ? "w-64" : "w-16") : "w-64")}`}
          onMouseEnter={() => handleSidebarHover(true)}
          onMouseLeave={() => handleSidebarHover(false)}
          style={{ 
            transitionProperty: "transform, width",
            willChange: "transform, width"
          }}
        >
          <AppSidebar 
            collapsed={!isMobile && sidebarCollapsed && !isHovering} 
            onCollapsedChange={setSidebarCollapsed} 
          />
        </div>

        {/* Backdrop overlay when sidebar expands on mobile */}
        {!sidebarCollapsed && isMobile && (
          <div 
            className="fixed inset-0 bg-black bg-opacity-40 z-30"
            onClick={() => setSidebarCollapsed(true)}
          />
        )}

        {/* Main Content */}
        <div className="w-full pt-[73px] min-h-[calc(100vh-73px)] flex justify-center">
          <div className="w-full max-w-[1400px] flex">
            {/* Sidebar spacer - only on desktop */}
            {!isMobile && (
              <div 
                className="flex-shrink-0 transition-all duration-300"
                style={{ width: `${sidebarWidth}px` }}
              ></div>
            )}
            
            {/* Content container - centered with max width */}
            <main className="flex-1 w-full px-6 sm:px-8 py-4 sm:py-6 pt-8 bg-background overflow-x-auto">
              <Outlet />
            </main>
            
            {/* Optional right spacer for balance on large screens */}
            <div className="hidden xl:block w-16 flex-shrink-0"></div>
          </div>
        </div>
      </div>
    </SidebarProvider>
  );
}
