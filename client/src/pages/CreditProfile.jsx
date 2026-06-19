import { useEffect, useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { fetchCustomerProfile } from "../api/customer";
import {
  TrendingUp,
  Receipt,
  Bell,
  Zap,
  Calendar,
  ChevronRight,
  Activity,
  Award,
  ShoppingBag,
} from "lucide-react";

export default function CreditProfile() {
  const { token, customerId, user } = useAuth();
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!token || !customerId) return;
    let ignore = false;
    async function loadProfile() {
      setLoading(true);
      setError("");
      try {
        const data = await fetchCustomerProfile(token, customerId);
        if (!ignore) setProfile(data);
      } catch (err) {
        if (!ignore) setError(err.message || "Unable to load profile");
      } finally {
        if (!ignore) setLoading(false);
      }
    }
    loadProfile();
    return () => {
      ignore = true;
    };
  }, [token, customerId]);

  if (!customerId) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-neutral-50">
        <div className="bg-white border border-neutral-200 rounded-lg p-8 text-center max-w-md">
          <p className="text-neutral-600">
            Create a customer account first to view your credit profile.
          </p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-neutral-50">
        <div className="flex items-center gap-3">
          <div
            className="w-2 h-2 bg-neutral-800 rounded-full animate-bounce"
            style={{ animationDelay: "0s" }}
          ></div>
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

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-neutral-50">
        <div className="bg-white border border-red-200 rounded-lg p-8 text-center space-y-4 max-w-md">
          <p className="text-red-600">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-neutral-900 text-white rounded-lg hover:bg-neutral-800 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (!profile) return null;

  const {
    latestScore,
    orderStats = {},
    notifications = [],
    unreadNotifications = 0,
    boosterTasks = [],
    installmentPlans = [],
  } = profile;

  const getScoreColor = (score) => {
    if (score >= 80) return "text-emerald-600";
    if (score >= 50) return "text-amber-600";
    return "text-rose-600";
  };

  const getScoreBg = (score) => {
    if (score >= 80) return "bg-emerald-50 border-emerald-200";
    if (score >= 50) return "bg-amber-50 border-amber-200";
    return "bg-rose-50 border-rose-200";
  };

  const sections = [
    {
      title: "Order History",
      description: "View all your transactions, returns, and payment records",
      icon: Receipt,
      route: "/profile/orders",
      color: "bg-purple-500",
      stats: `${orderStats.totalOrders || 0} Orders`,
    },
    {
      title: "Notifications",
      description: "Stay updated with score changes and important alerts",
      icon: Bell,
      route: "/profile/notifications",
      color: "bg-orange-500",
      stats: `${unreadNotifications} Unread`,
      badge: unreadNotifications > 0 ? unreadNotifications : null,
    },
    {
      title: "Score Boosters",
      description: "Complete tasks to improve your credit score faster",
      icon: Zap,
      route: "/profile/boosters",
      color: "bg-yellow-500",
      stats: `${boosterTasks.filter((t) => t.completed).length}/${
        boosterTasks.length
      } Complete`,
    },
    {
      title: "Installments",
      description: "Manage your payment plans and upcoming due dates",
      icon: Calendar,
      route: "/profile/installments",
      color: "bg-green-500",
      stats: `${installmentPlans.length} Plans`,
    },
  ];

  return (
    <div className="min-h-screen bg-neutral-50 font-sans">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&display=swap');
        
        * {
          font-family: 'Plus Jakarta Sans', system-ui, -apple-system, sans-serif;
        }
        
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        
        .animate-slide-up {
          animation: slideUp 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
        
        .stagger-1 { animation-delay: 0.1s; opacity: 0; }
        .stagger-2 { animation-delay: 0.2s; opacity: 0; }
        .stagger-3 { animation-delay: 0.3s; opacity: 0; }
        .stagger-4 { animation-delay: 0.4s; opacity: 0; }
      `}</style>
      
      {/* Premium Dark Header */}
      <div className="bg-[#0f172a] text-white pt-12 pb-24 relative overflow-hidden">
        {/* Abstract shapes */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2 pointer-events-none"></div>

        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
            <div className="animate-slide-up">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 border border-white/10 text-xs font-medium text-emerald-300 mb-4 backdrop-blur-sm">
                <Award size={14} />
                <span>Credit Identity Verified</span>
              </div>
              <h1 className="text-4xl md:text-5xl font-bold mb-2 tracking-tight">
                {profile.customer?.name || user?.email?.split("@")[0]}
              </h1>
              <p className="text-slate-400 text-lg max-w-xl">
                Manage your financial reputation and unlock better credit power.
              </p>
            </div>

            <div className="animate-slide-up stagger-1">
              <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-6 min-w-[280px]">
                <div className="flex justify-between items-start mb-2">
                   <p className="text-sm font-medium text-slate-400 uppercase tracking-wider">Trust Score</p>
                   {profile.trend !== 0 && (
                    <span className={`text-xs font-bold px-2 py-0.5 rounded ${profile.trend > 0 ? 'bg-emerald-500/20 text-emerald-400' : 'bg-rose-500/20 text-rose-400'}`}>
                      {profile.trend > 0 ? "+" : ""}{profile.trend} pts
                    </span>
                   )}
                </div>
                <div className="flex items-baseline gap-2">
                  <span className={`text-5xl font-black ${
                      latestScore?.score >= 80 ? "text-emerald-400" : latestScore?.score >= 50 ? "text-amber-400" : "text-rose-400"
                  }`}>
                      {latestScore?.score ?? "—"}
                  </span>
                  <span className="text-slate-400 font-medium">/ 100</span>
                </div>
                <div className="mt-2 h-1.5 w-full bg-white/10 rounded-full overflow-hidden">
                    <div 
                        className={`h-full rounded-full transition-all duration-1000 ${
                            latestScore?.score >= 80 ? "bg-emerald-500" : latestScore?.score >= 50 ? "bg-amber-500" : "bg-rose-500"
                        }`}
                        style={{ width: `${latestScore?.score || 0}%` }}
                    ></div>
                </div>
                <p className="text-xs text-slate-500 mt-2 text-right">
                    Level: <span className="text-white font-medium">{latestScore?.level || "Standard"}</span>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content (Overlapping) */}
      <div className="max-w-7xl mx-auto px-6 -mt-16 relative z-20 pb-12">
        {/* Quick Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            {[
                { label: "Total Orders", value: orderStats.totalOrders || 0, icon: ShoppingBag },
                { label: "Lifetime Spend", value: `₹${(orderStats.totalSpent || 0).toLocaleString()}`, icon: TrendingUp },
                { label: "Success Rate", value: `${Math.round((orderStats.paymentSuccessRate || 1) * 100)}%`, icon: Award },
                { label: "Active Plans", value: installmentPlans.length || 0, icon: Calendar }
            ].map((stat, i) => (
                <div key={i} className={`bg-white p-5 rounded-xl shadow-sm border border-neutral-100/50 hover:shadow-md transition-shadow animate-slide-up stagger-${Math.min(i+2, 4)}`}>
                    <div className="flex items-center gap-3 mb-2">
                        <div className="p-2 bg-slate-50 rounded-lg text-slate-600">
                            <stat.icon size={18} />
                        </div>
                        <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide">{stat.label}</p>
                    </div>
                    <p className="text-2xl font-bold text-slate-900">{stat.value}</p>
                </div>
            ))}
        </div>

        {/* Navigation Grid */}
        <h2 className="text-lg font-bold text-slate-900 mb-4 px-1">Dashboard Menu</h2>
        <div className="grid md:grid-cols-3 gap-6">
            {sections.map((section, idx) => {
             const Icon = section.icon;
             return (
               <button
                 key={section.route}
                 onClick={() => navigate(section.route)}
                 className={`group relative overflow-hidden bg-white p-6 rounded-2xl shadow-sm border border-neutral-100/50 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 text-left animate-slide-up stagger-${idx+1}`}
               >
                 {/* Hover gradient background */}
                 <div className="absolute inset-0 bg-gradient-to-br from-white to-slate-50 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                 
                 {section.badge && (
                   <span className="absolute top-4 right-4 bg-rose-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow-sm z-10">
                     {section.badge} NEW
                   </span>
                 )}

                 <div className="relative z-10">
                    <div className={`w-12 h-12 ${section.color} rounded-xl flex items-center justify-center text-white mb-4 shadow-lg shadow-indigo-500/20 group-hover:scale-110 transition-transform`}>
                        <Icon size={24} />
                    </div>
                    <h3 className="text-xl font-bold text-slate-900 mb-1 group-hover:text-indigo-600 transition-colors">{section.title}</h3>
                    <p className="text-sm text-slate-500 mb-4 line-clamp-2">{section.description}</p>
                    
                    <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-slate-400 group-hover:text-indigo-500 transition-colors">
                        <span>{section.stats}</span>
                        <ChevronRight size={14} />
                    </div>
                 </div>
               </button>
             )
            })}
        </div>
      </div>
    </div>
  );
}
