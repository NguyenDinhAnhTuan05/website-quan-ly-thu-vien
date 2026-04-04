import axiosClient from './axiosClient';

const authApi = {
  login(data) {
    return axiosClient.post('/auth/login', data);
  },

  register(data) {
    return axiosClient.post('/auth/register', data);
  },

  refreshToken(refreshToken) {
    return axiosClient.post('/auth/refresh', { refreshToken });
  },

  forgotPassword(data) {
    return axiosClient.post('/auth/forgot-password', data);
  },

  resetPassword(data) {
    return axiosClient.post('/auth/reset-password', data);
  },
};

export default authApi;
