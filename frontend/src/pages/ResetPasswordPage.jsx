import { Link, useSearchParams, useNavigate } from "react-router-dom";
import { useState } from "react";
import authApi from "../api/authApi";

export default function ResetPasswordPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get("token");

  const [formData, setFormData] = useState({ newPassword: "", confirmPassword: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  if (!token) {
    return (
      <div className="min-h-screen flex items-center justify-center py-12 px-4 bg-gray-50">
        <div className="w-full max-w-md text-center">
          <div className="text-6xl mb-4">⚠️</div>
          <h1 className="heading-2 mb-2">Link không hợp lệ</h1>
          <p className="text-gray-600 mb-6">Link đặt lại mật khẩu không hợp lệ hoặc đã hết hạn.</p>
          <Link to="/forgot-password" className="btn-primary">
            Gửi lại link mới
          </Link>
        </div>
      </div>
    );
  }

  const validate = () => {
    if (!formData.newPassword) return "Vui lòng nhập mật khẩu mới";
    if (formData.newPassword.length < 8) return "Mật khẩu phải có ít nhất 8 ký tự";
    if (!/[A-Z]/.test(formData.newPassword)) return "Mật khẩu phải có ít nhất 1 chữ hoa";
    if (!/[a-z]/.test(formData.newPassword)) return "Mật khẩu phải có ít nhất 1 chữ thường";
    if (!/[0-9]/.test(formData.newPassword)) return "Mật khẩu phải có ít nhất 1 chữ số";
    if (!/[!@#$%^&*(),.?":{}|<>]/.test(formData.newPassword)) return "Mật khẩu phải có ít nhất 1 ký tự đặc biệt";
    if (formData.newPassword !== formData.confirmPassword) return "Mật khẩu xác nhận không khớp";
    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const err = validate();
    if (err) { setError(err); return; }

    setIsLoading(true);
    setError("");
    try {
      await authApi.resetPassword({ token, newPassword: formData.newPassword });
      setSuccess(true);
    } catch (err) {
      setError(err.response?.data?.message || "Link đã hết hạn hoặc không hợp lệ. Vui lòng gửi lại.");
    } finally {
      setIsLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center py-12 px-4 bg-gray-50">
        <div className="w-full max-w-md">
          <div className="card p-8 text-center">
            <div className="text-5xl mb-4">✅</div>
            <h1 className="heading-2 mb-2">Đặt lại mật khẩu thành công!</h1>
            <p className="text-gray-600 mb-6">Bạn có thể đăng nhập bằng mật khẩu mới.</p>
            <Link to="/login" className="btn-primary w-full">
              Đăng nhập ngay
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center py-12 px-4 bg-gray-50">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex w-16 h-16 bg-gradient-to-br from-primary-600 to-primary-700 rounded-2xl items-center justify-center shadow-lg mb-4">
            <span className="text-white text-2xl">🔒</span>
          </div>
          <h1 className="heading-2 mb-2">Đặt lại mật khẩu</h1>
          <p className="body text-gray-600">Nhập mật khẩu mới cho tài khoản của bạn</p>
        </div>

        <div className="card p-8">
          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <div className="bg-danger-50 border border-danger-200 rounded-lg p-4 text-sm text-danger-700">
                {error}
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-900 mb-2">Mật khẩu mới</label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={formData.newPassword}
                  onChange={(e) => setFormData((p) => ({ ...p, newPassword: e.target.value }))}
                  placeholder="••••••••"
                  className="input pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? "🙈" : "👁️"}
                </button>
              </div>
              <p className="text-xs text-gray-500 mt-1">Tối thiểu 8 ký tự, gồm chữ hoa, thường, số và ký tự đặc biệt</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-900 mb-2">Xác nhận mật khẩu</label>
              <input
                type={showPassword ? "text" : "password"}
                value={formData.confirmPassword}
                onChange={(e) => setFormData((p) => ({ ...p, confirmPassword: e.target.value }))}
                placeholder="••••••••"
                className="input"
              />
            </div>

            <button type="submit" disabled={isLoading} className="btn-primary w-full">
              {isLoading ? "Đang xử lý..." : "Đặt lại mật khẩu"}
            </button>

            <Link to="/login" className="block text-center text-sm link">
              ← Quay lại đăng nhập
            </Link>
          </form>
        </div>
      </div>
    </div>
  );
}
