import { Navigate, useLocation } from "react-router-dom";
import { useAuthStore } from "../store/index";

/**
 * Bảo vệ route: chỉ cho phép user đã đăng nhập (và đúng role) truy cập.
 * roles: mảng role được phép, ví dụ ["ROLE_ADMIN", "ROLE_SUPER_ADMIN"]
 */
export default function ProtectedRoute({ children, roles }) {
  const { isAuthenticated, user } = useAuthStore();
  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (roles && roles.length > 0 && !roles.includes(user?.role)) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
}
