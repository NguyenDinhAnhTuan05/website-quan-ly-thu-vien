import { useParams, Link, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import bookApi from "../api/bookApi";
import borrowApi from "../api/borrowApi";
import reviewApi from "../api/reviewApi";
import { useAuthStore } from "../store/index";
import useToast from "../hooks/useToast";
import Toast from "../components/ui/Toast";
import BookCoverCard from "../components/book/BookCoverCard";
import BookQuickInfo from "../components/book/BookQuickInfo";
import RatingOverview from "../components/book/RatingOverview";
import ReviewSection from "../components/book/ReviewSection";

export default function BookDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuthStore();
  const { toast, showToast } = useToast();

  const [book, setBook] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [totalReviews, setTotalReviews] = useState(0);
  const [isLoadingBook, setIsLoadingBook] = useState(true);
  const [isBorrowing, setIsBorrowing] = useState(false);

  const [showReviewForm, setShowReviewForm] = useState(false);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);

  useEffect(() => {
    const fetchBook = async () => {
      setIsLoadingBook(true);
      try {
        const data = await bookApi.getBookById(id);
        setBook(data);
      } catch {
        setBook(null);
      } finally {
        setIsLoadingBook(false);
      }
    };
    fetchBook();
  }, [id]);

  useEffect(() => {
    if (!id) return;
    reviewApi
      .getReviews(id, { page: 0, size: 20 })
      .then((data) => {
        setReviews(data.content || []);
        setTotalReviews(data.page?.totalElements ?? data.totalElements ?? 0);
      })
      .catch(() => {});
  }, [id]);

  const handleBorrow = async () => {
    if (!isAuthenticated) {
      navigate("/login", { state: { from: { pathname: `/books/${id}` } } });
      return;
    }
    setIsBorrowing(true);
    try {
      await borrowApi.createBorrow({ bookIds: [parseInt(id)] });
      showToast("Tạo phiếu mượn thành công! Chờ thủ thư xác nhận.");
      const updated = await bookApi.getBookById(id);
      setBook(updated);
    } catch (err) {
      showToast(err.response?.data?.message || "Không thể tạo phiếu mượn.", "error");
    } finally {
      setIsBorrowing(false);
    }
  };

  const handleSubmitReview = async (e) => {
    e.preventDefault();
    if (!isAuthenticated) {
      navigate("/login");
      return;
    }
    if (!comment.trim()) {
      showToast("Vui lòng nhập nội dung đánh giá.", "error");
      return;
    }
    setIsSubmittingReview(true);
    try {
      const newReview = await reviewApi.addOrUpdateReview(id, { rating, comment });
      setReviews((prev) => {
        const idx = prev.findIndex((r) => r.userId === user?.id);
        if (idx >= 0) {
          const updated = [...prev];
          updated[idx] = newReview;
          return updated;
        }
        return [newReview, ...prev];
      });
      showToast("Đánh giá của bạn đã được lưu!");
      setShowReviewForm(false);
      setComment("");
    } catch (err) {
      showToast(err.response?.data?.message || "Không thể gửi đánh giá.", "error");
    } finally {
      setIsSubmittingReview(false);
    }
  };

  const handleDeleteReview = async (reviewId) => {
    if (!window.confirm("Bạn có chắc muốn xóa đánh giá này?")) return;
    try {
      await reviewApi.deleteReview(id, reviewId);
      setReviews((prev) => prev.filter((r) => r.id !== reviewId));
      showToast("Đã xóa đánh giá.");
    } catch {
      showToast("Không thể xóa đánh giá.", "error");
    }
  };

  const avgRating = reviews.length
    ? (reviews.reduce((s, r) => s + r.rating, 0) / reviews.length).toFixed(1)
    : 0;

  const authorList = book
    ? Array.isArray(book.authorNames) ? book.authorNames : Array.from(book.authorNames || [])
    : [];

  const categoryList = book
    ? Array.isArray(book.categoryNames) ? book.categoryNames : Array.from(book.categoryNames || [])
    : [];

  if (isLoadingBook) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="spinner w-12 h-12"></div>
      </div>
    );
  }

  if (!book) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">📭</div>
          <h2 className="heading-2 mb-4">Không tìm thấy sách</h2>
          <Link to="/book" className="btn-primary">Quay lại danh sách</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white py-12">
      {toast && <Toast message={toast.msg} type={toast.type} />}

      <div className="container-max px-4">
        {/* Breadcrumb */}
        <div className="mb-8">
          <Link
            to="/book"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-white border border-gray-200 hover:border-primary-300 hover:bg-primary-50 transition-all group"
          >
            <svg className="w-4 h-4 text-gray-600 group-hover:text-primary-600 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            <span className="text-sm font-semibold text-gray-700 group-hover:text-primary-600 transition-colors">Quay lại danh sách</span>
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-12">
          {/* Cover - Sticky Sidebar */}
          <div className="lg:col-span-4">
            <div className="sticky top-24 space-y-6">
              <BookCoverCard
                book={book}
                id={id}
                isBorrowing={isBorrowing}
                isAuthenticated={isAuthenticated}
                onBorrow={handleBorrow}
              />
              <BookQuickInfo book={book} categoryList={categoryList} />
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-8 space-y-8">
            {/* Title & Author Card */}
            <div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-100">
              <h1 className="text-4xl md:text-5xl font-black text-gray-900 mb-4 leading-tight">{book.title}</h1>
              <div className="flex items-center gap-3 mb-6">
                <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                <p className="text-lg text-gray-600 font-medium">{authorList.join(", ") || "Tác giả không xác định"}</p>
              </div>
              <RatingOverview reviews={reviews} totalReviews={totalReviews} avgRating={avgRating} />
            </div>

            {/* Description Card */}
            {book.description && (
              <div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-100">
                <h3 className="text-2xl font-black text-gray-900 mb-4 flex items-center gap-3">
                  <div className="w-8 h-1 bg-gradient-to-r from-primary-500 to-accent-500 rounded-full"></div>
                  Giới thiệu sách
                </h3>
                <div className="prose prose-gray max-w-none">
                  <p className="text-gray-700 leading-relaxed whitespace-pre-line text-base">{book.description}</p>
                </div>
              </div>
            )}

            {/* Reviews */}
            <ReviewSection
              reviews={reviews}
              totalReviews={totalReviews}
              isAuthenticated={isAuthenticated}
              user={user}
              showReviewForm={showReviewForm}
              setShowReviewForm={setShowReviewForm}
              rating={rating}
              setRating={setRating}
              comment={comment}
              setComment={setComment}
              isSubmittingReview={isSubmittingReview}
              onSubmitReview={handleSubmitReview}
              onDeleteReview={handleDeleteReview}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
