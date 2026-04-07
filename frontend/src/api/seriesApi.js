import axiosClient from './axiosClient';

const seriesApi = {
  /** Lấy tất cả bộ sách (PUBLIC) */
  getAllSeries() {
    return axiosClient.get('/series');
  },

  /** Chi tiết một bộ sách kèm danh sách sách (PUBLIC) */
  getSeriesById(id) {
    return axiosClient.get(`/series/${id}`);
  },

  // ─── ADMIN ────────────────────────────────────────────────

  /** Lấy tất cả bộ sách cho Admin (bao gồm series rỗng) */
  adminGetAll() {
    return axiosClient.get('/admin/series');
  },

  /** Chi tiết bộ sách (Admin) */
  adminGetById(id) {
    return axiosClient.get(`/admin/series/${id}`);
  },

  /** Tạo bộ sách mới */
  adminCreate(data) {
    return axiosClient.post('/admin/series', data);
  },

  /** Cập nhật bộ sách */
  adminUpdate(id, data) {
    return axiosClient.put(`/admin/series/${id}`, data);
  },

  /** Xóa bộ sách */
  adminDelete(id) {
    return axiosClient.delete(`/admin/series/${id}`);
  },

  /** Thêm sách vào bộ sách */
  adminAddBook(seriesId, bookId, order = 0) {
    return axiosClient.post(`/admin/series/${seriesId}/books/${bookId}`, null, { params: { order } });
  },

  /** Xóa sách khỏi bộ sách */
  adminRemoveBook(seriesId, bookId) {
    return axiosClient.delete(`/admin/series/${seriesId}/books/${bookId}`);
  },
};

export default seriesApi;
