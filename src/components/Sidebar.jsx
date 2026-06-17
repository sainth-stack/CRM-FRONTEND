import { NavLink, useLocation, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  PlusCircle,
  Radio,
  Archive,
  Settings as SettingsIcon,
  Shield,
  Building2,
  ShieldCheck,
  Clock,
  ArrowLeft,
  X,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { canAccessAdmin, isSuperAdmin } from "../utils/roles";

const SIDEBAR_WIDTH = "w-64";

const userNavItems = [
  { name: "Dashboard", to: "/", icon: LayoutDashboard, end: true },
  { name: "Launch Campaign", to: "/create", icon: PlusCircle },
  { name: "Active", to: "/active", icon: Radio },
  { name: "Inactive", to: "/inactive", icon: Archive },
];

const adminEntryItem = { name: "Administration", to: "/admin", icon: Shield };

const adminSubItems = [
  { name: "Tenants", to: "/admin/tenants", icon: Building2, superOnly: true },
  { name: "Organizations", to: "/admin/organizations", icon: Building2 },
  { name: "User Roles", to: "/admin/user-roles", icon: ShieldCheck },
  { name: "User Sessions", to: "/admin/user-sessions", icon: Clock },
];

const Sidebar = ({ open, onClose }) => {
  const { user } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const isAdminUser = canAccessAdmin(user);
  const superAdmin = isSuperAdmin(user);
  const isAdminRoute = location.pathname.startsWith("/admin");

  const linkClass = ({ isActive }) =>
    [
      "group relative flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-[13px] font-semibold tracking-tight transition-all duration-200",
      isActive
        ? "bg-[#00f0ff]/10 text-white"
        : "text-zinc-400 hover:text-white hover:bg-zinc-800/40",
    ].join(" ");

  const renderItem = (item) => {
    const Icon = item.icon;
    return (
      <NavLink
        key={item.to}
        to={item.to}
        end={item.end}
        onClick={onClose}
        className={linkClass}
      >
        {({ isActive }) => (
          <>
            <span
              className={`absolute left-0 top-1/2 -translate-y-1/2 h-5 w-[3px] rounded-r-full bg-[#00f0ff] transition-all duration-200 ${
                isActive ? "opacity-100" : "opacity-0 group-hover:opacity-40"
              }`}
            />
            <Icon
              size={18}
              className={`shrink-0 transition-colors ${
                isActive ? "text-[#00f0ff]" : "text-zinc-500 group-hover:text-zinc-300"
              }`}
            />
            <span>{item.name}</span>
          </>
        )}
      </NavLink>
    );
  };

  const showSettings = superAdmin || (!isAdminUser && !isAdminRoute);
  const workspaceItems = isAdminRoute
    ? adminSubItems.filter((item) => !item.superOnly || superAdmin)
    : isAdminUser
    ? [...userNavItems, adminEntryItem]   // admins & super admins: full campaign nav + admin entry
    : userNavItems;

  return (
    <>
      {open && (
        <div
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm md:hidden"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      <aside
        className={`fixed top-[70px] bottom-0 left-0 z-40 ${SIDEBAR_WIDTH} flex flex-col bg-[#060a14]/95 backdrop-blur-xl border-r border-zinc-900/70 transition-transform duration-300 ease-out md:translate-x-0 ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex md:hidden items-center justify-between px-4 pt-4">
          <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-600">Navigation</span>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800/60 transition-colors"
            aria-label="Close navigation"
          >
            <X size={18} />
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto custom-scrollbar px-3 py-5">
          {isAdminRoute && (
            <div className="mb-4 px-1">
              <button
                onClick={() => {
                  navigate("/");
                  onClose?.();
                }}
                className="flex items-center gap-2 w-full px-3 py-2 rounded-xl text-[12px] font-semibold text-zinc-400 hover:text-white hover:bg-zinc-800/40 transition-all"
              >
                <ArrowLeft size={16} />
                Back to Home
              </button>
            </div>
          )}

          <div className="px-3 mb-2 text-[10px] font-bold uppercase tracking-widest text-zinc-600">
            {isAdminRoute ? "Administration" : "Workspace"}
          </div>
          <div className="flex flex-col gap-1">{workspaceItems.map(renderItem)}</div>

          {superAdmin && !isAdminRoute && (
            <>
              <div className="px-3 mt-7 mb-2 text-[10px] font-bold uppercase tracking-widest text-zinc-600">
                Administration
              </div>
              <div className="flex flex-col gap-1">{renderItem(adminEntryItem)}</div>
            </>
          )}

          {showSettings && (
            <>
              <div className="px-3 mt-7 mb-2 text-[10px] font-bold uppercase tracking-widest text-zinc-600">
                Account
              </div>
              <div className="flex flex-col gap-1">
                {renderItem({ name: "Settings", to: "/settings", icon: SettingsIcon })}
              </div>
            </>
          )}
        </nav>

        <div className="px-5 py-4 border-t border-zinc-900/70">
          <div className="flex items-center gap-2 text-[10px] font-semibold uppercase tracking-widest text-zinc-500">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            All systems operational
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
