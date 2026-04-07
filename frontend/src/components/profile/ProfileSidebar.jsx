import { useRef, useState } from "react";
import { Link } from "react-router-dom";

/* ─── Khung viền VIP kiểu game ─── */
const VipFrame = () => (
  <div className="absolute -inset-4 pointer-events-none" style={{ zIndex: 10 }}>
    {/* Outer glow */}
    <div className="absolute inset-0 rounded-full animate-pulse" style={{
      background: "radial-gradient(circle, rgba(255,215,0,0.35) 0%, transparent 70%)",
      animationDuration: "2s",
    }} />

    {/* Thick golden ring */}
    <div className="absolute inset-0 rounded-full" style={{
      border: "5px solid transparent",
      borderImage: "linear-gradient(180deg, #FFF8DC 0%, #FFD700 30%, #FFA500 70%, #FFD700 100%) 1",
      borderRadius: "9999px",
      background: "linear-gradient(#fff,#fff) padding-box, linear-gradient(180deg, #FFF8DC, #FFD700, #FFA500, #FFD700) border-box",
      WebkitMask: "linear-gradient(#fff 0 0) padding-box, linear-gradient(#fff 0 0)",
      WebkitMaskComposite: "destination-out",
      maskComposite: "exclude",
    }} />
    <div className="absolute inset-[2px] rounded-full border-[1.5px] border-[#DAA520] opacity-60" />

    {/* Crown on top */}
    <div className="absolute -top-7 left-1/2 -translate-x-1/2 z-20 drop-shadow-[0_0_10px_rgba(255,215,0,0.8)]">
      <svg width="48" height="32" viewBox="0 0 48 32" fill="none">
        <path d="M4 12L12 20L24 4L36 20L44 12L38 30H10L4 12Z" fill="url(#cg)" stroke="#B8860B" strokeWidth="1.2"/>
        <path d="M24 12L27 17L24 22L21 17Z" fill="#FFF8DC" stroke="#B8860B" strokeWidth="0.8"/>
        <circle cx="14" cy="26" r="1.2" fill="#B8860B"/><circle cx="19" cy="26" r="1.2" fill="#B8860B"/>
        <circle cx="24" cy="26" r="1.2" fill="#B8860B"/><circle cx="29" cy="26" r="1.2" fill="#B8860B"/>
        <circle cx="34" cy="26" r="1.2" fill="#B8860B"/>
        <defs><linearGradient id="cg" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#FFF8DC"/><stop offset="40%" stopColor="#FFD700"/><stop offset="100%" stopColor="#FFA500"/>
        </linearGradient></defs>
      </svg>
    </div>

    {/* Left laurel */}
    <div className="absolute -left-3 top-1/2 -translate-y-1/2 z-0 opacity-80">
      <svg width="24" height="60" viewBox="0 0 24 60" fill="none">
        <path d="M20 55C12 45 6 35 4 20C6 30 12 38 18 48Z" fill="#E8E8E8" stroke="#CCC" strokeWidth="0.5"/>
        <path d="M22 50C14 40 8 28 6 10C8 22 14 32 20 42Z" fill="#F5F5F5" stroke="#CCC" strokeWidth="0.5"/>
        <path d="M24 45C16 35 10 22 8 2C10 16 16 26 22 36Z" fill="#FFF" stroke="#D3D3D3" strokeWidth="0.5"/>
      </svg>
    </div>
    {/* Right laurel */}
    <div className="absolute -right-3 top-1/2 -translate-y-1/2 z-0 opacity-80" style={{ transform: "translateY(-50%) scaleX(-1)" }}>
      <svg width="24" height="60" viewBox="0 0 24 60" fill="none">
        <path d="M20 55C12 45 6 35 4 20C6 30 12 38 18 48Z" fill="#E8E8E8" stroke="#CCC" strokeWidth="0.5"/>
        <path d="M22 50C14 40 8 28 6 10C8 22 14 32 20 42Z" fill="#F5F5F5" stroke="#CCC" strokeWidth="0.5"/>
        <path d="M24 45C16 35 10 22 8 2C10 16 16 26 22 36Z" fill="#FFF" stroke="#D3D3D3" strokeWidth="0.5"/>
      </svg>
    </div>

    {/* Bottom emblem — compact */}
    <div className="absolute -bottom-5 left-1/2 -translate-x-1/2 z-20 drop-shadow-[0_2px_8px_rgba(255,140,0,0.6)]">
      <svg width="56" height="32" viewBox="0 0 56 32" fill="none">
        {/* Red ribbon wings */}
        <path d="M28 28C20 26 8 22 2 14C8 20 16 24 24 26Z" fill="url(#rb)" stroke="#FFD700" strokeWidth="1"/>
        <path d="M28 28C36 26 48 22 54 14C48 20 40 24 32 26Z" fill="url(#rb)" stroke="#FFD700" strokeWidth="1"/>
        <path d="M28 22C22 20 12 16 6 10C12 16 20 18 26 20Z" fill="url(#rbi)"/>
        <path d="M28 22C34 20 44 16 50 10C44 16 36 18 30 20Z" fill="url(#rbi)"/>
        {/* Center gem */}
        <path d="M28 8L33 16L28 24L23 16Z" fill="#E6E6FA" stroke="#FFD700" strokeWidth="1.2"/>
        <circle cx="28" cy="16" r="4.5" fill="url(#gem)" stroke="#00CED1" strokeWidth="1"/>
        <path d="M26 14L30 14L28 18Z" fill="#FFF" opacity="0.7"/>
        <defs>
          <linearGradient id="rb" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#FF4444"/><stop offset="100%" stopColor="#8B0000"/>
          </linearGradient>
          <linearGradient id="rbi" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#FFD700"/><stop offset="100%" stopColor="#FFA500"/>
          </linearGradient>
          <linearGradient id="gem" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#9B59B6"/><stop offset="100%" stopColor="#2C003E"/>
          </linearGradient>
        </defs>
      </svg>
    </div>
  </div>
);

/* ─── Khung viền Admin kiểu ice/crystal ─── */
const AdminFrame = () => (
  <div className="absolute -inset-4 pointer-events-none" style={{ zIndex: 10 }}>
    {/* Outer glow */}
    <div className="absolute inset-0 rounded-full animate-pulse" style={{
      background: "radial-gradient(circle, rgba(0,191,255,0.25) 0%, transparent 70%)",
      animationDuration: "2.5s",
    }} />

    {/* Gold + ice gradient ring */}
    <div className="absolute inset-0 rounded-full" style={{
      border: "5px solid transparent",
      background: "linear-gradient(#fff,#fff) padding-box, linear-gradient(135deg, #FFD700, #87CEEB, #FFD700, #87CEEB) border-box",
      WebkitMask: "linear-gradient(#fff 0 0) padding-box, linear-gradient(#fff 0 0)",
      WebkitMaskComposite: "destination-out",
      maskComposite: "exclude",
    }} />
    <div className="absolute inset-[2px] rounded-full border-[1.5px] border-[#B8860B] opacity-50" />

    {/* Top diamond crystal */}
    <div className="absolute -top-7 left-1/2 -translate-x-1/2 z-20 drop-shadow-[0_0_12px_rgba(0,191,255,0.9)]">
      <svg width="44" height="30" viewBox="0 0 44 30" fill="none">
        {/* Wing crystals */}
        <path d="M22 2L30 10L42 10L34 16L22 28L10 16L2 10L14 10Z" fill="url(#ic)" stroke="#4DD0E1" strokeWidth="0.8"/>
        {/* Center diamond */}
        <path d="M22 6L28 14L22 24L16 14Z" fill="url(#gh)" stroke="#B8860B" strokeWidth="1.5"/>
        <path d="M22 9L26 15L22 22L18 15Z" fill="url(#cd)"/>
        <path d="M22 9L26 15L22 15Z" fill="#E0FFFF" opacity="0.5"/>
        <defs>
          <linearGradient id="ic" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#E0FFFF"/><stop offset="50%" stopColor="#87CEFA"/><stop offset="100%" stopColor="#4169E1"/>
          </linearGradient>
          <linearGradient id="gh" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#FFD700"/><stop offset="50%" stopColor="#FFA500"/><stop offset="100%" stopColor="#FF8C00"/>
          </linearGradient>
          <linearGradient id="cd" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#00FFFF"/><stop offset="100%" stopColor="#0000CD"/>
          </linearGradient>
        </defs>
      </svg>
    </div>

    {/* Left ice shard */}
    <div className="absolute -left-3 top-[40%] -translate-y-1/2 z-0 opacity-85">
      <svg width="22" height="50" viewBox="0 0 22 50" fill="none">
        <path d="M20 5L10 18L0 28L8 30L4 48L14 36L20 48L18 28Z" fill="url(#si)" stroke="#B0E0E6" strokeWidth="0.5"/>
        <path d="M20 5L10 18L8 30L18 28Z" fill="#FFF" opacity="0.3"/>
        <defs><linearGradient id="si" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#F0F8FF"/><stop offset="40%" stopColor="#87CEEB"/><stop offset="100%" stopColor="#4169E1"/>
        </linearGradient></defs>
      </svg>
    </div>
    {/* Right ice shard */}
    <div className="absolute -right-3 top-[40%] -translate-y-1/2 z-0 opacity-85" style={{ transform: "translateY(-50%) scaleX(-1)" }}>
      <svg width="22" height="50" viewBox="0 0 22 50" fill="none">
        <path d="M20 5L10 18L0 28L8 30L4 48L14 36L20 48L18 28Z" fill="url(#si)" stroke="#B0E0E6" strokeWidth="0.5"/>
        <path d="M20 5L10 18L8 30L18 28Z" fill="#FFF" opacity="0.3"/>
      </svg>
    </div>

    {/* Bottom shield emblem — compact */}
    <div className="absolute -bottom-5 left-1/2 -translate-x-1/2 z-20 drop-shadow-[0_2px_10px_rgba(255,0,0,0.5)]">
      <svg width="48" height="32" viewBox="0 0 48 32" fill="none">
        {/* Ice wing base */}
        <path d="M24 28C16 24 4 18 0 10C6 18 14 22 22 26Z" fill="url(#bic)" stroke="#4DD0E1" strokeWidth="0.8"/>
        <path d="M24 28C32 24 44 18 48 10C42 18 34 22 26 26Z" fill="url(#bic)" stroke="#4DD0E1" strokeWidth="0.8"/>
        {/* Shield */}
        <path d="M24 6L32 10L34 20C34 26 26 30 24 31C22 30 14 26 14 20L16 10Z" fill="url(#gh)" stroke="#FFD700" strokeWidth="1.2"/>
        <path d="M24 9L30 12L32 20C32 24 26 27 24 28C22 27 16 24 16 20L18 12Z" fill="url(#rsc)" stroke="#8B0000" strokeWidth="0.5"/>
        {/* Drop jewel */}
        <path d="M24 14C24 14 20 20 20 22.5C20 24.5 22 26 24 26C26 26 28 24.5 28 22.5C28 20 24 14 24 14Z" fill="url(#cd)" stroke="#E0FFFF" strokeWidth="0.8"/>
        <path d="M24 14C24 14 21 20 21 22.5C21 23.5 22.5 25 24 25Z" fill="#FFF" opacity="0.5"/>
        <defs>
          <linearGradient id="bic" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#4682B4"/><stop offset="50%" stopColor="#00BFFF"/><stop offset="100%" stopColor="#4682B4"/>
          </linearGradient>
          <linearGradient id="rsc" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#FF4500"/><stop offset="50%" stopColor="#CC0000"/><stop offset="100%" stopColor="#800000"/>
          </linearGradient>
        </defs>
      </svg>
    </div>
  </div>
);

export default function ProfileSidebar({ user, onAvatarUploaded, showToast }) {
  const fileInputRef = useRef(null);
  const [uploading, setUploading] = useState(false);

  // Xác định khung viền avatar theo role/badge
  const isAdmin = user?.role === "ROLE_ADMIN" || user?.role === "ROLE_SUPER_ADMIN";
  const hasVipBadge = user?.badge === "vip_reader";

  const getAvatarRingStyle = () => {
    if (isAdmin) {
      return {
        className: "absolute inset-0 rounded-full bg-gradient-to-r from-cyan-400 via-blue-500 to-cyan-400 animate-spin",
        style: { animationDuration: "3s" },
        glow: "shadow-[0_0_30px_8px_rgba(0,191,255,0.6)]",
        label: "💎 Supreme Admin",
        labelColor: "bg-gradient-to-r from-blue-600 to-cyan-500 text-white shadow-[0_0_15px_rgba(0,191,255,0.5)]",
        frame: "admin",
      };
    }
    if (hasVipBadge) {
      return {
        className: "absolute inset-0 rounded-full bg-gradient-to-r from-yellow-400 via-amber-200 to-yellow-500 animate-spin",
        style: { animationDuration: "2s" },
        glow: "shadow-[0_0_30px_8px_rgba(255,215,0,0.6)]",
        label: "⭐ VIP Reader",
        labelColor: "bg-gradient-to-r from-amber-400 to-yellow-500 text-white shadow-[0_0_15px_rgba(251,191,36,0.5)]",
        frame: "vip",
      };
    }
    return {
      className: "absolute inset-0 rounded-full bg-gradient-to-r from-primary-500 via-accent-500 to-primary-500 animate-spin",
      style: { animationDuration: "3s" },
      glow: "",
      label: null,
      labelColor: "",
      frame: null,
    };
  };

  const ringStyle = getAvatarRingStyle();

  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      showToast?.("Vui lòng chọn file ảnh", "error");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      showToast?.("File không được vượt quá 5MB", "error");
      return;
    }
    setUploading(true);
    try {
      const { default: uploadApi } = await import("../../api/uploadApi");
      const result = await uploadApi.uploadAvatar(file);
      onAvatarUploaded?.(result.url);
      showToast?.("Cập nhật ảnh đại diện thành công!");
    } catch (err) {
      showToast?.(err.response?.data?.error || "Upload thất bại", "error");
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  };

  return (
    <div className="sticky top-24">
      <div className="relative">
        {/* Decorative Elements */}
        <div className="absolute -top-4 -left-4 w-24 h-24 bg-primary-200 rounded-full opacity-20 blur-2xl"></div>
        <div className="absolute -bottom-4 -right-4 w-32 h-32 bg-accent-200 rounded-full opacity-20 blur-2xl"></div>

        <div className="relative bg-white rounded-3xl p-8 shadow-lg border-2 border-gray-100">
          {/* Avatar Section */}
          <div className="flex flex-col items-center mb-6">
            <div className={`relative ${ringStyle.frame === "admin" || ringStyle.frame === "vip" ? "mb-8 mt-10" : "mb-4"} group cursor-pointer`} onClick={handleAvatarClick}>
              <input ref={fileInputRef} type="file" accept="image/*" onChange={handleFileChange} className="hidden" />

              {/* Ornate Frame (VIP / Admin) */}
              {ringStyle.frame === "vip" && <VipFrame />}
              {ringStyle.frame === "admin" && <AdminFrame />}

              <div className={ringStyle.className} style={ringStyle.style}></div>
              <div className={`relative w-32 h-32 rounded-full bg-white p-1.5 ${ringStyle.glow}`} style={{ zIndex: 5 }}>
                <div className="w-full h-full rounded-full bg-gradient-to-br from-primary-100 to-accent-100 flex items-center justify-center overflow-hidden">
                  {user?.avatarUrl ? (
                    <img src={user.avatarUrl} className="w-full h-full rounded-full object-cover" alt="avatar" />
                  ) : (
                    <span className="text-5xl font-black bg-gradient-to-br from-primary-600 to-accent-600 bg-clip-text text-transparent">
                      {user?.username?.[0]?.toUpperCase() || "?"}
                    </span>
                  )}
                </div>
                {/* Camera overlay on hover */}
                <div className="absolute inset-1.5 rounded-full bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity" style={{ zIndex: 15 }}>
                  {uploading ? (
                    <svg className="w-8 h-8 text-white animate-spin" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
                    </svg>
                  ) : (
                    <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  )}
                </div>
              </div>
            </div>

            {/* Badge Label */}
            {ringStyle.label && (
              <span className={`inline-block px-3 py-1 rounded-full text-xs font-black shadow-lg mb-2 ${ringStyle.labelColor}`}>
                {ringStyle.label}
              </span>
            )}

            <h2 className="text-2xl font-black text-gray-900 mb-1">{user?.username || "—"}</h2>
            <p className="text-sm text-gray-500 mb-4">{user?.email}</p>

            {/* Status Badges */}
            <div className="flex flex-col gap-2 w-full">
              <div className="flex items-center justify-between px-4 py-2 bg-gradient-to-r from-primary-50 to-primary-100 rounded-xl border border-primary-200">
                <span className="text-xs font-bold text-primary-700">ROLE</span>
                <span className="text-xs font-black text-primary-900">{user?.role?.replace("ROLE_", "")}</span>
              </div>

              <div className={`flex items-center justify-between px-4 py-2 rounded-xl border ${
                {
                  GOLD: "bg-gradient-to-r from-amber-50 to-amber-100 border-amber-200",
                  SILVER: "bg-gradient-to-r from-slate-50 to-slate-100 border-slate-200",
                  BRONZE: "bg-gradient-to-r from-orange-50 to-orange-100 border-orange-200",
                }[user?.membershipTier] || "bg-gradient-to-r from-gray-50 to-gray-100 border-gray-200"
              }`}>
                <span className={`text-xs font-bold ${
                  { GOLD: "text-amber-700", SILVER: "text-slate-700", BRONZE: "text-orange-700" }[user?.membershipTier] || "text-gray-700"
                }`}>TIER</span>
                <span className={`text-xs font-black ${
                  { GOLD: "text-amber-900", SILVER: "text-slate-900", BRONZE: "text-orange-900" }[user?.membershipTier] || "text-gray-900"
                }`}>
                  {{ GOLD: "\u2b50 V\u00e0ng", SILVER: "\ud83e\udd48 B\u1ea1c", BRONZE: "\ud83e\udd49 \u0110\u1ed3ng" }[user?.membershipTier] || user?.membershipTier || "\u2014"}
                </span>
              </div>

              <div className="flex items-center justify-between px-4 py-2 bg-gradient-to-r from-accent-50 to-accent-100 rounded-xl border border-accent-200">
                <span className="text-xs font-bold text-accent-700">POINTS</span>
                <span className="text-xs font-black text-accent-900">{user?.points ?? 0} pts</span>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="space-y-3 pt-6 border-t-2 border-gray-100">
            <Link
              to="/dashboard"
              className="flex items-center justify-between px-4 py-3 bg-gray-50 hover:bg-gray-100 rounded-xl transition-all group"
            >
              <span className="text-sm font-bold text-gray-700">Lịch sử mượn</span>
              <svg className="w-5 h-5 text-gray-400 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>

            <Link
              to="/subscription"
              className="flex items-center justify-between px-4 py-3 bg-gradient-to-r from-primary-500 to-accent-500 hover:from-primary-600 hover:to-accent-600 rounded-xl transition-all group shadow-md"
            >
              <span className="text-sm font-bold text-white">Nâng cấp gói</span>
              <svg className="w-5 h-5 text-white group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
