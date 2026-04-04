import axiosClient from './axiosClient';

const reviewApi = {
  /** Lấy danh sách đánh giá của sách (PUBLIC) */
  getReviews(bookId, params = {}) {
    return axiosClient.get(`/books/${bookId}/reviews`, { params });
  },

  /** Thêm hoặc cập nhật đánh giá (cần đăng nhập) */
  addOrUpdateReview(bookId, data) {
    return axiosClient.post(`/books/${bookId}/reviews`, data);
  },

  /** Xóa đánh giá (chủ sở hữu) */
  deleteReview(bookId, reviewId) {
    return axiosClient.delete(`/books/${bookId}/reviews/${reviewId}`);
  },
};

export default reviewApi;
