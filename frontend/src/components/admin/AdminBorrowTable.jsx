import { STATUS_CONFIG } from "../ui/StatusBadge";

const BORROW_STATUS = {
  PENDING: { label: "Chờ duyệt", color: "warning" },
  BORROWING: { label: "Đang mượn", color: "primary" },
  RETURNED: { label: "Đã trả", color: "success" },
  OVERDUE: { label: "Quá hạn", color: "danger" },
  CANCELLED: { label: "Đã hủy", color: "neutral" },
  REJECTED: { label: "Từ chối", color: "danger" },
};

export default function AdminBorrowTable({
  borrows,
  borrowLoading,
  borrowStatus,
  setBorrowStatus,
  onRefresh,
  onApprove,
  onReject,
  onReturn,
}) {
  return (
    <div>
      <div className="flex flex-wrap gap-3 mb-6 items-center">
        <select value={borrowStatus} onChange={(e) => setBorrowStatus(e.target.value)} className="select w-44">
          <option value="">Tất cả trạng thái</option>
          {Object.entries(BORROW_STATUS).map(([k, v]) => (
            <option key={k} value={k}>
              {v.label}
            </option>
          ))}
        </select>
        <button onClick={onRefresh} className="btn-outline">
          Tải lại
        </button>
      </div>

      {borrowLoading ? (
        <div className="flex justify-center py-12">
          <div className="spinner w-10 h-10"></div>
        </div>
      ) : (
        <div className="space-y-4">
          {borrows.map((borrow) => {
            const st = BORROW_STATUS[borrow.status] || { label: borrow.status, color: "neutral" };
            return (
              <div key={borrow.id} className="card p-5">
                <div className="flex justify-between items-start flex-wrap gap-3">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs text-gray-500">#{borrow.id}</span>
                      <span className="font-semibold text-gray-900">{borrow.username}</span>
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {(borrow.details || []).map((d) => (
                        <span key={d.id} className="text-sm text-gray-700 bg-gray-50 border border-gray-200 px-2 py-0.5 rounded">
                          {d.bookTitle}
                        </span>
                      ))}
                    </div>
                    <div className="flex gap-4 mt-2 text-xs text-gray-500">
                      <span>Mượn: {borrow.borrowDate || "—"}</span>
                      <span>Hạn: {borrow.dueDate || "—"}</span>
                      {borrow.returnDate && <span className="text-success-600">Đã trả: {borrow.returnDate}</span>}
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={`badge-${st.color}`}>{st.label}</span>
                    <div className="flex gap-2">
                      {borrow.status === "PENDING" && (
                        <>
                          <button onClick={() => onApprove(borrow.id)} className="btn-primary btn-sm">
                            Duyệt
                          </button>
                          <button onClick={() => onReject(borrow.id)} className="btn-danger btn-sm">
                            Từ chối
                          </button>
                        </>
                      )}
                      {(borrow.status === "BORROWING" || borrow.status === "OVERDUE") && (
                        <button onClick={() => onReturn(borrow.id)} className="btn-primary btn-sm">
                          Xác nhận trả
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
          {borrows.length === 0 && <div className="text-center py-10 text-gray-500">Không có phiếu mượn</div>}
        </div>
      )}
    </div>
  );
}
