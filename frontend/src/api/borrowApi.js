import axiosClient from './axiosClient';

const borrowApi = {
  /** User tạo phiếu mượn — body: { bookIds: [1,2,...], note: '' } */
  createBorrow(data) {
    return axiosClient.post('/borrows', data);
  },

  /** Lịch sử mượn của tôi (phân trang) */
  getMyHistory(params = {}) {
    return axiosClient.get('/borrows/my-history', { params });
  },

  /** User tự hủy phiếu (chỉ khi PENDING) */
  cancelBorrow(id) {
    return axiosClient.post(`/borrows/${id}/cancel`);
  },

  // ── ADMIN ────────────────────────────────────────────────────────────────

  /** Admin lấy tất cả phiếu, có thể lọc theo status */
  getAllBorrows(params = {}) {
    return axiosClient.get('/borrows', { params });
  },

  /** Admin duyệt phiếu PENDING → BORROWING */
  approveBorrow(id) {
    return axiosClient.post(`/borrows/${id}/approve`);
  },

  /** Admin xác nhận khi user trả sách */
  returnBorrow(id) {
    return axiosClient.post(`/borrows/${id}/return`);
  },

  /** Admin từ chối phiếu mượn */
  rejectBorrow(id, reason = '') {
    return axiosClient.post(`/borrows/${id}/reject`, null, {
      params: reason ? { reason } : {},
    });
  },
};

export default borrowApi;
