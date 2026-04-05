import axiosClient from './axiosClient';

const subscriptionApi = {
  /** Lấy danh sách tất cả gói subscription */
  getAllPlans() {
    return axiosClient.get('/subscriptions/plans');
  },

  /** Lấy gói đang active của user hiện tại (server lấy userId từ JWT) */
  getMySubscription() {
    return axiosClient.get('/subscriptions/my-subscription');
  },

  /** 
   * Kích hoạt gói subscription cho user
   * payload: { userId, planId, paymentRef }
   */
  activate(payload) {
    return axiosClient.post('/subscriptions/activate', payload);
  },

  /** Tạo gói mới (ADMIN) */
  createPlan(data) {
    return axiosClient.post('/subscriptions/plans', data);
  },

  /** Cập nhật gói (ADMIN) */
  updatePlan(id, data) {
    return axiosClient.put(`/subscriptions/plans/${id}`, data);
  },

  /** Xóa gói (ADMIN) */
  deletePlan(id) {
    return axiosClient.delete(`/subscriptions/plans/${id}`);
  },

  /** Lấy danh sách tất cả user subscriptions (ADMIN) */
  getAllUserSubscriptions(params = {}) {
    return axiosClient.get('/subscriptions/admin/user-subscriptions', { params });
  },
};

export default subscriptionApi;
