import axiosClient from './axiosClient';

const authorApi = {
  /** Tất cả tác giả - phân trang (PUBLIC) */
  getAll(params = {}) {
    return axiosClient.get('/authors', { params });
  },

  /** Tất cả tác giả - dạng List (PUBLIC, dùng cho dropdown) */
  getAllAsList() {
    return axiosClient.get('/authors/list');
  },

  /** Chi tiết tác giả (PUBLIC) */
  getById(id) {
    return axiosClient.get(`/authors/${id}`);
  },

  /** Tạo tác giả (ADMIN) */
  create(data) {
    return axiosClient.post('/authors', data);
  },

  /** Cập nhật tác giả (ADMIN) */
  update(id, data) {
    return axiosClient.put(`/authors/${id}`, data);
  },

  /** Xóa mềm tác giả (ADMIN) */
  delete(id) {
    return axiosClient.delete(`/authors/${id}`);
  },
};

export default authorApi;
