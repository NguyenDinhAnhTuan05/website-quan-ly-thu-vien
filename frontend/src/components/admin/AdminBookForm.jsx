export default function AdminBookForm({ editingBook, bookForm, setBookForm, onSubmit, onClose }) {
  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <h3 className="text-xl font-bold mb-4">{editingBook ? "Sửa sách" : "Thêm sách mới"}</h3>
          <form onSubmit={onSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-900 mb-1">Tên sách *</label>
              <input
                type="text"
                value={bookForm.title}
                onChange={(e) => setBookForm({ ...bookForm, title: e.target.value })}
                className="input"
                required
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-1">ISBN</label>
                <input
                  type="text"
                  value={bookForm.isbn}
                  onChange={(e) => setBookForm({ ...bookForm, isbn: e.target.value })}
                  className="input"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-1">Số lượng *</label>
                <input
                  type="number"
                  min={1}
                  value={bookForm.quantity}
                  onChange={(e) => setBookForm({ ...bookForm, quantity: parseInt(e.target.value) })}
                  className="input"
                  required
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-900 mb-1">URL ảnh bìa</label>
              <input
                type="text"
                value={bookForm.coverUrl}
                onChange={(e) => setBookForm({ ...bookForm, coverUrl: e.target.value })}
                className="input"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-900 mb-1">Ngày xuất bản</label>
              <input
                type="date"
                value={bookForm.publishedDate}
                onChange={(e) => setBookForm({ ...bookForm, publishedDate: e.target.value })}
                className="input"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-900 mb-1">Mô tả</label>
              <textarea
                value={bookForm.description}
                onChange={(e) => setBookForm({ ...bookForm, description: e.target.value })}
                rows={3}
                className="textarea"
              />
            </div>
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="available"
                checked={bookForm.available}
                onChange={(e) => setBookForm({ ...bookForm, available: e.target.checked })}
              />
              <label htmlFor="available" className="text-sm">
                Hiển thị cho người dùng
              </label>
            </div>
            <div className="flex gap-3 justify-end pt-2">
              <button type="button" onClick={onClose} className="btn-outline">
                Hủy
              </button>
              <button type="submit" className="btn-primary">
                Lưu
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
