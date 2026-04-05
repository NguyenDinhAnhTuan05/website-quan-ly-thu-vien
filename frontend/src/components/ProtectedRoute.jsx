import { Navigate, useLocation } from "react-router-dom";
import { useAuthStore } from "../store/index";

/**
 * Bảo vệ route: chỉ cho phép user đã đăng nhập (và đúng role) truy cập.
 * roles: mảng role được phép, ví dụ ["ROLE_ADMIN", "ROLE_SUPER_ADMIN"]
 *
 * Đợi server verify xong (isAuthVerified=true) trước khi kiểm tra role,
 * tránh dùng user data từ localStorage (có thể bị chỉnh sửa bởi user).
 */
export default function ProtectedRoute({ children, roles }) {
  const { isAuthenticated, user, isAuthVerified } = useAuthStore();
  const location = useLocation();

  // Đang verify user từ server → hiển thị loading
  if (!isAuthVerified) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (roles && roles.length > 0 && !roles.includes(user?.role)) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
}
