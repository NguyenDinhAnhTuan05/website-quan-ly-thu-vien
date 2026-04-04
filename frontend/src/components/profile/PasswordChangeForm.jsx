export default function PasswordChangeForm({
  currentPassword,
  setCurrentPassword,
  newPassword,
  setNewPassword,
  confirmPassword,
  setConfirmPassword,
  loadingPwd,
  onSubmit,
}) {
  return (
    <div className="bg-white rounded-3xl p-8 shadow-lg border-2 border-gray-100">
      <div className="flex items-center gap-3 mb-8">
        <div className="w-12 h-12 bg-gray-900 rounded-2xl flex items-center justify-center">
          <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
        </div>
        <div>
          <h3 className="text-xl font-black text-gray-900">Đổi mật khẩu</h3>
          <p className="text-sm text-gray-500">Cập nhật mật khẩu để bảo mật tài khoản</p>
        </div>
      </div>

      {/* Warning */}
      <div className="mb-6 p-4 bg-amber-50 border-2 border-amber-200 rounded-xl">
        <div className="flex gap-3">
          <svg className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <div>
            <p className="text-sm font-bold text-amber-900">Lưu ý</p>
            <p className="text-xs text-amber-700 mt-1">Tài khoản đăng nhập bằng Google không hỗ trợ đổi mật khẩu</p>
          </div>
        </div>
      </div>

      <form onSubmit={onSubmit} className="space-y-6">
        <div>
          <label className="block text-xs font-black text-gray-700 uppercase tracking-wider mb-2">
            Mật khẩu hiện tại <span className="text-danger-500">*</span>
          </label>
          <input
            type="password"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            className="w-full px-4 py-3 bg-white rounded-xl border-2 border-gray-200 focus:border-gray-900 focus:ring-4 focus:ring-gray-100 transition-all font-medium"
            placeholder="••••••••"
            required
          />
        </div>

        <div>
          <label className="block text-xs font-black text-gray-700 uppercase tracking-wider mb-2">
            Mật khẩu mới <span className="text-danger-500">*</span>
          </label>
          <input
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            className="w-full px-4 py-3 bg-white rounded-xl border-2 border-gray-200 focus:border-gray-900 focus:ring-4 focus:ring-gray-100 transition-all font-medium"
            placeholder="••••••••"
            minLength={6}
            required
          />
        </div>

        <div>
          <label className="block text-xs font-black text-gray-700 uppercase tracking-wider mb-2">
            Xác nhận mật khẩu <span className="text-danger-500">*</span>
          </label>
          <input
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className={`w-full px-4 py-3 rounded-xl border-2 transition-all font-medium ${
              confirmPassword && newPassword !== confirmPassword
                ? "border-danger-400 focus:ring-danger-100"
                : "border-gray-200 focus:border-gray-900 focus:ring-gray-100"
            } focus:ring-4`}
            placeholder="••••••••"
            required
          />
          {confirmPassword && newPassword !== confirmPassword && (
            <p className="text-sm text-danger-500 mt-2 font-medium">Mật khẩu xác nhận không khớp</p>
          )}
        </div>

        <div className="flex justify-end pt-4">
          <button
            type="submit"
            disabled={loadingPwd || (confirmPassword && newPassword !== confirmPassword)}
            className="px-8 py-3 bg-gray-900 text-white font-bold rounded-xl hover:bg-gray-800 disabled:opacity-50 transition-all shadow-lg hover:shadow-xl"
          >
            {loadingPwd ? (
              <span className="flex items-center gap-2">
                <span className="spinner w-4 h-4 border-white"></span>
                Đang xử lý...
              </span>
            ) : (
              "Đổi mật khẩu"
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
