import { useCallback, useEffect, useMemo, useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import { fetchScoreDetails } from "../api/customer";

export default function ScoreWidget({ customerId }) {
  const { token } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const loadScore = useCallback(async () => {
    if (!customerId || !token) return;
    setLoading(true);
    setError("");
    try {
      const score = await fetchScoreDetails(token, customerId);
      setData(score);
    } catch (err) {
      console.error(err);
      setError(err.message || "Could not load score");
    } finally {
      setLoading(false);
    }
  }, [customerId, token]);

  useEffect(() => {
    loadScore();
  }, [loadScore]);

  const palette = useMemo(() => {
    const base = data?.score ?? 0;
    if (base >= 80) return { text: "text-emerald-600", badge: "bg-emerald-100 text-emerald-700" };
    if (base >= 50) return { text: "text-amber-600", badge: "bg-amber-100 text-amber-700" };
    return { text: "text-rose-600", badge: "bg-rose-100 text-rose-700" };
  }, [data]);

  if (!customerId || !token) {
    return (
      <div className="p-4 bg-white/70 backdrop-blur rounded-2xl shadow text-center text-sm text-gray-500">
        Login as a customer to see your credit score.
      </div>
    );
  }

  if (loading) {
    return (
      <div className="p-4 bg-white rounded-2xl shadow text-center">
        Loading score...
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 bg-white rounded-2xl shadow text-center text-red-500">
        {error}
      </div>
    );
  }

  if (!data) {
    return (
      <div className="p-4 bg-white rounded-2xl shadow text-center">
        No score available yet.
      </div>
    );
  }

  return (
    <div className="p-5 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white rounded-3xl shadow-xl space-y-3">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs uppercase tracking-wide text-slate-400">TrustCart score</p>
          <p className={`text-5xl font-black leading-tight ${palette.text}`}>
            {data.score ?? "—"}
          </p>
          <p className="text-sm font-semibold text-slate-200">{data.level || "Calculating"}</p>
        </div>
        <span className={`px-3 py-1 text-xs font-semibold rounded-full ${palette.badge}`}>
          Live
        </span>
      </div>

      {Array.isArray(data.reasons) && data.reasons.length > 0 && (
        <div className="bg-white/10 rounded-2xl p-3 space-y-2">
          <p className="text-[11px] uppercase tracking-wide text-slate-300">
            Why this score
          </p>
          {data.reasons.slice(0, 4).map((r, idx) => (
            <div key={idx} className="flex items-start gap-2 text-sm">
              <div className="h-2 w-2 mt-1 rounded-full bg-blue-400" />
              <div>
                <p className="font-semibold text-white">{r.text}</p>
                {r.value && <p className="text-xs text-slate-300">{r.value}</p>}
              </div>
              <span className="ml-auto text-[11px] text-slate-400 font-semibold">
                {r.weight ? (r.weight > 0 ? `+${r.weight}` : r.weight) : ""}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
