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
import ResetPasswordPage from "./pages/ResetPasswordPage";
import OAuth2CallbackPage from "./pages/OAuth2CallbackPage";
import UserDashboardPage from "./pages/UserDashboardPage";
import AdminDashboardPage from "./pages/AdminDashboardPage";
import AdminOverviewPage from "./pages/admin/AdminOverviewPage";
import AdminCategoryPage from "./pages/admin/AdminCategoryPage";
import AdminBookContentPage from "./pages/admin/AdminBookContentPage";
import AdminSeriesPage from "./pages/admin/AdminSeriesPage";
import SubscriptionPage from "./pages/SubscriptionPage";
import ProfilePage from "./pages/ProfilePage";
import BookReaderPage from "./pages/BookReaderPage";
import PaymentPage from "./pages/PaymentPage";
import CategoryPage from "./pages/CategoryPage";
import SeriesDetailPage from "./pages/SeriesDetailPage";
import LeaderboardPage from "./pages/LeaderboardPage";
import RewardShopPage from "./pages/RewardShopPage";
import NotFoundPage from "./pages/NotFoundPage";
import ForbiddenPage from "./pages/ForbiddenPage";
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

        {/* OAuth2 Callback — no layout needed */}
        <Route path="/oauth2/callback" element={<OAuth2CallbackPage />} />

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
                <Route path="/leaderboard" element={<LeaderboardPage />} />
                <Route
                  path="/rewards"
                  element={
                    <ProtectedRoute>
                      <RewardShopPage />
                    </ProtectedRoute>
                  }
                />
                <Route path="/login" element={<LoginPage />} />
                <Route path="/register" element={<RegisterPage />} />
                <Route path="/forgot-password" element={<ForgotPasswordPage />} />
                <Route path="/reset-password" element={<ResetPasswordPage />} />

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

                <Route path="/403" element={<ForbiddenPage />} />
                <Route path="*" element={<NotFoundPage />} />
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
                  <Route path="/authors" element={<AdminDashboardPage activeTab="authors" />} />
                  <Route path="/categories" element={<AdminCategoryPage />} />
                  <Route path="/series" element={<AdminSeriesPage />} />
                  <Route path="/content" element={<AdminBookContentPage />} />
                  <Route path="/subscriptions" element={<AdminDashboardPage activeTab="subscriptions" />} />
                </Routes>
              </AdminLayout>
            </ProtectedRoute>
          }
        />
      </Routes>
    </Router>
  );
}
