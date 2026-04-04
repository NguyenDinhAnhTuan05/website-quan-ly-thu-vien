import axiosClient from './axiosClient';

const categoryApi = {
  /** Tất cả thể loại - phân trang (PUBLIC) */
  getAll(params = {}) {
    return axiosClient.get('/categories', { params });
  },

  /** Tất cả thể loại - dạng List (PUBLIC, dùng cho select/dropdown) */
  getAllAsList() {
    return axiosClient.get('/categories/list');
  },

  /** Chi tiết thể loại (PUBLIC) */
  getById(id) {
    return axiosClient.get(`/categories/${id}`);
  },

  /** Tạo thể loại (ADMIN) */
  create(data) {
    return axiosClient.post('/categories', data);
  },

  /** Cập nhật thể loại (ADMIN) */
  update(id, data) {
    return axiosClient.put(`/categories/${id}`, data);
  },

  /** Xóa mềm thể loại (ADMIN) */
  delete(id) {
    return axiosClient.delete(`/categories/${id}`);
  },
};

export default categoryApi;
