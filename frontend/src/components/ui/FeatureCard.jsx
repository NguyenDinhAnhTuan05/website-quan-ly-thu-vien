export default function FeatureCard({ title, description, icon, gradient }) {
  return (
    <div className="group relative">
      <div className="absolute inset-0 bg-gradient-to-br from-primary-500/20 to-accent-500/20 rounded-2xl blur-xl group-hover:blur-2xl transition-all opacity-0 group-hover:opacity-100"></div>
      <div className="relative card-hover p-8 text-center bg-white/80 backdrop-blur-sm">
        <div className={`w-20 h-20 bg-gradient-to-br ${gradient} rounded-2xl mx-auto mb-6 flex items-center justify-center shadow-xl group-hover:shadow-2xl group-hover:scale-110 transition-all duration-300 group-hover:rotate-3`}>
          <span className="text-4xl">{icon}</span>
        </div>
        <h3 className="text-xl font-bold text-gray-900 mb-4 group-hover:text-primary-600 transition-colors">
          {title}
        </h3>
        <p className="text-gray-600 leading-relaxed">{description}</p>
      </div>
    </div>
  );
}
