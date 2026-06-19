import React, { useState } from "react";
import { API_BASE_URL } from "../../config";
import { useAuth } from "../../contexts/AuthContext";

export default function CreditCheckModal({
  open,
  onClose,
  cart,
  paymentOption,
  onApproved,
}) {
  const { token } = useAuth();
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  if (!open) return null;

  async function runCheck() {
    setLoading(true);
    setResult(null);

    try {
      const res = await fetch(`${API_BASE_URL}/api/score/realtime`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ cart, paymentOption }),
      });

      const json = await res.json();
      if (!res.ok) throw new Error(json.message || "Credit check failed");

      setResult(json);
    } catch (err) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  }

  function handleProceed() {
    onApproved(result);
    onClose();
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center px-4">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md p-8">
        {/* HEADER */}
        <h2 className="text-2xl font-bold text-gray-900">Credit evaluation</h2>
        <p className="text-sm text-gray-500 mt-1">
          We’re checking your eligibility for{" "}
          <span className="font-semibold">
            {paymentOption === "installment" ? "installments" : "pay later"}
          </span>
        </p>

        {/* LOADING STATE */}
        {!result && (
          <div className="mt-8">
            <button
              onClick={runCheck}
              disabled={loading}
              className="w-full py-3 rounded-xl bg-blue-600 text-white font-semibold transition hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? "Evaluating eligibility…" : "Run credit check"}
            </button>

            <p className="text-xs text-gray-400 text-center mt-4">
              This does not affect your traditional credit score
            </p>
          </div>
        )}

        {/* RESULT STATE */}
        {result && (
          <div className="mt-8 space-y-5">
            {/* SCORE */}
            <div className="text-center">
              <p className="text-xs uppercase text-gray-400">TrustCart score</p>
              <p
                className={`text-5xl font-black mt-2 ${
                  result.score >= 80
                    ? "text-green-600"
                    : result.score >= 50
                    ? "text-amber-500"
                    : "text-red-500"
                }`}
              >
                {result.score}
              </p>
              <p className="text-sm font-semibold text-gray-700 mt-1">
                {result.level}
              </p>
            </div>

            {/* DECISION */}
            <div
              className={`rounded-2xl p-4 text-center ${
                result.approved
                  ? "bg-green-50 text-green-700"
                  : "bg-red-50 text-red-700"
              }`}
            >
              {result.approved ? (
                <p className="font-semibold">
                  You’re approved for this payment option
                </p>
              ) : (
                <p className="font-semibold">
                  This option isn’t available for you right now
                </p>
              )}
            </div>

            {/* REASONS (HUMAN READABLE) */}
            {Array.isArray(result.reasons) && result.reasons.length > 0 && (
              <div className="text-sm text-gray-600">
                <p className="font-semibold mb-2">Why this decision?</p>
                <ul className="space-y-1 list-disc list-inside">
                  {result.reasons.slice(0, 3).map((r, i) => (
                    <li key={i}>{r.text}</li>
                  ))}
                </ul>
              </div>
            )}

            {/* ACTION */}
            {result.approved && (
              <button
                onClick={handleProceed}
                className="w-full py-3 rounded-xl bg-green-600 text-white font-semibold hover:bg-green-700 transition"
              >
                Continue with payment
              </button>
            )}
          </div>
        )}

        {/* FOOTER */}
        <button
          onClick={onClose}
          className="mt-6 w-full py-2 text-sm text-gray-500 hover:text-gray-700"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}
