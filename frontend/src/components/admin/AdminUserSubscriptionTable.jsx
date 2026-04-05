export default function AdminUserSubscriptionTable({
  userSubscriptions,
  loading,
  statusFilter,
  setStatusFilter,
  onRefresh,
}) {
  const statusColors = {
    ACTIVE: "bg-green-100 text-green-700",
    EXPIRED: "bg-amber-100 text-amber-700",
    CANCELLED: "bg-red-100 text-red-700",
  };

  const statusLabels = {
    ACTIVE: "Đang hoạt động",
    EXPIRED: "Hết hạn",
    CANCELLED: "Đã hủy",
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return "—";
    return new Date(dateStr).toLocaleDateString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatPrice = (price) => {
    if (!price) return "0đ";
    return Number(price).toLocaleString("vi-VN") + "đ";
  };

  return (
    <div>
      <div className="flex flex-wrap gap-3 mb-6 items-center justify-between">
        <div className="flex gap-3 items-center">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="input max-w-[200px]"
          >
            <option value="">Tất cả trạng thái</option>
            <option value="ACTIVE">Đang hoạt động</option>
            <option value="EXPIRED">Hết hạn</option>
            <option value="CANCELLED">Đã hủy</option>
          </select>
          <button onClick={onRefresh} className="btn-outline">
            Tải lại
          </button>
        </div>
        <div className="text-sm text-gray-500">
          Tổng: <span className="font-semibold text-gray-700">{userSubscriptions.length}</span> bản ghi
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <div className="spinner w-10 h-10"></div>
        </div>
      ) : userSubscriptions.length === 0 ? (
        <div className="text-center py-12 text-gray-400">
          <p className="text-lg">Chưa có người dùng nào đăng ký gói thành viên</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-50">
                <th className="text-left p-3 font-semibold">#</th>
                <th className="text-left p-3 font-semibold">Người dùng</th>
                <th className="text-left p-3 font-semibold">Email</th>
                <th className="text-left p-3 font-semibold">Gói đăng ký</th>
                <th className="text-right p-3 font-semibold">Giá</th>
                <th className="text-center p-3 font-semibold">Ngày bắt đầu</th>
                <th className="text-center p-3 font-semibold">Ngày kết thúc</th>
                <th className="text-center p-3 font-semibold">Trạng thái</th>
                <th className="text-left p-3 font-semibold">Mã thanh toán</th>
              </tr>
            </thead>
            <tbody>
              {userSubscriptions.map((sub, idx) => (
                <tr key={sub.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                  <td className="p-3 text-gray-500">{idx + 1}</td>
                  <td className="p-3 font-medium">{sub.userName || "—"}</td>
                  <td className="p-3 text-gray-600">{sub.userEmail || "—"}</td>
                  <td className="p-3">
                    <span className="font-medium text-indigo-600">{sub.plan?.name || "—"}</span>
                  </td>
                  <td className="p-3 text-right font-medium">{formatPrice(sub.plan?.price)}</td>
                  <td className="p-3 text-center text-gray-600">{formatDate(sub.startDate)}</td>
                  <td className="p-3 text-center text-gray-600">{formatDate(sub.endDate)}</td>
                  <td className="p-3 text-center">
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-semibold ${
                        statusColors[sub.status] || "bg-gray-100 text-gray-600"
                      }`}
                    >
                      {statusLabels[sub.status] || sub.status}
                    </span>
                  </td>
                  <td className="p-3 text-gray-500 text-xs font-mono">{sub.paymentReference || "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
