import axiosClient from './axiosClient';

const bookApi = {
  /**
   * Tìm kiếm và phân trang sách (PUBLIC)
   * Params: title, isbn, categoryId, authorId, available, borrowableOnly, sortBy, sortDir, page, size
   */
  getBooks(params = {}) {
    return axiosClient.get('/books', { params });
  },

  /** Chi tiết một cuốn sách (PUBLIC) */
  getBookById(id) {
    return axiosClient.get(`/books/${id}`);
  },

  /** Sách phổ biến (Redis cached) */
  getPopularBooks(limit = 10) {
    return axiosClient.get('/books/popular', { params: { limit } });
  },

  /** Đọc nội dung sách (YÊU CẦU ĐĂNG NHẬP + SUBSCRIPTION) */
  readBookContent(id) {
    return axiosClient.get(`/books/${id}/read`);
  },
};

export default bookApi;
