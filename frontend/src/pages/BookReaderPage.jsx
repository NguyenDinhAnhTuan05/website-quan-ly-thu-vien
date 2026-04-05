import { useState, useEffect, useCallback, useRef } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import DOMPurify from "dompurify";
import bookApi from "../api/bookApi";
import { getProxiedImageUrl, handleImageError } from "../utils/imageProxy";

const THEMES = {
  light:  { bg: "#ffffff", text: "#1a1a1a", secondaryText: "#4a5568", contentBg: "#ffffff", headerBg: "rgba(255,255,255,0.95)", border: "#e2e8f0", blockquoteBg: "#f7fafc", codeBg: "#f7fafc", label: "Sáng", icon: "☀️" },
  dark:   { bg: "#1a1a2e", text: "#e2e8f0", secondaryText: "#a0aec0", contentBg: "#16213e", headerBg: "rgba(26,26,46,0.95)", border: "#2d3748", blockquoteBg: "#1e293b", codeBg: "#0f172a", label: "Tối", icon: "🌙" },
  sepia:  { bg: "#f5e6d3", text: "#3d2b1f", secondaryText: "#6b4c3b", contentBg: "#fdf2e4", headerBg: "rgba(245,230,211,0.95)", border: "#d4b896", blockquoteBg: "#f0dcc6", codeBg: "#efe0cc", label: "Sepia", icon: "📜" },
};

const FONTS = {
  sans:  { family: "'Inter', system-ui, sans-serif", label: "Sans" },
  serif: { family: "'Georgia', 'Times New Roman', serif", label: "Serif" },
  mono:  { family: "'Courier New', monospace", label: "Mono" },
};

const STORAGE_KEY = (id) => `reader_${id}`;

export default function BookReaderPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const contentRef = useRef(null);

  const [book, setBook] = useState(null);
  const [loading, setLoading] = useState(true);

  // Reader settings — restore from localStorage
  const saved = (() => { try { return JSON.parse(localStorage.getItem(STORAGE_KEY(id))) || {}; } catch { return {}; } })();
  const [fontSize, setFontSize] = useState(saved.fontSize ?? 18);
  const [theme, setTheme] = useState(saved.theme ?? "light");
  const [fontKey, setFontKey] = useState(saved.fontKey ?? "sans");
  const [scrollProgress, setScrollProgress] = useState(0);
  const [showSettings, setShowSettings] = useState(false);
  const [immersive, setImmersive] = useState(false);

  const t = THEMES[theme];
  const font = FONTS[fontKey];

  // Persist settings
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY(id), JSON.stringify({ fontSize, theme, fontKey }));
  }, [fontSize, theme, fontKey, id]);

  // Fetch book content
  useEffect(() => {
    bookApi
      .readBookContent(id)
      .then(setBook)
      .catch((err) => {
        if (err.response?.status === 403) {
          alert(err.response?.data?.message || "Bạn cần gói Premium để đọc sách này.");
        }
        navigate(`/books/${id}`);
      })
      .finally(() => setLoading(false));
  }, [id]);

  // Scroll progress tracking + save last position
  useEffect(() => {
    const onScroll = () => {
      const total = document.documentElement.scrollHeight - window.innerHeight;
      const pct = total > 0 ? Math.min(100, (window.scrollY / total) * 100) : 0;
      setScrollProgress(pct);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Restore last reading position
  useEffect(() => {
    if (!loading && book?.content && saved.scrollPct) {
      requestAnimationFrame(() => {
        const total = document.documentElement.scrollHeight - window.innerHeight;
        window.scrollTo({ top: (saved.scrollPct / 100) * total, behavior: "auto" });
      });
    }
  }, [loading]);

  // Save scroll position on unload
  useEffect(() => {
    const save = () => {
      const total = document.documentElement.scrollHeight - window.innerHeight;
      const pct = total > 0 ? Math.min(100, (window.scrollY / total) * 100) : 0;
      const data = { fontSize, theme, fontKey, scrollPct: pct };
      localStorage.setItem(STORAGE_KEY(id), JSON.stringify(data));
    };
    window.addEventListener("beforeunload", save);
    return () => { save(); window.removeEventListener("beforeunload", save); };
  }, [fontSize, theme, fontKey, id]);

  // Keyboard shortcuts
  useEffect(() => {
    const handler = (e) => {
      if (e.target.tagName === "INPUT" || e.target.tagName === "TEXTAREA") return;
      switch (e.key) {
        case "ArrowRight":
        case "ArrowDown":
          e.preventDefault();
          window.scrollBy({ top: window.innerHeight * 0.85, behavior: "smooth" });
          break;
        case "ArrowLeft":
        case "ArrowUp":
          e.preventDefault();
          window.scrollBy({ top: -window.innerHeight * 0.85, behavior: "smooth" });
          break;
        case "f":
        case "F":
          if (!e.ctrlKey && !e.metaKey) setImmersive((v) => !v);
          break;
        case "Escape":
          setImmersive(false);
          setShowSettings(false);
          break;
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: t.bg }}>
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-primary-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p style={{ color: t.secondaryText }} className="text-lg">Đang tải nội dung...</p>
        </div>
      </div>
    );
  }

  const hasContent = book?.content && book.content.trim().length > 0;
  const authorList = Array.isArray(book?.authorNames)
    ? book.authorNames.join(", ")
    : book?.authorNames || "";

  return (
    <div className="min-h-screen transition-colors duration-300" style={{ background: t.bg }}>
      {/* Fixed Header — hidden in immersive mode */}
      <header
        className={`fixed top-0 left-0 right-0 z-50 backdrop-blur-sm border-b transition-transform duration-300 ${
          immersive ? "-translate-y-full" : "translate-y-0"
        }`}
        style={{ background: t.headerBg, borderColor: t.border }}
      >
        {/* Progress Bar */}
        <div className="h-1" style={{ background: t.border }}>
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
                className="flex items-center gap-2 transition-colors"
                style={{ color: t.secondaryText }}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                <span className="text-sm font-semibold hidden sm:inline">Quay lại</span>
              </Link>

              <div className="flex-1 min-w-0">
                <h1 className="font-bold text-sm sm:text-base truncate" style={{ color: t.text }}>{book?.title}</h1>
                {authorList && <p className="text-xs truncate" style={{ color: t.secondaryText }}>{authorList}</p>}
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs font-mono hidden sm:block" style={{ color: t.secondaryText }}>
                {Math.round(scrollProgress)}%
              </span>

              {/* Theme Toggle */}
              <div className="hidden sm:flex items-center gap-1 bg-black/5 rounded-lg p-1">
                {Object.entries(THEMES).map(([key, th]) => (
                  <button
                    key={key}
                    onClick={() => setTheme(key)}
                    className={`w-7 h-7 rounded-md text-xs flex items-center justify-center transition-all ${
                      theme === key ? "shadow-md scale-110" : "opacity-60 hover:opacity-80"
                    }`}
                    style={{ background: theme === key ? th.contentBg : "transparent" }}
                    title={th.label}
                  >
                    {th.icon}
                  </button>
                ))}
              </div>

              {/* Immersive toggle */}
              <button
                onClick={() => setImmersive(!immersive)}
                className="p-2 rounded-lg transition-colors hover:bg-black/5"
                style={{ color: t.secondaryText }}
                title="Chế độ tập trung (F)"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
                </svg>
              </button>

              {/* Settings */}
              <button
                onClick={() => setShowSettings(!showSettings)}
                className={`p-2 rounded-lg transition-colors ${showSettings ? "bg-primary-500/20 text-primary-400" : "hover:bg-black/5"}`}
                style={{ color: showSettings ? undefined : t.secondaryText }}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
                </svg>
              </button>
            </div>
          </div>

          {/* Settings Panel */}
          {showSettings && (
            <div className="py-4 border-t" style={{ borderColor: t.border }}>
              <div className="flex flex-wrap items-center gap-6">
                {/* Font Size */}
                <div className="flex items-center gap-3">
                  <span className="text-sm" style={{ color: t.secondaryText }}>Cỡ chữ:</span>
                  <button onClick={() => setFontSize((f) => Math.max(14, f - 2))} className="w-8 h-8 rounded-lg flex items-center justify-center transition-colors" style={{ background: t.border, color: t.text }}>A-</button>
                  <span className="font-semibold w-12 text-center" style={{ color: t.text }}>{fontSize}px</span>
                  <button onClick={() => setFontSize((f) => Math.min(32, f + 2))} className="w-8 h-8 rounded-lg flex items-center justify-center transition-colors" style={{ background: t.border, color: t.text }}>A+</button>
                </div>

                {/* Font Family */}
                <div className="flex items-center gap-3">
                  <span className="text-sm" style={{ color: t.secondaryText }}>Font:</span>
                  <div className="flex gap-1 p-1 rounded-lg" style={{ background: t.border }}>
                    {Object.entries(FONTS).map(([key, f]) => (
                      <button
                        key={key}
                        onClick={() => setFontKey(key)}
                        className={`px-3 py-1 rounded-md text-sm font-medium transition-all ${
                          fontKey === key ? "shadow-sm" : "opacity-60 hover:opacity-80"
                        }`}
                        style={{
                          background: fontKey === key ? t.contentBg : "transparent",
                          color: t.text,
                          fontFamily: f.family,
                        }}
                      >
                        {f.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Theme (mobile) */}
                <div className="flex sm:hidden items-center gap-3">
                  <span className="text-sm" style={{ color: t.secondaryText }}>Theme:</span>
                  <div className="flex gap-1 p-1 rounded-lg" style={{ background: t.border }}>
                    {Object.entries(THEMES).map(([key, th]) => (
                      <button
                        key={key}
                        onClick={() => setTheme(key)}
                        className={`px-3 py-1 rounded-md text-sm transition-all ${
                          theme === key ? "shadow-sm" : "opacity-60"
                        }`}
                        style={{ background: theme === key ? th.contentBg : "transparent", color: th.text }}
                      >
                        {th.icon} {th.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Keyboard hint */}
                <div className="hidden md:flex items-center gap-2 ml-auto text-xs" style={{ color: t.secondaryText }}>
                  <kbd className="px-1.5 py-0.5 rounded text-xs border" style={{ borderColor: t.border }}>←→</kbd> lật trang
                  <kbd className="px-1.5 py-0.5 rounded text-xs border ml-2" style={{ borderColor: t.border }}>F</kbd> tập trung
                </div>
              </div>
            </div>
          )}
        </div>
      </header>

      {/* Click zone to exit immersive mode */}
      {immersive && (
        <button
          onClick={() => setImmersive(false)}
          className="fixed top-0 left-0 right-0 h-8 z-40 opacity-0 hover:opacity-100 transition-opacity cursor-pointer"
          style={{ background: "linear-gradient(to bottom, rgba(0,0,0,0.1), transparent)" }}
        />
      )}

      {/* Main Content */}
      <main
        className="transition-all duration-300"
        style={{ paddingTop: immersive ? "20px" : showSettings ? "140px" : "80px" }}
      >
        {!hasContent ? (
          <div className="container mx-auto px-4 py-20">
            <div className="max-w-2xl mx-auto text-center">
              <div className="text-8xl mb-6">📖</div>
              <h2 className="text-3xl font-black mb-4" style={{ color: t.text }}>Chưa có nội dung</h2>
              <p className="text-lg mb-8" style={{ color: t.secondaryText }}>
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
              <h1 className="text-4xl md:text-5xl font-black mb-4 leading-tight" style={{ color: t.text }}>
                {book?.title}
              </h1>
              {authorList && (
                <p className="text-xl mb-6" style={{ color: t.secondaryText }}>{authorList}</p>
              )}
              <div className="w-24 h-1 bg-gradient-to-r from-primary-500 to-accent-500 mx-auto rounded-full" />
            </div>

            {/* Content Area */}
            <div className="max-w-4xl mx-auto" ref={contentRef}>
              <div
                className="book-content rounded-2xl shadow-2xl p-8 md:p-12 transition-colors duration-300"
                style={{
                  fontSize: `${fontSize}px`,
                  fontFamily: font.family,
                  background: t.contentBg,
                  color: t.text,
                }}
                dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(book.content) }}
              />

              {/* End Section */}
              <div className="mt-12 text-center py-8 border-t" style={{ borderColor: t.border }}>
                <p className="mb-2" style={{ color: t.secondaryText }}>Bạn đã đọc xong</p>
                <p className="font-bold text-xl mb-6" style={{ color: t.text }}>{book?.title}</p>
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

      {/* Theme-aware Content Styles */}
      <style>{`
        .book-content {
          line-height: 1.8;
        }
        .book-content h1 {
          font-size: ${fontSize + 12}px;
          font-weight: 900;
          margin: 2em 0 1em;
          line-height: 1.2;
        }
        .book-content h2 {
          font-size: ${fontSize + 8}px;
          font-weight: 800;
          margin: 1.8em 0 0.8em;
          line-height: 1.3;
        }
        .book-content h3 {
          font-size: ${fontSize + 4}px;
          font-weight: 700;
          margin: 1.5em 0 0.6em;
          line-height: 1.4;
        }
        .book-content p {
          margin: 0 0 1.5em;
          text-align: justify;
          color: ${t.secondaryText};
        }
        .book-content img {
          max-width: 100%;
          height: auto;
          border-radius: 12px;
          margin: 2em auto;
          display: block;
          box-shadow: 0 10px 40px rgba(0,0,0,0.15);
        }
        .book-content strong { font-weight: 700; color: ${t.text}; }
        .book-content em { font-style: italic; color: ${t.secondaryText}; }
        .book-content blockquote {
          margin: 2em 0;
          padding: 1.5em 2em;
          border-left: 4px solid #d946ef;
          background: ${t.blockquoteBg};
          border-radius: 0 12px 12px 0;
          font-style: italic;
          color: ${t.secondaryText};
        }
        .book-content ul, .book-content ol { margin: 1.5em 0; padding-left: 2em; }
        .book-content li { margin: 0.5em 0; color: ${t.secondaryText}; }
        .book-content a { color: #d946ef; text-decoration: underline; font-weight: 600; }
        .book-content a:hover { color: #c026d3; }
        .book-content code {
          background: ${t.codeBg};
          padding: 0.2em 0.4em;
          border-radius: 4px;
          font-family: 'Courier New', monospace;
          font-size: 0.9em;
        }
        .book-content pre {
          background: ${theme === "dark" ? "#0f172a" : "#1a202c"};
          color: #e2e8f0;
          padding: 1.5em;
          border-radius: 12px;
          overflow-x: auto;
          margin: 2em 0;
        }
        .book-content pre code { background: transparent; color: inherit; padding: 0; }
        .book-content table { width: 100%; border-collapse: collapse; margin: 2em 0; }
        .book-content th, .book-content td {
          border: 1px solid ${t.border};
          padding: 0.75em;
          text-align: left;
        }
        .book-content th { background: ${t.blockquoteBg}; font-weight: 700; }
        .book-content hr {
          border: none;
          height: 2px;
          background: linear-gradient(to right, transparent, ${t.border}, transparent);
          margin: 3em 0;
        }
        @media (max-width: 768px) {
          .book-content { padding: 1.5rem !important; }
          .book-content h1 { font-size: ${fontSize + 8}px; }
          .book-content h2 { font-size: ${fontSize + 6}px; }
          .book-content h3 { font-size: ${fontSize + 3}px; }
        }
      `}</style>
    </div>
  );
}
