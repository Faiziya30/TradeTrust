import { useEffect, useState } from "react";
import { useAuth } from "../../contexts/AuthContext";
import { API_BASE_URL } from "../../config";
import {
  Zap,
  CheckCircle2,
  Lock,
  ArrowRight,
  ShieldCheck,
  User,
  ShoppingBag,
  CreditCard,
  Target
} from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function Boosters() {
  const { token, customerId } = useAuth();
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      if (!token || !customerId) return;
      try {
        const res = await fetch(`${API_BASE_URL}/api/customers/${customerId}/profile`, {
             headers: { Authorization: `Bearer ${token}` }
        });
        const json = await res.json();
        setProfile(json);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [token, customerId]);

  const handleAction = (action) => {
      if (action === "shop_now") navigate("/");
      if (action === "edit_profile") navigate("/settings"); // Assuming settings exists, otherwise maybe just alert
      if (action === "verify_kyc") {
          // Simulate KYC process
          const verified = window.confirm("Simulate ID Verification Process?\n\n(In a real app, this would open a camera/upload flow)");
          if (verified) {
             // In real app, call API. For now, we can't easily verify without backend endpoint.
             // We'll just guide them.
             alert("Verification submitted! It will be reviewed shortly.");
          }
      }
  };

  if (loading) return <div className="p-10 text-center">Loading boosters...</div>;
  if (!profile) return null;

  const { boosterTasks = [] } = profile;
  const completedCount = boosterTasks.filter(t => t.completed).length;
  const progressPercent = Math.round((completedCount / boosterTasks.length) * 100);

  return (
    <div className="min-h-screen bg-slate-50 font-sans pb-12">
      {/* Header */}
      <div className="bg-[#0f172a] text-white pt-8 pb-32 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-yellow-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>
        
        <div className="max-w-3xl mx-auto px-6 relative z-10">
          <button onClick={() => navigate(-1)} className="text-slate-400 hover:text-white mb-6 flex items-center gap-2 transition-colors">
            <ArrowRight className="rotate-180" size={16} /> Back
          </button>
          
          <div className="flex items-center gap-4 mb-4">
            <div className="w-12 h-12 bg-yellow-500 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-yellow-500/20">
                <Zap size={24} fill="currentColor" />
            </div>
            <h1 className="text-3xl font-bold">Score Boosters</h1>
          </div>
          <p className="text-slate-400 text-lg max-w-xl">
            Complete these verifiable tasks to prove your creditworthiness and unlock higher trust scores.
          </p>

          <div className="mt-8 bg-white/5 backdrop-blur border border-white/10 p-4 rounded-xl flex items-center gap-4">
             <div className="flex-1">
                <div className="flex justify-between text-xs font-semibold uppercase tracking-wider mb-2">
                    <span className="text-yellow-400">Boost Progress</span>
                    <span className="text-white">{completedCount}/{boosterTasks.length} Completed</span>
                </div>
                <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                    <div className="h-full bg-yellow-500 rounded-full transition-all duration-1000" style={{ width: `${progressPercent}%` }}></div>
                </div>
             </div>
          </div>
        </div>
      </div>

      {/* List */}
      <div className="max-w-3xl mx-auto px-6 -mt-20 relative z-20 space-y-4">
        {boosterTasks.map((task, idx) => {
            const isLocked = !task.completed;
            const Icon = getIconForTask(task.key);

            return (
                <div key={task.key} className={`bg-white p-5 rounded-2xl shadow-sm border border-slate-100 flex items-center gap-5 transition-all ${task.completed ? 'opacity-75 grayscale-[0.3]' : 'hover:shadow-md hover:-translate-y-0.5'}`}>
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center shrink-0 ${task.completed ? 'bg-green-100 text-green-600' : 'bg-slate-100 text-slate-400'}`}>
                        {task.completed ? <CheckCircle2 size={24} /> : <Icon size={24} />}
                    </div>
                    
                    <div className="flex-1">
                        <div className="flex justify-between items-start">
                            <h3 className={`font-bold text-lg ${task.completed ? 'text-slate-700 decoration-slate-400' : 'text-slate-900'}`}>
                                {task.label}
                            </h3>
                            {task.boostAmount && (
                                <span className={`text-xs font-bold px-2 py-1 rounded-full ${task.completed ? 'bg-slate-100 text-slate-500' : 'bg-yellow-100 text-yellow-700'}`}>
                                    +{task.boostAmount} PTS
                                </span>
                            )}
                        </div>
                        <p className="text-sm text-slate-500 mt-1">{task.description}</p>
                        
                        {/* Progress Bar for behavioral tasks */}
                        {task.total > 1 && !task.completed && (
                            <div className="mt-3">
                                <div className="flex justify-between text-[10px] font-bold uppercase text-slate-400 mb-1">
                                    <span>Progress</span>
                                    <span>{task.progress}/{task.total} {task.isPercentage ? '%' : ''}</span>
                                </div>
                                <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                                    <div className="h-full bg-indigo-500 rounded-full" style={{ width: `${Math.min(100, (task.progress / task.total) * 100)}%` }}></div>
                                </div>
                            </div>
                        )}
                    </div>

                    {!task.completed && task.action && (
                        <button 
                            onClick={() => handleAction(task.action)}
                            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-lg transition-colors shrink-0"
                        >
                            {getActionLabel(task.action)}
                        </button>
                    )}
                </div>
            )
        })}
      </div>
    </div>
  );
}

function getIconForTask(key) {
    if (key.includes("profile")) return User;
    if (key.includes("kyc")) return ShieldCheck;
    if (key.includes("order")) return ShoppingBag;
    if (key.includes("shopper")) return ShoppingBag;
    if (key.includes("card") || key.includes("payment")) return CreditCard;
    return Target;
}

function getActionLabel(action) {
    if (action === "shop_now") return "Shop Now";
    if (action === "edit_profile") return "Edit";
    if (action === "verify_kyc") return "Verify";
    return "Go";
}
