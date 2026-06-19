import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  useLocation,
} from "react-router-dom";
import Home from "./pages/Home";
import Products from "./pages/Products";
import CartPage from "./pages/CartPage";
import Checkout from "./pages/Checkout";
import OrderSuccess from "./pages/OrderSuccess";
import Signup from "./pages/Signup";
import Login from "./pages/Login";
import MerchantDashboard from "./pages/MerchantDashboard";
import AdminDashboard from "./pages/AdminDashboard";
import { useAuth } from "./contexts/AuthContext";
import ChatBotDock from "./components/ChatBotDock";
import AppLayout from "./components/layout/AppLayout";

import CreditProfile from "./pages/CreditProfile";
import OrderHistory from "./pages/profile/OrderHistory";
import Notifications from "./pages/profile/Notifications";
import Boosters from "./pages/profile/Boosters";
import Installments from "./pages/profile/Installments";

function ProtectedRoute({ children, role }) {
  const { user, token } = useAuth();
  const location = useLocation();

  if (!token) {
    return (
      <Navigate
        to="/login"
        replace
        state={{ from: location.pathname + location.search }}
      />
    );
  }

  if (token && !user) return <div className="p-6">Loading…</div>;
  if (role && user?.role !== role) return <Navigate to="/" replace />;
  return children;
}

export default function App() {
  const { user, customerId } = useAuth();

  return (
    <Router>
      <Routes>
        <Route element={<AppLayout />}>
          <Route path="/" element={<Home />} />
          <Route path="/products" element={<Products />} />
          <Route path="/cart" element={<CartPage />} />
          <Route path="/checkout" element={<Checkout />} />
          <Route path="/order-success" element={<OrderSuccess />} />

          <Route
            path="/profile"
            element={
              <ProtectedRoute role="customer">
                <CreditProfile />
              </ProtectedRoute>
            }
          />

          <Route
            path="/profile/orders"
            element={
              <ProtectedRoute role="customer">
                <OrderHistory />
              </ProtectedRoute>
            }
          />
          <Route
            path="/profile/notifications"
            element={
              <ProtectedRoute role="customer">
                <Notifications />
              </ProtectedRoute>
            }
          />
          <Route
            path="/profile/boosters"
            element={
              <ProtectedRoute role="customer">
                <Boosters />
              </ProtectedRoute>
            }
          />
          <Route
            path="/profile/installments"
            element={
              <ProtectedRoute role="customer">
                <Installments />
              </ProtectedRoute>
            }
          />
          <Route
            path="/merchant/dashboard"
            element={
              <ProtectedRoute role="merchant">
                <MerchantDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/dashboard"
            element={
              <ProtectedRoute role="admin">
                <AdminDashboard />
              </ProtectedRoute>
            }
          />
        </Route>
        <Route path="/signup" element={<Signup />} />
        <Route path="/login" element={<Login />} />
      </Routes>
      {user?.role === "customer" && customerId && (
        <ChatBotDock customerId={customerId} />
      )}
    </Router>
  );
}
