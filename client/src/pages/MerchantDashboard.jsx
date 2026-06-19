// client/src/pages/MerchantDashboard.jsx
import React, { useEffect, useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import { API_BASE_URL, DEFAULT_MERCHANT_ID } from "../config";
import {
  LayoutDashboard,
  Users,
  AlertTriangle,
  Undo2,
  LogOut,
  ChevronRight,
  Bell,
  Search,
  Filter,
  User as UserIcon // Imported User icon for fallback avatar
} from "lucide-react";

// --- SUB-COMPONENTS ---

function Sidebar({ activeTab, setActiveTab }) {
  const menu = [
    { id: "overview", label: "Overview", icon: LayoutDashboard },
    { id: "customers", label: "Customers", icon: Users },
    { id: "risk", label: "Risk Center", icon: AlertTriangle },
    { id: "returns", label: "Returns", icon: Undo2 },
  ];

  return (
    // Fixed sidebar position, removed redundant header
    // Added mt-16 to account for top Navbar (usually height 16 / 4rem)
    <div className="w-64 bg-white h-[calc(100vh-4rem)] fixed left-0 top-16 border-r flex flex-col">
      <nav className="flex-1 p-4 space-y-1 mt-4">
        {menu.map((item) => (
          <button
            key={item.id}
            onClick={() => setActiveTab(item.id)}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors ${
              activeTab === item.id
                ? "bg-indigo-50 text-indigo-700"
                : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
            }`}
          >
            <item.icon size={18} />
            {item.label}
          </button>
        ))}
      </nav>
      {/* Removed Sign Out as it likely duplicates top navbar functionality, or can remain at bottom */}
      <div className="p-4 border-t">
        <div className="text-xs text-center text-gray-400">
             © 2025 Merchant Console
        </div>
      </div>
    </div>
  );
}

function Overview({ token }) {
  const [summary, setSummary] = useState(null);

  useEffect(() => {
    fetchSummary();
    // eslint-disable-next-line
  }, []);

  async function fetchSummary() {
    try {
      const res = await fetch(
        `${API_BASE_URL}/api/merchants/${DEFAULT_MERCHANT_ID}/dashboard`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const json = await res.json();
      if (res.ok) setSummary(json);
    } catch (err) {
      console.error(err);
    }
  }

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Dashboard Overview</h2>
        <p className="text-gray-500">Welcome back, here's what's happening.</p>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        <div className="rounded-2xl bg-white p-6 border border-gray-100 shadow-sm">
          <p className="text-xs uppercase font-semibold text-gray-400">
            Total Customers
          </p>
          <p className="text-3xl font-black mt-2 text-gray-900">
            {summary?.totalCustomers ?? "—"}
          </p>
        </div>
        <div className="rounded-2xl bg-white p-6 border border-gray-100 shadow-sm">
          <p className="text-xs uppercase font-semibold text-gray-400">
            Avg Credit Score
          </p>
          <p className="text-3xl font-black mt-2 text-indigo-600">
            {summary?.avgScore?.toFixed?.(0) ?? "—"}
          </p>
        </div>
        <div className="rounded-2xl bg-white p-6 border border-gray-100 shadow-sm">
          <p className="text-xs uppercase font-semibold text-gray-400">
            On-time Rate
          </p>
          <p className="text-3xl font-black mt-2 text-green-600">
            {summary?.onTimeRate
              ? `${Math.round(summary.onTimeRate * 100)}%`
              : "—"}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <h3 className="font-bold text-gray-900 mb-4">Risk Distribution</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-green-50 rounded-xl">
              <span className="font-medium text-green-800">Low Risk</span>
              <span className="text-2xl font-bold text-green-700">
                {summary?.buckets?.lowRisk ?? 0}
              </span>
            </div>
            <div className="flex items-center justify-between p-4 bg-amber-50 rounded-xl">
              <span className="font-medium text-amber-800">Medium Risk</span>
              <span className="text-2xl font-bold text-amber-700">
                {summary?.buckets?.mediumRisk ?? 0}
              </span>
            </div>
            <div className="flex items-center justify-between p-4 bg-red-50 rounded-xl">
              <span className="font-medium text-red-800">High Risk</span>
              <span className="text-2xl font-bold text-red-700">
                {summary?.buckets?.highRisk ?? 0}
              </span>
            </div>
          </div>
        </div>
        
        {/* Placeholder for chart or recent activity */}
        <div className="bg-gradient-to-br from-indigo-600 to-purple-700 rounded-2xl shadow-lg p-6 text-white flex flex-col justify-between">
           <div>
               <h3 className="font-bold text-xl mb-2">Merchant Insights</h3>
               <p className="text-indigo-100 text-sm">Your customer base is growing steadily with a healthy credit mix.</p>
           </div>
           <button className="bg-white/20 hover:bg-white/30 backdrop-blur-sm self-start px-4 py-2 rounded-lg text-sm font-medium transition mt-4">
               View Full Report
           </button>
        </div>
      </div>
    </div>
  );
}

function Customers({ token }) {
  const [customers, setCustomers] = useState([]);
  const [page, setPage] = useState(0);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const pageSize = 20;

  useEffect(() => {
    fetchCustomers();
    // eslint-disable-next-line
  }, [page]);

  async function fetchCustomers() {
    try {
      const url = `${API_BASE_URL}/api/merchants/${DEFAULT_MERCHANT_ID}/customers?skip=${
        page * pageSize
      }&limit=${pageSize}`;
      const res = await fetch(url, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const json = await res.json();
      if (res.ok) setCustomers(json.customers || json);
    } catch (err) {
      console.error(err);
    }
  }

  async function fetchCustomerDetail(customerId) {
    setDetailLoading(true);
    try {
      const res = await fetch(
        `${API_BASE_URL}/api/merchants/${DEFAULT_MERCHANT_ID}/customers/${customerId}/detail`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const json = await res.json();
      if (res.ok) setSelectedCustomer(json);
    } catch (err) {
      console.error(err);
    } finally {
      setDetailLoading(false);
    }
  }

  async function handleNotify(customerId) {
    const msg = prompt("Enter message for customer:");
    if (!msg) return;

    try {
      const res = await fetch(
        `${API_BASE_URL}/api/merchants/${DEFAULT_MERCHANT_ID}/customers/${customerId}/notify`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ message: msg }),
        }
      );
      if (res.ok) alert("Notification sent");
    } catch (e) {
      alert(e.message);
    }
  }

  // Generate random avatar color based on name
  const getAvatarColor = (name) => {
      const colors = ['bg-red-100 text-red-700', 'bg-green-100 text-green-700', 'bg-blue-100 text-blue-700', 'bg-yellow-100 text-yellow-700', 'bg-purple-100 text-purple-700', 'bg-pink-100 text-pink-700'];
      const charCode = name ? name.charCodeAt(0) : 0;
      return colors[charCode % colors.length];
  }

  return (
    <div className="flex h-[calc(100vh-6rem)] gap-6">
      {/* List */}
      <div className="flex-1 flex flex-col bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="p-4 border-b flex justify-between items-center bg-gray-50/50 backdrop-blur">
          <div>
            <h2 className="font-bold text-gray-900 text-lg">Customers</h2>
            <p className="text-xs text-gray-500">Manage and view customer profiles</p>
          </div>
          <div className="flex gap-2">
            <button
                onClick={() => setPage((p) => Math.max(0, p - 1))}
                disabled={page === 0}
                className="px-3 py-1 bg-white border rounded text-sm disabled:opacity-50 hover:bg-gray-50"
            >
                Prev
            </button>
            <button
                onClick={() => setPage((p) => p + 1)}
                className="px-3 py-1 bg-white border rounded text-sm hover:bg-gray-50"
            >
                Next
            </button>
          </div>
        </div>
        <div className="overflow-y-auto flex-1 p-2 space-y-1">
          {customers.map((c) => {
            const score = Math.round(c.lastScore ?? c.score ?? 0);
            const risk = score >= 80 ? "low" : score >= 50 ? "medium" : "high";
            const isSelected = selectedCustomer?.customer?._id === c._id;
            const initials = (c.name || "U").slice(0, 2).toUpperCase();
            const avatarColor = getAvatarColor(c.name);

            return (
              <div
                key={c._id}
                onClick={() => fetchCustomerDetail(c._id)}
                className={`p-3 rounded-xl cursor-pointer flex items-center justify-between transition group ${
                    isSelected ? "bg-indigo-50 border border-indigo-100" : "hover:bg-gray-50 border border-transparent"
                }`}
              >
                <div className="flex items-center gap-4">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-xs ${avatarColor}`}>
                        {initials}
                    </div>
                    <div>
                        <div className="font-semibold text-gray-900">{c.name || "Unknown"}</div>
                        <div className="text-xs text-gray-500">{c.email}</div>
                    </div>
                </div>

                <div className="flex items-center gap-6">
                    <div className="text-right">
                        <div className="font-bold text-gray-900">{score}</div>
                        <div className="text-[10px] text-gray-400 uppercase tracking-wide">Score</div>
                    </div>
                    <div className="w-20 text-right">
                         <span
                            className={`inline-block px-2 py-1 rounded-md text-[10px] font-bold uppercase tracking-wide text-center w-full ${
                            risk === "low"
                                ? "bg-green-100 text-green-700"
                                : risk === "medium"
                                ? "bg-amber-100 text-amber-700"
                                : "bg-red-100 text-red-700"
                            }`}
                        >
                            {risk}
                        </span>
                    </div>
                    <ChevronRight size={16} className={`text-gray-300 transition-transform ${isSelected ? "text-indigo-400 translate-x-1" : "group-hover:text-gray-400"}`} />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Detail Panel */}
      <div className="w-96 bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden flex flex-col shrink-0">
        {!selectedCustomer ? (
          <div className="flex-1 flex flex-col items-center justify-center text-gray-400 p-8 text-center bg-gray-50/30">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                <Users size={32} className="opacity-20" />
            </div>
            <p className="text-sm font-medium text-gray-900">No Customer Selected</p>
            <p className="text-xs text-gray-500 mt-1">Select a customer from the list to view their full profile, orders, and risk analysis.</p>
          </div>
        ) : detailLoading ? (
            <div className="flex-1 flex items-center justify-center text-gray-400">Loading...</div>
        ) : (
          <div className="flex-1 overflow-y-auto">
            <div className="p-6 bg-gradient-to-br from-indigo-900 to-purple-900 text-white relative overflow-hidden">
                {/* Decorative circle */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2 blur-2xl pointer-events-none"></div>

                <div className="relative z-10 flex justify-between items-start">
                    <div>
                        <h2 className="text-xl font-bold">{selectedCustomer.customer?.name}</h2>
                        <p className="text-sm opacity-70">{selectedCustomer.customer?.email}</p>
                    </div>
                    <button
                        onClick={() => handleNotify(selectedCustomer.customer?._id)}
                        className="p-2 bg-white/10 hover:bg-white/20 rounded-lg transition border border-white/10"
                        title="Notify Customer"
                    >
                        <Bell size={18} />
                    </button>
                </div>
                <div className="mt-8 flex gap-8">
                    <div>
                        <p className="text-[10px] uppercase tracking-widest opacity-60 mb-1">Credit Score</p>
                        <p className="text-3xl font-black text-green-400">
                            {selectedCustomer.scores?.[0]?.score ?? "—"}
                        </p>
                    </div>
                     <div>
                        <p className="text-[10px] uppercase tracking-widest opacity-60 mb-1">Total Spent</p>
                        <p className="text-3xl font-bold">
                            ₹{selectedCustomer.customer?.totalSpent}
                        </p>
                    </div>
                </div>
            </div>
            
            <div className="p-5 space-y-8">
                <div>
                    <h3 className="text-xs font-bold text-gray-900 uppercase tracking-widest mb-4 flex items-center gap-2">
                        <span className="w-1 h-3 bg-indigo-500 rounded-full"></span>
                        Active Plans
                    </h3>
                    <div className="space-y-3">
                        {selectedCustomer.plans?.length === 0 && <div className="p-4 bg-gray-50 rounded-xl text-center text-xs text-gray-400 border border-dashed border-gray-200">No active plans</div>}
                        {selectedCustomer.plans?.map(p => (
                            <div key={p._id} className="p-3 border border-gray-100 rounded-xl bg-white shadow-sm flex justify-between items-center text-sm">
                                <div>
                                    <p className="font-semibold text-gray-900">{p.type === 'pay_later_30' ? 'Pay Later' : 'Installment'}</p>
                                    <p className="text-xs text-gray-500 capitalize">{p.status}</p>
                                </div>
                                <div className="text-right">
                                    <p className="font-bold text-gray-900">₹{p.totalAmount}</p>
                                    <p className="text-[10px] text-gray-400">{new Date(p.createdAt).toLocaleDateString()}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                 <div>
                    <h3 className="text-xs font-bold text-gray-900 uppercase tracking-widest mb-4 flex items-center gap-2">
                        <span className="w-1 h-3 bg-indigo-500 rounded-full"></span>
                        Recent Orders
                    </h3>
                    <div className="divide-y divide-gray-100">
                        {selectedCustomer.orders?.length === 0 && <div className="p-4 bg-gray-50 rounded-xl text-center text-xs text-gray-400 border border-dashed border-gray-200">No orders</div>}
                        {selectedCustomer.orders?.map(o => (
                            <div key={o._id} className="py-3 flex justify-between items-center text-sm">
                                <div>
                                     <span className="font-medium text-gray-900 block">₹{o.amount}</span>
                                     <span className="text-[10px] text-gray-400">{new Date(o.createdAt).toLocaleDateString()}</span>
                                </div>
                                <span className={`text-[10px] px-2 py-1 rounded-full font-bold uppercase ${
                                    o.status === 'paid' ? 'bg-green-50 text-green-700' : 'bg-gray-100 text-gray-600'
                                }`}>{o.status}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function RiskCenter({ token }) {
  const [activities, setActivities] = useState([]);

  useEffect(() => {
    fetchSuspicious();
    // eslint-disable-next-line
  }, []);

  async function fetchSuspicious() {
    try {
      const res = await fetch(
        `${API_BASE_URL}/api/merchants/${DEFAULT_MERCHANT_ID}/suspicious`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const json = await res.json();
      if (res.ok) setActivities(json.activities || []);
    } catch (err) {
      console.error(err);
    }
  }

  async function handleNotify(customerId, type) {
    if (!customerId) return alert("Customer ID missing");
    
    const defaultMsg = `We detected suspicious activity on your account (${type}). Please verify your recent transactions.`;
    const msg = prompt("Enter notification message:", defaultMsg);
    if (!msg) return;

    try {
      const res = await fetch(
        `${API_BASE_URL}/api/merchants/${DEFAULT_MERCHANT_ID}/customers/${customerId}/notify`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ message: msg }),
        }
      );
      if (res.ok) alert("Notification sent to customer");
    } catch (e) {
      alert(e.message);
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Risk Center</h2>
        <p className="text-gray-500">
          Monitor suspicious activities and system alerts
        </p>
      </div>

      <div className="grid gap-4">
        {activities.length === 0 && (
          <div className="p-10 text-center bg-white rounded-2xl border border-dashed border-gray-200 text-gray-400">
            <AlertTriangle className="mx-auto mb-2 opacity-50" size={32} />
            No suspicious activities detected recently. Good job!
          </div>
        )}
        {activities.map((act) => (
          <div
            key={act._id}
            className="bg-white border-l-4 border-red-500 rounded-r-xl shadow-sm p-6 flex flex-col md:flex-row md:items-center justify-between gap-4"
          >
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="bg-red-100 text-red-700 text-xs font-bold px-2 py-0.5 rounded uppercase tracking-wide">
                  {act.type.replace("_", " ")}
                </span>
                <span className="text-xs text-gray-400">
                  {new Date(act.createdAt).toLocaleString()}
                </span>
              </div>
              <h3 className="font-bold text-gray-900 text-lg">
                {act.customerId?.name}
                <span className="text-gray-400 font-normal text-sm ml-2">
                  ({act.customerId?.email})
                </span>
              </h3>
              <p className="text-sm text-gray-600 mt-1">
                {act.details?.reason || JSON.stringify(act.details)}
              </p>
            </div>
            <button
                onClick={() => handleNotify(act.customerId?._id, act.type)}
                className="px-4 py-2 bg-white border border-gray-200 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition shadow-sm flex items-center gap-2"
            >
                <Bell size={16} />
                Notify
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

function Returns({ token }) {
  const [returns, setReturns] = useState([]);

  useEffect(() => {
    fetchReturns();
    // eslint-disable-next-line
  }, []);

  async function fetchReturns() {
    try {
      const res = await fetch(`${API_BASE_URL}/api/orders/returns/pending`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const json = await res.json();
      setReturns(json.orders || []);
    } catch (err) {
      console.error(err);
    }
  }

  async function handleDecision(orderId, decision) {
    try {
      const endpoint =
        decision === "approve"
          ? `${API_BASE_URL}/api/orders/${orderId}/approve-return`
          : `${API_BASE_URL}/api/orders/${orderId}/reject-return`;
      
      const res = await fetch(endpoint, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      });
      
      if (res.ok) {
        alert(`Return ${decision}d`);
        fetchReturns();
      } else {
        alert("Failed");
      }
    } catch (err) {
      alert(err.message);
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Return Requests</h2>
        <p className="text-gray-500">Approve or reject pending return requests</p>
      </div>
      
      <div className="grid gap-4">
        {returns.length === 0 && (
            <div className="p-10 text-center bg-white rounded-2xl border border-dashed border-gray-200 text-gray-400">
                <Undo2 className="mx-auto mb-2 opacity-50" size={32} />
                No pending return requests.
            </div>
        )}
        {returns.map(order => (
            <div key={order._id} className="bg-white rounded-xl border border-gray-200 p-6 flex items-center justify-between">
                <div>
                     <p className="font-bold text-lg text-gray-900">
                        Order #{String(order._id).slice(-6)}
                    </p>
                    <p className="text-sm text-gray-600 mt-1">
                        Reason: <span className="italic">{order.returnReason || "—"}</span>
                    </p>
                    <p className="text-xs text-gray-400 mt-2">
                        Refund Amount: ₹{order.amount?.toFixed(2)}
                    </p>
                </div>
                <div className="flex flex-col gap-2">
                    <button 
                        onClick={() => handleDecision(order._id, 'approve')}
                        className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm font-medium transition"
                    >
                        Approve
                    </button>
                    <button 
                        onClick={() => handleDecision(order._id, 'reject')}
                        className="px-4 py-2 bg-gray-100 hover:bg-red-100 hover:text-red-700 text-gray-700 rounded-lg text-sm font-medium transition"
                    >
                        Reject
                    </button>
                </div>
            </div>
        ))}
      </div>
    </div>
  );
}

// --- MAIN COMPONENT ---

export default function MerchantDashboard() {
  const { token } = useAuth();
  const [activeTab, setActiveTab] = useState("overview");

  if (!token) return <div className="p-10 text-center">Please login first.</div>;

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />
      
      <main className="flex-1 ml-64 p-8 mt-16">
        {activeTab === "overview" && <Overview token={token} />}
        {activeTab === "customers" && <Customers token={token} />}
        {activeTab === "risk" && <RiskCenter token={token} />}
        {activeTab === "returns" && <Returns token={token} />}
      </main>
    </div>
  );
}
