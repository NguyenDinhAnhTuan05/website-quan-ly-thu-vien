import { useState, useRef } from "react";
import uploadApi from "../../api/uploadApi";

export default function AdminAuthorForm({ editingAuthor, authorForm, setAuthorForm, onSubmit, onClose }) {
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState(authorForm.avatarUrl || "");
  const fileInputRef = useRef(null);

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setPreview(URL.createObjectURL(file));
    setUploading(true);

    try {
      const res = await uploadApi.uploadAuthorAvatar(file, editingAuthor?.id || "new");
      setAuthorForm({ ...authorForm, avatarUrl: res.url });
    } catch (err) {
      alert(err.response?.data?.error || "Lỗi khi upload ảnh đại diện");
      setPreview(authorForm.avatarUrl || "");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="card p-6 mb-6 border-2 border-primary-200 bg-primary-50/30">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-bold text-lg">
          {editingAuthor ? "Sửa tác giả" : "Thêm tác giả mới"}
        </h3>
        <button onClick={onClose} className="text-gray-500 hover:text-gray-700 text-xl">
          ✕
        </button>
      </div>
      <form onSubmit={onSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-semibold mb-1">Tên tác giả *</label>
          <input
            type="text"
            value={authorForm.name}
            onChange={(e) => setAuthorForm({ ...authorForm, name: e.target.value })}
            className="input w-full"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-semibold mb-1">Ảnh đại diện</label>
          <div className="flex items-center gap-3">
            {(preview || authorForm.avatarUrl) && (
              <img
                src={preview || authorForm.avatarUrl}
                alt="Avatar"
                className="w-14 h-14 object-cover rounded-full border border-gray-200"
              />
            )}
            <div>
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
                {uploading ? "Đang tải lên..." : preview || authorForm.avatarUrl ? "Đổi ảnh" : "Chọn ảnh"}
              </button>
              {authorForm.avatarUrl && (
                <p className="text-xs text-green-600 mt-1">✓ Đã upload</p>
              )}
            </div>
          </div>
        </div>
        <div className="md:col-span-2">
          <label className="block text-sm font-semibold mb-1">Tiểu sử</label>
          <textarea
            value={authorForm.bio}
            onChange={(e) => setAuthorForm({ ...authorForm, bio: e.target.value })}
            className="input w-full h-24 resize-none"
            placeholder="Thông tin về tác giả..."
          />
        </div>
        <div className="md:col-span-2 flex gap-3">
          <button type="submit" className="btn-primary">
            {editingAuthor ? "Cập nhật" : "Thêm mới"}
          </button>
          <button type="button" onClick={onClose} className="btn-outline">
            Hủy
          </button>
        </div>
      </form>
    </div>
  );
}
