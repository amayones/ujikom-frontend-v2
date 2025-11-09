import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import { Film, User, LogOut, ChevronDown, Menu, X } from 'lucide-react';

export default function Navbar() {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();
  const [showDropdown, setShowDropdown] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
    setShowMobileMenu(false);
  };

  const isActive = (path) => location.pathname === path;

  const navLinks = [
    { path: '/customer/home', label: 'Home' },
    { path: '/customer/films', label: 'Films' },
    { path: '/customer/history', label: 'History' },
  ];

  return (
    <nav className="bg-white border-b border-gray-200 sticky top-0 z-50 shadow-sm">
      <div className="max-w-6xl mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/customer/home" className="flex items-center space-x-2 text-gray-900 hover:text-blue-600 transition-colors">
            <Film size={24} className="text-blue-600" />
            <span className="text-base sm:text-lg font-bold">Absolute Cinema</span>
          </Link>
          
          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            {navLinks.map((link) => {
              const active = isActive(link.path);
              return (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`text-sm font-medium transition-colors relative ${
                    active
                      ? 'text-blue-600'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  {link.label}
                  {active && (
                    <span className="absolute -bottom-[17px] left-0 right-0 h-0.5 bg-blue-600"></span>
                  )}
                </Link>
              );
            })}
          </div>
          
          {/* Desktop User Menu */}
          <div className="hidden md:flex items-center">
            {user ? (
              <div className="relative">
                <button
                  onClick={() => setShowDropdown(!showDropdown)}
                  className="flex items-center space-x-2 text-gray-700 hover:text-gray-900 transition-colors"
                >
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                    <User size={16} className="text-blue-600" />
                  </div>
                  <span className="text-sm font-medium">{user.name}</span>
                  <ChevronDown size={16} className={`transition-transform ${showDropdown ? 'rotate-180' : ''}`} />
                </button>
                
                {showDropdown && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1">
                    <Link
                      to="/customer/profile"
                      onClick={() => setShowDropdown(false)}
                      className="flex items-center space-x-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                    >
                      <User size={16} />
                      <span>Profile</span>
                    </Link>
                    <hr className="my-1" />
                    <button
                      onClick={handleLogout}
                      className="flex items-center space-x-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors w-full text-left"
                    >
                      <LogOut size={16} />
                      <span>Logout</span>
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <Link
                to="/login"
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Login
              </Link>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setShowMobileMenu(!showMobileMenu)}
            className="md:hidden p-2 text-gray-600 hover:text-gray-900"
          >
            {showMobileMenu ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile Menu */}
        {showMobileMenu && (
          <div className="md:hidden py-4 border-t border-gray-200">
            {/* Mobile Navigation Links */}
            <div className="space-y-2">
              {navLinks.map((link) => {
                const active = isActive(link.path);
                return (
                  <Link
                    key={link.path}
                    to={link.path}
                    onClick={() => setShowMobileMenu(false)}
                    className={`block px-4 py-2 text-sm font-medium rounded-lg ${
                      active
                        ? 'bg-blue-50 text-blue-600'
                        : 'text-gray-600 hover:bg-gray-50'
                    }`}
                  >
                    {link.label}
                  </Link>
                );
              })}
            </div>

            {/* Mobile User Menu */}
            {user ? (
              <div className="mt-4 pt-4 border-t border-gray-200 space-y-2">
                <div className="px-4 py-2 text-sm font-medium text-gray-900">
                  {user.name}
                </div>
                <Link
                  to="/customer/profile"
                  onClick={() => setShowMobileMenu(false)}
                  className="flex items-center space-x-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-lg"
                >
                  <User size={16} />
                  <span>Profile</span>
                </Link>
                <button
                  onClick={handleLogout}
                  className="flex items-center space-x-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg w-full text-left"
                >
                  <LogOut size={16} />
                  <span>Logout</span>
                </button>
              </div>
            ) : (
              <div className="mt-4 pt-4 border-t border-gray-200">
                <Link
                  to="/login"
                  onClick={() => setShowMobileMenu(false)}
                  className="block px-4 py-2 text-sm font-medium text-center text-white bg-blue-600 rounded-lg hover:bg-blue-700"
                >
                  Login
                </Link>
              </div>
            )}
          </div>
        )}
      </div>
    </nav>
  );
}