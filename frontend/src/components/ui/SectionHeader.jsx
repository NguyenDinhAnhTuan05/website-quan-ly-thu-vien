import { Link } from "react-router-dom";

export default function SectionHeader({ badge, badgeIcon, title, description, linkTo, linkText }) {
  return (
    <div className="flex justify-between items-end mb-10">
      <div>
        {badge && (
          <div className="inline-block mb-3">
            <span className={`inline-flex items-center gap-2 ${badge.className} px-3 py-1 rounded-full text-xs font-bold border`}>
              {badgeIcon && <span>{badgeIcon}</span>}
              {badge.text}
            </span>
          </div>
        )}
        <h2 className={`heading-2 mb-2 ${title.gradient ? `bg-gradient-to-r ${title.gradient} bg-clip-text text-transparent` : ""}`}>
          {title.text}
        </h2>
        {description && <p className="body text-gray-600">{description}</p>}
      </div>
      {linkTo && linkText && (
        <Link to={linkTo} className="hidden md:inline-flex items-center gap-2 text-primary-600 hover:text-primary-700 font-semibold group">
          {linkText}
          <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
          </svg>
        </Link>
      )}
    </div>
  );
}
