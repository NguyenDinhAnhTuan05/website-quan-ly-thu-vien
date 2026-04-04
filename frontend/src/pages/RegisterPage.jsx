import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import { useAuthStore } from "../store/index";

export default function RegisterPage() {
  const navigate = useNavigate();
  const { register, isLoading, error, clearError } = useAuthStore();
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
    agreeTerms: false,
  });
  const [showPwd, setShowPwd] = useState(false);
  const [localErrors, setLocalErrors] = useState({});

  const validate = () => {
    const e = {};
    if (!formData.username) e.username = "Username không được để trống";
    else if (formData.username.length < 3) e.username = "Username phải có ít nhất 3 ký tự";
    if (!formData.email) e.email = "Email không được để trống";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) e.email = "Email không hợp lệ";
    if (!formData.password) e.password = "Mật khẩu không được để trống";
    else if (formData.password.length < 6) e.password = "Mật khẩu phải có ít nhất 6 ký tự";
    if (formData.password !== formData.confirmPassword) e.confirmPassword = "Mật khẩu không khớp";
    if (!formData.agreeTerms) e.agreeTerms = "Bạn phải đồng ý với Điều khoản dịch vụ";
    setLocalErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    clearError();
    if (!validate()) return;
    try {
      await register(formData.username, formData.email, formData.password);
      navigate("/dashboard", { replace: true });
    } catch {}
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((p) => ({ ...p, [name]: type === "checkbox" ? checked : value }));
    if (localErrors[name]) setLocalErrors((p) => ({ ...p, [name]: "" }));
  };

  return (
    <div className="min-h-screen flex items-center justify-center py-12 px-4 bg-gray-50">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex w-16 h-16 bg-gradient-to-br from-primary-600 to-primary-700 rounded-2xl items-center justify-center shadow-lg mb-4">
            <span className="text-white text-2xl font-bold">L</span>
          </div>
          <h1 className="heading-2 mb-2">Đăng ký</h1>
          <p className="body text-gray-600">Tạo tài khoản để khám phá thế giới sách</p>
        </div>

        <div className="card p-8">
          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <div className="bg-danger-50 border border-danger-200 rounded-lg p-4 text-sm text-danger-700">
                {error}
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-900 mb-2">Username</label>
              <input
                type="text"
                name="username"
                value={formData.username}
                onChange={handleChange}
                placeholder="your_username"
                className={localErrors.username ? "input-error" : "input"}
              />
              {localErrors.username && <p className="text-sm text-danger-600 mt-1">{localErrors.username}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-900 mb-2">Email</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="your@email.com"
                className={localErrors.email ? "input-error" : "input"}
              />
              {localErrors.email && <p className="text-sm text-danger-600 mt-1">{localErrors.email}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-900 mb-2">Mật khẩu</label>
              <div className="relative">
                <input
                  type={showPwd ? "text" : "password"}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="••••••••"
                  className={localErrors.password ? "input-error pr-10" : "input pr-10"}
                />
                <button
                  type="button"
                  onClick={() => setShowPwd(!showPwd)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPwd ? "🙈" : "👁️"}
                </button>
              </div>
              {localErrors.password && <p className="text-sm text-danger-600 mt-1">{localErrors.password}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-900 mb-2">Xác nhận mật khẩu</label>
              <input
                type="password"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                placeholder="••••••••"
                className={localErrors.confirmPassword ? "input-error" : "input"}
              />
              {localErrors.confirmPassword && (
                <p className="text-sm text-danger-600 mt-1">{localErrors.confirmPassword}</p>
              )}
            </div>

            <div className="flex items-start gap-3">
              <input
                type="checkbox"
                name="agreeTerms"
                id="agreeTerms"
                checked={formData.agreeTerms}
                onChange={handleChange}
                className="mt-1 h-4 w-4 rounded border-gray-300"
              />
              <label htmlFor="agreeTerms" className="text-sm text-gray-600 cursor-pointer">
                Tôi đồng ý với <span className="link">điều khoản dịch vụ</span>
              </label>
            </div>
            {localErrors.agreeTerms && <p className="text-sm text-danger-600">{localErrors.agreeTerms}</p>}

            <button type="submit" disabled={isLoading} className="btn-primary w-full">
              {isLoading ? "Đang đăng ký..." : "Đăng ký"}
            </button>
          </form>
        </div>

        <p className="text-center text-gray-600 mt-6">
          Đã có tài khoản?{" "}
          <Link to="/login" className="link font-medium">
            Đăng nhập ngay
          </Link>
        </p>
      </div>
    </div>
  );
}
