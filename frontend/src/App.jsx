import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { useEffect } from "react";
import PublicLayout from "./layouts/PublicLayout";
import AdminLayout from "./layouts/AdminLayout";
import ProtectedRoute from "./components/ProtectedRoute";
import HomePage from "./pages/HomePage";
import BookCatalogPage from "./pages/BookCatalogPage";
import BookDetailPage from "./pages/BookDetailPage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import ForgotPasswordPage from "./pages/ForgotPasswordPage";
import UserDashboardPage from "./pages/UserDashboardPage";
import AdminDashboardPage from "./pages/AdminDashboardPage";
import AdminOverviewPage from "./pages/admin/AdminOverviewPage";
import SubscriptionPage from "./pages/SubscriptionPage";
import ProfilePage from "./pages/ProfilePage";
import BookReaderPage from "./pages/BookReaderPage";
import PaymentPage from "./pages/PaymentPage";
import CategoryPage from "./pages/CategoryPage";
import SeriesDetailPage from "./pages/SeriesDetailPage";
import { useAuthStore } from "./store/index";

export default function App() {
  const { initAuth } = useAuthStore();

  useEffect(() => {
    initAuth();
  }, []);

  return (
    <Router>
      <Routes>
        {/* Book Reader — full-screen, no nav/footer */}
        <Route path="/books/:id/read" element={<BookReaderPage />} />

        {/* Public Routes with Navigation & Footer */}
        <Route
          path="/*"
          element={
            <PublicLayout>
              <Routes>
                <Route path="/" element={<HomePage />} />
                <Route path="/book" element={<BookCatalogPage />} />
                <Route path="/books/:id" element={<BookDetailPage />} />
                <Route path="/categories" element={<CategoryPage />} />
                <Route path="/series/:id" element={<SeriesDetailPage />} />
                <Route path="/login" element={<LoginPage />} />
                <Route path="/register" element={<RegisterPage />} />
                <Route path="/forgot-password" element={<ForgotPasswordPage />} />

                <Route
                  path="/dashboard"
                  element={
                    <ProtectedRoute>
                      <UserDashboardPage />
                    </ProtectedRoute>
                  }
                />

                <Route
                  path="/subscription"
                  element={
                    <ProtectedRoute>
                      <SubscriptionPage />
                    </ProtectedRoute>
                  }
                />

                <Route
                  path="/payment"
                  element={
                    <ProtectedRoute>
                      <PaymentPage />
                    </ProtectedRoute>
                  }
                />

                <Route
                  path="/profile"
                  element={
                    <ProtectedRoute>
                      <ProfilePage />
                    </ProtectedRoute>
                  }
                />

                <Route
                  path="*"
                  element={
                    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
                      <div className="text-6xl mb-4">🔍</div>
                      <h1 className="heading-2 mb-2">Trang không tồn tại</h1>
                      <p className="text-gray-600 mb-6">Đường dẫn bạn truy cập không tồn tại.</p>
                      <a href="/" className="btn-primary">
                        Về trang chủ
                      </a>
                    </div>
                  }
                />
              </Routes>
            </PublicLayout>
          }
        />

        {/* Admin Routes with Sidebar Layout */}
        <Route
          path="/admin/*"
          element={
            <ProtectedRoute roles={["ROLE_ADMIN", "ROLE_SUPER_ADMIN"]}>
              <AdminLayout>
                <Routes>
                  <Route path="/" element={<AdminOverviewPage />} />
                  <Route path="/books" element={<AdminDashboardPage activeTab="books" />} />
                  <Route path="/borrows" element={<AdminDashboardPage activeTab="borrows" />} />
                  <Route path="/users" element={<AdminDashboardPage activeTab="users" />} />
                </Routes>
              </AdminLayout>
            </ProtectedRoute>
          }
        />
      </Routes>
    </Router>
  );
}
