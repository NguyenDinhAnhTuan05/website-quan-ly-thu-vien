const STATUS_CONFIG = {
  PENDING: { label: "Chờ duyệt", color: "warning", icon: "⏳", gradient: "from-amber-500 to-amber-600" },
  BORROWING: { label: "Đang mượn", color: "primary", icon: "📖", gradient: "from-primary-500 to-primary-600" },
  RETURNED: { label: "Đã trả", color: "success", icon: "✅", gradient: "from-success-500 to-success-600" },
  OVERDUE: { label: "Quá hạn", color: "danger", icon: "⚠️", gradient: "from-danger-500 to-danger-600" },
  CANCELLED: { label: "Đã hủy", color: "neutral", icon: "❌", gradient: "from-gray-400 to-gray-500" },
  REJECTED: { label: "Bị từ chối", color: "danger", icon: "🚫", gradient: "from-danger-500 to-danger-600" },
};

export { STATUS_CONFIG };

export default function StatusBadge({ status }) {
  const st = STATUS_CONFIG[status] || { label: status, color: "neutral", icon: "📄", gradient: "from-gray-400 to-gray-500" };

  return (
    <span className={`inline-flex items-center gap-1.5 px-3 py-1 bg-gradient-to-r ${st.gradient} text-white rounded-lg text-xs font-bold shadow-md`}>
      <span>{st.icon}</span>
      {st.label}
    </span>
  );
}
