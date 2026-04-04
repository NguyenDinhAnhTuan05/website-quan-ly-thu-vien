import { Link } from "react-router-dom";
import { getProxiedImageUrl, handleImageError } from "../utils/imageProxy";

export default function BookCard({ book, onBorrow }) {
  const authorList = Array.isArray(book.authorNames)
    ? book.authorNames
    : book.authorNames instanceof Object
    ? Array.from(book.authorNames)
    : Array.isArray(book.authors)
    ? book.authors
    : book.authors
    ? [book.authors]
    : ["Tác giả không xác định"];

  const categoryName =
    (book.categoryNames && (Array.from(book.categoryNames)[0] || book.categoryNames[0])) ||
    book.category ||
    "Chưa phân loại";

  const rating = book.rating ?? book.averageRating ?? 0;

  return (
    <div className="group relative">
      {/* Glow Effect on Hover */}
      <div className="absolute -inset-1 bg-gradient-to-r from-primary-500 to-accent-500 rounded-2xl opacity-0 group-hover:opacity-20 blur-xl transition-all duration-500"></div>
      
      <div className="relative card bg-white/90 backdrop-blur-sm group-hover:shadow-2xl group-hover:shadow-primary-500/20 transition-all duration-300">
        <Link to={`/books/${book.id}`} className="block">
          {/* Book Cover */}
          <div className="relative bg-gradient-to-br from-primary-100 via-accent-50 to-primary-50 aspect-[3/4] overflow-hidden rounded-t-xl">
            {/* Fallback placeholder — always behind the image */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center text-primary-300">
                <svg className="w-20 h-20 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} 
                    d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
                <p className="text-sm font-medium">Không có ảnh bìa</p>
              </div>
            </div>
            {book.coverUrl && (
              <img 
                src={getProxiedImageUrl(book.coverUrl, book.isbn)} 
                alt={book.title} 
                className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 group-hover:rotate-1 transition-all duration-500"
                onError={(e) => handleImageError(e, book.isbn, book.coverUrl)}
              />
            )}
            
            {/* Availability Badge */}
            <div className="absolute top-3 right-3 z-10">
              {book.available ? (
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-success-500 text-white text-xs font-bold rounded-lg shadow-lg backdrop-blur-sm">
                  <span className="w-1.5 h-1.5 bg-white rounded-full animate-pulse"></span>
                  Còn {book.availableQuantity ?? ""} bản
                </span>
              ) : (
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-danger-500 text-white text-xs font-bold rounded-lg shadow-lg backdrop-blur-sm">
                  Hết sách
                </span>
              )}
            </div>

            {/* Overlay on Hover */}
            <div className="absolute inset-0 bg-gradient-to-t from-primary-900/80 via-primary-900/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end justify-center pb-6">
              <span className="text-white font-semibold text-sm px-4 py-2 bg-white/20 backdrop-blur-sm rounded-lg border border-white/30">
                Xem chi tiết →
              </span>
            </div>
          </div>
        </Link>

        {/* Book Info */}
        <div className="p-5">
          <Link to={`/books/${book.id}`}>
            <h3 className="font-bold text-gray-900 line-clamp-2 mb-2 group-hover:text-transparent group-hover:bg-gradient-to-r group-hover:from-primary-600 group-hover:to-accent-600 group-hover:bg-clip-text transition-all duration-300 text-lg leading-snug">
              {book.title}
            </h3>
          </Link>
          
          <p className="text-sm text-gray-600 mb-3 line-clamp-1 font-medium">
            {authorList.join(", ")}
          </p>

          {/* Rating */}
          <div className="flex items-center gap-2 mb-4">
            <div className="flex gap-0.5">
              {[...Array(5)].map((_, i) => (
                <svg 
                  key={i} 
                  className={`w-4 h-4 transition-all duration-300 ${
                    i < Math.floor(rating) 
                      ? "text-accent-400 fill-current drop-shadow-sm" 
                      : "text-gray-300 fill-current"
                  }`}
                  viewBox="0 0 20 20"
                >
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
              ))}
            </div>
            <span className="text-sm font-bold text-gray-700">
              {rating > 0 ? rating.toFixed(1) : "—"}
            </span>
          </div>

          {/* Category */}
          <div className="mb-4">
            <span className="inline-flex items-center px-3 py-1.5 bg-gradient-to-r from-primary-50 to-accent-50 text-primary-700 border border-primary-200 rounded-lg text-xs font-bold">
              {categoryName}
            </span>
          </div>

          {/* Actions */}
          <div className="flex gap-2 pt-4 border-t border-gray-100">
            <Link to={`/books/${book.id}`} className="flex-1 text-center px-4 py-2.5 bg-white text-primary-600 border-2 border-primary-300 rounded-lg font-semibold text-sm hover:bg-primary-50 hover:border-primary-400 transition-all">
              Chi tiết
            </Link>
            <button 
              className="flex-1 px-4 py-2.5 bg-gradient-to-r from-primary-600 to-accent-600 text-white rounded-lg font-semibold text-sm hover:from-primary-700 hover:to-accent-700 disabled:from-gray-400 disabled:to-gray-500 disabled:cursor-not-allowed transition-all shadow-md hover:shadow-lg disabled:shadow-none"
              onClick={() => onBorrow?.(book.id)}
              disabled={!book.available}
            >
              Mượn sách
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
