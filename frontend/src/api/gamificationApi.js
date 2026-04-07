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
  // Rewards
  getRewards: () => {
    return axiosClient.get('/gamification/rewards');
  },
  redeemReward: (rewardId) => {
    return axiosClient.post('/gamification/redeem', { rewardId });
  },
  getRedemptionHistory: () => {
    return axiosClient.get('/gamification/redemption-history');
  },
  // Leaderboard
  getLeaderboard: () => {
    return axiosClient.get('/gamification/leaderboard');
  },
};

export default gamificationApi;
