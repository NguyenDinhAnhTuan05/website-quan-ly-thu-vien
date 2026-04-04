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
          <Link to="/" className="flex items-center gap-3 group">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-br from-primary-600 to-accent-600 rounded-xl blur-md opacity-50 group-hover:opacity-75 transition-opacity"></div>
              <div className="relative w-11 h-11 bg-gradient-to-br from-primary-600 via-primary-700 to-accent-600 rounded-xl flex items-center justify-center shadow-lg group-hover:shadow-xl group-hover:scale-105 transition-all">
                <span className="text-white text-xl font-bold">L</span>
              </div>
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-primary-600 to-accent-600 bg-clip-text text-transparent hidden sm:inline">
              Thư Viện
            </span>
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
