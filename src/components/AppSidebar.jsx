import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  PlusCircle,
  Radio,
  Archive,
  Settings,
  Shield,
  Building2,
  ShieldCheck,
  Clock,
  FileUp,
  ArrowLeft,
  LogOut,
  PanelLeftClose,
  PanelLeftOpen,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useSidebarState } from "@/hooks/use-sidebar-state";
import { useAuth } from "@/context/AuthContext";
import { AppLogo } from "@/components/AppLogo";
import { canAccessAdmin, isSuperAdmin } from "@/utils/roles";

const userNavItems = [
  { title: "Dashboard", path: "/", icon: LayoutDashboard },
  { title: "Launch Campaign", path: "/create", icon: PlusCircle },
  { title: "Active", path: "/active", icon: Radio },
  { title: "Inactive", path: "/inactive", icon: Archive },
  { title: "Settings", path: "/settings", icon: Settings },
];

const adminEntry = { title: "Administration", path: "/admin", icon: Shield };

const adminNavItems = [
  { title: "Tenants", path: "/admin/tenants", icon: Building2, superOnly: true },
  { title: "Organizations", path: "/admin/organizations", icon: Building2, superOnly: true },
  { title: "User Roles", path: "/admin/user-roles", icon: ShieldCheck },
  { title: "User Sessions", path: "/admin/user-sessions", icon: Clock },
  { title: "File Uploads", path: "/admin/file-uploads", icon: FileUp },
];

export function AppSidebar() {
  const { collapsed, toggle } = useSidebarState();
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const superAdmin = isSuperAdmin(user);
  const isAdminUser = canAccessAdmin(user);
  const isAdminRoute = location.pathname.startsWith("/admin");

  // Sidebar layout by route + role:
  //   /admin routes -> admin sub-items (Tenants filtered for super only).
  //   anywhere else -> full campaign nav for everyone; admins & super admins also see
  //                    the Administration entry so they can hop into the panel.
  // (Previously admins on the dashboard saw ONLY "Administration", with no path to
  // Launch Campaign / Active / Inactive. Admins can now start their own campaigns,
  // so they need the full nav like end users.)
  let navItems = userNavItems;
  if (isAdminRoute) {
    navItems = adminNavItems.filter((item) => !item.superOnly || superAdmin);
  } else if (isAdminUser) {
    const settingsItem = userNavItems.find((i) => i.path === "/settings");
    navItems = [
      ...userNavItems.filter((i) => i.path !== "/settings"),
      adminEntry,
      ...(settingsItem ? [settingsItem] : []),
    ];
  }

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const displayName = user?.full_name || user?.email?.split("@")[0] || "Guest";
  const initials = displayName.slice(0, 2).toUpperCase();

  return (
    <aside
      className={cn(
        "fixed left-0 top-0 z-40 flex h-screen flex-col border-r border-zinc-900/70 transition-all duration-200",
        collapsed ? "w-sidebar-collapsed" : "w-sidebar-expanded"
      )}
      style={{ background: "#060a14" }}
    >
      <div
        className={cn(
          "relative flex items-center border-b border-zinc-900/70 shrink-0",
          collapsed ? "justify-center px-2 h-16" : "justify-between px-4 h-16"
        )}
      >
        <AppLogo collapsed={collapsed} showTagline={!collapsed} size="sm" />
        <button
          type="button"
          onClick={toggle}
          className={cn(
            "rounded-lg p-1.5 text-zinc-500 transition-all duration-200 hover:bg-zinc-800/60 hover:text-white",
            collapsed ? "absolute right-1.5 top-1/2 -translate-y-1/2" : "shrink-0"
          )}
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {collapsed ? <PanelLeftOpen className="h-4 w-4" /> : <PanelLeftClose className="h-4 w-4" />}
        </button>
      </div>

      <div className={cn("border-b border-zinc-900/70 px-3 py-3", collapsed ? "flex justify-center" : "flex items-center gap-3")}>
        <div className="relative h-9 w-9 shrink-0">
          <div
            className="h-9 w-9 rounded-full flex items-center justify-center text-xs font-bold text-zinc-950"
            style={{ background: "#00f0ff" }}
          >
            {initials}
          </div>
          <div className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 bg-emerald-500" style={{ borderColor: "#060a14" }} />
        </div>
        {!collapsed && (
          <div className="min-w-0">
            <p className="text-[13px] font-bold text-white truncate">{displayName}</p>
            <p className="text-[11px] text-zinc-500 truncate">{user?.role || ""}</p>
          </div>
        )}
      </div>

      {isAdminRoute && (
        <div className="px-2 pt-3 pb-1">
          <button
            onClick={() => navigate("/")}
            className="flex items-center gap-3 rounded-xl px-3 py-2 text-sm font-semibold text-zinc-400 transition-colors w-full hover:text-white hover:bg-zinc-800/40"
          >
            <ArrowLeft className="h-5 w-5 shrink-0" />
            {!collapsed && <span>Back to Home</span>}
          </button>
        </div>
      )}

      <nav className="flex-1 min-h-0 space-y-1 px-2 py-3 overflow-y-auto custom-scrollbar">
        {navItems.map((item) => {
          const active = item.path === "/"
            ? location.pathname === "/"
            : isAdminRoute
            ? location.pathname === item.path
            : location.pathname.startsWith(item.path);

          return (
            <Link
              key={item.path}
              to={item.path}
              title={item.title}
              className={cn(
                "group relative flex items-center gap-3 rounded-xl text-[13px] font-semibold transition-all duration-200",
                active
                  ? "bg-[#00f0ff]/10 text-white"
                  : "text-zinc-400 hover:text-white hover:bg-zinc-800/40"
              )}
              style={{ padding: "10px 12px" }}
            >
              <span
                className={cn(
                  "absolute left-0 top-1/2 -translate-y-1/2 h-5 w-[3px] rounded-r-full bg-[#00f0ff] transition-all duration-200",
                  active ? "opacity-100" : "opacity-0 group-hover:opacity-40"
                )}
              />
              <item.icon
                className={cn(
                  "h-[18px] w-[18px] shrink-0 transition-colors",
                  active ? "text-[#00f0ff]" : "text-zinc-500 group-hover:text-zinc-300"
                )}
              />
              {!collapsed && <span>{item.title}</span>}
            </Link>
          );
        })}
      </nav>

      <div className="mt-auto shrink-0 border-t border-zinc-900/70">
        <button
          onClick={handleLogout}
          className={cn(
            "flex w-full items-center gap-3 px-4 py-3 text-sm font-semibold text-zinc-400 transition-colors hover:text-white hover:bg-zinc-800/40",
            collapsed ? "justify-center px-2" : ""
          )}
        >
          <LogOut className="h-4 w-4 shrink-0" />
          {!collapsed && <span>Sign Out</span>}
        </button>
      </div>
    </aside>
  );
}
