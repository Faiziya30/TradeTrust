import { useEffect, useState } from "react";
import { useAuth } from "../../contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { API_BASE_URL } from "../../config";

export default function ScoreAnalytics() {
  const { token, customerId } = useAuth();
  const navigate = useNavigate();

  const [scoreData, setScoreData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  /* -------------------------------------------------- */
  /* FETCH EVERYTHING WITH DETAILED LOGGING            */
  /* -------------------------------------------------- */
  useEffect(() => {
    console.log("=== ScoreAnalytics Mount ===");
    console.log("token:", !!token, "customerId:", customerId);

    if (!token || !customerId) {
      console.warn("Missing token or customerId");
      setError("Missing authentication");
      setLoading(false);
      return;
    }

    async function load() {
      try {
        console.log(
          "Fetching score from:",
          `${API_BASE_URL}/api/customers/${customerId}/score`
        );

        /* 1️⃣ Latest Score */
        const scoreRes = await fetch(
          `${API_BASE_URL}/api/customers/${customerId}/score`,
          { headers: { Authorization: `Bearer ${token}` } }
        );

        console.log("Score response status:", scoreRes.status);

        if (!scoreRes.ok) {
          const errorData = await scoreRes.text();
          console.error("Score fetch failed:", scoreRes.status, errorData);
          throw new Error(`Score request failed: ${scoreRes.status}`);
        }

        const scoreResponse = await scoreRes.json();
        console.log("Raw score response:", scoreResponse);

        // Validate response structure
        if (!scoreResponse || typeof scoreResponse.score !== "number") {
          console.error("Invalid score response structure:", scoreResponse);
          throw new Error("Invalid score data structure");
        }

        setScoreData(scoreResponse);
        console.log("Score data set successfully:", scoreResponse);
      } catch (err) {
        console.error("=== ERROR IN LOAD ===", err);
        console.error("Error message:", err.message);
        console.error("Error stack:", err.stack);
        setError(err.message || "Failed to load score analytics");
      } finally {
        console.log("Load complete, setting loading to false");
        setLoading(false);
      }
    }

    load();
  }, [token, customerId]);

  /* -------------------------------------------------- */
  /* STATES                                             */
  /* -------------------------------------------------- */
  if (loading) {
    console.log("=== RENDER: LOADING ===");
    return (
      <div className="min-h-screen flex items-center justify-center bg-neutral-50">
        <div className="text-center">
          <p className="text-lg font-semibold text-neutral-700 mb-4">
            Loading score analytics…
          </p>
          <div className="flex justify-center gap-2">
            <div
              className="w-3 h-3 bg-neutral-400 rounded-full animate-bounce"
              style={{ animationDelay: "0s" }}
            ></div>
            <div
              className="w-3 h-3 bg-neutral-400 rounded-full animate-bounce"
              style={{ animationDelay: "0.1s" }}
            ></div>
            <div
              className="w-3 h-3 bg-neutral-400 rounded-full animate-bounce"
              style={{ animationDelay: "0.2s" }}
            ></div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    console.log("=== RENDER: ERROR ===", error);
    return (
      <div className="min-h-screen flex items-center justify-center bg-neutral-50">
        <div className="bg-white p-8 rounded-xl border border-red-200 text-center max-w-md">
          <h2 className="text-xl font-bold text-red-600 mb-2">
            Error Loading Score
          </h2>
          <p className="text-red-600 font-semibold mb-4">{error}</p>
          <p className="text-neutral-600 text-sm mb-6">
            Please check the browser console for more details.
          </p>
          <button
            onClick={() => navigate("/profile")}
            className="px-4 py-2 bg-neutral-900 text-white rounded-lg hover:bg-neutral-800 transition-colors"
          >
            Back to profile
          </button>
        </div>
      </div>
    );
  }

  // Fallback if no scoreData at all
  if (!scoreData) {
    console.log("=== RENDER: NO SCORE DATA ===");
    console.log("scoreData:", scoreData);
    return (
      <div className="min-h-screen flex items-center justify-center bg-neutral-50">
        <div className="bg-white p-8 rounded-xl border text-center max-w-md">
          <p className="text-neutral-600 mb-3">No score data available</p>
          <p className="text-sm text-neutral-500 mb-6">
            Your score will appear here once data is loaded.
          </p>
          <button
            onClick={() => navigate("/profile")}
            className="px-4 py-2 bg-neutral-900 text-white rounded-lg hover:bg-neutral-800 transition-colors"
          >
            Back to profile
          </button>
        </div>
      </div>
    );
  }

  console.log("=== RENDER: SUCCESS ===");
  console.log("scoreData:", scoreData);

  /* -------------------------------------------------- */
  /* UI                                                 */
  /* -------------------------------------------------- */
  return (
    <div className="min-h-screen bg-neutral-50">
      {/* HEADER */}
      <div className="bg-white border-b">
        <div className="max-w-6xl mx-auto px-6 py-6">
          <button
            onClick={() => navigate("/profile")}
            className="flex items-center gap-2 text-sm text-neutral-600 mb-4"
          >
            <ArrowLeft className="w-4 h-4" /> Back
          </button>

          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold">Score Analytics</h1>
              <p className="text-neutral-600">
                Understand how your actions affect your score
              </p>
            </div>

            <div className="bg-neutral-900 text-white rounded-xl p-5">
              <p className="text-xs uppercase text-neutral-400 mb-1">
                Current Score
              </p>
              <p className="text-4xl font-bold">
                {typeof scoreData?.score === "number" ? scoreData.score : "N/A"}
              </p>
              <p className="text-sm text-neutral-400 mt-1">
                {scoreData?.level || "Unknown"}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* CONTENT */}
      <div className="max-w-6xl mx-auto px-6 py-8 space-y-6">
        {/* CURRENT SCORE DETAILS */}
        <div className="bg-white rounded-xl border p-8">
          <h2 className="text-2xl font-bold mb-6">Your Score Details</h2>

          <div className="space-y-6">
            {/* Score Value */}
            <div className="border-b pb-4">
              <p className="text-sm text-neutral-600 mb-1">CURRENT SCORE</p>
              <p className="text-5xl font-black text-neutral-900">
                {typeof scoreData?.score === "number" ? scoreData.score : "N/A"}
              </p>
            </div>

            {/* Score Level */}
            <div className="border-b pb-4">
              <p className="text-sm text-neutral-600 mb-1">LEVEL</p>
              <p className="text-2xl font-bold text-neutral-900">
                {scoreData?.level || "Unknown"}
              </p>
            </div>

            {/* Score Reasons/Factors */}
            {scoreData?.reasonsRule &&
            Array.isArray(scoreData.reasonsRule) &&
            scoreData.reasonsRule.length > 0 ? (
              <div className="border-b pb-4">
                <p className="text-sm text-neutral-600 mb-3 font-semibold">
                  SCORING FACTORS
                </p>
                <div className="space-y-2">
                  {scoreData.reasonsRule.map((reason, idx) => (
                    <div
                      key={idx}
                      className="flex justify-between items-center p-3 bg-neutral-50 rounded-lg"
                    >
                      <div>
                        <p className="font-medium text-neutral-900">
                          {reason.text || reason.feature || "Factor"}
                        </p>
                        <p className="text-xs text-neutral-500">
                          Type: {reason.feature || "unknown"}
                        </p>
                      </div>
                      <div
                        className={`text-right font-bold ${
                          (reason.weight || 0) > 0
                            ? "text-green-600"
                            : "text-red-600"
                        }`}
                      >
                        {(reason.weight || 0) > 0 ? "+" : ""}
                        {reason.weight || 0} pts
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="border-b pb-4">
                <p className="text-sm text-neutral-600 mb-1">SCORING FACTORS</p>
                <p className="text-neutral-500">
                  No scoring factors available yet. Place an order to generate
                  factors.
                </p>
              </div>
            )}

            {/* Raw Score Response Data */}
            <div>
              <p className="text-sm text-neutral-600 mb-3 font-semibold">
                RAW DATA
              </p>
              <pre className="bg-gray-900 text-green-400 p-4 rounded-lg text-xs overflow-auto max-h-64">
                {JSON.stringify(scoreData, null, 2)}
              </pre>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
