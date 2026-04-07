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

  uploadBookCover: async (file, bookId = "new") => {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("bookId", bookId);

    return await axiosClient.post("/upload/book-cover", formData, {
      headers: {
        "Content-Type": undefined,
      },
    });
  },

  uploadAuthorAvatar: async (file, authorId = "new") => {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("authorId", authorId);

    return await axiosClient.post("/upload/author-avatar", formData, {
      headers: {
        "Content-Type": undefined,
      },
    });
  },
};

export default uploadApi;
