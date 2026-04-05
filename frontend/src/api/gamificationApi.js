import axiosClient from './axiosClient';

const gamificationApi = {
  getSummary: () => {
    return axiosClient.get('/gamification/summary');
  },
  getMissions: () => {
    return axiosClient.get('/gamification/missions');
  },
  getTransactions: () => {
    return axiosClient.get('/gamification/transactions');
  },
  dailyCheckIn: () => {
    return axiosClient.post('/gamification/daily-check-in');
  },
};

export default gamificationApi;
