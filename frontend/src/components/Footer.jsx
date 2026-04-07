export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-white border-t border-gray-200 mt-auto">
      <div className="container-max py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* About */}
          <div className="md:col-span-2">
            <div className="flex items-center gap-2 mb-4">
              <img src="/logo.png" alt="eLibConnect" className="h-10 w-auto" />
            </div>
            <p className="text-gray-600 text-sm leading-relaxed max-w-md">
              Nền tảng quản lý thư viện hiện đại, giúp độc giả dễ dàng tìm kiếm
              và mượn sách yêu thích. Kết nối tri thức, lan tỏa văn hóa đọc.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-semibold text-gray-900 mb-4">Liên kết</h4>
            <ul className="space-y-2 text-sm">
              <li><a href="/" className="link-muted">Trang chủ</a></li>
              <li><a href="/book" className="link-muted">Danh sách sách</a></li>
              <li><a href="/dashboard" className="link-muted">Tài khoản</a></li>
              <li><a href="#" className="link-muted">Về chúng tôi</a></li>
            </ul>
          </div>

          {/* Help */}
          <div>
            <h4 className="font-semibold text-gray-900 mb-4">Hỗ trợ</h4>
            <ul className="space-y-2 text-sm">
              <li><a href="#" className="link-muted">Câu hỏi thường gặp</a></li>
              <li><a href="#" className="link-muted">Hướng dẫn sử dụng</a></li>
              <li><a href="#" className="link-muted">Chính sách bảo mật</a></li>
              <li><a href="#" className="link-muted">Điều khoản dịch vụ</a></li>
            </ul>
          </div>
        </div>

        {/* Bottom */}
        <div className="border-t border-gray-200 pt-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-sm text-gray-500">
              © {currentYear} eLibConnect. Tất cả quyền được bảo lưu.
            </p>
            <div className="flex gap-6">
              <a href="#" className="text-gray-500 hover:text-gray-900 transition-colors text-sm">
                Facebook
              </a>
              <a href="#" className="text-gray-500 hover:text-gray-900 transition-colors text-sm">
                Twitter
              </a>
              <a href="#" className="text-gray-500 hover:text-gray-900 transition-colors text-sm">
                Instagram
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
