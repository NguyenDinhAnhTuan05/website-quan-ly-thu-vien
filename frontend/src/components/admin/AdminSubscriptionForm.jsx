export default function AdminSubscriptionForm({ editingPlan, planForm, setPlanForm, onSubmit, onClose }) {
  return (
    <div className="card p-6 mb-6 border-2 border-primary-200 bg-primary-50/30">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-bold text-lg">
          {editingPlan ? "Sửa gói thành viên" : "Thêm gói thành viên mới"}
        </h3>
        <button onClick={onClose} className="text-gray-500 hover:text-gray-700 text-xl">
          ✕
        </button>
      </div>
      <form onSubmit={onSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-semibold mb-1">Tên gói *</label>
          <input
            type="text"
            value={planForm.name}
            onChange={(e) => setPlanForm({ ...planForm, name: e.target.value })}
            className="input w-full"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-semibold mb-1">Giá (VNĐ) *</label>
          <input
            type="number"
            value={planForm.price}
            onChange={(e) => setPlanForm({ ...planForm, price: e.target.value })}
            className="input w-full"
            min="0"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-semibold mb-1">Thời hạn (ngày) *</label>
          <input
            type="number"
            value={planForm.durationDays}
            onChange={(e) => setPlanForm({ ...planForm, durationDays: parseInt(e.target.value) || 0 })}
            className="input w-full"
            min="1"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-semibold mb-1">Số sách mượn tối đa *</label>
          <input
            type="number"
            value={planForm.maxBorrowBooks}
            onChange={(e) => setPlanForm({ ...planForm, maxBorrowBooks: parseInt(e.target.value) || 1 })}
            className="input w-full"
            min="1"
            required
          />
        </div>
        <div className="md:col-span-2">
          <label className="block text-sm font-semibold mb-1">Mô tả</label>
          <textarea
            value={planForm.description}
            onChange={(e) => setPlanForm({ ...planForm, description: e.target.value })}
            className="input w-full h-24 resize-none"
            placeholder="Mô tả chi tiết gói thành viên..."
          />
        </div>
        <div className="md:col-span-2 flex gap-3">
          <button type="submit" className="btn-primary">
            {editingPlan ? "Cập nhật" : "Thêm mới"}
          </button>
          <button type="button" onClick={onClose} className="btn-outline">
            Hủy
          </button>
        </div>
      </form>
    </div>
  );
}
