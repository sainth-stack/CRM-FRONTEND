import { BrowserRouter, Routes, Route, useLocation, Navigate } from "react-router-dom";
import { ConditionalAppLayout } from "@/components/ConditionalAppLayout";
import Home from "./pages/Home";
import CreateCampaign from "./pages/CreateCampaign";
import CampaignSetup from "./pages/CampaignSetup";
import ActiveCampaigns from "./pages/ActiveCampaigns";
import InactiveCampaigns from "./pages/InactiveCampaigns";
import CampaignWorkspace from "./pages/CampaignWorkspace";
import ProspectHistory from "./pages/ProspectHistory";
import Login from "./pages/Login";
import ForgotPassword from "./pages/ForgotPassword";
import SetupPassword from "./pages/SetupPassword";
import DemoExpiryBarrier from "./components/DemoExpiryBarrier";
import ConnectMailbox from "./pages/ConnectMailbox";
import ConnectCalendar from "./pages/ConnectCalendar";
import DemoSignUp from "./pages/DemoSignUp";
import ComingSoon from "./pages/ComingSoon";
import VerifyDemoOTP from "./pages/VerifyDemoOTP";
import AdminLayout from "./pages/admin/AdminLayout";
import AdminIndex from "./pages/admin/AdminIndex";
import Tenants from "./pages/admin/Tenants";
import Organizations from "./pages/admin/Organizations";
import UserRoles from "./pages/admin/UserRoles";
import Users from "./pages/admin/Users";
import UserSessions from "./pages/admin/UserSessions";
import Settings from "./pages/Settings";
import { adminDefaultPath, isSuperAdmin } from "./utils/roles";
import BusinessProfile from "./pages/BusinessProfile";
import ChangePassword from "./pages/ChangePassword";
import { useAuth } from "./context/AuthContext";
import { ToastProvider } from "./context/ToastContext";

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
  if (isSuperAdmin(user)) return children;
  if (user?.role === "admin") return <Navigate to="/" replace />;
  if (!hasMailbox) return <Navigate to="/connect-mailbox" replace />;
  return children;
};

const AdminRoute = ({ children }) => {
  const { isLoggedIn, user, loading } = useAuth();
  if (loading) return null;
  if (!isLoggedIn) return <Navigate to="/login" replace />;
  if (user?.role !== "admin" && user?.role !== "super_admin") return <Navigate to="/" replace />;
  return children;
};

const SuperAdminOnlyRoute = ({ children }) => {
  const { isLoggedIn, user, loading } = useAuth();
  if (loading) return null;
  if (!isLoggedIn) return <Navigate to="/login" replace />;
  if (user?.role !== "super_admin") return <Navigate to={adminDefaultPath(user)} replace />;
  return children;
};

function AppContents() {
  const { isLoggedIn, user, hasMailbox, hasCalendar, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center text-muted-foreground font-medium">
        Synchronizing Session...
      </div>
    );
  }

  const searchParams = new URLSearchParams(location.search);
  const hasOAuthCallbackParams = searchParams.has("code") && searchParams.has("state");
  if (hasOAuthCallbackParams && location.pathname !== "/auth/google/callback" && location.pathname !== "/connect-calendar") {
    return <Navigate to={`/auth/google/callback${location.search}`} replace />;
  }

  const isConnectionPage = location.pathname === "/connect-mailbox" || location.pathname === "/auth/google/callback" || location.pathname === "/connect-calendar";
  const isProfilePage = location.pathname === "/profile" || location.pathname === "/change-password";
  const isTenantAdmin = user?.role === "admin";
  const isFullAccessSuperAdmin = isSuperAdmin(user);
  const skipOnboardingBarriers = isFullAccessSuperAdmin || isTenantAdmin;

  const showMailboxBarrier = isLoggedIn && !hasMailbox && !isConnectionPage && !skipOnboardingBarriers;
  const showCalendarBarrier = isLoggedIn && hasMailbox && !hasCalendar && !isConnectionPage && !skipOnboardingBarriers;
  const showProfileBarrier =
    isLoggedIn &&
    !skipOnboardingBarriers &&
    hasMailbox &&
    hasCalendar &&
    user?.profile_complete === false &&
    !isConnectionPage &&
    !isProfilePage;

  if (showMailboxBarrier) return <Navigate to="/connect-mailbox" replace />;
  if (showCalendarBarrier) return <Navigate to="/connect-calendar" replace />;
  if (showProfileBarrier) return <Navigate to="/profile" replace />;

  return (
    <DemoExpiryBarrier>
      <Routes>
        <Route path="login" element={<Login />} />
        <Route path="forgot-password" element={<ForgotPassword />} />
        <Route path="setup-password" element={<SetupPassword />} />
        <Route path="demo" element={<DemoSignUp />} />
        <Route path="demo/verify" element={<VerifyDemoOTP />} />

        <Route element={<ConditionalAppLayout />}>
          <Route index element={<Home />} />
          <Route path="contact" element={<ComingSoon />} />
          <Route path="sovereign" element={<Navigate to="/admin/tenants" replace />} />
          <Route path="management" element={<Navigate to="/admin/users" replace />} />

          <Route path="admin" element={<AdminRoute><AdminLayout /></AdminRoute>}>
            <Route index element={<AdminIndex />} />
            <Route path="tenants" element={<SuperAdminOnlyRoute><Tenants /></SuperAdminOnlyRoute>} />
            <Route path="organizations" element={<Organizations />} />
            <Route path="user-roles" element={<UserRoles />} />
            <Route path="users" element={<Users />} />
            <Route path="user-sessions" element={<UserSessions />} />
          </Route>

          <Route path="connect-mailbox" element={<ProtectedRoute><ConnectMailbox /></ProtectedRoute>} />
          <Route path="auth/google/callback" element={<ProtectedRoute><ConnectMailbox /></ProtectedRoute>} />
          <Route path="connect-calendar" element={<ProtectedRoute><ConnectCalendar /></ProtectedRoute>} />
          <Route path="settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />
          <Route path="profile" element={<ProtectedRoute><BusinessProfile /></ProtectedRoute>} />
          <Route path="change-password" element={<ProtectedRoute><ChangePassword /></ProtectedRoute>} />
          <Route path="create" element={<CapabilityRoute><CreateCampaign /></CapabilityRoute>} />
          <Route path="create/setup" element={<CapabilityRoute><CampaignSetup /></CapabilityRoute>} />
          <Route path="active" element={<CapabilityRoute><ActiveCampaigns /></CapabilityRoute>} />
          <Route path="inactive" element={<CapabilityRoute><InactiveCampaigns /></CapabilityRoute>} />
          <Route path="campaign/:id" element={<CapabilityRoute><CampaignWorkspace /></CapabilityRoute>} />
          <Route path="campaign/:id/prospect/:dmId" element={<CapabilityRoute><ProspectHistory /></CapabilityRoute>} />
        </Route>
      </Routes>
    </DemoExpiryBarrier>
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
