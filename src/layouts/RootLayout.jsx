import { useState } from "react";
import { Outlet, useLocation } from "react-router-dom";
import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "../context/AuthContext";

const RootLayout = () => {
  const { isLoggedIn } = useAuth();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const isCampaignWorkspace = location.pathname.startsWith("/campaign");
  const isHome = location.pathname === "/";
  const isAuthPage = ["/login", "/forgot-password", "/setup-password", "/demo", "/demo/verify"].includes(location.pathname);
  const isOnboarding = ["/connect-calendar", "/connect-mailbox"].includes(location.pathname) || location.pathname.startsWith("/auth/google");

  // The sidebar is the primary navigation surface for the authenticated app.
  // It is suppressed on auth, onboarding, and the immersive campaign workspace.
  const showSidebar = isLoggedIn && !isAuthPage && !isOnboarding && !isCampaignWorkspace;

  // Pages fully redesigned with explicit dark-theme classes opt OUT of the global
  // `.dark-portal-theme` override (which force-recolors text/borders and would fight
  // their hand-tuned cyan/rose/emerald styling). Everything else relies on the override.
  const rawThemeRoutes = ["/create/setup", "/active", "/inactive", "/contact"];
  const isRawThemePage = rawThemeRoutes.includes(location.pathname);

  const shouldSuppressTopPadding = isHome || isAuthPage || isOnboarding ||
    ["/profile", "/settings", "/change-password"].includes(location.pathname);

  return (
    <div className={`min-h-screen flex flex-col font-outfit transition-colors duration-300 ${
      isCampaignWorkspace
        ? "bg-brand-light"
        : isRawThemePage
        ? "bg-[#030712] text-white"
        : "bg-[#030712] text-white dark-portal-theme"
    }`}>
      {!isAuthPage && (
        <Navbar
          showMenuButton={showSidebar}
          onMenuClick={() => setSidebarOpen(true)}
        />
      )}

      {showSidebar && (
        <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      )}

      <main
        className={`flex-grow ${shouldSuppressTopPadding ? "pt-0" : "pt-[74px]"} ${
          showSidebar ? "md:pl-64" : ""
        }`}
      >
        <AnimatePresence mode="wait">
          <motion.div
            key={location.pathname}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.35 }}
          >
            <Outlet />
          </motion.div>
        </AnimatePresence>
      </main>
    </div>
  );
};

export default RootLayout;
