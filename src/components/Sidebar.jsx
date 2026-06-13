import { NavLink } from "react-router-dom";
import {
  LayoutDashboard,
  PlusCircle,
  Radio,
  Archive,
  Settings as SettingsIcon,
  ShieldCheck,
  BarChart3,
  X,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";

const SIDEBAR_WIDTH = "w-64"; // 16rem / 256px

const Sidebar = ({ open, onClose }) => {
  const { user } = useAuth();
  const role = user?.role?.toUpperCase();
  const isAdmin = role === "ADMIN" || role === "SUPER_ADMIN";

  const primaryItems = isAdmin
    ? [
        {
          name: "Admin Deck",
          to: role === "SUPER_ADMIN" ? "/sovereign" : "/management",
          icon: ShieldCheck,
        },
        { name: "Analysis", to: "/analysis", icon: BarChart3 },
      ]
    : [
        { name: "Dashboard", to: "/", icon: LayoutDashboard, end: true },
        { name: "Launch Campaign", to: "/create", icon: PlusCircle },
        { name: "Active", to: "/active", icon: Radio },
        { name: "Inactive", to: "/inactive", icon: Archive },
      ];

  const secondaryItems = isAdmin
    ? []
    : [{ name: "Settings", to: "/settings", icon: SettingsIcon }];

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
            {/* Active accent rail */}
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

  return (
    <>
      {/* Mobile backdrop */}
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
        {/* Mobile close */}
        <div className="flex md:hidden items-center justify-between px-4 pt-4">
          <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-600">
            Navigation
          </span>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800/60 transition-colors"
            aria-label="Close navigation"
          >
            <X size={18} />
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto custom-scrollbar px-3 py-5">
          <div className="px-3 mb-2 text-[10px] font-bold uppercase tracking-widest text-zinc-600">
            Workspace
          </div>
          <div className="flex flex-col gap-1">{primaryItems.map(renderItem)}</div>

          {secondaryItems.length > 0 && (
            <>
              <div className="px-3 mt-7 mb-2 text-[10px] font-bold uppercase tracking-widest text-zinc-600">
                Account
              </div>
              <div className="flex flex-col gap-1">
                {secondaryItems.map(renderItem)}
              </div>
            </>
          )}
        </nav>

        {/* Footer status */}
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
