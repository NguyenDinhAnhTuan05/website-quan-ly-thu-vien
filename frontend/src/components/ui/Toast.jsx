export default function Toast({ message, type = "success", onClose }) {
  if (!message) return null;

  return (
    <div
      className={`fixed top-20 right-4 z-50 px-5 py-3 rounded-lg shadow-lg text-white text-sm animate-slide-down ${
        type === "error" ? "bg-danger-600" : type === "warning" ? "bg-accent-600" : "bg-success-600"
      }`}
    >
      <div className="flex items-center gap-3">
        <span>{message}</span>
        {onClose && (
          <button onClick={onClose} className="hover:opacity-80 transition-opacity">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>
    </div>
  );
}
