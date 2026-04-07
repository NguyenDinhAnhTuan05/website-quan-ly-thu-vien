export default function AdminCategoryForm({ editingCategory, categoryForm, setCategoryForm, onSubmit, onClose }) {
  return (
    <div className="card p-6 mb-6 border-2 border-primary-200 bg-primary-50/30">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-bold text-lg">
          {editingCategory ? "Sửa thể loại" : "Thêm thể loại mới"}
        </h3>
        <button onClick={onClose} className="text-gray-500 hover:text-gray-700 text-xl">
          ✕
        </button>
      </div>
      <form onSubmit={onSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="md:col-span-2">
          <label className="block text-sm font-semibold mb-1">Tên thể loại *</label>
          <input
            type="text"
            value={categoryForm.name}
            onChange={(e) => setCategoryForm({ ...categoryForm, name: e.target.value })}
            className="input w-full"
            required
            maxLength={100}
            placeholder="Ví dụ: Tiểu thuyết, Khoa học..."
          />
        </div>
        <div className="md:col-span-2">
          <label className="block text-sm font-semibold mb-1">Mô tả</label>
          <textarea
            value={categoryForm.description}
            onChange={(e) => setCategoryForm({ ...categoryForm, description: e.target.value })}
            className="input w-full h-24 resize-none"
            maxLength={1000}
            placeholder="Mô tả ngắn gọn về thể loại..."
          />
        </div>
        <div className="md:col-span-2 flex gap-3">
          <button type="submit" className="btn-primary">
            {editingCategory ? "Cập nhật" : "Thêm mới"}
          </button>
          <button type="button" onClick={onClose} className="btn-outline">
            Hủy
          </button>
        </div>
      </form>
    </div>
  );
}
