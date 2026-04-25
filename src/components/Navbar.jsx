import { Link, useLocation } from "react-router-dom";
import { LayoutGrid, Settings as SettingsIcon, ShieldCheck } from "lucide-react";
import { useAuth } from "../context/AuthContext";

const Navbar = () => {
  const { isLoggedIn, logout, user } = useAuth();
  const location = useLocation();
  const isActive = (path) => location.pathname === path;

  const role = user?.role?.toUpperCase();
  const navLinks = role === "USER" ? [
    { name: "New Campaign", path: "/create" },
    { name: "Active", path: "/active" },
    { name: "Inactive", path: "/inactive" },
  ] : [];

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white shadow-sm">
      {/* Sovereign Accent Bar */}
      <div className={`h-1.5 w-full ${role === 'SUPER_ADMIN' ? 'bg-amber-500' : role === 'ADMIN' ? 'bg-emerald-500' : 'bg-brand-primary'}`} />
      
      <div className="max-w-[1440px] mx-auto px-6 h-24 flex items-center justify-between">
        {/* Logo Artifact */}
        <Link to="/" className="flex items-center gap-3 group font-outfit">
           <img src="/logo.png" alt="AI-PRIORI Logo" className="w-18 h-18 object-contain group-hover:scale-105 transition-transform" />
           <div className="flex flex-col items-start">
             <span className="font-extrabold text-4xl tracking-tighter text-brand-primary leading-none uppercase">
                AI-PRIORI
             </span>
             <div className="flex justify-between w-full items-center mt-0 px-0.5">
               <span className="text-[11px] font-medium text-brand-secondary uppercase tracking-tighter">DATA</span>
               <span className="text-[11px] font-medium text-brand-dark leading-none">-</span>
               <span className="text-[11px] font-medium text-brand-accent uppercase tracking-tighter">INTELLIGENCE</span>
               <span className="text-[11px] font-medium text-brand-dark leading-none">-</span>
               <span className="text-[11px] font-medium text-brand-primary uppercase tracking-tighter">AUTONOMY</span>
             </div>
           </div>
        </Link>

        {/* Dynamic Command Interface - Role Filtered */}
        <nav className="flex items-center gap-10">
          {isLoggedIn && navLinks.map((link) => (
            <Link
              key={link.path}
              to={link.path}
              className={`text-[13px] font-black uppercase tracking-[0.15em] transition-all relative h-24 flex items-center ${
                isActive(link.path) ? "text-brand-primary" : "text-zinc-400 hover:text-zinc-800"
              }`}
            >
              {link.name}
              {isActive(link.path) && (
                <div className="absolute bottom-0 left-0 right-0 h-1 bg-brand-primary rounded-t-full shadow-[0_-4px_10px_rgba(59,130,246,0.3)]" />
              )}
            </Link>
          ))}

            {/* Management Link for Admins */}
            {isLoggedIn && (role === "ADMIN" || role === "SUPER_ADMIN") && (
              <Link
                to={role === "SUPER_ADMIN" ? "/sovereign" : "/management"}
                className={`flex items-center gap-2.5 px-6 py-2.5 rounded-xl text-[12px] font-black uppercase tracking-widest transition-all ${
                  isActive(role === "SUPER_ADMIN" ? "/sovereign" : "/management")
                    ? "bg-brand-operational text-white shadow-lg shadow-brand-operational/25"
                    : "bg-zinc-50 text-zinc-400 hover:bg-zinc-100 hover:text-zinc-900 border border-zinc-100"
                }`}
              >
                <ShieldCheck size={16} className={isActive(role === "SUPER_ADMIN" ? "/sovereign" : "/management") ? "text-white" : "text-brand-operational"} />
                {role === "SUPER_ADMIN" ? "Sovereign Deck" : "Admin Deck"}
              </Link>
            )}
        </nav>

        {/* Auth Buttons / Profile - Right */}
        <div className="flex items-center gap-4">
          {!isLoggedIn && !isActive("/login") && !isActive("/forgot-password") && !isActive("/demo") && !isActive("/demo/verify") && (
            <>
              <Link 
                to="/login"
                className="text-[14px] font-bold uppercase tracking-widest text-[#1e293b] hover:border-brand-primary transition-all px-6 py-2.5 border border-zinc-200 rounded-lg hover:text-brand-primary active:scale-95 shadow-sm"
              >
                Sign In
              </Link>
              <Link 
                to="/demo"
                className="text-[14px] font-bold uppercase tracking-widest bg-brand-primary text-white px-6 py-2.5 rounded-lg hover:bg-brand-primary/90 transition-all shadow-md active:scale-95 shadow-brand-primary/20"
              >
                Launch Trial
              </Link>
            </>
          )}
          {isLoggedIn && (
            <button 
              onClick={logout}
              className="text-[14px] font-bold uppercase tracking-widest text-zinc-400 hover:text-brand-primary transition-colors px-4 py-2"
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
