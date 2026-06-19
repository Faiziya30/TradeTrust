export default function BoosterChecklist({ tasks = [], onComplete }) {
  if (!tasks.length) {
    return (
      <div className="bg-white rounded-2xl shadow p-6">
        <p className="text-sm text-gray-500">No boosters available right now.</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow p-6 space-y-4">
      <div>
        <p className="text-sm font-semibold text-gray-600">
          Boost score tasks
        </p>
        <p className="text-xs text-gray-400">
          Complete tasks to unlock higher trust limits.
        </p>
      </div>
      <ul className="space-y-3">
        {tasks.map((task) => (
          <li
            key={task.key}
            className="flex items-start justify-between gap-3 border rounded-xl p-3"
          >
            <div>
              <p className="font-semibold text-gray-800">{task.label}</p>
              <p className="text-sm text-gray-500">{task.description}</p>
            </div>
            <button
              onClick={() => onComplete(task)}
              className={`px-3 py-1 rounded-full text-xs font-semibold ${
                task.completed
                  ? "bg-green-100 text-green-700"
                  : "bg-blue-600 text-white"
              }`}
            >
              {task.completed ? "Completed" : "Mark done"}
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}

