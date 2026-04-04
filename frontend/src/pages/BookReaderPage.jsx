import { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import bookApi from "../api/bookApi";
import { getProxiedImageUrl, handleImageError } from "../utils/imageProxy";

export default function BookReaderPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [book, setBook] = useState(null);
  const [loading, setLoading] = useState(true);
  const [fontSize, setFontSize] = useState(18);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [showSettings, setShowSettings] = useState(false);

  useEffect(() => {
    bookApi
      .readBookContent(id)
      .then(setBook)
      .catch((err) => {
        if (err.response?.status === 403) {
          alert(err.response?.data?.message || 'Bạn cần gói Premium để đọc sách này.');
        }
        navigate(`/books/${id}`);
      })
      .finally(() => setLoading(false));
  }, [id]);

  useEffect(() => {
    const onScroll = () => {
      const total = document.documentElement.scrollHeight - window.innerHeight;
      setScrollProgress(total > 0 ? Math.min(100, (window.scrollY / total) * 100) : 0);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-primary-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-400 text-lg">Đang tải nội dung...</p>
        </div>
      </div>
    );
  }

  const hasContent = book?.content && book.content.trim().length > 0;
  const authorList = Array.isArray(book?.authorNames)
    ? book.authorNames.join(", ")
    : book?.authorNames || "";

  return (
    <div className="min-h-screen bg-gray-900">
      {/* Fixed Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-gray-900/95 backdrop-blur-sm border-b border-gray-800">
        {/* Progress Bar */}
        <div className="h-1 bg-gray-800">
          <div 
            className="h-full bg-gradient-to-r from-primary-500 to-accent-500 transition-all duration-100"
            style={{ width: `${scrollProgress}%` }}
          />
        </div>

        {/* Header Content */}
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between py-3">
            <div className="flex items-center gap-4 flex-1 min-w-0">
              <Link 
                to={`/books/${id}`}
                className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                <span className="text-sm font-semibold hidden sm:inline">Quay lại</span>
              </Link>
              
              <div className="flex-1 min-w-0">
                <h1 className="text-white font-bold text-sm sm:text-base truncate">{book?.title}</h1>
                {authorList && (
                  <p className="text-gray-500 text-xs truncate">{authorList}</p>
                )}
              </div>
            </div>

            <div className="flex items-center gap-3">
              <span className="text-gray-500 text-xs font-mono hidden sm:block">
                {Math.round(scrollProgress)}%
              </span>
              
              <button
                onClick={() => setShowSettings(!showSettings)}
                className={`p-2 rounded-lg transition-colors ${
                  showSettings 
                    ? "bg-primary-500/20 text-primary-400" 
                    : "text-gray-400 hover:text-white hover:bg-gray-800"
                }`}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
                </svg>
              </button>
            </div>
          </div>

          {/* Settings Panel */}
          {showSettings && (
            <div className="py-4 border-t border-gray-800">
              <div className="flex flex-wrap items-center gap-4">
                <div className="flex items-center gap-3">
                  <span className="text-gray-400 text-sm">Cỡ chữ:</span>
                  <button
                    onClick={() => setFontSize(f => Math.max(14, f - 2))}
                    className="w-8 h-8 rounded-lg bg-gray-800 text-gray-300 hover:bg-gray-700 hover:text-white transition-colors flex items-center justify-center"
                  >
                    A-
                  </button>
                  <span className="text-white font-semibold w-12 text-center">{fontSize}px</span>
                  <button
                    onClick={() => setFontSize(f => Math.min(28, f + 2))}
                    className="w-8 h-8 rounded-lg bg-gray-800 text-gray-300 hover:bg-gray-700 hover:text-white transition-colors flex items-center justify-center"
                  >
                    A+
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </header>

      {/* Main Content */}
      <main className="pt-20" style={{ paddingTop: showSettings ? '140px' : '80px' }}>
        {!hasContent ? (
          <div className="container mx-auto px-4 py-20">
            <div className="max-w-2xl mx-auto text-center">
              <div className="text-8xl mb-6">📖</div>
              <h2 className="text-3xl font-black text-white mb-4">Chưa có nội dung</h2>
              <p className="text-gray-400 text-lg mb-8">
                Cuốn sách này chưa có bản điện tử để đọc trực tuyến.
              </p>
              <Link
                to={`/books/${id}`}
                className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-primary-500 to-accent-500 text-white font-bold rounded-xl hover:shadow-lg hover:shadow-primary-500/30 transition-all"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                Quay lại chi tiết sách
              </Link>
            </div>
          </div>
        ) : (
          <div className="container mx-auto px-4 pb-20">
            {/* Book Header */}
            <div className="max-w-4xl mx-auto mb-12 text-center py-8">
              {(book?.coverUrl || book?.isbn) && (
                <div className="mb-8 flex justify-center">
                  <img 
                    src={getProxiedImageUrl(book.coverUrl, book.isbn)} 
                    alt={book.title}
                    className="rounded-2xl shadow-2xl max-h-80 object-cover"
                    onError={(e) => handleImageError(e, book?.isbn, book?.coverUrl)}
                  />
                </div>
              )}
              <h1 className="text-4xl md:text-5xl font-black text-white mb-4 leading-tight">
                {book?.title}
              </h1>
              {authorList && (
                <p className="text-xl text-gray-400 mb-6">{authorList}</p>
              )}
              <div className="w-24 h-1 bg-gradient-to-r from-primary-500 to-accent-500 mx-auto rounded-full" />
            </div>

            {/* Content Area */}
            <div className="max-w-4xl mx-auto">
              <div 
                className="book-content bg-white rounded-2xl shadow-2xl p-8 md:p-12"
                style={{ fontSize: `${fontSize}px` }}
                dangerouslySetInnerHTML={{ __html: book.content }}
              />

              {/* End Section */}
              <div className="mt-12 text-center py-8 border-t border-gray-800">
                <p className="text-gray-500 mb-2">Bạn đã đọc xong</p>
                <p className="text-white font-bold text-xl mb-6">{book?.title}</p>
                <Link
                  to={`/books/${id}`}
                  className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-primary-500 to-accent-500 text-white font-bold rounded-xl hover:shadow-lg hover:shadow-primary-500/30 transition-all"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                  Quay lại chi tiết sách
                </Link>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Content Styles */}
      <style>{`
        .book-content {
          line-height: 1.8;
          color: #1a1a1a;
        }
        
        .book-content h1 {
          font-size: ${fontSize + 12}px;
          font-weight: 900;
          color: #111;
          margin: 2em 0 1em;
          line-height: 1.2;
        }
        
        .book-content h2 {
          font-size: ${fontSize + 8}px;
          font-weight: 800;
          color: #222;
          margin: 1.8em 0 0.8em;
          line-height: 1.3;
        }
        
        .book-content h3 {
          font-size: ${fontSize + 4}px;
          font-weight: 700;
          color: #333;
          margin: 1.5em 0 0.6em;
          line-height: 1.4;
        }
        
        .book-content p {
          margin: 0 0 1.5em;
          text-align: justify;
          color: #2d3748;
        }
        
        .book-content img {
          max-width: 100%;
          height: auto;
          border-radius: 12px;
          margin: 2em auto;
          display: block;
          box-shadow: 0 10px 40px rgba(0,0,0,0.15);
        }
        
        .book-content strong {
          font-weight: 700;
          color: #1a1a1a;
        }
        
        .book-content em {
          font-style: italic;
          color: #4a5568;
        }
        
        .book-content blockquote {
          margin: 2em 0;
          padding: 1.5em 2em;
          border-left: 4px solid #d946ef;
          background: linear-gradient(to right, #fdf4ff, #fae8ff);
          border-radius: 0 12px 12px 0;
          font-style: italic;
          color: #4a5568;
        }
        
        .book-content ul, .book-content ol {
          margin: 1.5em 0;
          padding-left: 2em;
        }
        
        .book-content li {
          margin: 0.5em 0;
          color: #2d3748;
        }
        
        .book-content a {
          color: #d946ef;
          text-decoration: underline;
          font-weight: 600;
        }
        
        .book-content a:hover {
          color: #c026d3;
        }
        
        .book-content code {
          background: #f7fafc;
          padding: 0.2em 0.4em;
          border-radius: 4px;
          font-family: 'Courier New', monospace;
          font-size: 0.9em;
          color: #e53e3e;
        }
        
        .book-content pre {
          background: #1a202c;
          color: #e2e8f0;
          padding: 1.5em;
          border-radius: 12px;
          overflow-x: auto;
          margin: 2em 0;
        }
        
        .book-content pre code {
          background: transparent;
          color: inherit;
          padding: 0;
        }
        
        .book-content table {
          width: 100%;
          border-collapse: collapse;
          margin: 2em 0;
        }
        
        .book-content th, .book-content td {
          border: 1px solid #e2e8f0;
          padding: 0.75em;
          text-align: left;
        }
        
        .book-content th {
          background: #f7fafc;
          font-weight: 700;
        }
        
        .book-content hr {
          border: none;
          height: 2px;
          background: linear-gradient(to right, transparent, #e2e8f0, transparent);
          margin: 3em 0;
        }
        
        @media (max-width: 768px) {
          .book-content {
            padding: 1.5rem !important;
          }
          
          .book-content h1 {
            font-size: ${fontSize + 8}px;
          }
          
          .book-content h2 {
            font-size: ${fontSize + 6}px;
          }
          
          .book-content h3 {
            font-size: ${fontSize + 3}px;
          }
        }
      `}</style>
    </div>
  );
}
