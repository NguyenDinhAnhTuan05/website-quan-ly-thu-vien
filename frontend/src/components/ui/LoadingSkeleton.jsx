export function BookCardSkeleton() {
  return (
    <div className="card animate-pulse">
      <div className="bg-gray-200 aspect-[3/4] rounded-t-xl"></div>
      <div className="p-5 space-y-3">
        <div className="h-4 bg-gray-200 rounded w-3/4"></div>
        <div className="h-3 bg-gray-200 rounded w-1/2"></div>
        <div className="h-8 bg-gray-200 rounded"></div>
      </div>
    </div>
  );
}

export function LoadingSpinner({ size = "md" }) {
  const sizeClasses = {
    sm: "w-4 h-4",
    md: "w-10 h-10",
    lg: "w-16 h-16",
  };

  return (
    <div className="flex justify-center items-center py-12">
      <div className={`spinner ${sizeClasses[size]}`}></div>
    </div>
  );
}

export function TableSkeleton({ rows = 5, cols = 5 }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b border-gray-200 bg-gray-50">
            {[...Array(cols)].map((_, i) => (
              <th key={i} className="p-3">
                <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {[...Array(rows)].map((_, rowIdx) => (
            <tr key={rowIdx} className="border-b border-gray-100">
              {[...Array(cols)].map((_, colIdx) => (
                <td key={colIdx} className="p-3">
                  <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
