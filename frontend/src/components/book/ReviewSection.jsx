import AvatarCircle from "../ui/AvatarCircle";

export default function ReviewSection({
  reviews,
  totalReviews,
  isAuthenticated,
  user,
  showReviewForm,
  setShowReviewForm,
  rating,
  setRating,
  comment,
  setComment,
  isSubmittingReview,
  onSubmitReview,
  onDeleteReview,
}) {
  return (
    <div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-100">
      <div className="flex justify-between items-center mb-8">
        <h2 className="text-2xl font-black text-gray-900 flex items-center gap-3">
          <div className="w-8 h-1 bg-gradient-to-r from-primary-500 to-accent-500 rounded-full"></div>
          Đánh giá từ độc giả
          <span className="text-lg font-semibold text-gray-500">({totalReviews})</span>
        </h2>
        {isAuthenticated && !showReviewForm && (
          <button
            onClick={() => setShowReviewForm(true)}
            className="px-6 py-3 bg-gradient-to-r from-primary-500 to-accent-500 text-white font-bold rounded-xl hover:shadow-lg hover:shadow-primary-500/30 transition-all duration-300 flex items-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Viết đánh giá
          </button>
        )}
      </div>

      {/* Review Form */}
      {showReviewForm && (
        <form onSubmit={onSubmitReview} className="bg-gradient-to-br from-gray-50 to-white rounded-2xl p-8 mb-8 border-2 border-primary-100 shadow-sm">
          <h3 className="text-xl font-black text-gray-900 mb-6">Chia sẻ cảm nhận của bạn</h3>

          <div className="mb-6">
            <label className="block text-sm font-bold text-gray-900 mb-3">Xếp hạng của bạn</label>
            <div className="flex gap-3">
              {Array.from({ length: 5 }).map((_, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => setRating(i + 1)}
                  className="p-2 hover:scale-125 transition-transform duration-200"
                >
                  <svg
                    className={`w-10 h-10 transition-colors ${
                      i < rating ? "text-accent-500 fill-current drop-shadow-lg" : "text-gray-300 fill-current"
                    }`}
                    viewBox="0 0 20 20"
                  >
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                </button>
              ))}
            </div>
          </div>

          <div className="mb-6">
            <label className="block text-sm font-bold text-gray-900 mb-3">Nhận xét của bạn</label>
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              rows={5}
              placeholder="Hãy chia sẻ suy nghĩ của bạn về cuốn sách này. Bạn thích điều gì? Có điều gì đặc biệt không?"
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-primary-500 focus:ring-4 focus:ring-primary-100 transition-all resize-none"
            />
          </div>

          <div className="flex gap-3 justify-end">
            <button
              type="button"
              onClick={() => setShowReviewForm(false)}
              className="px-6 py-3 bg-white border-2 border-gray-300 text-gray-700 font-bold rounded-xl hover:bg-gray-50 transition-all"
            >
              Hủy bỏ
            </button>
            <button
              type="submit"
              disabled={isSubmittingReview}
              className="px-8 py-3 bg-gradient-to-r from-primary-500 to-accent-500 text-white font-bold rounded-xl hover:shadow-lg hover:shadow-primary-500/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmittingReview ? "Đang gửi..." : "Gửi đánh giá"}
            </button>
          </div>
        </form>
      )}

      {/* Reviews List */}
      {reviews.length > 0 ? (
        <div className="space-y-6">
          {reviews.map((rev) => (
            <div key={rev.id} className="p-6 bg-gray-50 rounded-xl border border-gray-100 hover:border-primary-200 hover:shadow-md transition-all">
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center gap-4">
                  <AvatarCircle avatarUrl={rev.avatarUrl} username={rev.username} size="md" />
                  <div>
                    <p className="font-black text-gray-900 text-lg">{rev.username}</p>
                    <p className="text-sm text-gray-500">
                      {new Date(rev.createdAt).toLocaleDateString("vi-VN", { year: "numeric", month: "long", day: "numeric" })}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="flex gap-1">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <svg
                        key={i}
                        className={`w-5 h-5 ${i < rev.rating ? "text-accent-500 fill-current" : "text-gray-300 fill-current"}`}
                        viewBox="0 0 20 20"
                      >
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                    ))}
                  </div>
                  {user?.id === rev.userId && (
                    <button
                      onClick={() => onDeleteReview(rev.id)}
                      className="text-sm px-3 py-1.5 text-danger-600 hover:bg-danger-50 rounded-lg transition-all font-semibold"
                    >
                      Xóa
                    </button>
                  )}
                </div>
              </div>
              <p className="text-gray-700 leading-relaxed">{rev.comment}</p>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-16 bg-gradient-to-br from-gray-50 to-white rounded-2xl border-2 border-dashed border-gray-200">
          <div className="text-7xl mb-4">⭐</div>
          <h3 className="text-xl font-bold text-gray-900 mb-2">Chưa có đánh giá nào</h3>
          <p className="text-gray-600 mb-6">Hãy là người đầu tiên chia sẻ cảm nhận về cuốn sách này!</p>
          {isAuthenticated && !showReviewForm && (
            <button
              onClick={() => setShowReviewForm(true)}
              className="px-6 py-3 bg-gradient-to-r from-primary-500 to-accent-500 text-white font-bold rounded-xl hover:shadow-lg hover:shadow-primary-500/30 transition-all inline-flex items-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Viết đánh giá đầu tiên
            </button>
          )}
        </div>
      )}
    </div>
  );
}
