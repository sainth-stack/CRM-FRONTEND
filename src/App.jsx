import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import RootLayout from "./layouts/RootLayout";
import Home from "./pages/Home";
import CreateCampaign from "./pages/CreateCampaign";
import DefineQuery from "./pages/DefineQuery";
import ActiveCampaigns from "./pages/ActiveCampaigns";
import InactiveCampaigns from "./pages/InactiveCampaigns";
import CampaignWorkspace from "./pages/CampaignWorkspace";

import ProspectHistory from "./pages/ProspectHistory";
import Login from "./pages/Login";
import ForgotPassword from "./pages/ForgotPassword";
import MailboxPermissionBarrier from "./components/MailboxPermissionBarrier";
import DemoExpiryBarrier from "./components/DemoExpiryBarrier";
import ConnectMailbox from "./pages/ConnectMailbox";
import DemoSignUp from "./pages/DemoSignUp";
import VerifyDemoOTP from "./pages/VerifyDemoOTP";
import SuperAdminDashboard from "./pages/SuperAdminDashboard";
import AdminDashboard from "./pages/AdminDashboard";
import { useAuth } from "./context/AuthContext";
import { ToastProvider } from "./context/ToastContext";
import { Navigate } from "react-router-dom";

const ProtectedRoute = ({ children }) => {
  const { isLoggedIn, loading } = useAuth();
  if (loading) return null;
  if (!isLoggedIn) return <Navigate to="/login" replace />;
  return children;
};

const CapabilityRoute = ({ children }) => {
  const { isLoggedIn, user, hasMailbox, loading } = useAuth();
  if (loading) return null;
  if (!isLoggedIn) return <Navigate to="/login" replace />;
  const role = user?.role?.toUpperCase();
  // Restrict Sovereign/Admin identities from User operational sectors
  if (role === "SUPER_ADMIN" || role === "ADMIN") return <Navigate to="/" replace />;
  if (!hasMailbox) return <Navigate to="/connect-mailbox" replace />;
  return children;
};

const SovereignRoute = ({ children }) => {
  const { isLoggedIn, user, loading } = useAuth();
  if (loading) return null;
  if (!isLoggedIn) return <Navigate to="/login" replace />;
  if (user?.role !== "super_admin") return <Navigate to="/" replace />;
  return children;
};

const ManagementRoute = ({ children }) => {
  const { isLoggedIn, user, loading } = useAuth();
  if (loading) return null;
  if (!isLoggedIn) return <Navigate to="/login" replace />;
  if (user?.role !== "admin" && user?.role !== "super_admin") return <Navigate to="/" replace />;
  return children;
};

function AppContents() {
  const { isLoggedIn, user, hasMailbox, loading } = useAuth();
  const location = useLocation();

  if (loading) return <div className="min-h-screen bg-[#050505] flex items-center justify-center font-bold text-zinc-600">Synchronizing Session...</div>;

  const searchParams = new URLSearchParams(location.search);
  const hasOAuthCallbackParams = searchParams.has("code") && searchParams.has("state");
  if (hasOAuthCallbackParams && location.pathname !== "/auth/google/callback") {
    return <Navigate to={`/auth/google/callback${location.search}`} replace />;
  }

  // Strategic UI Suppression: Do not show the barrier if we are currently 
  // on the connection page or if the user is an administrative identity.
  const isConnectionPage = location.pathname === "/connect-mailbox" || location.pathname === "/auth/google/callback";
  const showMailboxBarrier = isLoggedIn && !hasMailbox && !isConnectionPage;

  return (
    <>
      {showMailboxBarrier && <MailboxPermissionBarrier />}
      <DemoExpiryBarrier>
        <Routes>
          <Route path="/" element={<RootLayout />}>
            <Route index element={<Home />} />
            <Route path="login" element={<Login />} />
            <Route path="forgot-password" element={<ForgotPassword />} />
            
            {/* Demo Identity Portal */}
            <Route path="demo" element={<DemoSignUp />} />
            <Route path="demo/verify" element={<VerifyDemoOTP />} />
            
            <Route path="sovereign" element={<SovereignRoute><SuperAdminDashboard /></SovereignRoute>} />
            <Route path="management" element={<ManagementRoute><AdminDashboard /></ManagementRoute>} />
            
            <Route path="connect-mailbox" element={<ProtectedRoute><ConnectMailbox /></ProtectedRoute>} />
            <Route path="auth/google/callback" element={<ProtectedRoute><ConnectMailbox /></ProtectedRoute>} />
            
            {/* Protected & Capability-Enforced Routes */}
            <Route path="create" element={<CapabilityRoute><CreateCampaign /></CapabilityRoute>} />
            <Route path="create/query" element={<CapabilityRoute><DefineQuery /></CapabilityRoute>} />
            <Route path="active" element={<CapabilityRoute><ActiveCampaigns /></CapabilityRoute>} />
            <Route path="inactive" element={<CapabilityRoute><InactiveCampaigns /></CapabilityRoute>} />
            <Route path="campaign/:id" element={<CapabilityRoute><CampaignWorkspace /></CapabilityRoute>} />
            <Route path="campaign/:id/prospect/:dmId" element={<CapabilityRoute><ProspectHistory /></CapabilityRoute>} />
          </Route>
        </Routes>
      </DemoExpiryBarrier>
    </>
  );
}

function App() {
  return (
    <ToastProvider>
      <BrowserRouter>
        <AppContents />
      </BrowserRouter>
    </ToastProvider>
  );
}

export default App;
