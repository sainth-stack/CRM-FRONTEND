import { Outlet } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { AppLayout } from "@/components/AppLayout";

export function ConditionalAppLayout() {
  const { isLoggedIn, loading } = useAuth();
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background text-muted-foreground font-medium">
        Synchronizing Session...
      </div>
    );
  }
  if (isLoggedIn) return <AppLayout />;
  return <Outlet />;
}
