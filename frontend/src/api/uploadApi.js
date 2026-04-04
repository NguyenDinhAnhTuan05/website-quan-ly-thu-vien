import axiosClient from "./axiosClient";

const uploadApi = {
  uploadAvatar: async (file) => {
    const formData = new FormData();
    formData.append("file", file);

    // axiosClient interceptor already unwraps response.data, so just return directly
    return await axiosClient.post("/upload/avatar", formData, {
      headers: {
        "Content-Type": undefined,
      },
    });
  },
};

export default uploadApi;
