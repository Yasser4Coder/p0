import { Navigate } from "react-router-dom";
import { isSignedInAdmin } from "../lib/adminAuth";

export default function ProtectedAdminRoute({
  children,
}: {
  children: React.ReactNode;
}) {
  if (!isSignedInAdmin()) {
    return <Navigate to="/admin/login" replace />;
  }
  return children;
}

