// src/components/profile/InstallmentSchedule.jsx
import { useState } from "react";
import { API_BASE_URL } from "../../config";
import { useAuth } from "../../contexts/AuthContext";

function formatDate(dateString) {
  try {
    return new Intl.DateTimeFormat("en", {
      month: "short",
      day: "numeric",
      year: "numeric",
    }).format(new Date(dateString));
  } catch {
    return dateString;
  }
}

const PAGE_SIZE = 2;

export default function InstallmentSchedule({ plans = [], onPayment }) {
  const { token } = useAuth();
  const [loading, setLoading] = useState(null); // { planId, index }
  const [page, setPage] = useState(0);

  const pageCount = Math.ceil(plans.length / PAGE_SIZE) || 1;
  const pagePlans = plans.slice(page * PAGE_SIZE, page * PAGE_SIZE + PAGE_SIZE);

  // No plans at all
  if (!plans.length) {
    return (
      <div className="bg-white rounded-2xl shadow p-6">
        <p className="text-sm text-gray-600">
          No active installment or pay-later plans.
        </p>
      </div>
    );
  }

  // PAY LATER PAYMENT HANDLER
  async function payPayLaterPlan(plan) {
    if (!token) return alert("Please login");

    try {
      const res = await fetch(
        `${API_BASE_URL}/api/installments/${plan._id}/pay`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      const json = await res.json();
      if (!res.ok) throw new Error(json.message);

      alert("Payment successful!");
      onPayment && onPayment();
    } catch (err) {
      alert(err.message);
    }
  }

  // INSTALLMENT PAYMENT HANDLER
  async function payInstallment(plan, index) {
    if (!token) return alert("Please login");

    setLoading({ planId: plan._id, index });

    try {
      const res = await fetch(
        `${API_BASE_URL}/api/installments/${plan._id}/pay`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ index }),
        }
      );

      const json = await res.json();
      if (!res.ok) throw new Error(json.message);

      alert("Installment paid successfully!");
      onPayment && onPayment();
    } catch (err) {
      alert(err.message);
    } finally {
      setLoading(null);
    }
  }

  return (
    <div className="bg-white rounded-2xl shadow p-6">
      <p className="text-sm font-semibold text-gray-600 mb-4">
        Installments & Pay Later
      </p>

      <div className="space-y-6">
        {pagePlans.map((plan) => (
          <div key={plan._id} className="border rounded-xl p-4 space-y-4">
            {/* HEADER */}
            <div className="flex justify-between items-center">
              <p className="font-bold text-lg">
                Order #{String(plan.orderId).slice(-6)}
              </p>

              <span
                className={`px-3 py-1 rounded-full text-xs font-semibold ${
                  plan.status === "pending"
                    ? "bg-amber-100 text-amber-700"
                    : plan.status === "completed" || plan.status === "paid"
                    ? "bg-green-100 text-green-700"
                    : "bg-gray-100 text-gray-500"
                }`}
              >
                {plan.status}
              </span>
            </div>

            <p className="text-sm text-gray-600">
              Total: ₹{plan.totalAmount?.toFixed(2)}
            </p>

            {/* PAY LATER (NO SCHEDULE) */}
            {plan.type === "pay_later" && (
              <div className="border-t pt-3 flex justify-between items-center">
                <div>
                  <p className="text-sm font-medium">Due Date</p>
                  <p className="text-xs text-gray-500">
                    {formatDate(plan.dueDate)}
                  </p>
                </div>

                {plan.status !== "paid" && (
                  <button
                    onClick={() => payPayLaterPlan(plan)}
                    className="px-3 py-1 bg-blue-600 text-white text-xs rounded-lg hover:bg-blue-700"
                  >
                    Pay Now
                  </button>
                )}
              </div>
            )}

            {/* INSTALLMENT SCHEDULE */}
            {plan.type === "installment" && (
              <div className="space-y-3">
                {plan.schedule.map((inst, idx) => (
                  <div
                    key={idx}
                    className="flex justify-between items-center border-t pt-3"
                  >
                    <div>
                      <p className="text-sm font-medium">Payment {idx + 1}</p>
                      <p className="text-xs text-gray-500">
                        Due: {formatDate(inst.dueDate)}
                      </p>
                    </div>

                    <div className="flex items-center gap-3">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-semibold ${
                          inst.status === "paid"
                            ? "bg-green-100 text-green-700"
                            : inst.late
                            ? "bg-red-100 text-red-600"
                            : "bg-amber-100 text-amber-700"
                        }`}
                      >
                        {inst.status}
                      </span>

                      {inst.status !== "paid" &&
                        plan.status !== "completed" && (
                          <button
                            onClick={() => payInstallment(plan, idx)}
                            disabled={
                              loading &&
                              loading.planId === plan._id &&
                              loading.index === idx
                            }
                            className="px-3 py-1 bg-blue-600 text-white text-xs rounded-lg hover:bg-blue-700"
                          >
                            {loading &&
                            loading.planId === plan._id &&
                            loading.index === idx
                              ? "Paying…"
                              : "Pay now"}
                          </button>
                        )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>

      {pageCount > 1 && (
        <div className="flex items-center justify-between mt-4 text-sm text-gray-600">
          <button
            className="px-3 py-1 rounded-lg border text-xs disabled:opacity-50"
            onClick={() => setPage((p) => Math.max(0, p - 1))}
            disabled={page === 0}
          >
            Previous
          </button>
          <span>
            Page {page + 1} of {pageCount}
          </span>
          <button
            className="px-3 py-1 rounded-lg border text-xs disabled:opacity-50"
            onClick={() => setPage((p) => Math.min(pageCount - 1, p + 1))}
            disabled={page === pageCount - 1}
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}
