import { Link } from "react-router-dom";
import { getProxiedImageUrl, handleImageError } from "../../utils/imageProxy";

export default function BookCoverCard({ book, id, isBorrowing, isAuthenticated, onBorrow }) {
  return (
    <div className="bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-100">
      <div className="relative aspect-[3/4] bg-gradient-to-br from-gray-100 via-gray-50 to-white flex items-center justify-center overflow-hidden group">
        {/* Fallback placeholder */}
        <div className="text-center">
          <span className="text-8xl text-gray-300 mb-4 block">📖</span>
          <p className="text-sm text-gray-400 font-medium">Không có ảnh bìa</p>
        </div>
        {(book.coverUrl || book.isbn) && (
          <>
            <img 
              src={getProxiedImageUrl(book.coverUrl, book.isbn)} 
              alt={book.title} 
              className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
              onError={(e) => handleImageError(e, book.isbn, book.coverUrl)}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          </>
        )}
        
        {/* Availability Badge */}
        <div className="absolute top-4 right-4">
          <div className={`px-3 py-1.5 rounded-full text-xs font-bold backdrop-blur-sm ${
            book.available 
              ? "bg-success-500/90 text-white shadow-lg shadow-success-500/30" 
              : "bg-gray-900/90 text-white"
          }`}>
            {book.available ? `Còn ${book.availableQuantity} bản` : "Hết sách"}
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="p-6 space-y-3 bg-gradient-to-b from-white to-gray-50">
        <button
          onClick={onBorrow}
          disabled={!book.available || isBorrowing}
          className={`w-full py-4 rounded-xl font-bold text-white transition-all duration-300 ${
            book.available && !isBorrowing
              ? "bg-gradient-to-r from-primary-500 to-accent-500 hover:from-primary-600 hover:to-accent-600 shadow-lg shadow-primary-500/30 hover:shadow-xl hover:shadow-primary-500/40 hover:-translate-y-0.5"
              : "bg-gray-300 cursor-not-allowed"
          }`}
        >
          {isBorrowing ? (
            <span className="flex items-center justify-center gap-2">
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              Đang xử lý...
            </span>
          ) : book.available ? (
            <span className="flex items-center justify-center gap-2">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              Mượn sách ngay
            </span>
          ) : (
            "Tạm hết sách"
          )}
        </button>

        {(book.content || book.ebookUrl || book.previewUrl) && (
          <Link
            to={`/books/${id}/read`}
            className="w-full py-4 rounded-xl font-bold bg-white border-2 border-primary-500 text-primary-600 hover:bg-primary-50 transition-all duration-300 flex items-center justify-center gap-2 shadow-sm hover:shadow-md"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
            Đọc trực tuyến
          </Link>
        )}

        {!isAuthenticated && (
          <p className="text-xs text-center text-gray-500 pt-2">
            <Link to="/login" className="text-primary-600 hover:text-primary-700 font-semibold">Đăng nhập</Link> để mượn sách
          </p>
        )}
      </div>
    </div>
  );
}
