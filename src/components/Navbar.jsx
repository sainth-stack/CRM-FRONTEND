import { Link, useLocation } from "react-router-dom";
import { LayoutGrid, Settings as SettingsIcon, ShieldCheck } from "lucide-react";
import { useAuth } from "../context/AuthContext";

const Navbar = () => {
  const { isLoggedIn, logout, user } = useAuth();
  const location = useLocation();
  const isActive = (path) => location.pathname === path;

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
      
      <div className="w-full px-4 md:px-6 h-20 flex items-center justify-between">
        {/* Logo Branding */}
        <Link to="/" className="flex items-center gap-3 group">
           <img src="/logo.png" alt="AI-PRIORI Logo" className="w-14 h-14 object-cover rounded-full group-hover:scale-105 transition-transform shrink-0 mix-blend-multiply" />
            <div className="flex flex-col items-start leading-none shrink-0 font-outfit">
              <span className="font-extrabold text-3xl md:text-4xl tracking-tighter text-red-600 leading-none uppercase select-none">
                 AI-PRIORI
              </span>
              <div className="flex justify-between w-full items-center mt-1 px-0.5">
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-tighter">DATA</span>
                <span className="text-[10px] font-bold text-slate-300 leading-none">-</span>
                <span className="text-[10px] font-bold text-red-600 uppercase tracking-tighter">INTELLIGENCE</span>
                <span className="text-[10px] font-bold text-slate-300 leading-none">-</span>
                <span className="text-[10px] font-bold text-slate-600 uppercase tracking-tighter">AUTONOMY</span>
              </div>
            </div>
        </Link>

        {/* Dynamic Command Interface */}
        <nav className="hidden md:flex items-center gap-8">
          {isLoggedIn && navLinks.map((link) => (
            <Link
              key={link.path}
              to={link.path}
              className={`text-xs font-bold uppercase tracking-wider transition-all relative h-20 flex items-center ${
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
            <button 
              onClick={logout}
              className="text-xs font-extrabold uppercase tracking-widest text-slate-400 hover:text-red-600 transition-colors px-3 py-2 select-none"
            >
              Sign Out
            </button>
          )}
        </div>
      </div>
    </header>
  );
};

export default Navbar;
