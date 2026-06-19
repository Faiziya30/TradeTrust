import { useEffect, useState } from "react";
import { useAuth } from "../../contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { fetchCustomerProfile } from "../../api/customer";
import { API_BASE_URL } from "../../config";
import {
  ArrowLeft,
  Package,
  CheckCircle,
  XCircle,
  Clock,
  AlertCircle,
} from "lucide-react";

export default function OrderHistory() {
  const { token, customerId } = useAuth();
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [returningOrder, setReturningOrder] = useState(null);

  useEffect(() => {
    if (!token || !customerId) return;

    async function loadProfile() {
      try {
        const data = await fetchCustomerProfile(token, customerId);
        setProfile(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }

    loadProfile();
  }, [token, customerId]);

  async function requestReturn(order) {
    const reason = prompt("Why do you want to return this item?");
    if (!reason) return;

    setReturningOrder(order._id || order.id);

    try {
      const orderId = order._id || order.id;
      const res = await fetch(
        `${API_BASE_URL}/api/orders/${orderId}/request-return`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ reason }),
        }
      );

      const json = await res.json();
      if (!res.ok) throw new Error(json.message || "Failed to request return");

      alert("Return request submitted successfully!");

      // Reload profile data to show updated status
      const data = await fetchCustomerProfile(token, customerId);
      setProfile(data);
    } catch (err) {
      alert("Error: " + err.message);
    } finally {
      setReturningOrder(null);
    }
  }

  const getOrderId = (order) => order._id || order.id;

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-neutral-50">
        <div className="flex items-center gap-3">
          <div className="w-2 h-2 bg-neutral-800 rounded-full animate-bounce"></div>
          <div
            className="w-2 h-2 bg-neutral-800 rounded-full animate-bounce"
            style={{ animationDelay: "0.1s" }}
          ></div>
          <div
            className="w-2 h-2 bg-neutral-800 rounded-full animate-bounce"
            style={{ animationDelay: "0.2s" }}
          ></div>
        </div>
      </div>
    );
  }

  if (!profile) return null;

  const { orders = [], orderStats = {} } = profile;

  const getStatusIcon = (status) => {
    switch (status) {
      case "paid":
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case "returned":
        return <AlertCircle className="w-5 h-5 text-orange-600" />;
      case "failed":
        return <XCircle className="w-5 h-5 text-red-600" />;
      default:
        return <Clock className="w-5 h-5 text-neutral-600" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "paid":
        return "bg-green-50 text-green-700 border-green-200";
      case "returned":
        return "bg-orange-50 text-orange-700 border-orange-200";
      case "failed":
        return "bg-red-50 text-red-700 border-red-200";
      default:
        return "bg-neutral-50 text-neutral-700 border-neutral-200";
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "—";
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans">
       <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&display=swap');
        * { font-family: 'Plus Jakarta Sans', system-ui, sans-serif; }
      `}</style>

      {/* Premium Header */}
      <div className="bg-[#0f172a] text-white py-12 px-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl translate-x-1/2 -translate-y-1/2"></div>
        <div className="max-w-7xl mx-auto relative z-10">
          <button
            onClick={() => navigate("/profile")}
            className="flex items-center gap-2 text-slate-400 hover:text-white mb-6 transition-colors text-sm font-medium"
          >
            <ArrowLeft size={16} />
            Back to Dashboard
          </button>
          
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
             <div>
                <h1 className="text-3xl font-bold mb-2">Order History</h1>
                <p className="text-slate-400">Track and manage your recent purchases</p>
             </div>
             
             <div className="flex gap-4">
                <div className="bg-white/5 border border-white/10 rounded-xl px-4 py-3 backdrop-blur-sm">
                    <p className="text-[10px] mobile-label text-slate-400 uppercase tracking-widest font-bold">Total Spent</p>
                    <p className="text-2xl font-bold">₹{(orderStats.totalSpent || 0).toLocaleString()}</p>
                </div>
                 <div className="bg-white/5 border border-white/10 rounded-xl px-4 py-3 backdrop-blur-sm">
                    <p className="text-[10px] mobile-label text-slate-400 uppercase tracking-widest font-bold">Orders</p>
                    <p className="text-2xl font-bold">{orderStats.totalOrders || 0}</p>
                </div>
             </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-6 -mt-8 relative z-20 pb-12">
        {orders.length === 0 ? (
          <div className="bg-white border border-slate-200 rounded-2xl p-16 text-center shadow-sm">
            <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6">
                 <Package className="w-8 h-8 text-slate-300" />
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-2">No orders yet</h3>
            <p className="text-slate-500 mb-8 max-w-sm mx-auto">
              Start shopping to build your credit profile and unlock rewards.
            </p>
            <button
              onClick={() => navigate("/")}
              className="px-8 py-3 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-colors font-semibold shadow-lg shadow-indigo-500/30"
            >
              Start Shopping
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => {
              const orderId = getOrderId(order);
              const isSelected = selectedOrder && getOrderId(selectedOrder) === orderId;
              const isReturning = returningOrder === orderId;

              return (
                <div
                  key={orderId}
                  className={`bg-white border rounded-2xl overflow-hidden transition-all duration-300 ${
                      isSelected ? 'border-indigo-500 ring-4 ring-indigo-500/5 shadow-xl' : 'border-slate-200 shadow-sm hover:shadow-md'
                  }`}
                >
                  <div className="p-6 flex flex-col md:flex-row md:items-center justify-between gap-6 cursor-pointer" onClick={() => setSelectedOrder(isSelected ? null : order)}>
                    <div className="flex items-start gap-4">
                      <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${
                          order.status === 'paid' ? 'bg-green-100 text-green-700' : 
                          order.status === 'returned' ? 'bg-orange-100 text-orange-700' : 'bg-slate-100 text-slate-600'
                      }`}>
                        {getStatusIcon(order.status)}
                      </div>
                      <div>
                        <div className="flex items-center gap-3 mb-1">
                          <p className="text-lg font-bold text-slate-900">
                            ₹{order.amount?.toLocaleString()}
                          </p>
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wide ${getStatusColor(order.status)} border`}>
                            {order.status}
                          </span>
                        </div>
                        <p className="text-sm text-slate-500 font-medium">
                          {formatDate(order.createdAt)}
                        </p>
                         <p className="text-xs text-slate-400 mt-1">
                             ID: <span className="font-mono">{String(orderId).slice(-6).toUpperCase()}</span>
                         </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                         {/* Action Buttons */}
                        {order.status === "paid" && (!order.returnStatus || order.returnStatus === "none") && (
                            <button
                                onClick={(e) => { e.stopPropagation(); requestReturn(order); }}
                                disabled={isReturning}
                                className="px-4 py-2 text-sm font-medium text-rose-600 bg-rose-50 hover:bg-rose-100 rounded-lg transition-colors disabled:opacity-50"
                            >
                                {isReturning ? "Processing..." : "Return Item"}
                            </button>
                        )}
                        
                        {order.returnStatus && order.returnStatus !== "none" && (
                             <span className={`px-3 py-1.5 text-xs font-bold uppercase tracking-wide rounded-lg flex items-center gap-2 border ${
                                 order.returnStatus === 'approved' ? 'bg-green-50 text-green-700 border-green-200' :
                                 order.returnStatus === 'rejected' ? 'bg-red-50 text-red-700 border-red-200' :
                                 'bg-amber-50 text-amber-700 border-amber-200'
                             }`}>
                                 {order.returnStatus === 'requested' && <Clock size={12} />}
                                 {order.returnStatus}
                             </span>
                        )}
                        
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-transform ${isSelected ? 'bg-indigo-100 text-indigo-600 rotate-180' : 'bg-slate-100 text-slate-400'}`}>
                             <div className="transition-transform duration-300">▼</div>
                        </div>
                    </div>
                  </div>

                  {/* Details Section */}
                  {isSelected && (
                    <div className="border-t border-slate-100 bg-slate-50/50 p-6 animate-fade-in">
                         <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">Order Items</h4>
                         <div className="grid gap-3">
                             {order.items?.map((item, idx) => (
                                 <div key={idx} className="bg-white p-4 rounded-xl border border-slate-200 flex items-center justify-between">
                                     <div className="flex items-center gap-4">
                                         {item.productId?.images?.[0] ? (
                                             <img src={item.productId.images[0]} alt={item.name} className="w-12 h-12 rounded-lg object-cover bg-slate-100" />
                                         ) : (
                                              <div className="w-12 h-12 rounded-lg bg-slate-100 flex items-center justify-center text-slate-400">
                                                  <Package size={20} />
                                              </div>
                                         )}
                                         <div>
                                             <p className="font-semibold text-slate-900">{item.productId?.name || item.name || "Unknown Product"}</p>
                                             <p className="text-xs text-slate-500">Qty: {item.quantity || 1}</p>
                                         </div>
                                     </div>
                                     <p className="font-bold text-slate-900">₹{(item.price || 0).toLocaleString()}</p>
                                 </div>
                             ))}
                         </div>
                         
                         <div className="mt-6 flex flex-wrap gap-6 text-sm">
                             <div>
                                 <p className="text-xs text-slate-400 uppercase mb-1">Payment Method</p>
                                 <p className="font-medium text-slate-700 capitalize">
                                     {order.paymentOption?.replace("_", " ") || "Standard"}
                                 </p>
                             </div>
                              {order.returnReason && (
                                <div>
                                     <p className="text-xs text-slate-400 uppercase mb-1">Return Reason</p>
                                     <p className="font-medium text-rose-600">{order.returnReason}</p>
                                </div>
                              )}
                         </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
