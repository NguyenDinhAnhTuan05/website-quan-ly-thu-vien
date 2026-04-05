import { useState } from "react";

export default function AdminAuthorTable({
  authors,
  authorLoading,
  authorKeyword,
  setAuthorKeyword,
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
            value={authorKeyword}
            onChange={(e) => setAuthorKeyword(e.target.value)}
            placeholder="Tìm tác giả..."
            className="input max-w-sm"
          />
          <button onClick={onRefresh} className="btn-outline">
            Tải lại
          </button>
        </div>
        <button onClick={onAdd} className="btn-primary">
          Thêm tác giả
        </button>
      </div>

      {authorLoading ? (
        <div className="flex justify-center py-12">
          <div className="spinner w-10 h-10"></div>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-50">
                <th className="text-left p-3 font-semibold w-16">Ảnh</th>
                <th className="text-left p-3 font-semibold">Tên tác giả</th>
                <th className="text-left p-3 font-semibold">Tiểu sử</th>
                <th className="text-center p-3 font-semibold">Ngày tạo</th>
                <th className="text-right p-3 font-semibold">Hành động</th>
              </tr>
            </thead>
            <tbody>
              {authors.map((a) => (
                <tr key={a.id} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="p-3">
                    {a.avatarUrl ? (
                      <img
                        src={a.avatarUrl}
                        alt={a.name}
                        className="w-10 h-10 rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary-400 to-accent-400 flex items-center justify-center">
                        <span className="text-white font-bold text-sm">
                          {a.name?.[0]?.toUpperCase()}
                        </span>
                      </div>
                    )}
                  </td>
                  <td className="p-3 font-medium text-gray-900">{a.name}</td>
                  <td className="p-3 text-gray-600 max-w-xs truncate">
                    {a.bio || "—"}
                  </td>
                  <td className="p-3 text-center text-gray-500 text-xs">
                    {a.createdAt
                      ? new Date(a.createdAt).toLocaleDateString("vi-VN")
                      : "—"}
                  </td>
                  <td className="p-3 text-right">
                    <div className="flex gap-2 justify-end">
                      <button
                        onClick={() => onEdit(a)}
                        className="text-sm px-3 py-1 rounded hover:bg-primary-50 text-primary-600"
                      >
                        Sửa
                      </button>
                      <button
                        onClick={() => onDelete(a.id)}
                        className="text-sm px-3 py-1 rounded hover:bg-danger-50 text-danger-500"
                      >
                        Xóa
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {authors.length === 0 && (
            <div className="text-center py-10 text-gray-500">
              Không có tác giả nào
            </div>
          )}
        </div>
      )}
    </div>
  );
}
