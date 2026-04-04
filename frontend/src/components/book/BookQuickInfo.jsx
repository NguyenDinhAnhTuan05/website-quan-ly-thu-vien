export default function BookQuickInfo({ book, categoryList }) {
  return (
    <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
      <h3 className="text-sm font-black text-gray-900 uppercase tracking-wide mb-4">Thông tin nhanh</h3>
      <div className="space-y-4">
        <InfoRow icon={categoryIcon} bgColor="bg-primary-100" iconColor="text-primary-600" label="Thể loại">
          <div className="flex flex-wrap gap-1.5">
            {categoryList.length > 0 ? categoryList.map((cat, idx) => (
              <span key={idx} className="text-xs px-2 py-1 rounded-md bg-primary-50 text-primary-700 font-semibold">
                {cat}
              </span>
            )) : <span className="text-sm text-gray-400">—</span>}
          </div>
        </InfoRow>

        <InfoRow icon={bookIcon} bgColor="bg-accent-100" iconColor="text-accent-600" label="Số trang">
          <p className="text-sm font-bold text-gray-900">{book.pageCount || "—"} trang</p>
        </InfoRow>

        <InfoRow icon={calendarIcon} bgColor="bg-blue-100" iconColor="text-blue-600" label="Xuất bản">
          <p className="text-sm font-bold text-gray-900">{book.publishedDate || "—"}</p>
        </InfoRow>

        <InfoRow icon={languageIcon} bgColor="bg-green-100" iconColor="text-green-600" label="Ngôn ngữ">
          <p className="text-sm font-bold text-gray-900 uppercase">{book.language || "VI"}</p>
        </InfoRow>

        {book.isbn && (
          <InfoRow icon={hashIcon} bgColor="bg-purple-100" iconColor="text-purple-600" label="ISBN">
            <p className="text-sm font-bold text-gray-900 font-mono">{book.isbn}</p>
          </InfoRow>
        )}
      </div>
    </div>
  );
}

function InfoRow({ icon, bgColor, iconColor, label, children }) {
  return (
    <div className="flex items-start gap-3">
      <div className={`w-8 h-8 rounded-lg ${bgColor} flex items-center justify-center flex-shrink-0`}>
        <svg className={`w-4 h-4 ${iconColor}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={icon} />
        </svg>
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-xs text-gray-500 mb-1">{label}</p>
        {children}
      </div>
    </div>
  );
}

const categoryIcon = "M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z";
const bookIcon = "M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253";
const calendarIcon = "M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z";
const languageIcon = "M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129";
const hashIcon = "M7 20l4-16m2 16l4-16M6 9h14M4 15h14";
