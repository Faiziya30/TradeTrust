// client/src/pages/AdminDashboard.jsx
import React, { useEffect, useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import { API_BASE_URL } from "../config";
import AdminUserList from "../components/admin/AdminUserList";
import AdminUserDetail from "../components/admin/AdminUserDetail";
import { ShieldCheck, RefreshCw } from "lucide-react";

export default function AdminDashboard() {
  const { token } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedId, setSelectedId] = useState(null);
  const [detail, setDetail] = useState(null);

  useEffect(() => {
    if (!token) return;
    fetchUsers();
    // eslint-disable-next-line
  }, [token]);

  async function fetchUsers() {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/admin/users`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.message || "Failed to load users");
      setUsers(json.users || []);
    } catch (err) {
      console.error(err);
      alert(err.message || "Could not load users");
    } finally {
      setLoading(false);
    }
  }

  async function handleSelectUser(userId) {
    setSelectedId(userId);
    setDetail(null);
    try {
      const res = await fetch(`${API_BASE_URL}/api/admin/users/${userId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.message || "Failed to load user");
      setDetail(json);
    } catch (err) {
      console.error(err);
      // alert(err.message || "Could not load details"); // Optional: suppress alert for sleekness
    }
  }

  return (
    <div className="h-screen bg-gray-50 flex flex-col overflow-hidden">
      {/* Top Bar */}
      <header className="bg-white border-b px-6 py-4 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-indigo-100 rounded-lg text-indigo-700">
            <ShieldCheck size={24} />
          </div>
          <div>
            <h1 className="text-xl font-black text-gray-900 leading-tight">Admin Console</h1>
            <p className="text-xs text-gray-500 font-medium">Platform Management</p>
          </div>
        </div>
        <button
          onClick={fetchUsers}
          className="flex items-center gap-2 px-3 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-sm font-medium transition"
        >
          <RefreshCw size={16} />
          <span>Refresh Data</span>
        </button>
      </header>

      {/* Main Content - Split Layout */}
      <div className="flex-1 flex p-6 gap-6 overflow-hidden">
        {/* Left Sidebar: User List */}
        <aside className="w-80 shrink-0 flex flex-col">
          <AdminUserList 
            users={users} 
            selectedId={selectedId} 
            onSelect={handleSelectUser} 
          />
        </aside>

        {/* Right Pane: Detail View */}
        <main className="flex-1 overflow-hidden">
          <AdminUserDetail detail={detail} />
        </main>
      </div>
    </div>
  );
}
