import { useState, useEffect, useCallback } from "react";
import Toast from "../../components/ui/Toast";
import useToast from "../../hooks/useToast";
import seriesApi from "../../api/seriesApi";
import adminApi from "../../api/adminApi";

export default function AdminSeriesPage() {
  const { toast, showToast } = useToast(3000);

  const [seriesList, setSeriesList] = useState([]);
  const [keyword, setKeyword] = useState("");
  const [loading, setLoading] = useState(false);

  // Form state
  const [showForm, setShowForm] = useState(false);
  const [editingSeries, setEditingSeries] = useState(null);
  const [form, setForm] = useState({ name: "", description: "", coverUrl: "" });

  // Detail/book management state
  const [selectedSeries, setSelectedSeries] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);

  // Book search for adding to series
  const [bookSearch, setBookSearch] = useState("");
  const [bookResults, setBookResults] = useState([]);
  const [bookSearchLoading, setBookSearchLoading] = useState(false);
  const [addOrder, setAddOrder] = useState(1);

  const fetchSeries = useCallback(async () => {
    setLoading(true);
    try {
      const res = await seriesApi.adminGetAll();
      let list = res || [];
      if (keyword) {
        list = list.filter((s) =>
          s.name.toLowerCase().includes(keyword.toLowerCase())
        );
      }
      setSeriesList(list);
    } catch {
      showToast("Không thể tải danh sách bộ sách", "error");
    } finally {
      setLoading(false);
    }
  }, [keyword]);

  useEffect(() => {
    fetchSeries();
  }, [fetchSeries]);

  const handleAdd = () => {
    setEditingSeries(null);
    setForm({ name: "", description: "", coverUrl: "" });
    setShowForm(true);
  };

  const handleEdit = (s) => {
    setEditingSeries(s);
    setForm({ name: s.name, description: s.description || "", coverUrl: s.coverUrl || "" });
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!confirm("Bạn có chắc muốn xóa bộ sách này? Các sách trong bộ sẽ không bị xóa.")) return;
    try {
      await seriesApi.adminDelete(id);
      showToast("Xóa bộ sách thành công", "success");
      if (selectedSeries?.id === id) setSelectedSeries(null);
      fetchSeries();
    } catch {
      showToast("Xóa bộ sách thất bại", "error");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingSeries) {
        await seriesApi.adminUpdate(editingSeries.id, form);
        showToast("Cập nhật bộ sách thành công", "success");
      } else {
        await seriesApi.adminCreate(form);
        showToast("Thêm bộ sách thành công", "success");
      }
      setShowForm(false);
      setEditingSeries(null);
      setForm({ name: "", description: "", coverUrl: "" });
      fetchSeries();
    } catch (err) {
      const msg = err?.response?.data?.message || "Thao tác thất bại";
      showToast(msg, "error");
    }
  };

  const handleCloseForm = () => {
    setShowForm(false);
    setEditingSeries(null);
    setForm({ name: "", description: "", coverUrl: "" });
  };

  // Detail view - view books in series
  const handleViewDetail = async (s) => {
    setDetailLoading(true);
    try {
      const res = await seriesApi.adminGetById(s.id);
      setSelectedSeries(res);
    } catch {
      showToast("Không thể tải chi tiết bộ sách", "error");
    } finally {
      setDetailLoading(false);
    }
  };

  const handleCloseDetail = () => {
    setSelectedSeries(null);
    setBookSearch("");
    setBookResults([]);
  };

  // Search books to add
  const handleBookSearch = async () => {
    if (!bookSearch.trim()) return;
    setBookSearchLoading(true);
    try {
      const res = await adminApi.getAllBooks({ keyword: bookSearch, page: 0, size: 10 });
      const books = res.content || res || [];
      // Filter out books already in this series
      const existingIds = new Set((selectedSeries?.books || []).map((b) => b.id));
      setBookResults(books.filter((b) => !existingIds.has(b.id)));
    } catch {
      showToast("Tìm sách thất bại", "error");
    } finally {
      setBookSearchLoading(false);
    }
  };

  const handleAddBook = async (bookId) => {
    try {
      const res = await seriesApi.adminAddBook(selectedSeries.id, bookId, addOrder);
      setSelectedSeries(res);
      setBookResults((prev) => prev.filter((b) => b.id !== bookId));
      setAddOrder((prev) => prev + 1);
      showToast("Thêm sách vào bộ thành công", "success");
      fetchSeries();
    } catch {
      showToast("Thêm sách thất bại", "error");
    }
  };

  const handleRemoveBook = async (bookId) => {
    try {
      const res = await seriesApi.adminRemoveBook(selectedSeries.id, bookId);
      setSelectedSeries(res);
      showToast("Đã xóa sách khỏi bộ", "success");
      fetchSeries();
    } catch {
      showToast("Xóa sách khỏi bộ thất bại", "error");
    }
  };

  return (
    <div>
      <Toast toast={toast} />

      {/* Form tạo/sửa bộ sách */}
      {showForm && (
        <div className="card p-6 mb-6 border-2 border-primary-200 bg-primary-50/30">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-lg">
              {editingSeries ? "Sửa bộ sách" : "Thêm bộ sách mới"}
            </h3>
            <button onClick={handleCloseForm} className="text-gray-500 hover:text-gray-700 text-xl">✕</button>
          </div>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold mb-1">Tên bộ sách *</label>
              <input
                type="text"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="input w-full"
                required
                maxLength={255}
                placeholder="Ví dụ: Doraemon, Harry Potter..."
              />
            </div>
            <div>
              <label className="block text-sm font-semibold mb-1">Cover URL</label>
              <input
                type="text"
                value={form.coverUrl}
                onChange={(e) => setForm({ ...form, coverUrl: e.target.value })}
                className="input w-full"
                placeholder="https://..."
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-semibold mb-1">Mô tả</label>
              <textarea
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                className="input w-full h-24 resize-none"
                placeholder="Mô tả ngắn gọn về bộ sách..."
              />
            </div>
            <div className="md:col-span-2 flex gap-3">
              <button type="submit" className="btn-primary">
                {editingSeries ? "Cập nhật" : "Thêm mới"}
              </button>
              <button type="button" onClick={handleCloseForm} className="btn-outline">Hủy</button>
            </div>
          </form>
        </div>
      )}

      {/* Chi tiết bộ sách + quản lý sách trong bộ */}
      {selectedSeries && (
        <div className="card p-6 mb-6 border-2 border-accent-200 bg-accent-50/30">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-lg">
              📚 {selectedSeries.name}
              <span className="text-sm font-normal text-gray-500 ml-2">
                ({selectedSeries.books?.length || 0} cuốn)
              </span>
            </h3>
            <button onClick={handleCloseDetail} className="text-gray-500 hover:text-gray-700 text-xl">✕</button>
          </div>

          {/* Danh sách sách trong bộ */}
          {selectedSeries.books?.length > 0 ? (
            <div className="overflow-x-auto mb-6">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-200 bg-gray-50">
                    <th className="text-center p-3 font-semibold w-16">Thứ tự</th>
                    <th className="text-left p-3 font-semibold">Tên sách</th>
                    <th className="text-left p-3 font-semibold">Tác giả</th>
                    <th className="text-right p-3 font-semibold w-24">Hành động</th>
                  </tr>
                </thead>
                <tbody>
                  {selectedSeries.books.map((book) => (
                    <tr key={book.id} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="p-3 text-center font-mono">{book.seriesOrder || "—"}</td>
                      <td className="p-3 font-medium">{book.title}</td>
                      <td className="p-3 text-gray-600">
                        {book.authors?.map((a) => a.name).join(", ") || "—"}
                      </td>
                      <td className="p-3 text-right">
                        <button
                          onClick={() => handleRemoveBook(book.id)}
                          className="text-red-600 hover:text-red-800 font-medium text-sm"
                        >
                          Gỡ
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-gray-500 italic mb-6">Chưa có sách nào trong bộ.</p>
          )}

          {/* Tìm và thêm sách */}
          <div className="border-t border-gray-200 pt-4">
            <h4 className="font-semibold mb-3">Thêm sách vào bộ</h4>
            <div className="flex gap-3 mb-3 flex-wrap items-end">
              <div className="flex-1 min-w-[200px]">
                <label className="block text-sm font-medium mb-1">Tìm sách</label>
                <input
                  type="text"
                  value={bookSearch}
                  onChange={(e) => setBookSearch(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), handleBookSearch())}
                  className="input w-full"
                  placeholder="Nhập tên sách..."
                />
              </div>
              <div className="w-24">
                <label className="block text-sm font-medium mb-1">Thứ tự</label>
                <input
                  type="number"
                  value={addOrder}
                  onChange={(e) => setAddOrder(Number(e.target.value))}
                  className="input w-full"
                  min={0}
                />
              </div>
              <button
                onClick={handleBookSearch}
                className="btn-primary"
                disabled={bookSearchLoading}
              >
                {bookSearchLoading ? "Đang tìm..." : "Tìm"}
              </button>
            </div>
            {bookResults.length > 0 && (
              <div className="space-y-2 max-h-60 overflow-y-auto">
                {bookResults.map((book) => (
                  <div
                    key={book.id}
                    className="flex items-center justify-between p-3 bg-white rounded-lg border border-gray-200 hover:border-primary-300"
                  >
                    <div>
                      <span className="font-medium">{book.title}</span>
                      <span className="text-gray-500 text-sm ml-2">
                        {book.authors?.map((a) => a.name).join(", ")}
                      </span>
                    </div>
                    <button
                      onClick={() => handleAddBook(book.id)}
                      className="btn-primary text-sm px-3 py-1"
                    >
                      + Thêm
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Bảng danh sách bộ sách */}
      <div className="card p-6">
        <div className="flex flex-wrap gap-3 mb-6 items-center justify-between">
          <div className="flex gap-3 flex-1 flex-wrap">
            <input
              type="text"
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              placeholder="Tìm bộ sách..."
              className="input max-w-sm"
            />
            <button onClick={fetchSeries} className="btn-outline">Tải lại</button>
          </div>
          <button onClick={handleAdd} className="btn-primary">Thêm bộ sách</button>
        </div>

        {loading ? (
          <div className="flex justify-center py-12">
            <div className="spinner w-10 h-10"></div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200 bg-gray-50">
                  <th className="text-left p-3 font-semibold w-16">ID</th>
                  <th className="text-left p-3 font-semibold">Tên bộ sách</th>
                  <th className="text-left p-3 font-semibold">Mô tả</th>
                  <th className="text-center p-3 font-semibold">Số sách</th>
                  <th className="text-right p-3 font-semibold">Hành động</th>
                </tr>
              </thead>
              <tbody>
                {seriesList.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="text-center py-8 text-gray-500">
                      Chưa có bộ sách nào
                    </td>
                  </tr>
                ) : (
                  seriesList.map((s) => (
                    <tr key={s.id} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="p-3 text-gray-500">{s.id}</td>
                      <td className="p-3 font-semibold">{s.name}</td>
                      <td className="p-3 text-gray-600 max-w-xs truncate">
                        {s.description || <span className="italic text-gray-400">Chưa có mô tả</span>}
                      </td>
                      <td className="p-3 text-center">
                        <span className="bg-primary-100 text-primary-700 px-2 py-0.5 rounded-full text-xs font-semibold">
                          {s.bookCount || 0} cuốn
                        </span>
                      </td>
                      <td className="p-3 text-right">
                        <div className="flex gap-2 justify-end">
                          <button
                            onClick={() => handleViewDetail(s)}
                            className="text-primary-600 hover:text-primary-800 font-medium text-sm"
                          >
                            Quản lý sách
                          </button>
                          <button
                            onClick={() => handleEdit(s)}
                            className="text-blue-600 hover:text-blue-800 font-medium text-sm"
                          >
                            Sửa
                          </button>
                          <button
                            onClick={() => handleDelete(s.id)}
                            className="text-red-600 hover:text-red-800 font-medium text-sm"
                          >
                            Xóa
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
