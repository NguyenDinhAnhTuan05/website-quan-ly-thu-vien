import axiosClient from './axiosClient';

const subscriptionApi = {
  /** Lấy danh sách tất cả gói subscription */
  getAllPlans() {
    return axiosClient.get('/subscriptions/plans');
  },

  /** 
   * Kích hoạt gói subscription cho user
   * payload: { userId, planId, paymentRef }
   */
  activate(payload) {
    return axiosClient.post('/subscriptions/activate', payload);
  },
};

export default subscriptionApi;
