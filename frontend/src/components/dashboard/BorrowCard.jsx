import { Link } from "react-router-dom";

const STATUS_CONFIG = {
  PENDING: { label: "Chờ duyệt", icon: "⏳", gradient: "from-amber-500 to-amber-600" },
  BORROWING: { label: "Đang mượn", icon: "📖", gradient: "from-primary-500 to-primary-600" },
  RETURNED: { label: "Đã trả", icon: "✅", gradient: "from-success-500 to-success-600" },
  OVERDUE: { label: "Quá hạn", icon: "⚠️", gradient: "from-danger-500 to-danger-600" },
  CANCELLED: { label: "Đã hủy", icon: "❌", gradient: "from-gray-400 to-gray-500" },
  REJECTED: { label: "Bị từ chối", icon: "🚫", gradient: "from-danger-500 to-danger-600" },
};

export default function BorrowCard({ borrow, onCancel, onReturn }) {
  const st = STATUS_CONFIG[borrow.status] || { label: borrow.status, icon: "📄", gradient: "from-gray-400 to-gray-500" };

  return (
    <div className="group relative">
      <div className="absolute inset-0 bg-gradient-to-r from-primary-500/10 to-accent-500/10 rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-all"></div>
      <div className="relative bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all border border-gray-100">
        <div className="flex flex-col md:flex-row justify-between items-start gap-4 mb-4">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-3">
              <span className="text-xs font-mono text-gray-400">#{borrow.id}</span>
              <span className={`inline-flex items-center gap-1.5 px-3 py-1 bg-gradient-to-r ${st.gradient} text-white rounded-lg text-xs font-bold shadow-md`}>
                <span>{st.icon}</span>
                {st.label}
              </span>
            </div>
            <div className="flex flex-wrap gap-2">
              {(borrow.details || []).map((d) => (
                <span key={d.id} className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-primary-50 to-accent-50 text-primary-700 rounded-lg text-sm font-semibold border border-primary-200">
                  📚 {d.bookTitle}
                </span>
              ))}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm bg-gray-50 rounded-xl p-4">
          <div>
            <p className="text-xs text-gray-500 mb-1 font-semibold">📅 Ngày mượn</p>
            <p className="font-bold text-gray-900">{borrow.borrowDate || "—"}</p>
          </div>
          <div>
            <p className="text-xs text-gray-500 mb-1 font-semibold">⏰ Hạn trả</p>
            <p className={`font-bold ${borrow.status === "OVERDUE" ? "text-danger-600" : "text-gray-900"}`}>
              {borrow.dueDate || "—"}
            </p>
          </div>
          {borrow.returnDate && (
            <div>
              <p className="text-xs text-gray-500 mb-1 font-semibold">✅ Ngày trả</p>
              <p className="font-bold text-success-600">{borrow.returnDate}</p>
            </div>
          )}
        </div>

        <div className="mt-4 flex flex-wrap gap-3">
          {borrow.status === "BORROWING" && (borrow.details || []).map((d) => (
            !d.bookDeleted && d.bookId && (
              <Link
                key={d.id}
                to={`/books/${d.bookId}/read`}
                className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-primary-500 to-accent-500 text-white rounded-lg text-sm font-semibold hover:from-primary-600 hover:to-accent-600 transition-all shadow-md hover:shadow-lg"
              >
                📖 Đọc {d.bookTitle}
              </Link>
            )
          ))}
          {borrow.status === "PENDING" && (
            <button
              onClick={() => onCancel(borrow.id)}
              className="px-4 py-2 bg-danger-50 text-danger-600 rounded-lg text-sm font-semibold hover:bg-danger-100 transition-all"
            >
              ❌ Hủy phiếu
            </button>
          )}
          {(borrow.status === "BORROWING" || borrow.status === "OVERDUE") && (
            <button
              onClick={() => onReturn(borrow.id)}
              className="px-4 py-2 bg-success-50 text-success-600 rounded-lg text-sm font-semibold hover:bg-success-100 transition-all"
            >
              ✅ Trả sách
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
