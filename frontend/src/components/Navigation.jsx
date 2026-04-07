import { Link } from "react-router-dom";
import { useState } from "react";
import { useAuthStore } from "../store/index";
import UserDropdown from "./UserDropdown";

export default function Navigation() {
  const [isOpen, setIsOpen] = useState(false);
  const { isAuthenticated } = useAuthStore();

  return (
    <nav className="bg-white/80 backdrop-blur-xl border-b border-primary-100 sticky top-0 z-50 shadow-sm">
      <div className="container-max">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 group">
            <img src="/logo.png" alt="eLibConnect" className="h-10 w-auto group-hover:scale-105 transition-transform" />  
          </Link>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center gap-1">
            <Link to="/" className="px-4 py-2 text-gray-700 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-all font-medium">
              Trang chủ
            </Link>
            <Link to="/book" className="px-4 py-2 text-gray-700 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-all font-medium">
              Danh sách sách
            </Link>
            <Link to="/categories" className="px-4 py-2 text-gray-700 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-all font-medium">
              Thể loại
            </Link>
            <Link to="/leaderboard" className="px-4 py-2 text-gray-700 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-all font-medium">
              Bảng xếp hạng
            </Link>
            <Link to="/rewards" className="px-4 py-2 text-gray-700 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-all font-medium">
              Đổi quà
            </Link>
          </div>

          {/* Auth Buttons */}
          <div className="hidden md:flex items-center gap-3">
            {isAuthenticated ? (
              <UserDropdown />
            ) : (
              <>
                <Link to="/login" className="px-4 py-2 text-gray-700 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-all font-medium">
                  Đăng nhập
                </Link>
                <Link to="/register" className="px-5 py-2.5 bg-gradient-to-r from-primary-600 to-accent-600 text-white rounded-lg font-semibold hover:from-primary-700 hover:to-accent-700 transition-all shadow-md hover:shadow-lg hover:shadow-primary-500/50">
                  Đăng ký
                </Link>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button 
            onClick={() => setIsOpen(!isOpen)}
            className="md:hidden p-2 hover:bg-primary-50 rounded-lg transition-colors text-gray-700"
            aria-label="Menu"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {isOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>

        {/* Mobile Menu */}
        {isOpen && (
          <div className="md:hidden pb-4 space-y-1 border-t border-primary-100 pt-4 animate-slide-down">
            <Link to="/" onClick={() => setIsOpen(false)} 
              className="block px-4 py-2.5 text-gray-700 hover:bg-primary-50 hover:text-primary-600 rounded-lg transition-all font-medium">
              Trang chủ
            </Link>
            <Link to="/book" onClick={() => setIsOpen(false)} 
              className="block px-4 py-2.5 text-gray-700 hover:bg-primary-50 hover:text-primary-600 rounded-lg transition-all font-medium">
              Danh sách sách
            </Link>
            <Link to="/categories" onClick={() => setIsOpen(false)} 
              className="block px-4 py-2.5 text-gray-700 hover:bg-primary-50 hover:text-primary-600 rounded-lg transition-all font-medium">
              Thể loại
            </Link>
            <Link to="/leaderboard" onClick={() => setIsOpen(false)} 
              className="block px-4 py-2.5 text-gray-700 hover:bg-primary-50 hover:text-primary-600 rounded-lg transition-all font-medium">
              Bảng xếp hạng
            </Link>
            <Link to="/rewards" onClick={() => setIsOpen(false)} 
              className="block px-4 py-2.5 text-gray-700 hover:bg-primary-50 hover:text-primary-600 rounded-lg transition-all font-medium">
              Đổi quà
            </Link>
            {isAuthenticated ? (
              <div className="pt-2">
                <UserDropdown />
              </div>
            ) : (
              <>
                <Link to="/login" onClick={() => setIsOpen(false)} 
                  className="block px-4 py-2.5 text-gray-700 hover:bg-primary-50 hover:text-primary-600 rounded-lg transition-all font-medium">
                  Đăng nhập
                </Link>
                <Link to="/register" onClick={() => setIsOpen(false)} 
                  className="block px-4 py-2.5 text-white bg-gradient-to-r from-primary-600 to-accent-600 hover:from-primary-700 hover:to-accent-700 rounded-lg transition-all font-semibold text-center shadow-md">
                  Đăng ký
                </Link>
              </>
            )}
          </div>
        )}
      </div>
    </nav>
  );
}
