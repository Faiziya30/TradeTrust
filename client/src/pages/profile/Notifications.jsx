import { useEffect, useState } from "react";
import { useAuth } from "../../contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { fetchCustomerProfile, markNotificationRead } from "../../api/customer";
import {
  ArrowLeft,
  Bell,
  CheckCircle,
  TrendingUp,
  AlertCircle,
  Info,
} from "lucide-react";

export default function Notifications() {
  const { token, customerId } = useAuth();
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

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

  async function handleNotificationRead(id) {
    try {
      await markNotificationRead(token, customerId, id);
      setProfile((prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          notifications: prev.notifications.map((n) =>
            n.id === id ? { ...n, status: "read" } : n
          ),
          unreadNotifications: Math.max(0, (prev.unreadNotifications || 0) - 1),
        };
      });
    } catch (err) {
      alert(err.message);
    }
  }

  async function markAllRead() {
    if (!profile?.notifications) return;

    const unreadIds = profile.notifications
      .filter((n) => n.status === "unread")
      .map((n) => n.id);

    for (const id of unreadIds) {
      await handleNotificationRead(id);
    }
  }

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

  const { notifications = [], unreadNotifications = 0 } = profile;

  const getNotificationIcon = (type) => {
    switch (type) {
      case "score_increase":
        return <TrendingUp className="w-5 h-5 text-green-600" />;
      case "score_decrease":
        return <AlertCircle className="w-5 h-5 text-red-600" />;
      case "payment_success":
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case "payment_failed":
        return <AlertCircle className="w-5 h-5 text-red-600" />;
      default:
        return <Info className="w-5 h-5 text-blue-600" />;
    }
  };

  const getNotificationColor = (type, status) => {
    const isUnread = status === "unread";

    switch (type) {
      case "score_increase":
      case "payment_success":
        return isUnread
          ? "bg-green-50 border-green-300"
          : "bg-white border-neutral-200";
      case "score_decrease":
      case "payment_failed":
        return isUnread
          ? "bg-red-50 border-red-300"
          : "bg-white border-neutral-200";
      default:
        return isUnread
          ? "bg-blue-50 border-blue-300"
          : "bg-white border-neutral-200";
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "—";
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;

    return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&display=swap');
        * { font-family: 'Plus Jakarta Sans', system-ui, sans-serif; }
      `}</style>
      
      {/* Premium Header */}
      <div className="bg-[#0f172a] text-white py-12 px-6 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2"></div>
        <div className="max-w-7xl mx-auto relative z-10">
          <button
            onClick={() => navigate("/profile")}
            className="flex items-center gap-2 text-slate-400 hover:text-white mb-6 transition-colors text-sm font-medium"
          >
            <ArrowLeft size={16} />
            Back to Dashboard
          </button>
          
          <div className="flex items-end justify-between gap-6">
             <div>
                <h1 className="text-3xl font-bold mb-2">Notifications</h1>
                <p className="text-slate-400">Stay updated with your latest activities</p>
             </div>
             
             {unreadNotifications > 0 && (
                 <button
                    onClick={markAllRead}
                    className="px-4 py-2 bg-white/10 hover:bg-white/20 border border-white/10 rounded-xl text-sm font-medium transition-colors backdrop-blur-sm"
                 >
                    Mark all read
                 </button>
             )}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-6 -mt-8 relative z-20 pb-12">
        {notifications.length === 0 ? (
          <div className="bg-white border border-slate-200 rounded-2xl p-16 text-center shadow-sm">
            <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
                 <Bell className="w-8 h-8 text-slate-300" />
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-2">No notifications</h3>
            <p className="text-slate-500">You're all caught up!</p>
          </div>
        ) : (
          <div className="space-y-4">
            {notifications.map((notification) => {
              const Icon = getNotificationIcon(notification.type);
              // Need to extract icon if it's a component or render logic
              // actually getNotificationIcon returns JSX already.
              
              const isUnread = notification.status === "unread";
              
              return (
                <div
                  key={notification.id}
                  className={`relative overflow-hidden p-6 rounded-2xl border transition-all duration-300 ${
                      isUnread ? 'bg-white border-indigo-100 shadow-lg shadow-indigo-100/50' : 'bg-slate-50 border-slate-200 opacity-80 hover:opacity-100'
                  }`}
                >
                   {isUnread && <div className="absolute top-0 left-0 h-full w-1 bg-indigo-500"></div>}
                   
                   <div className="flex gap-5">
                       <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${
                           isUnread ? 'bg-indigo-50 shadow-sm' : 'bg-white border border-slate-100'
                       }`}>
                           {getNotificationIcon(notification.type)}
                       </div>
                       
                       <div className="flex-1">
                           <div className="flex justify-between items-start mb-1">
                               <h3 className={`font-bold text-lg ${isUnread ? 'text-slate-900' : 'text-slate-600'}`}>{notification.title}</h3>
                               <span className="text-xs font-medium text-slate-400">{formatDate(notification.createdAt)}</span>
                           </div>
                           <p className="text-slate-600 text-sm leading-relaxed mb-3 pr-8">{notification.body || notification.message}</p>
                           
                           {isUnread && (
                               <button 
                                   onClick={() => handleNotificationRead(notification.id)}
                                   className="text-xs font-bold text-indigo-600 hover:text-indigo-700 uppercase tracking-wide flex items-center gap-1"
                               >
                                   Mark as Read <CheckCircle size={12} />
                               </button>
                           )}
                       </div>
                   </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
