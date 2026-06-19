import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

export default function ProtectedRoute({ children, role }) {
  const { isAuthenticated, isCustomer, isMerchant, authReady } = useAuth();
  const location = useLocation();

  if (!authReady) return null;

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location.pathname }} replace />;
  }

  if (role === "customer" && !isCustomer) {
    return <Navigate to="/merchant/dashboard" replace />;
  }

  if (role === "merchant" && !isMerchant) {
    return <Navigate to="/products" replace />;
  }

  return children;
}
