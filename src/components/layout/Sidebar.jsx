import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import { 
  Film, 
  Users, 
  Calendar, 
  DollarSign, 
  UserCheck, 
  BarChart3,
  ShoppingCart,
  CheckCircle,
  Scan,
  LogOut,
  Receipt
} from 'lucide-react';

const menuItems = {
  admin: [
    { path: '/admin/films', label: 'Kelola Film', icon: Film },
    { path: '/admin/users', label: 'Kelola Pelanggan', icon: Users },
    { path: '/admin/schedules', label: 'Kelola Jadwal', icon: Calendar },
    { path: '/admin/prices', label: 'Kelola Harga', icon: DollarSign },
    { path: '/admin/cashiers', label: 'Kelola Kasir', icon: UserCheck }
  ],
  owner: [
    { path: '/owner/dashboard', label: 'Dashboard', icon: BarChart3 },
    { path: '/owner/transactions', label: 'Detail Transaksi', icon: Receipt }
  ],
  cashier: [
    { path: '/cashier/offline-order', label: 'Pesan Offline', icon: ShoppingCart },
    { path: '/cashier/all-orders', label: 'Semua Pembelian', icon: CheckCircle },
    { path: '/cashier/scan-ticket', label: 'Scan Tiket', icon: Scan }
  ]
};

export default function Sidebar({ mobile, onNavigate }) {
  const { user, logout } = useAuthStore();
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleNavClick = (path) => {
    navigate(path);
    if (onNavigate) onNavigate();
  };

  const currentMenuItems = menuItems[user?.role] || [];

  if (mobile) {
    return (
      <nav className="flex-1 p-4">
        <ul className="space-y-2">
          {currentMenuItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            
            return (
              <li key={item.path}>
                <button
                  onClick={() => handleNavClick(item.path)}
                  className={`flex items-center space-x-3 px-3 py-2 rounded-md transition-colors w-full text-left ${
                    isActive 
                      ? 'bg-blue-600 text-white' 
                      : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                  }`}
                >
                  <Icon size={20} />
                  <span>{item.label}</span>
                </button>
              </li>
            );
          })}
        </ul>
        <div className="mt-6 pt-6 border-t border-gray-700">
          <button
            onClick={handleLogout}
            className="flex items-center space-x-2 w-full px-3 py-2 text-gray-300 hover:bg-gray-700 hover:text-white rounded-md transition-colors"
          >
            <LogOut size={20} />
            <span>Logout</span>
          </button>
        </div>
      </nav>
    );
  }

  return (
    <div className="bg-gray-800 text-white w-64 h-screen flex flex-col fixed left-0 top-0 overflow-y-auto hidden lg:flex">
      <div className="p-4 border-b border-gray-700">
        <h1 className="text-lg sm:text-xl font-bold">Absolute Cinema</h1>
        <p className="text-xs sm:text-sm text-gray-300 capitalize">{user?.role} Panel</p>
      </div>
      
      <nav className="flex-1 p-4">
        <ul className="space-y-2">
          {currentMenuItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            
            return (
              <li key={item.path}>
                <Link
                  to={item.path}
                  className={`flex items-center space-x-3 px-3 py-2 rounded-md transition-colors ${
                    isActive 
                      ? 'bg-blue-600 text-white' 
                      : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                  }`}
                >
                  <Icon size={20} />
                  <span>{item.label}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
      
      <div className="p-4 border-t border-gray-700">
        <div className="mb-3">
          <p className="text-sm text-gray-300">Logged in as:</p>
          <p className="font-medium">{user?.name}</p>
        </div>
        <button
          onClick={handleLogout}
          className="flex items-center space-x-2 w-full px-3 py-2 text-gray-300 hover:bg-gray-700 hover:text-white rounded-md transition-colors"
        >
          <LogOut size={20} />
          <span>Logout</span>
        </button>
      </div>
    </div>
  );
}