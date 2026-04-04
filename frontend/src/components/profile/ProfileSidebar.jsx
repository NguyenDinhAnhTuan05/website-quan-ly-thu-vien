import { Link } from "react-router-dom";

export default function ProfileSidebar({ user }) {
  return (
    <div className="sticky top-24">
      <div className="relative">
        {/* Decorative Elements */}
        <div className="absolute -top-4 -left-4 w-24 h-24 bg-primary-200 rounded-full opacity-20 blur-2xl"></div>
        <div className="absolute -bottom-4 -right-4 w-32 h-32 bg-accent-200 rounded-full opacity-20 blur-2xl"></div>

        <div className="relative bg-white rounded-3xl p-8 shadow-lg border-2 border-gray-100">
          {/* Avatar Section */}
          <div className="flex flex-col items-center mb-6">
            <div className="relative mb-4">
              <div className="absolute inset-0 rounded-full bg-gradient-to-r from-primary-500 via-accent-500 to-primary-500 animate-spin" style={{ animationDuration: "3s" }}></div>
              <div className="relative w-32 h-32 rounded-full bg-white p-1.5">
                <div className="w-full h-full rounded-full bg-gradient-to-br from-primary-100 to-accent-100 flex items-center justify-center overflow-hidden">
                  {user?.avatarUrl ? (
                    <img src={user.avatarUrl} className="w-full h-full rounded-full object-cover" alt="avatar" />
                  ) : (
                    <span className="text-5xl font-black bg-gradient-to-br from-primary-600 to-accent-600 bg-clip-text text-transparent">
                      {user?.username?.[0]?.toUpperCase() || "?"}
                    </span>
                  )}
                </div>
              </div>
            </div>

            <h2 className="text-2xl font-black text-gray-900 mb-1">{user?.username || "—"}</h2>
            <p className="text-sm text-gray-500 mb-4">{user?.email}</p>

            {/* Status Badges */}
            <div className="flex flex-col gap-2 w-full">
              <div className="flex items-center justify-between px-4 py-2 bg-gradient-to-r from-primary-50 to-primary-100 rounded-xl border border-primary-200">
                <span className="text-xs font-bold text-primary-700">ROLE</span>
                <span className="text-xs font-black text-primary-900">{user?.role?.replace("ROLE_", "")}</span>
              </div>

              <div className={`flex items-center justify-between px-4 py-2 rounded-xl border ${
                user?.membershipTier === "PREMIUM"
                  ? "bg-gradient-to-r from-amber-50 to-amber-100 border-amber-200"
                  : "bg-gradient-to-r from-gray-50 to-gray-100 border-gray-200"
              }`}>
                <span className={`text-xs font-bold ${user?.membershipTier === "PREMIUM" ? "text-amber-700" : "text-gray-700"}`}>TIER</span>
                <span className={`text-xs font-black ${user?.membershipTier === "PREMIUM" ? "text-amber-900" : "text-gray-900"}`}>
                  {user?.membershipTier === "PREMIUM" ? "⭐ PREMIUM" : "BASIC"}
                </span>
              </div>

              <div className="flex items-center justify-between px-4 py-2 bg-gradient-to-r from-accent-50 to-accent-100 rounded-xl border border-accent-200">
                <span className="text-xs font-bold text-accent-700">POINTS</span>
                <span className="text-xs font-black text-accent-900">{user?.points ?? 0} pts</span>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="space-y-3 pt-6 border-t-2 border-gray-100">
            <Link
              to="/dashboard"
              className="flex items-center justify-between px-4 py-3 bg-gray-50 hover:bg-gray-100 rounded-xl transition-all group"
            >
              <span className="text-sm font-bold text-gray-700">Lịch sử mượn</span>
              <svg className="w-5 h-5 text-gray-400 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>

            <Link
              to="/subscription"
              className="flex items-center justify-between px-4 py-3 bg-gradient-to-r from-primary-500 to-accent-500 hover:from-primary-600 hover:to-accent-600 rounded-xl transition-all group shadow-md"
            >
              <span className="text-sm font-bold text-white">Nâng cấp gói</span>
              <svg className="w-5 h-5 text-white group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
