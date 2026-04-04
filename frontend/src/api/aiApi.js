import axiosClient from './axiosClient';

const aiApi = {
  /** Chat với AI tư vấn mượn sách */
  chat(message) {
    return axiosClient.post('/ai-assistant/chat', { message });
  },
};

export default aiApi;
