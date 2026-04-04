import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../store/index";
import Toast from "../components/ui/Toast";
import { LoadingSpinner } from "../components/ui/LoadingSkeleton";
import useToast from "../hooks/useToast";
import borrowApi from "../api/borrowApi";
import DashboardHero from "../components/dashboard/DashboardHero";
import BorrowCard from "../components/dashboard/BorrowCard";

export default function UserDashboardPage() {
  const navigate = useNavigate();
  const { user, logout, isAuthenticated } = useAuthStore();
  const { toast, showToast } = useToast(3000);
  const [activeTab, setActiveTab] = useState("all");
  const [borrows, setBorrows] = useState([]);
  const [totalBorrows, setTotalBorrows] = useState(0);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/login");
      return;
    }
    fetchBorrows();
  }, [isAuthenticated]);

  const fetchBorrows = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await borrowApi.getMyHistory({ page: 0, size: 50, sort: "borrowDate,desc" });
      if (res && res.content) {
        setBorrows(res.content);
        setTotalBorrows(res.totalElements || res.content.length);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const handleCancel = async (id) => {
    if (!window.confirm("Bạn có chắc muốn hủy phiếu mượn này?")) return;
    try {
      await borrowApi.cancelBorrow(id);
      showToast("Đã hủy phiếu mượn.");
      fetchBorrows();
    } catch (err) {
      showToast(err.response?.data?.message || "Không thể hủy phiếu.", "error");
    }
  };

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  const activeBorrows = borrows.filter((b) => ["BORROWING", "OVERDUE"].includes(b.status));
  const returnedBorrows = borrows.filter((b) => b.status === "RETURNED");
  const overdueCount = borrows.filter((b) => b.status === "OVERDUE").length;

  const displayBorrows =
    activeTab === "active"
      ? borrows.filter((b) => ["PENDING", "BORROWING", "OVERDUE"].includes(b.status))
      : activeTab === "history"
      ? borrows.filter((b) => ["RETURNED", "CANCELLED", "REJECTED"].includes(b.status))
      : borrows;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-primary-50/30 to-accent-50/30 py-8">
      <Toast message={toast?.msg} type={toast?.type} />

      <div className="container-max px-4">
        <DashboardHero user={user} onLogout={handleLogout} />

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {[
            { icon: "📚", value: totalBorrows, label: "Tổng phiếu", color: "primary" },
            { icon: "📖", value: activeBorrows.length, label: "Đang mượn", color: "blue" },
            { icon: "✅", value: returnedBorrows.length, label: "Đã trả", color: "success" },
            { icon: "⚠️", value: overdueCount, label: "Quá hạn", color: "danger" },
          ].map((stat) => (
            <div key={stat.label} className="group relative">
              <div className={`absolute inset-0 bg-gradient-to-br from-${stat.color}-500/20 to-${stat.color}-600/20 rounded-2xl blur-xl group-hover:blur-2xl transition-all opacity-0 group-hover:opacity-100`}></div>
              <div className="relative bg-white rounded-2xl p-6 text-center shadow-lg hover:shadow-xl transition-all border border-gray-100">
                <div className="text-4xl mb-2">{stat.icon}</div>
                <p className={`text-3xl font-bold text-${stat.color}-600 mb-1`}>{stat.value}</p>
                <p className="text-sm text-gray-600 font-medium">{stat.label}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6 bg-white rounded-2xl p-2 shadow-md">
          {[
            { id: "all", label: "Tất cả", icon: "📋" },
            { id: "active", label: "Đang mượn", icon: "📖" },
            { id: "history", label: "Lịch sử", icon: "📜" },
          ].map(({ id, label, icon }) => (
            <button
              key={id}
              onClick={() => setActiveTab(id)}
              className={`flex-1 flex items-center justify-center gap-2 px-5 py-3 font-semibold text-sm rounded-xl transition-all ${
                activeTab === id
                  ? "bg-gradient-to-r from-primary-600 to-accent-600 text-white shadow-lg"
                  : "text-gray-600 hover:bg-gray-50"
              }`}
            >
              <span>{icon}</span>
              <span className="hidden sm:inline">{label}</span>
            </button>
          ))}
        </div>

        {/* Content */}
        {isLoading ? (
          <LoadingSpinner />
        ) : displayBorrows.length > 0 ? (
          <div className="space-y-4">
            {displayBorrows.map((borrow) => (
              <BorrowCard key={borrow.id} borrow={borrow} onCancel={handleCancel} />
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-2xl p-12 text-center shadow-lg">
            <div className="text-6xl mb-4">📭</div>
            <h3 className="text-xl font-bold text-gray-800 mb-2">Chưa có phiếu mượn</h3>
            <p className="text-gray-500 mb-6">Hãy bắt đầu khám phá và mượn sách!</p>
            <a href="/book" className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-primary-600 to-accent-600 text-white rounded-xl font-semibold hover:shadow-lg transition-all">
              📚 Khám phá sách
            </a>
          </div>
        )}
      </div>
    </div>
  );
}
