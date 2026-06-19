/**
 * PayOptionCard
 * props:
 *  - id
 *  - title
 *  - subtitle
 *  - details (array of strings)
 *  - priceInfo (string, e.g. "4 x $25.00")
 *  - eligible (bool)
 *  - onSelect() callback
 *  - badge (string) optional
 */
export default function PayOptionCard({
  id,
  title,
  subtitle,
  details = [],
  priceInfo,
  eligible = true,
  onSelect,
  badge,
}) {
  return (
    <div
      role="button"
      tabIndex={0}
      onClick={() => eligible && onSelect && onSelect(id)}
      className={`border rounded-xl p-4 w-full md:w-80 cursor-pointer transition-shadow focus:outline-none ${
        eligible ? "hover:shadow-lg" : "opacity-60 cursor-not-allowed"
      }`}
    >
      <div className="flex items-start justify-between">
        <div>
          <h3 className="text-lg font-semibold">{title}</h3>
          <p className="text-sm text-gray-500">{subtitle}</p>
        </div>
        {badge && (
          <div className="text-xs px-2 py-1 rounded-md bg-amber-100 text-amber-800">
            {badge}
          </div>
        )}
      </div>

      <div className="mt-3 text-sm text-gray-700 space-y-1">
        {details.map((d, i) => (
          <div key={i} className="flex items-center">
            <span className="mr-2 text-xs text-gray-400">•</span>
            <span>{d}</span>
          </div>
        ))}
      </div>

      <div className="mt-4 flex items-center justify-between">
        <div className="text-sm text-gray-600">{priceInfo}</div>
        <button
          onClick={(e) => {
            e.stopPropagation();
            if (eligible && onSelect) onSelect(id);
          }}
          disabled={!eligible}
          className={`px-3 py-1 rounded-md text-xs font-semibold ${
            eligible
              ? "bg-blue-600 text-white hover:bg-blue-700"
              : "bg-gray-200 text-gray-500"
          }`}
        >
          {eligible ? "Choose" : "Not eligible"}
        </button>
      </div>
    </div>
  );
}
