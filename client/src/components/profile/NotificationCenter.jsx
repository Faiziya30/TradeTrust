export default function NotificationCenter({
  notifications = [],
  unread = 0,
  onMarkRead,
}) {
  return (
    <div className="bg-white rounded-2xl shadow p-6 space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-semibold text-gray-600">
            Notifications
          </p>
          <p className="text-xs text-gray-400">
            {unread} unread • score, payment, and booster alerts
          </p>
        </div>
      </div>
      <div className="space-y-3 max-h-64 overflow-y-auto pr-2">
        {notifications.length === 0 && (
          <div className="text-sm text-gray-500">
            All quiet! We’ll let you know when something changes.
          </div>
        )}
        {notifications.map((note) => (
          <div
            key={note.id}
            className={`border rounded-xl p-3 ${
              note.status === "unread" ? "border-blue-200 bg-blue-50" : ""
            }`}
          >
            <div className="flex items-center justify-between">
              <p className="font-semibold text-gray-800">{note.title}</p>
              <span className="text-xs text-gray-400">
                {new Date(note.createdAt).toLocaleString()}
              </span>
            </div>
            <p className="text-sm text-gray-600">{note.body}</p>
            {note.status === "unread" && (
              <button
                onClick={() => onMarkRead(note.id)}
                className="mt-2 text-xs font-semibold text-blue-600"
              >
                Mark as read
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

