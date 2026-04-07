export default function AdminCategoryTable({
  categories,
  loading,
  keyword,
  setKeyword,
  onRefresh,
  onEdit,
  onDelete,
  onAdd,
}) {
  return (
    <div>
      <div className="flex flex-wrap gap-3 mb-6 items-center justify-between">
        <div className="flex gap-3 flex-1 flex-wrap">
          <input
            type="text"
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            placeholder="Tìm thể loại..."
            className="input max-w-sm"
          />
          <button onClick={onRefresh} className="btn-outline">
            Tải lại
          </button>
        </div>
        <button onClick={onAdd} className="btn-primary">
          Thêm thể loại
        </button>
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
                <th className="text-left p-3 font-semibold">Tên thể loại</th>
                <th className="text-left p-3 font-semibold">Mô tả</th>
                <th className="text-center p-3 font-semibold">Ngày tạo</th>
                <th className="text-right p-3 font-semibold">Hành động</th>
              </tr>
            </thead>
            <tbody>
              {categories.length === 0 ? (
                <tr>
                  <td colSpan={5} className="text-center py-8 text-gray-500">
                    Không có thể loại nào
                  </td>
                </tr>
              ) : (
                categories.map((cat) => (
                  <tr key={cat.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="p-3 text-gray-500">{cat.id}</td>
                    <td className="p-3 font-semibold">{cat.name}</td>
                    <td className="p-3 text-gray-600 max-w-xs truncate">
                      {cat.description || <span className="italic text-gray-400">Chưa có mô tả</span>}
                    </td>
                    <td className="p-3 text-center text-gray-500">
                      {cat.createdAt
                        ? new Date(cat.createdAt).toLocaleDateString("vi-VN")
                        : "—"}
                    </td>
                    <td className="p-3 text-right">
                      <div className="flex gap-2 justify-end">
                        <button
                          onClick={() => onEdit(cat)}
                          className="text-blue-600 hover:text-blue-800 font-medium text-sm"
                        >
                          Sửa
                        </button>
                        <button
                          onClick={() => onDelete(cat.id)}
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
  );
}
