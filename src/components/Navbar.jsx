import { useEffect, useRef, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { LayoutGrid, Settings as SettingsIcon, ShieldCheck, User as UserIcon, LogOut } from "lucide-react";
import { useAuth } from "../context/AuthContext";

const Navbar = () => {
  const { isLoggedIn, logout, user } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const isActive = (path) => location.pathname === path;

  // Avatar dropdown state
  const [menuOpen, setMenuOpen] = useState(false);
  const [imgError, setImgError] = useState(false);
  const menuRef = useRef(null);

  // Close on outside click or Escape — no external library needed
  useEffect(() => {
    if (!menuOpen) return;
    const onClick = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) setMenuOpen(false);
    };
    const onKey = (e) => { if (e.key === "Escape") setMenuOpen(false); };
    document.addEventListener("mousedown", onClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onClick);
      document.removeEventListener("keydown", onKey);
    };
  }, [menuOpen]);

  // No explicit route-change effect needed — clicking a nav <Link> is an outside
  // click, which the mousedown handler above already uses to close the menu.

  // Derive initial for avatar — prefer full_name when present, fall back to email
  const avatarInitial = (user?.full_name || user?.email || "?").trim().charAt(0).toUpperCase();

  const handleProfile = () => {
    setMenuOpen(false);
    navigate("/profile");
  };

  const handleLogout = () => {
    setMenuOpen(false);
    logout();
    navigate("/login", { replace: true });
  };

  const role = user?.role?.toUpperCase();
  const isAdmin = role === "ADMIN" || role === "SUPER_ADMIN";
  const navLinks = role === "USER" ? [
    { name: "New Campaign", path: "/create" },
    { name: "Active", path: "/active" },
    { name: "Inactive", path: "/inactive" },
  ] : isAdmin ? [
    { name: "Admin Deck", path: role === "SUPER_ADMIN" ? "/sovereign" : "/management" },
    { name: "Analysis", path: "/analysis" },
  ] : [];

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white border-b border-slate-100/80 shadow-sm select-none">
      {/* Premium Red Accent Bar */}
      <div className={`h-1 w-full ${role === 'SUPER_ADMIN' ? 'bg-amber-500' : role === 'ADMIN' ? 'bg-emerald-500' : 'bg-red-600'}`} />
      
      <div className="w-full px-4 md:px-6 h-[70px] flex items-center justify-between">
        {/* Logo Branding */}
        <Link to="/" className="flex items-center gap-3 group hover:scale-[1.03] active:scale-[0.97] transition-all duration-200 pl-[2px]">
          <img 
            src="/Navbar_logo.png" 
            alt="AI-PRIORI Logo" 
            className="h-[50px] md:h-[58px] w-auto object-contain shrink-0" 
          />
        </Link>

        {/* Dynamic Command Interface */}
        <nav className="hidden md:flex items-center gap-8">
          {isLoggedIn && navLinks.map((link) => (
            <Link
              key={link.path}
              to={link.path}
              className={`text-xs font-bold uppercase tracking-wider transition-all relative h-[92px] flex items-center ${
                isActive(link.path) ? "text-red-600 font-extrabold" : "text-slate-500 hover:text-slate-800"
              }`}
            >
              {link.name}
              {isActive(link.path) && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-red-600 rounded-t-full shadow-sm" />
              )}
            </Link>
          ))}


        </nav>

        {/* Action Blocks & Logout */}
        <div className="flex items-center gap-3">
          {!isLoggedIn && !isActive("/login") && !isActive("/forgot-password") && !isActive("/demo") && !isActive("/demo/verify") && (
            <>
              <Link 
                to="/login"
                className="text-xs font-bold uppercase tracking-widest text-slate-600 hover:text-red-600 border border-slate-200/80 hover:border-red-100 bg-white rounded-xl transition-all px-4 py-2.5 shadow-sm active:scale-95 hover:bg-slate-50/50"
              >
                Sign In
              </Link>
              <Link 
                to="/demo"
                className="text-xs font-extrabold uppercase tracking-widest bg-red-600 hover:bg-red-700 text-white px-4 py-2.5 rounded-xl hover:shadow-md transition-all shadow-md active:scale-95 shadow-red-500/10"
              >
                Launch Trial
              </Link>
            </>
          )}
          {isLoggedIn && (
            <div className="relative" ref={menuRef}>
              <div className="flex items-center gap-3">
                <span className="hidden sm:inline-block text-xs font-black uppercase tracking-widest text-slate-600/90 select-none">
                  {user?.full_name || user?.email?.split("@")[0]}
                </span>
                <button
                  type="button"
                  onClick={() => setMenuOpen((v) => !v)}
                  aria-haspopup="menu"
                  aria-expanded={menuOpen}
                  aria-label="Account menu"
                  title={user?.email || "Account"}
                  className={`w-12 h-12 rounded-full flex items-center justify-center font-extrabold text-sm uppercase tracking-tight shadow-sm border transition-all active:scale-95 overflow-hidden ${
                    menuOpen
                      ? "bg-red-600 text-white border-red-600 ring-2 ring-red-500/20"
                      : "bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100 hover:border-slate-300"
                  }`}
                >
                  {!imgError ? (
                    <img
                      src="/default-avatar.png"
                      alt="User Profile"
                      className="w-full h-full object-cover rounded-full"
                      onError={() => setImgError(true)}
                    />
                  ) : (
                    avatarInitial
                  )}
                </button>
              </div>

              {menuOpen && (
                <div
                  role="menu"
                  className="absolute right-0 mt-2 w-60 bg-white border border-slate-100 rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.08)] overflow-hidden z-50 origin-top-right"
                >
                  {/* Identity header */}
                  <div className="px-4 py-3 border-b border-slate-100 bg-slate-50/60">
                    <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                      Signed in as
                    </div>
                    <div className="text-xs font-bold text-slate-800 truncate">
                      {user?.full_name || user?.email}
                    </div>
                    {user?.full_name && (
                      <div className="text-[10px] font-medium text-slate-400 truncate">
                        {user?.email}
                      </div>
                    )}
                  </div>

                  <button
                    role="menuitem"
                    onClick={handleProfile}
                    className="w-full flex items-center gap-3 px-4 py-3 text-xs font-bold uppercase tracking-widest text-slate-700 hover:bg-slate-50 hover:text-red-600 transition-colors"
                  >
                    <UserIcon size={14} />
                    Profile
                  </button>
                  <button
                    role="menuitem"
                    onClick={handleLogout}
                    className="w-full flex items-center gap-3 px-4 py-3 text-xs font-bold uppercase tracking-widest text-slate-700 hover:bg-slate-50 hover:text-red-600 transition-colors border-t border-slate-100"
                  >
                    <LogOut size={14} />
                    Logout
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Navbar;
