import { Outlet, useLocation } from "react-router-dom";
import Navbar from "../components/Navbar";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "../context/AuthContext";

const RootLayout = () => {
  const { isLoggedIn } = useAuth();
  const location = useLocation();
  const isCampaignWorkspace = location.pathname.startsWith("/campaign");
  const isHome = location.pathname === "/";
  const isAuthPage = ["/login", "/forgot-password", "/setup-password", "/demo", "/demo/verify"].includes(location.pathname);
  const isOnboardingOrSettings = ["/profile", "/settings", "/connect-calendar", "/connect-mailbox", "/change-password"].includes(location.pathname);
  const shouldSuppressPadding = isCampaignWorkspace || isHome || isAuthPage || isOnboardingOrSettings;

  return (
    <div className={`min-h-screen flex flex-col font-outfit transition-colors duration-300 ${
      isCampaignWorkspace ? "bg-brand-light" : "bg-[#030712] text-white dark-portal-theme"
    }`}>
      {!isCampaignWorkspace && !isAuthPage && <Navbar />}
      
      <main className={`flex-grow ${shouldSuppressPadding ? "pt-0" : "pt-[74px]"}`}>
        <AnimatePresence mode="wait">
          <motion.div
            key={isLoggedIn ? "logged-in" : "logged-out"}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.4 }}
          >
            <Outlet />
          </motion.div>
        </AnimatePresence>
      </main>

    </div>
  );
};

export default RootLayout;
