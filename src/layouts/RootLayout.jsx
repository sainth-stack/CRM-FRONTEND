import { Outlet } from "react-router-dom";
import Navbar from "../components/Navbar";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "../context/AuthContext";

const RootLayout = () => {
  const { isLoggedIn } = useAuth();

  return (
    <div className="min-h-screen bg-brand-light flex flex-col font-outfit">
      <Navbar />
      
      <main className="flex-grow pt-24">
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
