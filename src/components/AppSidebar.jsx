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
  Users,
  Clock,
  ChevronLeft,
  ChevronRight,
  ArrowLeft,
  LogOut,
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
  { title: "Organizations", path: "/admin/organizations", icon: Building2 },
  { title: "User Roles", path: "/admin/user-roles", icon: ShieldCheck },
  { title: "Users", path: "/admin/users", icon: Users },
  { title: "User Sessions", path: "/admin/user-sessions", icon: Clock },
];

export function AppSidebar() {
  const { collapsed, toggle } = useSidebarState();
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const superAdmin = isSuperAdmin(user);
  const isAdminUser = canAccessAdmin(user);
  const isAdminRoute = location.pathname.startsWith("/admin");

  let navItems = userNavItems;
  if (isAdminRoute) {
    navItems = adminNavItems.filter((item) => !item.superOnly || superAdmin);
  } else if (isAdminUser && !superAdmin) {
    navItems = [adminEntry];
  } else if (superAdmin) {
    navItems = [...userNavItems.filter((i) => i.path !== "/settings"), adminEntry, userNavItems.find((i) => i.path === "/settings")];
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
        "fixed left-0 top-0 z-40 flex h-screen flex-col transition-all duration-200 rounded-[10px]",
        collapsed ? "w-sidebar-collapsed" : "w-sidebar-expanded"
      )}
      style={{ background: "#1a2a3a" }}
    >
      <div
        className={cn(
          "flex items-center border-b border-white/[0.06]",
          collapsed ? "justify-center px-2 h-20" : "justify-start px-4 h-20"
        )}
      >
        <AppLogo collapsed={collapsed} />
      </div>

      <div className={cn("border-b border-white/[0.06] px-3 py-3", collapsed ? "flex justify-center" : "flex items-center gap-3")}>
        <div className="relative h-9 w-9 shrink-0">
          <div className="h-9 w-9 rounded-full flex items-center justify-center text-xs font-bold text-white" style={{ background: "#2a4a6a" }}>
            {initials}
          </div>
          <div className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 bg-emerald-400" style={{ borderColor: "#1a2a3a" }} />
        </div>
        {!collapsed && (
          <div className="min-w-0">
            <p className="text-[13px] font-bold text-white truncate">{displayName}</p>
            <p className="text-[11px] truncate" style={{ color: "#7a9ab5" }}>{user?.role || ""}</p>
          </div>
        )}
      </div>

      {isAdminRoute && (
        <div className="px-2 pt-3 pb-1">
          <button
            onClick={() => navigate("/")}
            className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors w-full hover:bg-white/[0.06]"
            style={{ color: "#8aaec8" }}
          >
            <ArrowLeft className="h-5 w-5 shrink-0" />
            {!collapsed && <span>Back to Home</span>}
          </button>
        </div>
      )}

      <nav className="flex-1 space-y-[2px] px-2 py-3 overflow-y-auto">
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
                "group flex items-center gap-3 rounded-lg text-sm font-medium transition-all duration-150",
                active ? "font-bold text-white" : "hover:bg-white/[0.05]"
              )}
              style={{
                padding: "10px 12px",
                borderRadius: "8px",
                ...(active ? { background: "#2a4a6a", color: "#ffffff" } : { color: "#8aaec8" }),
              }}
            >
              <item.icon className="h-[18px] w-[18px] shrink-0" style={{ color: active ? "#ffffff" : "#8aaec8" }} />
              {!collapsed && <span>{item.title}</span>}
            </Link>
          );
        })}
      </nav>

      <button
        onClick={handleLogout}
        className={cn(
          "flex items-center gap-3 border-t border-white/[0.06] px-4 py-3 text-sm font-medium transition-colors hover:bg-white/[0.06]",
          collapsed ? "justify-center px-2" : ""
        )}
        style={{ color: "#8aaec8" }}
      >
        <LogOut className="h-4 w-4 shrink-0" />
        {!collapsed && <span>Sign Out</span>}
      </button>

      <button
        onClick={toggle}
        className="flex h-10 items-center justify-center border-t border-white/[0.06] transition-colors"
        style={{ color: "#8aaec8" }}
        aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
      >
        {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
      </button>
    </aside>
  );
}
