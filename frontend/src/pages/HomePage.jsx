import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import BookCard from "../components/BookCard";
import Toast from "../components/ui/Toast";
import SectionHeader from "../components/ui/SectionHeader";
import FeatureCard from "../components/ui/FeatureCard";
import { BookCardSkeleton } from "../components/ui/LoadingSkeleton";
import bookApi from "../api/bookApi";
import borrowApi from "../api/borrowApi";
import { useAuthStore } from "../store/index";
import useToast from "../hooks/useToast";

export default function HomePage() {
  const [featuredBooks, setFeaturedBooks] = useState([]);
  const [popularBooks, setPopularBooks] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast, showToast } = useToast();
  const { isAuthenticated } = useAuthStore();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const [newest, popular] = await Promise.all([
          bookApi.getBooks({ page: 0, size: 4, sortBy: "createdAt", sortDir: "desc", available: true }),
          bookApi.getPopularBooks(4),
        ]);
        if (newest?.content) setFeaturedBooks(newest.content);
        if (Array.isArray(popular)) setPopularBooks(popular.slice(0, 4));
      } catch {
        // Error handled silently
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleBorrow = async (bookId) => {
    if (!isAuthenticated) {
      navigate("/login", { state: { from: { pathname: "/" } } });
      return;
    }
    try {
      await borrowApi.createBorrow({ bookIds: [bookId] });
      showToast("Tạo phiếu mượn thành công! Chờ thủ thư duyệt.");
    } catch (err) {
      showToast(err.response?.data?.message || "Không thể mượn sách.", "error");
    }
  };

  return (
    <div className="min-h-screen">
      <Toast message={toast?.msg} type={toast?.type} />

      <section className="relative overflow-hidden bg-gradient-to-br from-primary-600 via-primary-700 to-accent-600">
        {/* Animated Background Elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-20 left-10 w-72 h-72 bg-primary-400/30 rounded-full blur-3xl animate-float"></div>
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-accent-400/30 rounded-full blur-3xl animate-float" style={{animationDelay: '2s'}}></div>
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary-500/20 rounded-full blur-3xl animate-pulse"></div>
        </div>

        <div className="container-max relative py-24 md:py-40">
          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full px-5 py-2.5 mb-8 shadow-lg animate-slide-down">
              <span className="w-2.5 h-2.5 bg-accent-400 rounded-full animate-pulse shadow-lg shadow-accent-400/50"></span>
              <span className="text-sm text-white font-medium">Nền tảng thư viện số hiện đại</span>
            </div>
            
            <h1 className="text-5xl md:text-7xl font-bold text-white mb-8 text-balance leading-tight animate-slide-up">
              Khám phá thế giới
              <span className="block bg-gradient-to-r from-accent-300 via-accent-200 to-accent-300 bg-clip-text text-transparent mt-2 animate-gradient bg-[length:200%_auto]">
                tri thức vô tận
              </span>
            </h1>
            
            <p className="text-xl md:text-2xl text-primary-100 mb-12 text-balance max-w-3xl mx-auto leading-relaxed animate-fade-in">
              Hàng ngàn đầu sách từ các tác giả nổi tiếng. Mượn sách dễ dàng, 
              đọc thoải mái và chia sẻ những tác phẩm hay cùng cộng đồng.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-5 justify-center animate-scale-in">
              <Link to="/book" className="group relative inline-flex items-center justify-center gap-2 px-8 py-4 bg-white text-primary-600 font-bold text-lg rounded-xl shadow-2xl hover:shadow-accent-400/50 hover:scale-105 transition-all duration-300 overflow-hidden">
                <span className="relative z-10">Khám phá ngay</span>
                <svg className="w-5 h-5 relative z-10 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
                <div className="absolute inset-0 bg-gradient-to-r from-accent-400 to-accent-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              </Link>
              {!isAuthenticated && (
                <Link to="/register" className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-white/10 backdrop-blur-sm text-white font-bold text-lg rounded-xl border-2 border-white/30 hover:bg-white/20 hover:border-white/50 hover:scale-105 transition-all duration-300 shadow-xl">
                  Đăng ký miễn phí
                </Link>
              )}
            </div>
          </div>
        </div>

        {/* Wave Divider */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg className="w-full h-16 md:h-24 text-white" preserveAspectRatio="none" viewBox="0 0 1200 120" fill="currentColor">
            <path d="M321.39,56.44c58-10.79,114.16-30.13,172-41.86,82.39-16.72,168.19-17.73,250.45-.39C823.78,31,906.67,72,985.66,92.83c70.05,18.48,146.53,26.09,214.34,3V0H0V27.35A600.21,600.21,0,0,0,321.39,56.44Z"></path>
          </svg>
        </div>
      </section>

      <section className="section bg-white">
        <div className="container-max">
          <SectionHeader
            badge={{ text: "Mới cập nhật", className: "bg-gradient-to-r from-primary-100 to-accent-100 text-primary-700 border-primary-200" }}
            badgeIcon="🆕"
            title={{ text: "Sách mới nhất", gradient: "from-primary-600 to-accent-600" }}
            description="Những cuốn sách vừa được thêm vào thư viện"
            linkTo="/book"
            linkText="Xem tất cả"
          />

          {isLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {[...Array(4)].map((_, i) => (
                <BookCardSkeleton key={i} />
              ))}
            </div>
          ) : featuredBooks.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {featuredBooks.map((book) => (
                <BookCard key={book.id} book={book} onBorrow={() => handleBorrow(book.id)} />
              ))}
            </div>
          ) : (
            <div className="text-center py-16">
              <p className="text-gray-500">Chưa có sách nào.</p>
            </div>
          )}
        </div>
      </section>

      {popularBooks.length > 0 && (
        <section className="section bg-gradient-to-br from-primary-50/50 via-white to-accent-50/50">
          <div className="container-max">
            <SectionHeader
              badge={{ text: "Thịnh hành", className: "bg-gradient-to-r from-accent-100 to-primary-100 text-accent-700 border-accent-200" }}
              badgeIcon="🔥"
              title={{ text: "Sách phổ biến", gradient: "from-accent-600 to-primary-600" }}
              description="Được độc giả yêu thích và mượn nhiều nhất"
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {popularBooks.map((book) => (
                <BookCard key={book.id} book={book} onBorrow={() => handleBorrow(book.id)} />
              ))}
            </div>
          </div>
        </section>
      )}

      {!isAuthenticated && (
        <section className="section bg-gradient-to-br from-gray-50 to-white">
          <div className="container-max">
            <div className="relative bg-gradient-to-br from-primary-600 via-primary-700 to-accent-600 rounded-3xl p-12 md:p-20 text-white overflow-hidden shadow-2xl">
              {/* Animated Background */}
              <div className="absolute inset-0 overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-accent-400/30 rounded-full blur-3xl animate-float"></div>
                <div className="absolute bottom-0 left-0 w-80 h-80 bg-primary-400/30 rounded-full blur-3xl animate-float" style={{animationDelay: '1.5s'}}></div>
              </div>

              <div className="relative max-w-3xl mx-auto text-center">
                <h3 className="text-4xl md:text-5xl font-bold mb-6 leading-tight">
                  Bắt đầu hành trình đọc sách của bạn
                </h3>
                <p className="text-primary-100 mb-10 text-xl leading-relaxed">
                  Đăng ký miễn phí để mượn sách, viết đánh giá và kết nối với cộng đồng yêu sách.
                </p>
                <Link to="/register" className="group inline-flex items-center gap-3 bg-white text-primary-600 font-bold text-lg py-4 px-10 rounded-xl hover:bg-accent-50 transition-all shadow-2xl hover:shadow-accent-400/50 hover:scale-105">
                  <span>Đăng ký ngay</span>
                  <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </Link>
              </div>
            </div>
          </div>
        </section>
      )}

      <section className="section bg-gradient-to-br from-gray-50 via-white to-primary-50/30">
        <div className="container-max">
          <div className="text-center mb-16">
            <div className="inline-block mb-4">
              <span className="inline-flex items-center gap-2 bg-gradient-to-r from-primary-600 to-accent-600 text-white px-4 py-2 rounded-full text-sm font-semibold shadow-lg">
                ✨ Ưu điểm nổi bật
              </span>
            </div>
            <h2 className="heading-2 mb-4">Tại sao chọn chúng tôi?</h2>
            <p className="body-large">Trải nghiệm đọc sách hiện đại và tiện lợi</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <FeatureCard
              title="Nhanh & Dễ dàng"
              description="Mượn sách chỉ với vài cú nhấp chuột. Giao diện đơn giản, trực quan và thân thiện."
              icon="⚡"
              gradient="from-primary-500 to-primary-600"
            />
            <FeatureCard
              title="Kho sách phong phú"
              description="Hàng nghìn cuốn sách từ nhiều thể loại: văn học, khoa học, kỹ năng sống và nhiều hơn nữa."
              icon="📚"
              gradient="from-accent-500 to-accent-600"
            />
            <FeatureCard
              title="Cộng đồng tích cực"
              description="Kết nối với độc giả khác, chia sẻ đánh giá và khám phá những cuốn sách hay."
              icon="🤝"
              gradient="from-primary-600 to-accent-600"
            />
          </div>
        </div>
      </section>
    </div>
  );
}
