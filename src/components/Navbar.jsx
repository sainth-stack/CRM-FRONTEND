import { useEffect, useRef, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Menu, Settings as SettingsIcon, User as UserIcon, LogOut, Lock } from "lucide-react";
import { useAuth } from "../context/AuthContext";

const Navbar = ({ showMenuButton = false, onMenuClick }) => {
  const { isLoggedIn, logout, user } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const isActive = (path) => location.pathname === path;
  // Force global Navbar to always be dark to maintain consistency across all pages
  const isDarkPage = true;

  // Avatar dropdown state
  const [menuOpen, setMenuOpen] = useState(false);
  const [imgError, setImgError] = useState(false);
  const menuRef = useRef(null);

  // Close on outside click or Escape
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

  // Derive initial for avatar
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

  return (
    <header className={`fixed top-0 left-0 right-0 z-50 select-none transition-all duration-300 ${
      isDarkPage 
        ? "bg-[#030712]/80 backdrop-blur-md border-b border-zinc-900/50 shadow-none" 
        : "bg-white border-b border-slate-100/80 shadow-sm"
    }`}>
      {/* Dynamic Accent Bar */}
      <div className={`h-[2px] w-full transition-colors duration-300 ${
        isDarkPage 
          ? 'bg-[#00f0ff]' 
          : role === 'SUPER_ADMIN' 
          ? 'bg-amber-500' 
          : role === 'ADMIN' 
          ? 'bg-emerald-500' 
          : 'bg-red-600'
      }`} />
      
      <div className="w-full px-4 md:px-6 h-[70px] flex items-center justify-between">
        {/* Left cluster: mobile menu toggle + logo */}
        <div className="flex items-center gap-2">
          {showMenuButton && (
            <button
              type="button"
              onClick={onMenuClick}
              aria-label="Open navigation"
              className="md:hidden p-2 -ml-1 rounded-xl text-zinc-300 hover:text-white hover:bg-zinc-800/50 transition-colors active:scale-95"
            >
              <Menu size={20} />
            </button>
          )}
          {/* Logo Branding */}
          <Link to="/" className="flex items-center gap-3 group hover:scale-[1.01] active:scale-[0.99] transition-all duration-200 pl-[2px]">
          <div className="w-[34px] h-[34px] flex items-center justify-center shrink-0">
            <svg className="w-8 h-8 text-[#00f0ff] drop-shadow-[0_0_8px_rgba(0,240,255,0.45)]" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="12" cy="12" r="7.5" stroke="currentColor" strokeWidth="1.5" />
              <circle cx="12" cy="12" r="4.5" stroke="currentColor" strokeWidth="1.5" />
              <circle cx="12" cy="12" r="1.8" fill="currentColor" />
              <line x1="12" y1="1" x2="12" y2="3.2" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
              <line x1="12" y1="20.8" x2="12" y2="23" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
              <line x1="1" y1="12" x2="3.2" y2="12" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
              <line x1="20.8" y1="12" x2="23" y2="12" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
              <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="1.2" strokeDasharray="1.2 2.2" strokeLinecap="round" />
            </svg>
          </div>
          <span className={`font-black tracking-tight ${isDarkPage ? "text-white" : "text-slate-900"}`} style={{ fontSize: "calc(0.92rem + 5px)" }}>
            Focal<span className="text-[#00f0ff] font-black">Reach</span> <span className="text-zinc-500 font-semibold tracking-wider ml-1" style={{ fontSize: "11px" }}>AI</span>
          </span>
          </Link>
        </div>

        {/* Action Blocks & Logout */}
        <div className="flex items-center gap-3">
          {!isLoggedIn && !isActive("/login") && !isActive("/forgot-password") && !isActive("/demo") && !isActive("/demo/verify") && (
            <>
              {isDarkPage ? (
                <>
                  <Link 
                    to="/login"
                    className="text-xs font-bold uppercase tracking-widest text-zinc-300 hover:text-white transition-all px-4 py-2.5 rounded-xl hover:bg-zinc-800/30"
                  >
                    Log In
                  </Link>
                  <Link 
                    to="/demo"
                    className="text-xs font-extrabold uppercase tracking-widest bg-[#00f0ff] hover:bg-[#26f3ff] text-zinc-950 px-4 py-2.5 rounded-xl transition-all shadow-[0_0_15px_rgba(0,240,255,0.25)] active:scale-95"
                  >
                    Sign In
                  </Link>
                </>
              ) : (
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
            </>
          )}
          {isLoggedIn && (
            <div className="relative" ref={menuRef}>
              <div className="flex items-center gap-3">
                <span className={`hidden sm:inline-block text-xs font-black uppercase tracking-widest select-none ${
                  isDarkPage ? "text-zinc-400" : "text-slate-600/90"
                }`}>
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
                      ? isDarkPage 
                        ? "bg-[#00f0ff] text-zinc-950 border-[#00f0ff] ring-2 ring-[#00f0ff]/20" 
                        : "bg-red-600 text-white border-red-600 ring-2 ring-red-500/20"
                      : isDarkPage
                        ? "bg-zinc-900 text-zinc-300 border-zinc-800 hover:bg-zinc-800 hover:border-zinc-700"
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
                  className={`absolute right-0 mt-2 w-60 rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.12)] overflow-hidden z-50 origin-top-right ${
                    isDarkPage 
                      ? "bg-[#090d1a] border border-zinc-850 text-white shadow-cyan-950/20"
                      : "bg-white border border-slate-100 text-slate-700"
                  }`}
                >
                  {/* Identity header */}
                  <div className={`px-4 py-3 border-b ${
                    isDarkPage ? "border-zinc-800/80 bg-[#060a15]/60" : "border-slate-100 bg-slate-50/60"
                  }`}>
                    <div className={`text-[10px] font-black uppercase tracking-widest ${
                      isDarkPage ? "text-zinc-500" : "text-slate-400"
                    }`}>
                      Signed in as
                    </div>
                    <div className={`text-xs font-bold truncate ${
                      isDarkPage ? "text-zinc-200" : "text-slate-800"
                    }`}>
                      {user?.full_name || user?.email}
                    </div>
                    {user?.full_name && (
                      <div className="text-[10px] font-medium text-zinc-500 truncate">
                        {user?.email}
                      </div>
                    )}
                  </div>

                  <button
                    role="menuitem"
                    onClick={handleProfile}
                    className={`w-full flex items-center gap-3 px-4 py-3 text-xs font-bold uppercase tracking-widest transition-colors ${
                      isDarkPage 
                        ? "text-zinc-300 hover:bg-zinc-800/30 hover:text-[#00f0ff]" 
                        : "text-slate-700 hover:bg-slate-50 hover:text-red-600"
                    }`}
                  >
                    <UserIcon size={14} />
                    Profile
                  </button>
                  {role === "USER" && (
                    <button
                      role="menuitem"
                      onClick={() => {
                        setMenuOpen(false);
                        navigate("/settings");
                      }}
                      className={`w-full flex items-center gap-3 px-4 py-3 text-xs font-bold uppercase tracking-widest transition-colors border-t ${
                        isDarkPage 
                          ? "text-zinc-300 hover:bg-zinc-800/30 hover:text-[#00f0ff] border-zinc-800/80" 
                          : "text-slate-700 hover:bg-slate-50 hover:text-red-600 border-slate-100"
                      }`}
                    >
                      <SettingsIcon size={14} />
                      Settings
                    </button>
                  )}
                  <button
                    role="menuitem"
                    onClick={() => {
                      setMenuOpen(false);
                      navigate("/change-password");
                    }}
                    className={`w-full flex items-center gap-3 px-4 py-3 text-xs font-bold uppercase tracking-widest transition-colors border-t ${
                      isDarkPage 
                        ? "text-zinc-300 hover:bg-zinc-800/30 hover:text-[#00f0ff] border-zinc-800/80" 
                        : "text-slate-700 hover:bg-slate-50 hover:text-red-600 border-slate-100"
                    }`}
                  >
                    <Lock size={14} />
                    Change Password
                  </button>
                  <button
                    role="menuitem"
                    onClick={handleLogout}
                    className={`w-full flex items-center gap-3 px-4 py-3 text-xs font-bold uppercase tracking-widest transition-colors border-t ${
                      isDarkPage 
                        ? "text-zinc-300 hover:bg-zinc-800/30 hover:text-[#00f0ff] border-zinc-800/80" 
                        : "text-slate-700 hover:bg-slate-50 hover:text-red-600 border-slate-100"
                    }`}
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
