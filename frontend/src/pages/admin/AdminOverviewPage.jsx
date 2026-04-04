import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import adminApi from "../../api/adminApi";
import borrowApi from "../../api/borrowApi";

export default function AdminOverviewPage() {
  const navigate = useNavigate();
  const [stats, setStats] = useState({ books: 0, borrows: 0, users: 0, overdue: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    setLoading(true);
    try {
      const [bkRes, bRes, uRes, overdueRes] = await Promise.all([
        adminApi.getAllBooks({ page: 0, size: 1 }),
        borrowApi.getAllBorrows({ page: 0, size: 1 }),
        adminApi.getAllUsers({ page: 0, size: 1 }),
        borrowApi.getAllBorrows({ page: 0, size: 1, status: "OVERDUE" }),
      ]);
      setStats({
        books: bkRes.totalElements || 0,
        borrows: bRes.totalElements || 0,
        users: uRes.totalElements || 0,
        overdue: overdueRes.totalElements || 0,
      });
    } catch (err) {
      console.error("Error fetching stats:", err);
    } finally {
      setLoading(false);
    }
  };

  const statCards = [
    { label: "Tổng sách", value: stats.books, color: "primary", icon: "📚", gradient: "from-primary-500 to-primary-600" },
    { label: "Lượt mượn", value: stats.borrows, color: "blue", icon: "📖", gradient: "from-blue-500 to-blue-600" },
    { label: "Người dùng", value: stats.users, color: "green", icon: "👥", gradient: "from-green-500 to-green-600" },
    { label: "Quá hạn", value: stats.overdue, color: "red", icon: "⚠️", gradient: "from-red-500 to-red-600" },
  ];

  if (loading) {
    return (
      <div className="flex justify-center items-center py-20">
        <div className="spinner w-12 h-12"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat) => (
          <div key={stat.label} className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200 hover:shadow-md transition-all">
            <div className="flex items-center justify-between mb-4">
              <div className={`w-12 h-12 bg-gradient-to-br ${stat.gradient} rounded-xl flex items-center justify-center text-2xl shadow-lg`}>
                {stat.icon}
              </div>
            </div>
            <p className="text-3xl font-black text-gray-900 mb-1">{stat.value.toLocaleString()}</p>
            <p className="text-sm font-semibold text-gray-500 uppercase tracking-wide">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200">
        <h3 className="text-lg font-black text-gray-900 mb-4">Thao tác nhanh</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button 
            onClick={() => navigate('/admin/books')}
            className="flex items-center gap-3 p-4 bg-gray-50 hover:bg-gray-100 rounded-xl transition-all text-left"
          >
            <div className="w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center">
              <svg className="w-5 h-5 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
            </div>
            <div>
              <p className="font-bold text-gray-900">Thêm sách mới</p>
              <p className="text-xs text-gray-500">Thêm sách vào thư viện</p>
            </div>
          </button>

          <button 
            onClick={() => navigate('/admin/borrows')}
            className="flex items-center gap-3 p-4 bg-gray-50 hover:bg-gray-100 rounded-xl transition-all text-left"
          >
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
            <div>
              <p className="font-bold text-gray-900">Duyệt phiếu mượn</p>
              <p className="text-xs text-gray-500">Xử lý yêu cầu mượn sách</p>
            </div>
          </button>

          <button 
            onClick={() => navigate('/admin/users')}
            className="flex items-center gap-3 p-4 bg-gray-50 hover:bg-gray-100 rounded-xl transition-all text-left"
          >
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
              <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
              </svg>
            </div>
            <div>
              <p className="font-bold text-gray-900">Quản lý người dùng</p>
              <p className="text-xs text-gray-500">Xem và chỉnh sửa user</p>
            </div>
          </button>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200">
        <h3 className="text-lg font-black text-gray-900 mb-4">Hoạt động gần đây</h3>
        <div className="space-y-3">
          <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            <p className="text-sm text-gray-700">Hệ thống đang hoạt động bình thường</p>
          </div>
          <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
            <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
            <p className="text-sm text-gray-700">{stats.borrows} phiếu mượn đã được tạo</p>
          </div>
          <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
            <div className="w-2 h-2 bg-amber-500 rounded-full"></div>
            <p className="text-sm text-gray-700">{stats.overdue} phiếu mượn quá hạn cần xử lý</p>
          </div>
        </div>
      </div>
    </div>
  );
}
