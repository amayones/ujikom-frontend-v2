import { createBrowserRouter, Navigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import ErrorBoundary from '../components/ErrorBoundary';

// Layouts
import CustomerLayout from '../components/layout/CustomerLayout';
import AdminLayout from '../components/layout/AdminLayout';

// Public
import Landing from '../pages/Landing';

// Auth
import Login from '../pages/Login';
import Register from '../pages/Register';

// Customer pages
import CustomerHome from '../pages/customer/Home';
import FilmList from '../pages/customer/FilmList';
import FilmDetail from '../pages/customer/FilmDetail';
import SeatSelection from '../pages/customer/SeatSelection';
import Checkout from '../pages/customer/Checkout';
import Invoice from '../pages/customer/Invoice';
import History from '../pages/customer/History';
import Profile from '../pages/customer/Profile';

// Admin pages
import ManageFilms from '../pages/admin/ManageFilms';
import ManageUsers from '../pages/admin/ManageUsers';
import ManageSchedules from '../pages/admin/ManageSchedules';
import ManagePrices from '../pages/admin/ManagePrices';
import ManageCashiers from '../pages/admin/ManageCashiers';
import ManageDiscounts from '../pages/admin/ManageDiscounts';

// Owner pages
import Dashboard from '../pages/owner/Dashboard';
import Transactions from '../pages/owner/Transactions';

// Cashier pages
import OfflineOrder from '../pages/cashier/OfflineOrder';
import ProcessOnline from '../pages/cashier/ProcessOnline';
import ScanTicket from '../pages/cashier/ScanTicket';

// Protected Route Component
function ProtectedRoute({ children, allowedRoles }) {
  const { user, isAuthenticated, isInitialized } = useAuthStore();
  
  if (!isInitialized) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }
  
  if (!isAuthenticated || !user) {
    return <Navigate to="/login" replace />;
  }
  
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to="/login" replace />;
  }
  
  return children;
}

export const router = createBrowserRouter([
  {
    path: '/',
    element: <Landing />,
    errorElement: <ErrorBoundary />
  },
  {
    path: '/login',
    element: <Login />
  },
  {
    path: '/register',
    element: <Register />
  },
  {
    path: '/customer',
    element: (
      <ProtectedRoute allowedRoles={['customer']}>
        <CustomerLayout />
      </ProtectedRoute>
    ),
    errorElement: <ErrorBoundary />,
    children: [
      { path: 'home', element: <CustomerHome /> },
      { path: 'films', element: <FilmList /> },
      { path: 'films/:id', element: <FilmDetail /> },
      { path: 'seats/:scheduleId', element: <SeatSelection /> },
      { path: 'checkout', element: <Checkout /> },
      { path: 'invoice/:id', element: <Invoice /> },
      { path: 'history', element: <History /> },
      { path: 'profile', element: <Profile /> },
      { path: 'orders', element: <History /> }
    ]
  },
  {
    path: '/admin',
    element: (
      <ProtectedRoute allowedRoles={['admin']}>
        <AdminLayout />
      </ProtectedRoute>
    ),
    children: [
      { path: 'films', element: <ManageFilms /> },
      { path: 'users', element: <ManageUsers /> },
      { path: 'schedules', element: <ManageSchedules /> },
      { path: 'prices', element: <ManagePrices /> },
      { path: 'cashiers', element: <ManageCashiers /> },
      { path: 'discounts', element: <ManageDiscounts /> }
    ]
  },
  {
    path: '/owner',
    element: (
      <ProtectedRoute allowedRoles={['owner']}>
        <AdminLayout />
      </ProtectedRoute>
    ),
    children: [
      { path: 'dashboard', element: <Dashboard /> },
      { path: 'transactions', element: <Transactions /> }
    ]
  },
  {
    path: '/cashier',
    element: (
      <ProtectedRoute allowedRoles={['cashier']}>
        <AdminLayout />
      </ProtectedRoute>
    ),
    children: [
      { path: 'offline-order', element: <OfflineOrder /> },
      { path: 'all-orders', element: <ProcessOnline /> },
      { path: 'scan-ticket', element: <ScanTicket /> }
    ]
  },
  {
    path: '*',
    element: (
      <div className="flex flex-col items-center justify-center min-h-screen p-4">
        <h1 className="text-4xl font-bold mb-4">404</h1>
        <p className="text-xl mb-4">Oops! Halaman Tidak Ditemukan</p>
        <p className="text-gray-600 mb-4">URL: {window.location.pathname}</p>
        <button 
          onClick={() => window.history.back()}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Kembali
        </button>
      </div>
    )
  }
]);