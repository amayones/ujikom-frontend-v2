import { Outlet } from 'react-router-dom';
import { useThemeStore } from '../../store/themeStore';
import Navbar from './Navbar';

export default function CustomerLayout() {
  const { isDark } = useThemeStore();
  
  return (
    <div className={`min-h-screen transition-colors ${isDark ? 'bg-gray-900' : 'bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50'}`}>
      <Navbar />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Outlet />
      </main>
    </div>
  );
}