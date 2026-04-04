import { useState, useEffect } from "react";
import { useAuthStore } from "../store/index";
import Toast from "../components/ui/Toast";
import useToast from "../hooks/useToast";
import userApi from "../api/userApi";
import ProfileSidebar from "../components/profile/ProfileSidebar";
import ProfileInfoForm from "../components/profile/ProfileInfoForm";
import PasswordChangeForm from "../components/profile/PasswordChangeForm";

export default function ProfilePage() {
  const { user, updateProfile: storeUpdateProfile } = useAuthStore();
  const { toast, showToast } = useToast();

  const [username, setUsername] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");
  const [activeTab, setActiveTab] = useState("info");
  const [loadingSave, setLoadingSave] = useState(false);
  const [loadingPwd, setLoadingPwd] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  useEffect(() => {
    if (user) {
      setUsername(user.username || "");
      setAvatarUrl(user.avatarUrl || "");
    }
  }, [user]);

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    if (!username.trim()) {
      showToast("Tên người dùng không được để trống.", "error");
      return;
    }
    setLoadingSave(true);
    try {
      const updated = await userApi.updateProfile({ username: username.trim(), avatarUrl: avatarUrl.trim() });
      storeUpdateProfile(updated);
      showToast("Cập nhật hồ sơ thành công!");
    } catch (err) {
      showToast(err.response?.data?.message || "Cập nhật thất bại.", "error");
    } finally {
      setLoadingSave(false);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      showToast("Mật khẩu xác nhận không khớp.", "error");
      return;
    }
    if (newPassword.length < 6) {
      showToast("Mật khẩu mới phải ít nhất 6 ký tự.", "error");
      return;
    }
    setLoadingPwd(true);
    try {
      await userApi.changePassword({ currentPassword, newPassword });
      showToast("Đổi mật khẩu thành công!");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err) {
      showToast(err.response?.data?.message || "Đổi mật khẩu thất bại.", "error");
    } finally {
      setLoadingPwd(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Toast message={toast?.msg} type={toast?.type} />

      <div className="container-max px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Sidebar */}
          <div className="lg:col-span-4">
            <ProfileSidebar user={user} />
          </div>

          {/* Right Content */}
          <div className="lg:col-span-8">
            {/* Tab Navigation */}
            <div className="flex gap-3 mb-6">
              {[
                { key: "info", label: "Thông tin cá nhân" },
                { key: "password", label: "Bảo mật" },
              ].map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  className={`relative px-6 py-3 font-bold text-sm rounded-2xl transition-all ${
                    activeTab === tab.key
                      ? "bg-gray-900 text-white shadow-lg"
                      : "bg-white text-gray-600 hover:bg-gray-50 border-2 border-gray-200"
                  }`}
                >
                  {activeTab === tab.key && (
                    <div className="absolute inset-0 bg-gradient-to-r from-primary-500 to-accent-500 rounded-2xl blur-xl opacity-30"></div>
                  )}
                  <span className="relative">{tab.label}</span>
                </button>
              ))}
            </div>

            {activeTab === "info" && (
              <ProfileInfoForm
                user={user}
                username={username}
                setUsername={setUsername}
                avatarUrl={avatarUrl}
                setAvatarUrl={setAvatarUrl}
                loadingSave={loadingSave}
                onSave={handleSaveProfile}
                showToast={showToast}
              />
            )}

            {activeTab === "password" && (
              <PasswordChangeForm
                currentPassword={currentPassword}
                setCurrentPassword={setCurrentPassword}
                newPassword={newPassword}
                setNewPassword={setNewPassword}
                confirmPassword={confirmPassword}
                setConfirmPassword={setConfirmPassword}
                loadingPwd={loadingPwd}
                onSubmit={handleChangePassword}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
