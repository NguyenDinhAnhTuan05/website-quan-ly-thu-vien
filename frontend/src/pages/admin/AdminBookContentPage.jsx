import { useState, useEffect, useCallback } from "react";
import Toast from "../../components/ui/Toast";
import useToast from "../../hooks/useToast";
import adminApi from "../../api/adminApi";

export default function AdminBookContentPage() {
  const { toast, showToast } = useToast(3000);

  const [books, setBooks] = useState([]);
  const [keyword, setKeyword] = useState("");
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [loading, setLoading] = useState(false);

  // Editor state
  const [selectedBook, setSelectedBook] = useState(null);
  const [contentDraft, setContentDraft] = useState("");
  const [saving, setSaving] = useState(false);
  const [generating, setGenerating] = useState(null); // book id being generated
  const [generatingAll, setGeneratingAll] = useState(false);
  const [previewMode, setPreviewMode] = useState(false);

  const fetchBooks = useCallback(async () => {
    setLoading(true);
    try {
      const res = await adminApi.getAllBooks({ keyword, page, size: 10 });
      setBooks(res.content || []);
      setTotalPages(res.page?.totalPages ?? res.totalPages ?? 0);
    } catch {
      showToast("Không thể tải danh sách sách", "error");
    } finally {
      setLoading(false);
    }
  }, [keyword, page]);

  useEffect(() => {
    fetchBooks();
  }, [fetchBooks]);

  const handleSelectBook = (book) => {
    setSelectedBook(book);
    setContentDraft(book.content || "");
    setPreviewMode(false);
  };

  const handleSaveContent = async () => {
    if (!selectedBook) return;
    setSaving(true);
    try {
      const res = await adminApi.updateBookContent(selectedBook.id, contentDraft);
      showToast("Lưu nội dung thành công!", "success");
      setSelectedBook({ ...selectedBook, content: contentDraft });
      // Update in list
      setBooks((prev) =>
        prev.map((b) => (b.id === selectedBook.id ? { ...b, content: contentDraft } : b))
      );
    } catch {
      showToast("Lưu nội dung thất bại", "error");
    } finally {
      setSaving(false);
    }
  };

  const handleGenerateContent = async (bookId) => {
    setGenerating(bookId);
    try {
      await adminApi.generateContentForBook(bookId);
      showToast("Sinh nội dung AI thành công!", "success");
      // Refresh list to get new content
      await fetchBooks();
      // If currently editing this book, refresh editor
      if (selectedBook?.id === bookId) {
        const res = await adminApi.getAllBooks({ keyword: "", page: 0, size: 1000 });
        const updated = (res.content || []).find((b) => b.id === bookId);
        if (updated) {
          setSelectedBook(updated);
          setContentDraft(updated.content || "");
        }
      }
    } catch {
      showToast("Sinh nội dung AI thất bại. Kiểm tra GEMINI_API_KEY.", "error");
    } finally {
      setGenerating(null);
    }
  };

  const handleGenerateAll = async () => {
    if (!confirm("Sinh nội dung AI cho TẤT CẢ sách chưa có content? Quá trình này có thể mất vài phút.")) return;
    setGeneratingAll(true);
    try {
      const res = await adminApi.generateAllContent();
      showToast(`Sinh nội dung thành công cho ${res.updated_count} sách!`, "success");
      await fetchBooks();
    } catch {
      showToast("Sinh nội dung AI thất bại", "error");
    } finally {
      setGeneratingAll(false);
    }
  };

  const hasContent = (book) => book.content && book.content.trim().length > 0;

  return (
    <div className="space-y-6">
      <Toast toast={toast} />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Quản lý nội dung sách</h1>
          <p className="text-sm text-gray-500 mt-1">Xem, chỉnh sửa và sinh nội dung AI cho sách</p>
        </div>
        <button
          onClick={handleGenerateAll}
          disabled={generatingAll}
          className="inline-flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 transition-colors"
        >
          {generatingAll ? (
            <>
              <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              Đang sinh...
            </>
          ) : (
            <>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              Sinh AI tất cả
            </>
          )}
        </button>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Left: Book list */}
        <div className="lg:w-1/3 space-y-4">
          {/* Search */}
          <div className="relative">
            <input
              type="text"
              placeholder="Tìm kiếm sách..."
              value={keyword}
              onChange={(e) => { setKeyword(e.target.value); setPage(0); }}
              className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <svg className="absolute left-3 top-2.5 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>

          {/* Book list */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 divide-y divide-gray-200 max-h-[600px] overflow-y-auto">
            {loading ? (
              <div className="p-8 text-center text-gray-500">Đang tải...</div>
            ) : books.length === 0 ? (
              <div className="p-8 text-center text-gray-500">Không tìm thấy sách</div>
            ) : (
              books.map((book) => (
                <div
                  key={book.id}
                  onClick={() => handleSelectBook(book)}
                  className={`flex items-center gap-3 p-3 cursor-pointer hover:bg-gray-50 transition-colors ${
                    selectedBook?.id === book.id ? "bg-blue-50 border-l-4 border-blue-500" : ""
                  }`}
                >
                  <img
                    src={book.coverUrl || "/placeholder-book.png"}
                    alt={book.title}
                    className="w-10 h-14 rounded object-cover flex-shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">{book.title}</p>
                    <p className="text-xs text-gray-500 truncate">
                      {book.authors?.map((a) => a.name).join(", ") || "Không rõ tác giả"}
                    </p>
                  </div>
                  <div className="flex-shrink-0">
                    {hasContent(book) ? (
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-700">
                        Có
                      </span>
                    ) : (
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-700">
                        Trống
                      </span>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between">
              <button
                onClick={() => setPage((p) => Math.max(0, p - 1))}
                disabled={page === 0}
                className="px-3 py-1 text-sm bg-white border rounded-lg disabled:opacity-50 hover:bg-gray-50"
              >
                ← Trước
              </button>
              <span className="text-sm text-gray-600">
                Trang {page + 1} / {totalPages}
              </span>
              <button
                onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
                disabled={page >= totalPages - 1}
                className="px-3 py-1 text-sm bg-white border rounded-lg disabled:opacity-50 hover:bg-gray-50"
              >
                Sau →
              </button>
            </div>
          )}
        </div>

        {/* Right: Content editor */}
        <div className="lg:w-2/3">
          {selectedBook ? (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200">
              {/* Editor header */}
              <div className="flex items-center justify-between p-4 border-b border-gray-200">
                <div>
                  <h2 className="font-semibold text-gray-900">{selectedBook.title}</h2>
                  <p className="text-sm text-gray-500">
                    {selectedBook.content
                      ? `${selectedBook.content.length.toLocaleString()} ký tự`
                      : "Chưa có nội dung"}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleGenerateContent(selectedBook.id)}
                    disabled={generating === selectedBook.id}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm bg-purple-100 text-purple-700 rounded-lg hover:bg-purple-200 disabled:opacity-50 transition-colors"
                  >
                    {generating === selectedBook.id ? (
                      <>
                        <svg className="w-3.5 h-3.5 animate-spin" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                        </svg>
                        Đang sinh...
                      </>
                    ) : (
                      <>
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                        </svg>
                        Sinh AI
                      </>
                    )}
                  </button>
                  <button
                    onClick={() => setPreviewMode(!previewMode)}
                    className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-sm rounded-lg transition-colors ${
                      previewMode
                        ? "bg-blue-100 text-blue-700"
                        : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                    }`}
                  >
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                    {previewMode ? "Sửa" : "Xem trước"}
                  </button>
                  <button
                    onClick={handleSaveContent}
                    disabled={saving}
                    className="inline-flex items-center gap-1.5 px-4 py-1.5 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
                  >
                    {saving ? (
                      <>
                        <svg className="w-3.5 h-3.5 animate-spin" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                        </svg>
                        Đang lưu...
                      </>
                    ) : (
                      <>
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        Lưu
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Editor/Preview area */}
              <div className="p-4">
                {previewMode ? (
                  <div
                    className="prose prose-sm max-w-none min-h-[400px] p-4 bg-gray-50 rounded-lg overflow-auto max-h-[600px]"
                    dangerouslySetInnerHTML={{ __html: contentDraft }}
                  />
                ) : (
                  <textarea
                    value={contentDraft}
                    onChange={(e) => setContentDraft(e.target.value)}
                    placeholder="Nhập nội dung HTML cho sách... Bạn cũng có thể sử dụng nút 'Sinh AI' để tạo tự động."
                    className="w-full min-h-[400px] max-h-[600px] p-4 font-mono text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-y"
                  />
                )}
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 flex flex-col items-center justify-center min-h-[500px] text-center p-8">
              <svg className="w-16 h-16 text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
              <h3 className="text-lg font-medium text-gray-600 mb-1">Chọn một cuốn sách</h3>
              <p className="text-sm text-gray-400">Chọn sách từ danh sách bên trái để xem và chỉnh sửa nội dung</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
