import { Navigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { adminDefaultPath } from "../../utils/roles";

export default function AdminIndex() {
  const { user } = useAuth();
  return <Navigate to={adminDefaultPath(user)} replace />;
}
