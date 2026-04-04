import axiosClient from './axiosClient';

const userApi = {
  getMe() {
    return axiosClient.get('/users/me');
  },

  updateProfile(data) {
    // data: { username, avatarUrl }
    return axiosClient.put('/users/me', data);
  },

  changePassword(data) {
    // data: { currentPassword, newPassword }
    return axiosClient.put('/users/me/password', data);
  },
};

export default userApi;
