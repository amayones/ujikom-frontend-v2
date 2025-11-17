import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import { useThemeStore } from '../../store/themeStore';
import { Film, User, LogOut, ChevronDown, Menu, X, Moon, Sun } from 'lucide-react';

export default function Navbar() {
  const { user, logout } = useAuthStore();
  const { isDark, toggleTheme } = useThemeStore();
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
    <nav className={`sticky top-0 z-50 shadow-lg transition-colors ${
      isDark ? 'bg-gray-900' : 'bg-emerald-600'
    }`}>
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/customer/home" className="flex items-center space-x-2 text-white hover:text-emerald-100 transition-colors">
            <div className="bg-white/10 p-1.5 rounded-lg">
              <Film size={20} className="text-white" />
            </div>
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
                  className={`text-sm font-semibold transition-colors relative ${
                    active ? 'text-white' : 'text-white/80 hover:text-white'
                  }`}
                >
                  {link.label}
                  {active && (
                    <span className="absolute -bottom-[17px] left-0 right-0 h-1 bg-white"></span>
                  )}
                </Link>
              );
            })}
          </div>
          
          {/* Desktop User Menu */}
          <div className="hidden md:flex items-center space-x-4">
            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className="p-2 text-white/80 hover:text-white transition-colors rounded-lg hover:bg-white/10"
              title={isDark ? 'Light Mode' : 'Dark Mode'}
            >
              {isDark ? <Sun size={20} /> : <Moon size={20} />}
            </button>
            
            {user ? (
              <div className="relative">
                <button
                  onClick={() => setShowDropdown(!showDropdown)}
                  className="flex items-center space-x-2 text-white hover:text-emerald-100 transition-colors"
                >
                  <div className="w-8 h-8 rounded-full flex items-center justify-center bg-white/10">
                    <User size={16} className="text-white" />
                  </div>
                  <span className="text-sm font-semibold">{user.name}</span>
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
                className="px-6 py-2 text-sm font-bold rounded-lg transition-colors bg-white text-emerald-600 hover:bg-emerald-50"
              >
                Login
              </Link>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setShowMobileMenu(!showMobileMenu)}
            className="md:hidden p-2 text-white hover:text-emerald-100"
          >
            {showMobileMenu ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile Menu */}
        {showMobileMenu && (
          <div className={`md:hidden py-4 border-t transition-colors ${
            isDark ? 'border-gray-700 bg-gray-800' : 'border-emerald-500 bg-emerald-700'
          }`}>
            {/* Mobile Navigation Links */}
            <div className="space-y-2">
              {navLinks.map((link) => {
                const active = isActive(link.path);
                return (
                  <Link
                    key={link.path}
                    to={link.path}
                    onClick={() => setShowMobileMenu(false)}
                    className={`block px-4 py-2 text-sm font-semibold rounded-lg ${
                      active
                        ? (isDark ? 'bg-emerald-600 text-white' : 'bg-white/20 text-white')
                        : (isDark ? 'text-gray-300 hover:bg-gray-700 hover:text-white' : 'text-white/80 hover:bg-white/10 hover:text-white')
                    }`}
                  >
                    {link.label}
                  </Link>
                );
              })}
            </div>

            {/* Mobile Theme Toggle */}
            <div className={`mt-4 pt-4 border-t ${isDark ? 'border-gray-700' : 'border-emerald-500'}`}>
              <button
                onClick={toggleTheme}
                className={`flex items-center space-x-2 px-4 py-2 text-sm rounded-lg w-full ${
                  isDark 
                    ? 'text-gray-300 hover:bg-gray-700 hover:text-white' 
                    : 'text-white/80 hover:bg-white/10 hover:text-white'
                }`}
              >
                {isDark ? <Sun size={16} /> : <Moon size={16} />}
                <span>{isDark ? 'Light Mode' : 'Dark Mode'}</span>
              </button>
            </div>

            {/* Mobile User Menu */}
            {user ? (
              <div className={`mt-4 pt-4 border-t space-y-2 ${isDark ? 'border-gray-700' : 'border-emerald-500'}`}>
                <div className="px-4 py-2 text-sm font-bold text-white">
                  {user.name}
                </div>
                <Link
                  to="/customer/profile"
                  onClick={() => setShowMobileMenu(false)}
                  className={`flex items-center space-x-2 px-4 py-2 text-sm rounded-lg ${
                    isDark 
                      ? 'text-gray-300 hover:bg-gray-700 hover:text-white' 
                      : 'text-white/80 hover:bg-white/10 hover:text-white'
                  }`}
                >
                  <User size={16} />
                  <span>Profile</span>
                </Link>
                <button
                  onClick={handleLogout}
                  className={`flex items-center space-x-2 px-4 py-2 text-sm rounded-lg w-full text-left ${
                    isDark 
                      ? 'text-red-400 hover:bg-red-900/30' 
                      : 'text-white/80 hover:bg-white/10'
                  }`}
                >
                  <LogOut size={16} />
                  <span>Logout</span>
                </button>
              </div>
            ) : (
              <div className={`mt-4 pt-4 border-t ${isDark ? 'border-gray-700' : 'border-emerald-500'}`}>
                <Link
                  to="/login"
                  onClick={() => setShowMobileMenu(false)}
                  className="block px-4 py-2 text-sm font-bold text-center rounded-lg bg-white text-emerald-600 hover:bg-emerald-50"
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
