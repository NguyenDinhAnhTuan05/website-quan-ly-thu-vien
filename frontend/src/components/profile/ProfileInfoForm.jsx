import { useRef, useState } from "react";

export default function ProfileInfoForm({
  user,
  username,
  setUsername,
  avatarUrl,
  setAvatarUrl,
  loadingSave,
  onSave,
  showToast,
}) {
  const fileInputRef = useRef(null);
  const [avatarFile, setAvatarFile] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState(user?.avatarUrl || "");
  const [uploadingAvatar, setUploadingAvatar] = useState(false);

  const handleFileSelect = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      showToast("Vui lòng chọn file ảnh", "error");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      showToast("File không được vượt quá 5MB", "error");
      return;
    }
    setAvatarFile(file);
    const reader = new FileReader();
    reader.onloadend = () => setAvatarPreview(reader.result);
    reader.readAsDataURL(file);
  };

  const handleUploadAvatar = async () => {
    if (!avatarFile) {
      showToast("Vui lòng chọn ảnh trước", "error");
      return;
    }
    setUploadingAvatar(true);
    try {
      const { default: uploadApi } = await import("../../api/uploadApi");
      const result = await uploadApi.uploadAvatar(avatarFile);
      const fullUrl = `${window.location.origin}${result.url}`;
      setAvatarUrl(fullUrl);
      setAvatarFile(null);
      showToast("Upload ảnh thành công!");
    } catch (err) {
      showToast(err.response?.data?.error || "Upload thất bại", "error");
    } finally {
      setUploadingAvatar(false);
    }
  };

  return (
    <div className="bg-white rounded-3xl p-8 shadow-lg border-2 border-gray-100">
      <div className="flex items-center gap-3 mb-8">
        <div className="w-12 h-12 bg-gray-900 rounded-2xl flex items-center justify-center">
          <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
          </svg>
        </div>
        <div>
          <h3 className="text-xl font-black text-gray-900">Chỉnh sửa hồ sơ</h3>
          <p className="text-sm text-gray-500">Cập nhật thông tin cá nhân của bạn</p>
        </div>
      </div>

      <form onSubmit={onSave} className="space-y-6">
        {/* Email - Read Only */}
        <div>
          <label className="block text-xs font-black text-gray-700 uppercase tracking-wider mb-2">Email Address</label>
          <div className="relative">
            <input type="email" value={user?.email || ""} readOnly className="w-full px-4 py-3 bg-gray-100 text-gray-500 rounded-xl border-2 border-gray-200 font-medium" />
            <div className="absolute right-3 top-1/2 -translate-y-1/2">
              <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
          </div>
          <p className="text-xs text-gray-400 mt-2">Email không thể thay đổi</p>
        </div>

        {/* Username */}
        <div>
          <label className="block text-xs font-black text-gray-700 uppercase tracking-wider mb-2">
            Username <span className="text-danger-500">*</span>
          </label>
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="w-full px-4 py-3 bg-white rounded-xl border-2 border-gray-200 focus:border-gray-900 focus:ring-4 focus:ring-gray-100 transition-all font-medium"
            placeholder="Nhập tên người dùng"
            minLength={3}
            maxLength={50}
            required
          />
        </div>

        {/* Avatar Upload */}
        <div>
          <label className="block text-xs font-black text-gray-700 uppercase tracking-wider mb-2">Ảnh đại diện</label>
          <div className="space-y-4">
            <div
              onClick={() => fileInputRef.current?.click()}
              className="relative border-2 border-dashed border-gray-300 rounded-xl p-6 hover:border-gray-900 transition-all cursor-pointer bg-gray-50 hover:bg-gray-100"
            >
              <input ref={fileInputRef} type="file" accept="image/*" onChange={handleFileSelect} className="hidden" />
              <div className="text-center">
                <svg className="w-12 h-12 mx-auto text-gray-400 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                </svg>
                <p className="text-sm font-bold text-gray-700 mb-1">Click để chọn ảnh</p>
                <p className="text-xs text-gray-500">JPG, PNG, GIF, WEBP (tối đa 5MB)</p>
              </div>
            </div>

            {avatarPreview && (
              <div className="flex items-center gap-4 p-4 bg-white rounded-xl border-2 border-gray-200">
                <img src={avatarPreview} alt="preview" className="w-20 h-20 rounded-xl object-cover border-2 border-gray-200 shadow-md" />
                <div className="flex-1">
                  <p className="text-sm font-bold text-gray-900 mb-1">{avatarFile ? avatarFile.name : "Ảnh hiện tại"}</p>
                  <p className="text-xs text-gray-500">{avatarFile ? `${(avatarFile.size / 1024).toFixed(1)} KB` : "Đã lưu"}</p>
                </div>
                {avatarFile && (
                  <button
                    type="button"
                    onClick={handleUploadAvatar}
                    disabled={uploadingAvatar}
                    className="px-4 py-2 bg-gray-900 text-white text-sm font-bold rounded-lg hover:bg-gray-800 disabled:opacity-50 transition-all"
                  >
                    {uploadingAvatar ? (
                      <span className="flex items-center gap-2">
                        <span className="spinner w-3 h-3 border-white"></span>
                        Đang tải...
                      </span>
                    ) : (
                      "Upload"
                    )}
                  </button>
                )}
              </div>
            )}
          </div>
          <input type="hidden" value={avatarUrl} />
        </div>

        {/* Submit */}
        <div className="flex justify-end pt-4">
          <button
            type="submit"
            disabled={loadingSave}
            className="px-8 py-3 bg-gray-900 text-white font-bold rounded-xl hover:bg-gray-800 disabled:opacity-50 transition-all shadow-lg hover:shadow-xl"
          >
            {loadingSave ? (
              <span className="flex items-center gap-2">
                <span className="spinner w-4 h-4 border-white"></span>
                Đang lưu...
              </span>
            ) : (
              "Lưu thay đổi"
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
