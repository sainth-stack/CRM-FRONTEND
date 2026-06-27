import { useLocation, Link, useNavigate } from "react-router-dom";
import { ChevronRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuth } from "@/context/AuthContext";
import { cn } from "@/lib/utils";

const routeNames = {
  "/": "Dashboard",
  "/create": "Launch Campaign",
  "/create/setup": "Campaign Setup",
  "/active": "Active Campaigns",
  "/inactive": "Inactive Campaigns",
  "/settings": "Settings",
  "/profile": "Profile",
  "/admin": "Administration",
  "/admin/tenants": "Tenants",
  "/admin/organizations": "Organizations",
  "/admin/user-roles": "User Roles",
  "/admin/user-sessions": "User Sessions",
};

export function AppHeader() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const breadcrumbParts = location.pathname.split("/").filter(Boolean);
  const roleLabel = user?.role || "User";
  const displayName = user?.full_name || user?.email?.split("@")[0] || "?";
  const initials = displayName.slice(0, 2).toUpperCase();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

  const crumbLabel = (index) => {
    const path = "/" + breadcrumbParts.slice(0, index + 1).join("/");
    if (routeNames[path]) return routeNames[path];
    const segment = breadcrumbParts[index];
    if (uuidPattern.test(segment)) return segment;
    return segment.replace(/-/g, " ");
  };

  return (
    <>
      <header className="sticky top-0 z-30 flex h-16 shrink-0 items-center justify-between gap-2 border-b bg-card px-4 sm:px-6">
        <div className="flex items-center gap-2 sm:gap-3 min-w-0">
          {user && (
            <Badge variant="secondary" className="hidden sm:inline-flex text-[11px] shrink-0 capitalize">
              {roleLabel.replace("_", " ")}
            </Badge>
          )}
          {/* Brand removed from the header to avoid duplicating the sidebar's
              FocalReach logo. The sidebar is the single source of brand identity. */}
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="rounded-full" aria-label="User menu">
              <div className="h-8 w-8 rounded-full flex items-center justify-center text-xs font-bold text-zinc-950" style={{ background: "#00f0ff" }}>
                {initials}
              </div>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <div className="px-2 py-1.5">
              <p className="text-sm font-medium">{displayName}</p>
              <p className="text-xs text-muted-foreground">{user?.email}</p>
            </div>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => navigate("/profile")}>Profile</DropdownMenuItem>
            <DropdownMenuItem onClick={() => navigate("/settings")}>Settings</DropdownMenuItem>
            <DropdownMenuItem onClick={() => navigate("/change-password")}>Change Password</DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="text-destructive focus:text-destructive" onClick={handleLogout}>
              Logout
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </header>

      <div className="flex h-11 shrink-0 items-center gap-1 border-b bg-card px-4 sm:px-6 text-xs text-muted-foreground overflow-x-auto">
        <Link to="/" className="hover:text-foreground transition-colors shrink-0">Home</Link>
        {breadcrumbParts.map((_, i) => (
          <span key={i} className="flex items-center gap-1 shrink-0">
            <ChevronRight className="h-3 w-3" />
            <span className={cn(
              i === breadcrumbParts.length - 1 && "text-foreground font-medium",
              !uuidPattern.test(breadcrumbParts[i]) && "capitalize"
            )}>
              {crumbLabel(i)}
            </span>
          </span>
        ))}
      </div>
    </>
  );
}
