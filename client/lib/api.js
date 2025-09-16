import axios from "axios";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5002/api";

export const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: false,
});

api.interceptors.request.use((config) => {
  if (typeof window !== "undefined") {
    const token = window.localStorage.getItem("auth_token");
    if (token) {
      config.headers = config.headers || {};
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const message = error?.response?.data?.message || error.message;
    return Promise.reject(new Error(message));
  }
);

export default api;

export const communityApi = {
  listPosts: async (params = {}) => {
    const res = await api.get("/community/posts", { params });
    return res.data;
  },
  searchPosts: async (params = {}) => {
    const res = await api.get("/community/posts/search", { params });
    return res.data;
  },
  getPost: async (id) => {
    const res = await api.get(`/community/posts/${id}`);
    return res.data;
  },
  createPost: async (payload) => {
    const res = await api.post("/community/posts", payload);
    return res.data;
  },
  addComment: async (id, payload) => {
    const res = await api.post(`/community/posts/${id}/comments`, payload);
    return res.data;
  },
  addReply: async (postId, commentId, payload) => {
    const res = await api.post(`/community/posts/${postId}/comments/${commentId}/replies`, payload);
    return res.data;
  },
};
