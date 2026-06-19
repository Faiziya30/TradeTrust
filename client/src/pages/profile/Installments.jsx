import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { API_BASE_URL } from "../../config";
import { useAuth } from "../../contexts/AuthContext";
import {
  ArrowLeft,
  Calendar,
  CheckCircle,
  Clock,
  CreditCard,
  Lock,
} from "lucide-react";

export default function Installments() {
  const { token, customerId } = useAuth();
  const navigate = useNavigate();

  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [now, setNow] = useState(new Date());
  const [confirming, setConfirming] = useState(false);
  const [selected, setSelected] = useState(null);

  /* ---------------- effects ---------------- */
  useEffect(() => {
    loadPlans();
  }, [token, customerId]);

  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  /* ---------------- data ---------------- */
  async function loadPlans() {
    if (!token || !customerId) return;

    setLoading(true);
    try {
      const res = await fetch(
        `${API_BASE_URL}/api/customers/${customerId}/installments`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const json = await res.json();
      console.log("Installments loaded:", json);
      if (res.ok && Array.isArray(json)) setPlans(json);
      else {
        console.error("Error response:", json);
        setPlans([]);
      }
    } catch (e) {
      console.error("Installments fetch error:", e);
      setPlans([]);
    } finally {
      setLoading(false);
    }
  }

  /* ---------------- helpers ---------------- */
  const getCountdown = (due) => {
    const diff = new Date(due) - now;
    if (diff <= 0) return { text: "OVERDUE", color: "text-red-600" };
    const d = Math.floor(diff / 86400000);
    const h = Math.floor((diff % 86400000) / 3600000);
    if (d > 0) return { text: `${d}d ${h}h`, color: "text-orange-600" };
    return { text: `${Math.floor(diff / 60000)}m`, color: "text-red-600" };
  };

  const canPay = (schedule, idx) =>
    idx === 0 || schedule.slice(0, idx).every((s) => s.status === "paid");

  /* ---------------- payment ---------------- */
  async function confirmPayment() {
    if (!selected) return;

    setConfirming(true);
    try {
      await fetch(`${API_BASE_URL}/api/installments/${selected.planId}/pay`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ index: selected.index }),
      });
      setSelected(null);
      loadPlans();
    } finally {
      setConfirming(false);
    }
  }

  /* ---------------- loading ---------------- */
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-neutral-50">
        Loading payment plans…
      </div>
    );
  }

  /* ---------------- empty ---------------- */
  if (plans.length === 0) {
    return (
      <div className="min-h-screen bg-neutral-50 flex items-center justify-center">
        <div className="bg-white rounded-xl p-12 text-center max-w-md">
          <Calendar className="w-14 h-14 text-neutral-300 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-neutral-900">
            No payment plans yet
          </h2>
          <p className="text-neutral-600 mt-2">
            Installment and Pay Later plans will appear here after checkout.
          </p>
        </div>
      </div>
    );
  }

  /* ---------------- ui ---------------- */
  return (
    <div className="min-h-screen bg-slate-50 font-sans">
       <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&display=swap');
        * { font-family: 'Plus Jakarta Sans', system-ui, sans-serif; }
      `}</style>
      
      {/* Premium Header */}
      <div className="bg-[#0f172a] text-white py-12 px-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl translate-x-1/2 -translate-y-1/2"></div>
         <div className="absolute bottom-0 left-0 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl -translate-x-1/2 translate-y-1/2"></div>
        
        <div className="max-w-5xl mx-auto relative z-10">
          <button
            onClick={() => navigate("/profile")}
            className="flex items-center gap-2 text-slate-400 hover:text-white mb-6 transition-colors text-sm font-medium"
          >
            <ArrowLeft size={16} />
            Back to Dashboard
          </button>
          
          <h1 className="text-3xl font-bold mb-2">Payments & Installments</h1>
          <p className="text-slate-400">Manage your installment plans and pay-later commitments</p>
        </div>
      </div>

      {/* CONTENT */}
      <div className="max-w-5xl mx-auto px-6 -mt-8 relative z-20 pb-12 space-y-6">
        {plans.length === 0 ? (
          <div className="bg-white border border-slate-200 rounded-2xl p-16 text-center shadow-sm">
             <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
                 <Calendar className="w-8 h-8 text-slate-300" />
            </div>
            <h2 className="text-xl font-bold text-slate-900 mb-2">
              No active plans
            </h2>
            <p className="text-slate-500">
              Installment and Pay Later plans will appear here after your next purchase.
            </p>
          </div>
        ) : (
             plans.map((plan) => {
              const isPayLater = plan.type === "pay_later";
              const paidCount = plan.schedule?.filter((s) => s.status === "paid").length;
              const total = plan.schedule?.length || 1;
              const progress = isPayLater
                ? plan.status === "paid" ? 100 : 0
                : (paidCount / total) * 100;

              return (
                <div
                  key={plan._id}
                  className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm hover:shadow-md transition-all"
                >
                  {/* PLAN HEADER */}
                  <div className="p-6 border-b border-slate-100 flex flex-wrap justify-between items-center gap-4 bg-slate-50/50">
                    <div>
                      <p className="font-bold text-slate-900 text-lg flex items-center gap-2">
                        {isPayLater ? "Pay Later" : "Installment Plan"} 
                        <span className="text-xs font-mono font-medium text-slate-400 px-2 py-1 bg-white border border-slate-200 rounded-md">
                            #{String(plan._id).slice(-6).toUpperCase()}
                        </span>
                      </p>
                      <p className="text-sm text-slate-500 mt-1">
                        Total Amount: <span className="font-semibold text-slate-900">₹{plan.totalAmount.toLocaleString()}</span>
                      </p>
                    </div>

                    {isPayLater && plan.status !== "paid" ? (
                      <button
                        onClick={() =>
                          setSelected({
                            planId: plan._id,
                            index: 0,
                            amount: plan.totalAmount,
                          })
                        }
                        className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-semibold text-sm shadow-lg shadow-indigo-500/20 transition-all"
                      >
                        Settle Full Amount
                      </button>
                    ) : plan.status === "paid" ? (
                      <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm font-bold flex items-center gap-2">
                        <CheckCircle size={16} /> Paid in Full
                      </span>
                    ) : null}
                  </div>

                  {/* PROGRESS */}
                  <div className="h-1.5 bg-slate-100 w-full">
                    <div
                      className="h-full bg-emerald-500 transition-all duration-1000 ease-out"
                      style={{ width: `${progress}%` }}
                    />
                  </div>

                  {/* INSTALLMENTS */}
                  {!isPayLater && (
                    <div className="p-6 space-y-4">
                      {plan.schedule.map((s) => {
                        const overdue = s.status !== "paid" && new Date(s.dueDate) < new Date();
                        const payable = canPay(plan.schedule, s.index);
                        const countdown = getCountdown(s.dueDate);

                        return (
                          <div
                            key={s._id}
                            className={`border rounded-xl p-5 transition-all ${
                              s.status === "paid"
                                ? "bg-slate-50 border-slate-200"
                                : overdue
                                ? "bg-red-50 border-red-200 ring-1 ring-red-200"
                                : "bg-white border-slate-200"
                            }`}
                          >
                            <div className="flex justify-between items-center flex-wrap gap-4">
                              <div>
                                <p className={`font-bold text-lg ${s.status === 'paid' ? 'text-slate-400 line-through' : 'text-slate-900'}`}>₹{s.amount.toFixed(2)}</p>
                                <div className="flex items-center gap-2 mt-1">
                                     <Clock size={14} className="text-slate-400" />
                                     <p className="text-sm text-slate-500">
                                      Due {new Date(s.dueDate).toLocaleDateString()}
                                    </p>
                                </div>
                                
                                {s.status !== "paid" && (
                                  <p className={`text-xs font-bold mt-2 uppercase tracking-wide flex items-center gap-1 ${countdown.color}`}>
                                    {overdue && <Clock size={12} />} {countdown.text}
                                  </p>
                                )}
                              </div>

                              {s.status === "paid" ? (
                                <span className="text-green-600 font-bold text-sm flex items-center gap-1.5 bg-green-50 px-3 py-1.5 rounded-lg border border-green-100">
                                  <CheckCircle size={14} /> Paid
                                </span>
                              ) : !payable ? (
                                <span className="text-slate-400 text-sm font-medium flex items-center gap-1.5 bg-slate-100 px-3 py-1.5 rounded-lg border border-slate-200">
                                  <Lock size={14} /> Locked
                                </span>
                              ) : (
                                <button
                                  onClick={() =>
                                    setSelected({
                                      planId: plan._id,
                                      index: s.index,
                                      amount: s.amount,
                                    })
                                  }
                                  className="px-5 py-2 bg-slate-900 hover:bg-indigo-600 text-white rounded-lg font-medium text-sm transition-colors shadow-sm"
                                >
                                  Pay this installment
                                </button>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })
        )}
      </div>

      {/* CONFIRM MODAL */}
      {selected && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in">
          <div className="bg-white rounded-2xl p-8 max-w-sm w-full text-center shadow-2xl animate-slide-up">
            <div className="w-16 h-16 bg-indigo-50 rounded-full flex items-center justify-center mx-auto mb-6">
                <CreditCard className="w-8 h-8 text-indigo-600" />
            </div>
            
            <h3 className="text-xl font-bold text-slate-900 mb-2">Confirm Payment</h3>
            <p className="text-slate-500 mb-8">
              You are about to pay <span className="font-bold text-slate-900">₹{selected.amount.toFixed(2)}</span>
            </p>

            <div className="space-y-3">
                <button
                  onClick={confirmPayment}
                  disabled={confirming}
                  className="w-full py-3.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold transition-all shadow-lg shadow-indigo-500/20 disabled:opacity-70 disabled:cursor-not-allowed"
                >
                  {confirming ? (
                      <span className="flex items-center justify-center gap-2">
                          <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                          Processing...
                      </span>
                  ) : "Confirm & Pay"}
                </button>
    
                <button
                  onClick={() => setSelected(null)}
                  className="w-full py-3 text-slate-500 hover:text-slate-800 font-semibold transition-colors"
                >
                  Cancel
                </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
