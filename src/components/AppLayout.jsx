import { Outlet, useLocation } from "react-router-dom";
import { AppSidebar } from "@/components/AppSidebar";
import { AppHeader } from "@/components/AppHeader";
import { SidebarStateProvider, useSidebarState } from "@/hooks/use-sidebar-state";
import { cn } from "@/lib/utils";

function LayoutInner() {
  const { collapsed } = useSidebarState();
  const location = useLocation();
  const isCampaignWorkspace = location.pathname.startsWith("/campaign");
  const sidebarWidth = collapsed ? 56 : 240;

  return (
    <div className="flex min-h-screen w-full bg-background">
      {!isCampaignWorkspace && <AppSidebar />}
      <div
        className="flex flex-1 flex-col min-h-0 transition-all duration-200"
        style={{ marginLeft: isCampaignWorkspace ? 0 : sidebarWidth }}
      >
        <AppHeader />
        <main
          className={cn(
            "flex-1 min-h-0",
            isCampaignWorkspace ? "overflow-hidden p-0 flex flex-col" : "p-6"
          )}
        >
          <Outlet />
        </main>
      </div>
    </div>
  );
}

export function AppLayout() {
  return (
    <SidebarStateProvider>
      <LayoutInner />
    </SidebarStateProvider>
  );
}
