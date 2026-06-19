import { useEffect, useState } from "react";
import { useAuth } from "../../contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { fetchCustomerProfile, updateBoosterTask } from "../../api/customer";
import { ArrowLeft, Zap, CheckCircle, Circle, Award } from "lucide-react";

export default function ScoreBoosters() {
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

  async function handleBoosterComplete(task) {
    try {
      await updateBoosterTask(token, customerId, task.key, !task.completed);
      const data = await fetchCustomerProfile(token, customerId);
      setProfile(data);
    } catch (err) {
      alert(err.message);
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

  const { boosterTasks = [] } = profile;
  const completedCount = boosterTasks.filter((t) => t.completed).length;
  const totalCount = boosterTasks.length;
  const progressPercent =
    totalCount > 0 ? (completedCount / totalCount) * 100 : 0;

  return (
    <div className="min-h-screen bg-neutral-50">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Libre+Franklin:wght@300;400;500;600;700;800;900&display=swap');
        * { font-family: 'Libre Franklin', sans-serif; }
      `}</style>

      {/* Header */}
      <div className="bg-white border-b border-neutral-200">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <button
            onClick={() => navigate("/profile")}
            className="flex items-center gap-2 text-neutral-600 hover:text-neutral-900 mb-4 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="text-sm font-medium">Back to Dashboard</span>
          </button>

          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-3xl font-bold text-neutral-900 mb-2">
                Score Boosters
              </h1>
              <p className="text-neutral-600">
                Complete tasks to improve your credit score
              </p>
            </div>

            <div className="bg-gradient-to-br from-yellow-400 to-orange-500 text-white rounded-2xl p-6 min-w-[200px]">
              <div className="flex items-center gap-2 mb-2">
                <Award className="w-5 h-5" />
                <p className="text-sm font-semibold">Progress</p>
              </div>
              <p className="text-4xl font-bold mb-2">
                {completedCount}/{totalCount}
              </p>
              <div className="w-full h-2 bg-white/30 rounded-full overflow-hidden">
                <div
                  className="h-full bg-white rounded-full transition-all duration-500"
                  style={{ width: `${progressPercent}%` }}
                ></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-6 py-8">
        {boosterTasks.length === 0 ? (
          <div className="bg-white border border-neutral-200 rounded-2xl p-12 text-center">
            <Zap className="w-16 h-16 text-neutral-300 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-neutral-900 mb-2">
              No boosters available
            </h3>
            <p className="text-neutral-600">
              Check back later for tasks to improve your score
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {boosterTasks.map((task, idx) => (
              <div
                key={task.key || idx}
                className={`bg-white border-2 rounded-2xl p-6 transition-all ${
                  task.completed
                    ? "border-green-300 bg-green-50"
                    : "border-neutral-200 hover:border-neutral-300 hover:shadow-lg"
                }`}
              >
                <div className="flex items-start gap-4">
                  <button
                    onClick={() => handleBoosterComplete(task)}
                    className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 transition-all ${
                      task.completed
                        ? "bg-green-500 hover:bg-green-600"
                        : "bg-neutral-100 hover:bg-neutral-200 border-2 border-neutral-300"
                    }`}
                  >
                    {task.completed ? (
                      <CheckCircle className="w-6 h-6 text-white" />
                    ) : (
                      <Circle className="w-6 h-6 text-neutral-400" />
                    )}
                  </button>

                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-2">
                      <h3
                        className={`text-xl font-bold ${
                          task.completed ? "text-green-900" : "text-neutral-900"
                        }`}
                      >
                        {task.title}
                      </h3>
                      {task.points && (
                        <div className="flex items-center gap-1 bg-yellow-100 text-yellow-700 px-3 py-1 rounded-full">
                          <Zap className="w-4 h-4" />
                          <span className="text-sm font-bold">
                            +{task.points}
                          </span>
                        </div>
                      )}
                    </div>

                    <p
                      className={`leading-relaxed mb-3 ${
                        task.completed ? "text-green-700" : "text-neutral-700"
                      }`}
                    >
                      {task.description}
                    </p>

                    {task.completed ? (
                      <div className="flex items-center gap-2 text-sm text-green-600 font-medium">
                        <CheckCircle className="w-4 h-4" />
                        <span>Completed</span>
                      </div>
                    ) : (
                      <button
                        onClick={() => handleBoosterComplete(task)}
                        className="text-sm font-semibold text-blue-600 hover:text-blue-800 transition-colors"
                      >
                        Mark as complete →
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Booster Benefits */}
        <div className="mt-8 bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200 rounded-2xl p-8">
          <h2 className="text-xl font-bold text-neutral-900 mb-4">
            Why Complete Boosters?
          </h2>
          <ul className="space-y-3">
            <li className="flex items-start gap-3">
              <div className="w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <Zap className="w-4 h-4" />
              </div>
              <div>
                <p className="font-semibold text-neutral-900 mb-1">
                  Faster Score Growth
                </p>
                <p className="text-sm text-neutral-700">
                  Completing tasks can accelerate your credit score improvement
                  by up to 30%
                </p>
              </div>
            </li>
            <li className="flex items-start gap-3">
              <div className="w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <Award className="w-4 h-4" />
              </div>
              <div>
                <p className="font-semibold text-neutral-900 mb-1">
                  Unlock Benefits
                </p>
                <p className="text-sm text-neutral-700">
                  Higher scores unlock better payment terms and exclusive
                  merchant offers
                </p>
              </div>
            </li>
            <li className="flex items-start gap-3">
              <div className="w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <CheckCircle className="w-4 h-4" />
              </div>
              <div>
                <p className="font-semibold text-neutral-900 mb-1">
                  Build Trust
                </p>
                <p className="text-sm text-neutral-700">
                  Demonstrate your commitment to financial responsibility and
                  reliability
                </p>
              </div>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
