export default function AdminUserTable({ users, userLoading, userKeyword, setUserKeyword, onRefresh, onToggle, onDelete }) {
  return (
    <div>
      <div className="flex gap-3 mb-6">
        <input
          type="text"
          value={userKeyword}
          onChange={(e) => setUserKeyword(e.target.value)}
          placeholder="Tìm theo email, username..."
          className="input max-w-sm"
        />
        <button onClick={onRefresh} className="btn-outline">
          Tải lại
        </button>
      </div>

      {userLoading ? (
        <div className="flex justify-center py-12">
          <div className="spinner w-10 h-10"></div>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-50">
                <th className="text-left p-3 font-semibold">Username</th>
                <th className="text-left p-3 font-semibold">Email</th>
                <th className="text-center p-3 font-semibold">Role</th>
                <th className="text-center p-3 font-semibold">Gói đăng ký</th>
                <th className="text-center p-3 font-semibold">Trạng thái</th>
                <th className="text-center p-3 font-semibold">Ngày tạo</th>
                <th className="text-right p-3 font-semibold">Hành động</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.id} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="p-3 font-medium text-gray-900">{u.username || "—"}</td>
                  <td className="p-3 text-gray-600">{u.email}</td>
                  <td className="p-3 text-center">
                    <span className="badge-primary">{String(u.role).replace("ROLE_", "")}</span>
                  </td>
                  <td className="p-3 text-center">
                    {u.activeSubscriptionPlanName ? (
                      <div>
                        <span className="text-xs px-2 py-1 rounded-full bg-indigo-100 text-indigo-700 font-semibold">
                          {u.activeSubscriptionPlanName}
                        </span>
                        {u.subscriptionEndDate && (
                          <div className="text-[10px] text-gray-400 mt-1">
                            HSD: {new Date(u.subscriptionEndDate).toLocaleDateString("vi-VN")}
                          </div>
                        )}
                      </div>
                    ) : (
                      <span className="text-xs text-gray-400">Chưa đăng ký</span>
                    )}
                  </td>
                  <td className="p-3 text-center">
                    <span
                      className={`text-xs px-2 py-1 rounded-full ${
                        u.enabled ? "bg-success-100 text-success-700" : "bg-danger-100 text-danger-600"
                      }`}
                    >
                      {u.enabled ? "Hoạt động" : "Bị khóa"}
                    </span>
                  </td>
                  <td className="p-3 text-center text-gray-500 text-xs">
                    {u.createdAt ? new Date(u.createdAt).toLocaleDateString("vi-VN") : "—"}
                  </td>
                  <td className="p-3 text-right">
                    <div className="flex gap-2 justify-end">
                      <button
                        onClick={() => onToggle(u.id)}
                        className={`text-sm px-3 py-1 rounded ${
                          u.enabled ? "hover:bg-danger-50 text-danger-500" : "hover:bg-success-50 text-success-600"
                        }`}
                      >
                        {u.enabled ? "Khóa" : "Kích hoạt"}
                      </button>
                      <button onClick={() => onDelete(u.id)} className="text-sm px-3 py-1 rounded hover:bg-danger-50 text-danger-500">
                        Xóa
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {users.length === 0 && <div className="text-center py-10 text-gray-500">Không có người dùng</div>}
        </div>
      )}
    </div>
  );
}
