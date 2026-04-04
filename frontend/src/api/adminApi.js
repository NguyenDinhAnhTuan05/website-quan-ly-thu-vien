import axiosClient from './axiosClient';

const adminApi = {
  // ─── QUẢN LÝ SÁCH ──────────────────────────────────────────────────────────

  /** Danh sách sách cho Admin (có thể lọc keyword, phân trang) */
  getAllBooks(params = {}) {
    return axiosClient.get('/admin/books', { params });
  },

  /** Tạo sách mới */
  createBook(data) {
    return axiosClient.post('/admin/books', data);
  },

  /** Cập nhật sách */
  updateBook(id, data) {
    return axiosClient.put(`/admin/books/${id}`, data);
  },

  /** Bật / Tắt trạng thái sách */
  toggleBookStatus(id) {
    return axiosClient.patch(`/admin/books/${id}/toggle-status`);
  },

  /** Xóa mềm sách */
  deleteBook(id) {
    return axiosClient.delete(`/admin/books/${id}`);
  },

  /** Cào dữ liệu từ Google Books */
  crawlBooks(keyword = 'programming') {
    return axiosClient.post('/admin/books/crawl', null, { params: { keyword } });
  },

  // ─── QUẢN LÝ NGƯỜI DÙNG ────────────────────────────────────────────────────

  /** Danh sách người dùng (phân trang) */
  getAllUsers(params = {}) {
    return axiosClient.get('/admin/users', { params });
  },

  /** Tìm kiếm user theo email/username */
  searchUsers(keyword, params = {}) {
    return axiosClient.get('/admin/users/search', { params: { keyword, ...params } });
  },

  /** Chi tiết một user */
  getUserById(id) {
    return axiosClient.get(`/admin/users/${id}`);
  },

  /** Bật / Tắt tài khoản user */
  toggleUserStatus(id) {
    return axiosClient.patch(`/admin/users/${id}/toggle-status`);
  },

  /** Thay đổi vai trò user */
  changeUserRole(id, role) {
    return axiosClient.patch(`/admin/users/${id}/change-role`, { role });
  },

  /** Xóa mềm user */
  deleteUser(id) {
    return axiosClient.delete(`/admin/users/${id}`);
  },
};

export default adminApi;
