import { Outlet } from "react-router-dom";

import Navbar from "../Navbar";
import { useAuth } from "../../contexts/AuthContext";

function PublicLayout() {
  return (
    <>
      <Navbar />
      <Outlet />
    </>
  );
}

function CustomerLayout() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <main className="max-w-7xl mx-auto px-4 py-6">
        <Outlet />
      </main>
    </div>
  );
}

function MerchantLayout() {
  return (
    <div className="min-h-screen bg-gray-100">
      <Navbar />
      <main className="max-w-7xl mx-auto px-6 py-8">
        <Outlet />
      </main>
    </div>
  );
}

export default function AppLayout() {
  const { isAuthenticated, isMerchant } = useAuth();

  if (!isAuthenticated) return <PublicLayout />;
  if (isMerchant) return <MerchantLayout />;
  return <CustomerLayout />;
}
