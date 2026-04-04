export default function AvatarCircle({ avatarUrl, username, size = "md", className = "" }) {
  const sizeClasses = {
    sm: "w-10 h-10 text-base",
    md: "w-16 h-16 text-2xl",
    lg: "w-20 h-20 text-3xl",
    xl: "w-32 h-32 text-5xl",
  };

  const sizeClass = sizeClasses[size] || sizeClasses.md;

  return (
    <div className={`${sizeClass} rounded-full bg-gradient-to-br from-primary-100 to-accent-100 flex items-center justify-center overflow-hidden ${className}`}>
      {avatarUrl ? (
        <img src={avatarUrl} className="w-full h-full rounded-full object-cover" alt={username || "avatar"} />
      ) : (
        <span className="font-bold bg-gradient-to-br from-primary-600 to-accent-600 bg-clip-text text-transparent">
          {username?.[0]?.toUpperCase() || "?"}
        </span>
      )}
    </div>
  );
}
