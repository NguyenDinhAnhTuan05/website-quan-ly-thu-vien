import axiosClient from './axiosClient';

const seriesApi = {
  /** Lấy tất cả bộ sách (PUBLIC) */
  getAllSeries() {
    return axiosClient.get('/series');
  },

  /** Chi tiết một bộ sách kèm danh sách sách (PUBLIC) */
  getSeriesById(id) {
    return axiosClient.get(`/series/${id}`);
  },
};

export default seriesApi;
