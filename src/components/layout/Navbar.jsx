import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import Button from '../ui/Button';

export default function Navbar() {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="bg-white shadow-lg border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link to="/customer/home" className="text-xl font-bold text-blue-600">
              Absolute Cinema
            </Link>
          </div>
          
          <div className="flex items-center space-x-4">
            <Link to="/customer/home" className="text-gray-700 hover:text-blue-600">
              Home
            </Link>
            <Link to="/customer/films" className="text-gray-700 hover:text-blue-600">
              Films
            </Link>
            <Link to="/customer/history" className="text-gray-700 hover:text-blue-600">
              History
            </Link>
            <Link to="/customer/profile" className="text-gray-700 hover:text-blue-600">
              Profile
            </Link>
            
            {user ? (
              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-600">Hi, {user.name}</span>
                <Button variant="outline" size="sm" onClick={handleLogout}>
                  Logout
                </Button>
              </div>
            ) : (
              <Link to="/login">
                <Button size="sm">Login</Button>
              </Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}