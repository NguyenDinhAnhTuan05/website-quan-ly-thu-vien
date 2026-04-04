import { Link, useNavigate, useLocation } from "react-router-dom";
import { useState } from "react";
import { useAuthStore } from "../store/index";

export default function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || null;
  const { login, isLoading, error, clearError } = useAuthStore();
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [localErrors, setLocalErrors] = useState({});

  const validate = () => {
    const e = {};
    if (!formData.email) e.email = "Email không được để trống";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) e.email = "Email không hợp lệ";
    if (!formData.password) e.password = "Mật khẩu không được để trống";
    setLocalErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    clearError();
    if (!validate()) return;
    try {
      const res = await login(formData.email, formData.password);
      const role = res?.role || "";
      if (from) navigate(from, { replace: true });
      else if (role === "ROLE_ADMIN" || role === "ROLE_SUPER_ADMIN") navigate("/admin", { replace: true });
      else navigate("/dashboard", { replace: true });
    } catch {}
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((p) => ({ ...p, [name]: value }));
    if (localErrors[name]) setLocalErrors((p) => ({ ...p, [name]: "" }));
  };

  return (
    <div className="min-h-screen flex items-center justify-center py-12 px-4 bg-gray-50">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex w-16 h-16 bg-gradient-to-br from-primary-600 to-primary-700 rounded-2xl items-center justify-center shadow-lg mb-4">
            <span className="text-white text-2xl font-bold">L</span>
          </div>
          <h1 className="heading-2 mb-2">Đăng nhập</h1>
          <p className="body text-gray-600">Chào mừng bạn quay trở lại</p>
        </div>

        <div className="card p-8">
          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <div className="bg-danger-50 border border-danger-200 rounded-lg p-4 text-sm text-danger-700">
                {error}
              </div>
            )}

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
                  type={showPassword ? "text" : "password"}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="••••••••"
                  className={localErrors.password ? "input-error pr-10" : "input pr-10"}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? "🙈" : "👁️"}
                </button>
              </div>
              {localErrors.password && <p className="text-sm text-danger-600 mt-1">{localErrors.password}</p>}
            </div>

            <div className="text-right">
              <Link to="/forgot-password" className="text-sm link">
                Quên mật khẩu?
              </Link>
            </div>

            <button type="submit" disabled={isLoading} className="btn-primary w-full">
              {isLoading ? "Đang đăng nhập..." : "Đăng nhập"}
            </button>
          </form>
        </div>

        <p className="text-center text-gray-600 mt-6">
          Chưa có tài khoản?{" "}
          <Link to="/register" className="link font-medium">
            Đăng ký ngay
          </Link>
        </p>
      </div>
    </div>
  );
}
