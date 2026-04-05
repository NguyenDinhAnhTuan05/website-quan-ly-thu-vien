export default function AdminAuthorForm({ editingAuthor, authorForm, setAuthorForm, onSubmit, onClose }) {
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
          <label className="block text-sm font-semibold mb-1">URL ảnh đại diện</label>
          <input
            type="text"
            value={authorForm.avatarUrl}
            onChange={(e) => setAuthorForm({ ...authorForm, avatarUrl: e.target.value })}
            className="input w-full"
            placeholder="https://example.com/avatar.jpg"
          />
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
