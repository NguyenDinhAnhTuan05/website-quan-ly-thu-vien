export default function AdminBookTable({ books, bookLoading, onToggle, onEdit, onDelete }) {
  if (bookLoading) {
    return (
      <div className="flex justify-center py-12">
        <div className="spinner w-10 h-10"></div>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-gray-200 bg-gray-50">
            <th className="text-left p-3 font-semibold">Sách</th>
            <th className="text-center p-3 font-semibold">SL</th>
            <th className="text-center p-3 font-semibold">Còn lại</th>
            <th className="text-center p-3 font-semibold">Trạng thái</th>
            <th className="text-right p-3 font-semibold">Hành động</th>
          </tr>
        </thead>
        <tbody>
          {books.map((b) => (
            <tr key={b.id} className="border-b border-gray-100 hover:bg-gray-50">
              <td className="p-3">
                <p className="font-medium text-gray-900 line-clamp-1">{b.title}</p>
                <p className="text-xs text-gray-500">
                  {Array.isArray(b.authorNames)
                    ? b.authorNames.join(", ")
                    : [...(b.authorNames || [])].join(", ")}
                </p>
              </td>
              <td className="p-3 text-center text-gray-700">{b.quantity}</td>
              <td className="p-3 text-center">
                <span className={`font-medium ${b.availableQuantity > 0 ? "text-success-600" : "text-danger-600"}`}>
                  {b.availableQuantity}
                </span>
              </td>
              <td className="p-3 text-center">
                <span
                  className={`text-xs px-2 py-1 rounded-full ${
                    b.available ? "bg-success-100 text-success-700" : "bg-gray-100 text-gray-600"
                  }`}
                >
                  {b.available ? "Hiển thị" : "Ẩn"}
                </span>
              </td>
              <td className="p-3 text-right">
                <div className="flex gap-2 justify-end">
                  <button
                    onClick={() => onToggle(b.id)}
                    className="text-sm px-3 py-1 rounded hover:bg-gray-100"
                  >
                    {b.available ? "Ẩn" : "Hiện"}
                  </button>
                  <button onClick={() => onEdit(b)} className="text-sm px-3 py-1 rounded hover:bg-blue-50 text-blue-600">
                    Sửa
                  </button>
                  <button onClick={() => onDelete(b.id)} className="text-sm px-3 py-1 rounded hover:bg-danger-50 text-danger-600">
                    Xóa
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {books.length === 0 && <div className="text-center py-10 text-gray-500">Không có sách</div>}
    </div>
  );
}
