import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../store/index";
import Toast from "../components/ui/Toast";
import { LoadingSpinner } from "../components/ui/LoadingSkeleton";
import useToast from "../hooks/useToast";
import borrowApi from "../api/borrowApi";
import DashboardHero from "../components/dashboard/DashboardHero";
import BorrowCard from "../components/dashboard/BorrowCard";
import PointsDashboard from "../components/dashboard/PointsDashboard";
import MissionList from "../components/dashboard/MissionList";
import RewardShop from "../components/dashboard/RewardShop";
import Leaderboard from "../components/dashboard/Leaderboard";

export default function UserDashboardPage() {
  const navigate = useNavigate();
  const { user, logout, isAuthenticated } = useAuthStore();
  const { toast, showToast } = useToast(3000);
  const [activeTab, setActiveTab] = useState("active");
  const [borrows, setBorrows] = useState([]);
  const [totalBorrows, setTotalBorrows] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [pointsKey, setPointsKey] = useState(0);

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
        setTotalBorrows(res.page?.totalElements ?? res.totalElements ?? res.content.length);
      }
    } catch {
      // Error handled silently
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

  const handleReturn = async (id) => {
    if (!window.confirm("Bạn có chắc muốn trả sách?")) return;
    try {
      await borrowApi.userReturnBorrow(id);
      showToast("Đã trả sách thành công!");
      fetchBorrows();
    } catch (err) {
      showToast(err.response?.data?.message || "Không thể trả sách.", "error");
    }
  };

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  const activeBorrows = borrows.filter((b) => ["PENDING", "BORROWING", "OVERDUE"].includes(b.status));
  const returnedBorrows = borrows.filter((b) => b.status === "RETURNED");
  const overdueCount = borrows.filter((b) => b.status === "OVERDUE").length;

  const displayBorrows =
    activeTab === "active"
      ? activeBorrows
      : activeTab === "history"
      ? borrows.filter((b) => ["RETURNED", "CANCELLED", "REJECTED"].includes(b.status))
      : borrows;

  return (
    <div className="min-h-screen bg-gray-50/50 py-8">
      <Toast message={toast?.msg} type={toast?.type} />

      <div className="container-max px-4">
        <DashboardHero user={user} onLogout={handleLogout} />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content (2/3 width on LG) */}
          <div className="lg:col-span-2 space-y-6">
            {/* Stats Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {[
                { icon: "📚", value: totalBorrows, label: "Tổng phiếu", color: "indigo" },
                { icon: "📖", value: activeBorrows.length, label: "Đang mượn", color: "blue" },
                { icon: "✅", value: returnedBorrows.length, label: "Đã trả", color: "emerald" },
                { icon: "⚠️", value: overdueCount, label: "Quá hạn", color: "rose" },
              ].map((stat) => (
                <div key={stat.label} className="bg-white rounded-2xl p-4 text-center shadow-sm border border-gray-100 transition-all hover:shadow-md">
                  <div className="text-2xl mb-2">{stat.icon}</div>
                  <p className="text-2xl font-bold text-gray-900 mb-0.5">{stat.value}</p>
                  <p className="text-xs text-gray-500 font-semibold uppercase tracking-wider">{stat.label}</p>
                </div>
              ))}
            </div>

            {/* Tabs */}
            <div className="flex gap-1 bg-white rounded-2xl p-1.5 shadow-sm border border-gray-100">
              {[
                { id: "active", label: "Đang mượn", icon: "📖" },
                { id: "history", label: "Lịch sử", icon: "📜" },
                { id: "all", label: "Tất cả", icon: "📋" },
              ].map(({ id, label, icon }) => (
                <button
                  key={id}
                  onClick={() => setActiveTab(id)}
                  className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 font-bold text-sm rounded-xl transition-all ${
                    activeTab === id
                      ? "bg-indigo-600 text-white shadow-md shadow-indigo-200"
                      : "text-gray-500 hover:bg-gray-50"
                  }`}
                >
                  <span>{icon}</span>
                  <span className="hidden sm:inline">{label}</span>
                </button>
              ))}
            </div>

            {/* Content List */}
            {isLoading ? (
              <LoadingSpinner />
            ) : displayBorrows.length > 0 ? (
              <div className="space-y-4">
                {displayBorrows.map((borrow) => (
                  <BorrowCard key={borrow.id} borrow={borrow} onCancel={handleCancel} onReturn={handleReturn} />
                ))}
              </div>
            ) : (
              <div className="bg-white rounded-3xl p-16 text-center border-2 border-dashed border-gray-200">
                <div className="text-6xl mb-6">📭</div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Chưa có dữ liệu</h3>
                <p className="text-gray-500 mb-8 max-w-xs mx-auto text-sm leading-relaxed">
                  Hãy bắt đầu khám phá kho tàng kiến thức của thư viện ngay hôm nay!
                </p>
                <a href="/book" className="inline-flex items-center gap-2 px-8 py-3.5 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100">
                  📚 Khám phá sách ngay
                </a>
              </div>
            )}
          </div>

          {/* Sidebar Content (1/3 width on LG) */}
          <div className="space-y-6">
            <PointsDashboard key={pointsKey} />
            <RewardShop onPointsChanged={() => setPointsKey(k => k + 1)} />
            <MissionList />
            <Leaderboard />
          </div>
        </div>
      </div>
    </div>
  );
}
