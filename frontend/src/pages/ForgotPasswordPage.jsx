import { Link } from "react-router-dom";
import { useState } from "react";
import authApi from "../api/authApi";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email) {
      setError("Vui lòng nhập email");
      return;
    }
    setIsLoading(true);
    setError("");
    try {
      const res = await authApi.forgotPassword({ email });
      setMessage(res.message || "Nếu email tồn tại, chúng tôi đã gửi link reset mật khẩu.");
    } catch (err) {
      setError(err.response?.data?.message || "Có lỗi xảy ra. Vui lòng thử lại.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center py-12 px-4 bg-gray-50">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex w-16 h-16 bg-gradient-to-br from-primary-600 to-primary-700 rounded-2xl items-center justify-center shadow-lg mb-4">
            <span className="text-white text-2xl">🔑</span>
          </div>
          <h1 className="heading-2 mb-2">Quên mật khẩu</h1>
          <p className="body text-gray-600">Nhập email để nhận link đặt lại mật khẩu</p>
        </div>

        <div className="card p-8">
          {message ? (
            <div className="text-center">
              <div className="bg-success-50 border border-success-200 rounded-lg p-4 text-sm text-success-700 mb-6">
                {message}
              </div>
              <Link to="/login" className="btn-primary w-full">
                Quay lại đăng nhập
              </Link>
            </div>
          ) : (
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
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your@email.com"
                  className="input"
                />
              </div>

              <button type="submit" disabled={isLoading} className="btn-primary w-full">
                {isLoading ? "Đang gửi..." : "Gửi link đặt lại mật khẩu"}
              </button>

              <Link to="/login" className="block text-center text-sm link">
                ← Quay lại đăng nhập
              </Link>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
