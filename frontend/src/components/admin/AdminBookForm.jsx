import { useState, useRef } from "react";
import uploadApi from "../../api/uploadApi";

export default function AdminBookForm({ editingBook, bookForm, setBookForm, onSubmit, onClose }) {
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState(bookForm.coverUrl || "");
  const fileInputRef = useRef(null);

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Preview local
    setPreview(URL.createObjectURL(file));
    setUploading(true);

    try {
      const res = await uploadApi.uploadBookCover(file, editingBook?.id || "new");
      setBookForm({ ...bookForm, coverUrl: res.url });
    } catch (err) {
      alert(err.response?.data?.error || "Lỗi khi upload ảnh bìa");
      setPreview(bookForm.coverUrl || "");
    } finally {
      setUploading(false);
    }
  };

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
              <label className="block text-sm font-medium text-gray-900 mb-1">Ảnh bìa</label>
              <div className="flex items-center gap-4">
                {(preview || bookForm.coverUrl) && (
                  <img
                    src={preview || bookForm.coverUrl}
                    alt="Ảnh bìa"
                    className="w-20 h-28 object-cover rounded-lg border border-gray-200"
                  />
                )}
                <div className="flex-1">
                  <input
                    type="file"
                    ref={fileInputRef}
                    accept="image/jpeg,image/png,image/gif,image/webp"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploading}
                    className="btn-outline text-sm"
                  >
                    {uploading ? "Đang tải lên..." : preview || bookForm.coverUrl ? "Đổi ảnh bìa" : "Chọn ảnh bìa"}
                  </button>
                  {bookForm.coverUrl && (
                    <p className="text-xs text-green-600 mt-1">✓ Đã upload</p>
                  )}
                </div>
              </div>
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
