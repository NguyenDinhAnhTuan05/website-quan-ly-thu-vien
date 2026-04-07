import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../store/index";

export default function ForbiddenPage() {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuthStore();

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center px-4">
      {/* Card */}
      <div className="bg-white rounded-2xl shadow-lg border border-red-100 max-w-lg w-full p-10 text-center">
        {/* Icon */}
        <div className="flex items-center justify-center w-24 h-24 mx-auto mb-6 rounded-full bg-red-50 border-4 border-red-200">
          <svg className="w-12 h-12 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m0-10.036A11.959 11.959 0 0 1 3.598 6 11.99 11.99 0 0 0 3 9.75c0 5.592 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.57-.598-3.75h-.152c-3.196 0-6.1-1.25-8.25-3.286Zm0 13.036h.008v.008H12v-.008Z" />
          </svg>
        </div>

        {/* Status code */}
        <p className="text-8xl font-black text-red-500 leading-none mb-2">403</p>

        {/* Title */}
        <h1 className="text-2xl font-bold text-gray-800 mb-3">Truy cập bị từ chối</h1>

        {/* Description */}
        <p className="text-gray-500 mb-2">
          Bạn không có quyền truy cập vào trang này.
        </p>
        <p className="text-sm text-gray-400 mb-8">
          Khu vực này chỉ dành cho Quản trị viên của hệ thống. Hành động truy cập trái phép đã được ghi nhận.
        </p>

        {/* Divider */}
        <div className="border-t border-gray-100 mb-6" />

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <button
            onClick={() => navigate(-1)}
            className="btn-outline"
          >
            ← Quay lại
          </button>
          {isAuthenticated ? (
            <button
              onClick={() => navigate("/dashboard")}
              className="btn-primary"
            >
              Về trang cá nhân
            </button>
          ) : (
            <button
              onClick={() => navigate("/")}
              className="btn-primary"
            >
              Về trang chủ
            </button>
          )}
        </div>
      </div>

      {/* Footer note */}
      <p className="mt-6 text-xs text-gray-400">
        Nếu bạn cho rằng đây là nhầm lẫn, vui lòng liên hệ quản trị viên.
      </p>
    </div>
  );
}
