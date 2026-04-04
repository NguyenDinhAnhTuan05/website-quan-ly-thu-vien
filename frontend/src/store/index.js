import { create } from "zustand";
import authApi from "../api/authApi";

// --- Helper: build user object t? AuthResponse c?a Spring Boot -------------
const buildUser = (res) => ({
  id: res.userId ?? res.id,
  username: res.username,
  email: res.email,
  role: res.role,       // 'ROLE_USER' | 'ROLE_ADMIN' | 'ROLE_SUPER_ADMIN'
  avatarUrl: res.avatarUrl ?? null,
  points: res.points ?? 0,
  membershipTier: res.membershipTier ?? 'BASIC',
});

const saveAuthToStorage = (res) => {
  localStorage.setItem("accessToken", res.accessToken);
  if (res.refreshToken) localStorage.setItem("refreshToken", res.refreshToken);
  localStorage.setItem("user", JSON.stringify(buildUser(res)));
};

const clearAuthStorage = () => {
  localStorage.removeItem("accessToken");
  localStorage.removeItem("refreshToken");
  localStorage.removeItem("user");
};

// -- Đọc trạng thái auth từ localStorage ngay khi khởi tạo store (đồng bộ) --
const getInitialAuth = () => {
  try {
    const token = localStorage.getItem("accessToken");
    const userStr = localStorage.getItem("user");
    if (token && userStr) {
      return { user: JSON.parse(userStr), isAuthenticated: true };
    }
  } catch {
    clearAuthStorage();
  }
  return { user: null, isAuthenticated: false };
};

// --- Auth Store -------------------------------------------------------------
export const useAuthStore = create((set) => ({
  ...getInitialAuth(),
  isLoading: false,
  error: null,

  /** Đăng ký lắng nghe sự kiện auth:logout (gọi 1 lần khi app mount) */
  initAuth: () => {
    window.addEventListener("auth:logout", () => {
      set({ user: null, isAuthenticated: false });
    });
  },

  /** �ang nh?p */
  login: async (email, password) => {
    set({ isLoading: true, error: null });
    try {
      // axiosClient d� strip response.data ? res l� AuthResponse tr?c ti?p
      const res = await authApi.login({ email, password });
      saveAuthToStorage(res);
      set({ user: buildUser(res), isAuthenticated: true, isLoading: false, error: null });
      return res;
    } catch (err) {
      const msg =
        err.response?.data?.message ||
        err.response?.data?.error ||
        "�ang nh?p th?t b?i. Ki?m tra email/m?t kh?u.";
      set({ error: msg, isLoading: false });
      throw new Error(msg);
    }
  },

  /** �ang k� */
  register: async (username, email, password) => {
    set({ isLoading: true, error: null });
    try {
      const res = await authApi.register({ username, email, password });
      saveAuthToStorage(res);
      set({ user: buildUser(res), isAuthenticated: true, isLoading: false, error: null });
      return res;
    } catch (err) {
      const msg =
        err.response?.data?.message ||
        err.response?.data?.error ||
        "�ang k� th?t b?i. Vui l�ng th? l?i.";
      set({ error: msg, isLoading: false });
      throw new Error(msg);
    }
  },

  /** �ang xu?t */
  logout: () => {
    clearAuthStorage();
    set({ user: null, isAuthenticated: false, error: null });
  },
  /** Cập nhật thông tin hồ sơ sau khi PUT /api/users/me thành công */
  updateProfile: (updatedUser) => {
    const merged = buildUser(updatedUser);
    localStorage.setItem("user", JSON.stringify(merged));
    set({ user: merged });
  },
  clearError: () => set({ error: null }),
}));
