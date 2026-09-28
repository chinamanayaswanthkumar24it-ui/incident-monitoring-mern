import { Navigate } from "react-router-dom";
import { useAuth } from "../context/auth-context";

export default function ProtectedRoute({ children, roles }) {
  const { user, token, loading } = useAuth();

  if (loading) {
    return (
      <div className="page-loading">
        <div className="spinner" />
      </div>
    );
  }

  if (!token || !user) {
    return <Navigate to="/login" replace />;
  }

  if (roles && !roles.includes(user.role)) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
}
