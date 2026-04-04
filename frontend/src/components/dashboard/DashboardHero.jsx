import { Link } from "react-router-dom";

export default function DashboardHero({ user, onLogout }) {
  return (
    <div className="relative overflow-hidden bg-gradient-to-br from-primary-600 via-primary-700 to-accent-600 rounded-3xl p-8 md:p-12 mb-8 shadow-2xl">
      {/* Animated Background */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-accent-400/30 rounded-full blur-3xl animate-float"></div>
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-primary-400/30 rounded-full blur-3xl animate-float" style={{ animationDelay: "2s" }}></div>
      </div>

      <div className="relative flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div className="flex items-center gap-5">
          {/* Avatar with Glow */}
          <div className="relative group">
            <div className="absolute inset-0 bg-gradient-to-r from-accent-400 to-primary-400 rounded-full blur-xl opacity-50 group-hover:opacity-75 transition-opacity"></div>
            <div className="relative w-20 h-20 rounded-full bg-white p-1 shadow-2xl">
              <div className="w-full h-full rounded-full bg-gradient-to-br from-primary-100 to-accent-100 flex items-center justify-center overflow-hidden">
                {user?.avatarUrl ? (
                  <img src={user.avatarUrl} className="w-full h-full rounded-full object-cover" alt="" />
                ) : (
                  <span className="text-primary-600 text-3xl font-bold">{user?.username?.[0]?.toUpperCase()}</span>
                )}
              </div>
            </div>
          </div>

          {/* User Info */}
          <div className="text-white">
            <h1 className="text-3xl md:text-4xl font-bold mb-2">{user?.username || "Người dùng"}</h1>
            <p className="text-primary-100 mb-3">{user?.email}</p>
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white/20 backdrop-blur-sm text-white rounded-lg text-sm font-semibold border border-white/30">
                {user?.role?.replace("ROLE_", "") || "USER"}
              </span>
              {user?.membershipTier === "PREMIUM" ? (
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-amber-500/90 text-white rounded-lg text-sm font-bold shadow-lg">
                  ⭐ PREMIUM
                </span>
              ) : (
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white/20 backdrop-blur-sm text-white rounded-lg text-sm font-semibold border border-white/30">
                  📚 BASIC
                </span>
              )}
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-amber-500/90 text-white rounded-lg text-sm font-bold shadow-lg">
                🏅 {user?.points ?? 0} điểm
              </span>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3">
          <Link to="/profile" className="px-6 py-3 bg-white text-primary-600 rounded-xl font-semibold hover:bg-primary-50 transition-all shadow-lg hover:shadow-xl">
            Hồ sơ
          </Link>
          <Link to="/subscription" className="px-6 py-3 bg-accent-500 text-white rounded-xl font-semibold hover:bg-accent-600 transition-all shadow-lg hover:shadow-xl">
            Nâng cấp
          </Link>
          <button onClick={onLogout} className="px-6 py-3 bg-white/20 backdrop-blur-sm text-white rounded-xl font-semibold hover:bg-white/30 transition-all border border-white/30">
            Đăng xuất
          </button>
        </div>
      </div>
    </div>
  );
}
