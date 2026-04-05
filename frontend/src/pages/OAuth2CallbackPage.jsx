import { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAuthStore } from "../store/index";

export default function OAuth2CallbackPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { initAuth } = useAuthStore();

  useEffect(() => {
    const token = searchParams.get("token");
    const refreshToken = searchParams.get("refreshToken");
    const error = searchParams.get("error");

    if (error) {
      navigate("/login", { replace: true, state: { oauthError: error } });
      return;
    }

    if (token) {
      localStorage.setItem("accessToken", token);
      if (refreshToken) localStorage.setItem("refreshToken", refreshToken);
      // Re-init auth to fetch user data from server
      initAuth().then(() => {
        navigate("/profile", { replace: true });
      });
    } else {
      navigate("/login", { replace: true });
    }
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <div className="animate-spin w-10 h-10 border-4 border-primary-600 border-t-transparent rounded-full mx-auto mb-4"></div>
        <p className="text-gray-600">Đang xử lý đăng nhập...</p>
      </div>
    </div>
  );
}
