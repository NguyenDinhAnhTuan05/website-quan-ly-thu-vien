export default function StatsCard({ label, value, color = "primary", icon }) {
  const colorClasses = {
    primary: "text-primary-600",
    blue: "text-blue-600",
    green: "text-success-600",
    red: "text-danger-600",
    orange: "text-accent-600",
  };

  return (
    <div className="card p-6 text-center hover:shadow-lg transition-shadow">
      {icon && <div className="text-3xl mb-2">{icon}</div>}
      <p className={`text-3xl font-bold mb-1 ${colorClasses[color]}`}>
        {typeof value === "number" ? value.toLocaleString() : value}
      </p>
      <p className="text-sm text-gray-600">{label}</p>
    </div>
  );
}
