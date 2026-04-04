import axiosClient from './axiosClient';

const paymentApi = {
  /** Lấy ảnh QR chuyển khoản SePay */
  getSePayQR(amount, orderInfo) {
    return axiosClient.get(`/payment/sepay-qr?amount=${amount}&orderInfo=${orderInfo}`);
  },

  /** Kiểm tra giao dịch SePay đã nhận tiền chưa */
  verifySePayTransaction(amount, orderInfo) {
    return axiosClient.get(`/payment/sepay-verify?amount=${amount}&orderInfo=${orderInfo}`);
  },

  /** Tạo URL thanh toán VNPay */
  createVNPayUrl(amount, orderInfo) {
    return axiosClient.post(`/payment/vnpay-create?amount=${amount}&orderInfo=${orderInfo}`);
  },
};

export default paymentApi;
