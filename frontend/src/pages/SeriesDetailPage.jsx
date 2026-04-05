import { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import seriesApi from "../api/seriesApi";
import borrowApi from "../api/borrowApi";
import { useAuthStore } from "../store/index";
import { LoadingSpinner } from "../components/ui/LoadingSkeleton";
import Toast from "../components/ui/Toast";
import useToast from "../hooks/useToast";
import { getProxiedImageUrl, handleImageError } from "../utils/imageProxy";
import { ArrowLeft, Layers, BookOpen } from "lucide-react";

export default function SeriesDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [series, setSeries] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [borrowingId, setBorrowingId] = useState(null);
  const { toast, showToast } = useToast();
  const { isAuthenticated } = useAuthStore();

  useEffect(() => {
    const fetchSeries = async () => {
      setIsLoading(true);
      try {
        const res = await seriesApi.getSeriesById(id);
        setSeries(res);
      } catch {
        showToast("Không tìm thấy bộ sách.", "error");
      } finally {
        setIsLoading(false);
      }
    };
    fetchSeries();
  }, [id]);

  const handleBorrow = async (bookId) => {
    if (!isAuthenticated) {
      navigate("/login", { state: { from: { pathname: `/series/${id}` } } });
      return;
    }
    setBorrowingId(bookId);
    try {
      await borrowApi.createBorrow({ bookIds: [bookId] });
      showToast("Tạo phiếu mượn thành công! Chờ thủ thư duyệt.");
      // Refresh
      const res = await seriesApi.getSeriesById(id);
      setSeries(res);
    } catch (err) {
      showToast(err.response?.data?.message || "Tạo phiếu mượn thất bại.", "error");
    } finally {
      setBorrowingId(null);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen py-8">
        <div className="container-max px-4">
          <LoadingSpinner />
        </div>
      </div>
    );
  }

  if (!series) {
    return (
      <div className="min-h-screen py-8">
        <div className="container-max px-4 text-center py-20">
          <div className="text-6xl mb-4">😕</div>
          <h2 className="heading-2 mb-2">Không tìm thấy bộ sách</h2>
          <Link to="/categories" className="btn-primary mt-4 inline-block">
            Quay lại thể loại
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-8">
      <Toast message={toast?.msg} type={toast?.type} />

      <div className="container-max px-4">
        {/* Back Button */}
        <button
          onClick={() => navigate("/categories")}
          className="flex items-center gap-2 text-gray-600 hover:text-primary-600 transition-colors mb-6 font-medium"
        >
          <ArrowLeft className="w-5 h-5" />
          Quay lại thể loại
        </button>

        {/* Series Header */}
        <div className="relative mb-10 p-8 rounded-2xl bg-gradient-to-br from-primary-50 via-white to-accent-50 border border-primary-100">
          <div className="flex items-start gap-5">
            <div className="w-16 h-16 bg-gradient-to-br from-primary-500 to-accent-500 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-lg">
              <Layers className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="heading-1 mb-2">{series.name}</h1>
              {series.description && (
                <p className="text-gray-600 text-lg mb-3">{series.description}</p>
              )}
              <span className="inline-flex items-center px-3 py-1.5 rounded-full text-sm font-semibold bg-primary-100 text-primary-700">
                <BookOpen className="w-4 h-4 mr-1.5" />
                {series.bookCount} cuốn trong bộ
              </span>
            </div>
          </div>
        </div>

        {/* Book List */}
        {series.books && series.books.length > 0 ? (
          <div className="space-y-4">
            {series.books.map((book, index) => (
              <div
                key={book.id}
                className="group relative card bg-white/90 backdrop-blur-sm hover:shadow-xl transition-all duration-300 overflow-hidden"
              >
                <div className="flex flex-col sm:flex-row">
                  {/* Order Number */}
                  <div className="sm:w-16 flex-shrink-0 bg-gradient-to-b from-primary-500 to-accent-500 flex items-center justify-center p-4">
                    <span className="text-white text-xl font-bold">
                      {book.seriesOrder || index + 1}
                    </span>
                  </div>

                  {/* Book Cover */}
                  <div className="sm:w-32 flex-shrink-0 bg-gradient-to-br from-primary-100 to-accent-50">
                    <Link to={`/books/${book.id}`}>
                      <img
                        src={getProxiedImageUrl(book.coverUrl, book.isbn)}
                        alt={book.title}
                        className="w-full h-40 sm:h-full object-cover hover:scale-105 transition-transform duration-300"
                        onError={(e) => handleImageError(e, book.isbn, book.coverUrl)}
                      />
                    </Link>
                  </div>

                  {/* Book Info */}
                  <div className="flex-1 p-5 flex flex-col justify-between">
                    <div>
                      <Link
                        to={`/books/${book.id}`}
                        className="text-lg font-bold text-gray-900 hover:text-primary-600 transition-colors"
                      >
                        {book.title}
                      </Link>
                      {book.authorNames && (
                        <p className="text-gray-500 text-sm mt-1">
                          {Array.from(book.authorNames).join(", ")}
                        </p>
                      )}
                      {book.description && (
                        <p className="text-gray-600 text-sm mt-2 line-clamp-2">
                          {book.description}
                        </p>
                      )}
                    </div>

                    <div className="flex items-center gap-3 mt-4">
                      <Link
                        to={`/books/${book.id}`}
                        className="px-4 py-2 text-sm font-medium text-primary-600 bg-primary-50 hover:bg-primary-100 rounded-lg transition-colors"
                      >
                        Chi tiết
                      </Link>
                      {book.available && (
                        <button
                          onClick={() => handleBorrow(book.id)}
                          disabled={borrowingId === book.id}
                          className="px-4 py-2 text-sm font-medium text-white bg-gradient-to-r from-primary-600 to-accent-600 hover:from-primary-700 hover:to-accent-700 rounded-lg transition-all shadow-md hover:shadow-lg disabled:opacity-50"
                        >
                          {borrowingId === book.id ? "Đang xử lý..." : "Mượn sách"}
                        </button>
                      )}
                      {!book.available && (
                        <span className="px-3 py-1.5 text-xs font-semibold text-red-700 bg-red-100 rounded-full">
                          Hết sách
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-16 text-gray-500">
            <BookOpen className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p>Bộ sách này chưa có cuốn nào.</p>
          </div>
        )}
      </div>
    </div>
  );
}
