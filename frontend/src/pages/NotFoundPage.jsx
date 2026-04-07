import { useNavigate } from "react-router-dom";

export default function NotFoundPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center px-4">
      {/* Card */}
      <div className="bg-white rounded-2xl shadow-lg border border-blue-100 max-w-lg w-full p-10 text-center">
        {/* Icon */}
        <div className="flex items-center justify-center w-24 h-24 mx-auto mb-6 rounded-full bg-blue-50 border-4 border-blue-200">
          <svg className="w-12 h-12 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
          </svg>
        </div>

        {/* Status code */}
        <p className="text-8xl font-black text-blue-400 leading-none mb-2">404</p>

        {/* Title */}
        <h1 className="text-2xl font-bold text-gray-800 mb-3">Trang không tồn tại</h1>

        {/* Description */}
        <p className="text-gray-500 mb-2">
          Đường dẫn bạn truy cập không tồn tại trong hệ thống.
        </p>
        <p className="text-sm text-gray-400 mb-8">
          Có thể trang đã bị xóa, đổi địa chỉ, hoặc bạn đã nhập sai URL.
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
          <button
            onClick={() => navigate("/")}
            className="btn-primary"
          >
            Về trang chủ
          </button>
        </div>
      </div>

      {/* Footer note */}
      <p className="mt-6 text-xs text-gray-400">
        Nếu bạn cho rằng đây là lỗi hệ thống, vui lòng liên hệ quản trị viên.
      </p>
    </div>
  );
}
