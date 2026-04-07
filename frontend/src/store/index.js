import { create } from "zustand";
import authApi from "../api/authApi";
import userApi from "../api/userApi";

// --- Helper: build user object từ response của Spring Boot -----------------
const buildUser = (res) => ({
  id: res.userId ?? res.id,
  username: res.username,
  email: res.email,
  role: res.role,       // 'ROLE_USER' | 'ROLE_ADMIN' | 'ROLE_SUPER_ADMIN'
  avatarUrl: res.avatarUrl ?? null,
  points: res.points ?? 0,
  membershipTier: res.membershipTier ?? 'BRONZE',
  badge: res.badge ?? null,
});

/** Chỉ lưu token — KHÔNG lưu user data vào localStorage */
const saveTokensToStorage = (res) => {
  localStorage.setItem("accessToken", res.accessToken);
  if (res.refreshToken) localStorage.setItem("refreshToken", res.refreshToken);
};

const clearAuthStorage = () => {
  localStorage.removeItem("accessToken");
  localStorage.removeItem("refreshToken");
};

// --- Auth Store -------------------------------------------------------------
// User data CHỈ tồn tại trong memory (Zustand).
// Mỗi lần app load → fetch từ server qua GET /api/users/me.
// -------------------------------------------------------------------------
export const useAuthStore = create((set, get) => ({
  user: null,
  isAuthenticated: !!localStorage.getItem("accessToken"),
  isAuthVerified: !localStorage.getItem("accessToken"), // nếu không có token → đã verified (anonymous)
  isLoading: false,
  error: null,

  /**
   * Khởi tạo auth: lắng nghe logout event + fetch user từ server.
   * Gọi 1 lần khi app mount. Nếu có token → gọi GET /api/users/me
   * để lấy user data từ database. KHÔNG đọc user từ localStorage.
   */
  initAuth: async () => {
    // Lắng nghe sự kiện auth:logout từ axiosClient
    window.addEventListener("auth:logout", () => {
      clearAuthStorage();
      set({ user: null, isAuthenticated: false, isAuthVerified: true });
    });

    const token = localStorage.getItem("accessToken");
    if (!token) {
      set({ user: null, isAuthenticated: false, isAuthVerified: true });
      return;
    }

    // Có token → fetch user data thật từ server
    try {
      const serverUser = await userApi.getMe();
      set({ user: buildUser(serverUser), isAuthenticated: true, isAuthVerified: true });
    } catch {
      // Token không hợp lệ hoặc hết hạn → đăng xuất
      clearAuthStorage();
      set({ user: null, isAuthenticated: false, isAuthVerified: true });
    }
  },

  /** Đồng bộ user data từ server (gọi sau khi refresh token) */
  syncUserFromServer: async () => {
    try {
      const serverUser = await userApi.getMe();
      set({ user: buildUser(serverUser), isAuthenticated: true });
    } catch {
      // Nếu fetch thất bại, giữ nguyên state hiện tại
    }
  },

  /** Đăng nhập */
  login: async (email, password) => {
    set({ isLoading: true, error: null });
    try {
      const res = await authApi.login({ email, password });
      saveTokensToStorage(res);
      set({ user: buildUser(res), isAuthenticated: true, isAuthVerified: true, isLoading: false, error: null });
      return res;
    } catch (err) {
      const msg =
        err.response?.data?.message ||
        err.response?.data?.error ||
        "Đăng nhập thất bại. Kiểm tra email/mật khẩu.";
      set({ error: msg, isLoading: false });
      throw new Error(msg);
    }
  },

  /** Đăng ký */
  register: async (username, email, password) => {
    set({ isLoading: true, error: null });
    try {
      const res = await authApi.register({ username, email, password });
      saveTokensToStorage(res);
      set({ user: buildUser(res), isAuthenticated: true, isAuthVerified: true, isLoading: false, error: null });
      return res;
    } catch (err) {
      const msg =
        err.response?.data?.message ||
        err.response?.data?.error ||
        "Đăng ký thất bại. Vui lòng thử lại.";
      set({ error: msg, isLoading: false });
      throw new Error(msg);
    }
  },

  /** Đăng xuất */
  logout: () => {
    clearAuthStorage();
    set({ user: null, isAuthenticated: false, isAuthVerified: true, error: null });
  },

  /** Cập nhật thông tin hồ sơ sau khi PUT /api/users/me thành công */
  updateProfile: (updatedUser) => {
    set({ user: buildUser(updatedUser) });
  },
  clearError: () => set({ error: null }),
}));
