export default function AdminSubscriptionTable({
  plans,
  planLoading,
  onEdit,
  onDelete,
  onAdd,
  onRefresh,
}) {
  const formatPrice = (price) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(price);
  };

  return (
    <div>
      <div className="flex flex-wrap gap-3 mb-6 items-center justify-between">
        <button onClick={onRefresh} className="btn-outline">
          Tải lại
        </button>
        <button onClick={onAdd} className="btn-primary">
          Thêm gói mới
        </button>
      </div>

      {planLoading ? (
        <div className="flex justify-center py-12">
          <div className="spinner w-10 h-10"></div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {plans.map((plan) => (
            <div
              key={plan.id}
              className="card p-6 border border-gray-200 hover:border-primary-300 hover:shadow-lg transition-all"
            >
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="font-bold text-lg text-gray-900">{plan.name}</h3>
                  <p className="text-2xl font-black text-primary-600 mt-1">
                    {formatPrice(plan.price)}
                  </p>
                </div>
                <span className="bg-primary-100 text-primary-700 text-xs font-bold px-2 py-1 rounded-full">
                  {plan.durationDays} ngày
                </span>
              </div>

              <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                {plan.description || "Chưa có mô tả"}
              </p>

              <div className="flex items-center gap-2 text-sm text-gray-500 mb-4">
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                  />
                </svg>
                <span>Tối đa {plan.maxBorrowBooks} sách mượn</span>
              </div>

              <div className="flex gap-2 pt-3 border-t border-gray-100">
                <button
                  onClick={() => onEdit(plan)}
                  className="flex-1 text-sm px-3 py-2 rounded-lg bg-primary-50 hover:bg-primary-100 text-primary-600 font-semibold transition-all"
                >
                  Sửa
                </button>
                <button
                  onClick={() => onDelete(plan.id)}
                  className="flex-1 text-sm px-3 py-2 rounded-lg bg-danger-50 hover:bg-danger-100 text-danger-600 font-semibold transition-all"
                >
                  Xóa
                </button>
              </div>
            </div>
          ))}

          {plans.length === 0 && (
            <div className="col-span-full text-center py-10 text-gray-500">
              Chưa có gói thành viên nào
            </div>
          )}
        </div>
      )}
    </div>
  );
}
