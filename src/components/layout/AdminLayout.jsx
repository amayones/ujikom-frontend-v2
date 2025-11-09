import { Outlet } from 'react-router-dom';
import { useState } from 'react';
import Sidebar from './Sidebar';
import { Menu, X } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';

export default function AdminLayout() {
  const [showMobileSidebar, setShowMobileSidebar] = useState(false);
  const { user } = useAuthStore();

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />
      
      {/* Mobile Sidebar Overlay */}
      {showMobileSidebar && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden" onClick={() => setShowMobileSidebar(false)}>
          <div className="bg-gray-800 text-white w-64 h-screen flex flex-col" onClick={(e) => e.stopPropagation()}>
            <div className="p-4 border-b border-gray-700 flex justify-between items-center">
              <div>
                <h1 className="text-xl font-bold">Absolute Cinema</h1>
                <p className="text-sm text-gray-300 capitalize">{user?.role} Panel</p>
              </div>
              <button onClick={() => setShowMobileSidebar(false)}>
                <X size={24} />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto">
              <Sidebar mobile onNavigate={() => setShowMobileSidebar(false)} />
            </div>
          </div>
        </div>
      )}
      
      <main className="flex-1 p-4 sm:p-6 lg:p-8 lg:ml-64">
        {/* Mobile Header */}
        <div className="lg:hidden mb-4 flex items-center justify-between">
          <button
            onClick={() => setShowMobileSidebar(true)}
            className="p-2 rounded-lg bg-white shadow-md"
          >
            <Menu size={24} />
          </button>
          <h2 className="text-lg font-semibold capitalize">{user?.role} Panel</h2>
        </div>
        
        <Outlet />
      </main>
    </div>
  );
}