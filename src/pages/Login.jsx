import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import { Film, ChevronDown, ChevronRight } from 'lucide-react';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showDemo, setShowDemo] = useState(false);
  
  const { login } = useAuthStore();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await login(email, password);
      const user = response.data.user;
      
      const redirectPaths = {
        customer: '/customer/home',
        admin: '/admin/films',
        owner: '/owner/dashboard',
        cashier: '/cashier/offline-order'
      };
      
      navigate(redirectPaths[user.role] || '/customer/home');
    } catch (error) {
      setError(error.response?.data?.message || 'Email atau password salah');
    } finally {
      setLoading(false);
    }
  };

  const quickLogin = (demoEmail, demoPassword) => {
    setEmail(demoEmail);
    setPassword(demoPassword);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-4 sm:space-y-6">
        <div className="text-center">
          <div className="flex items-center justify-center mb-2">
            <Film size={48} className="text-emerald-600" />
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-800">
            Absolute Cinema
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Masuk ke akun Anda untuk memesan tiket
          </p>
        </div>
        
        <form className="mt-6 sm:mt-8 space-y-4 sm:space-y-6" onSubmit={handleSubmit}>
          <div className="bg-white p-6 sm:p-8 rounded-xl shadow-lg border border-gray-200 space-y-3 sm:space-y-4">
            <Input
              label="Email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="customer@test.com"
            />
            
            <Input
              label="Password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              placeholder="password"
            />
            
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                {error}
              </div>
            )}
            
            <Button 
              type="submit" 
              className="w-full mt-6" 
              disabled={loading}
            >
              {loading ? (
                <span className="flex items-center justify-center">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Masuk...
                </span>
              ) : 'Masuk'}
            </Button>

            <div className="text-center mt-4">
              <p className="text-sm text-gray-600">
                Belum punya akun?{' '}
                <Link to="/register" className="font-semibold text-emerald-600 hover:text-emerald-700 transition-colors">
                  Daftar di sini
                </Link>
              </p>
            </div>
          </div>
        </form>
        
        <div className="bg-white p-4 rounded-xl shadow-lg border border-gray-200">
          <button
            onClick={() => setShowDemo(!showDemo)}
            className="w-full text-left font-semibold text-gray-800 flex items-center justify-between hover:text-emerald-600 transition-colors"
          >
            <span>Demo Accounts</span>
            {showDemo ? <ChevronDown size={20} /> : <ChevronRight size={20} />}
          </button>
          {showDemo && (
            <div className="mt-3 space-y-2">
              <button
                onClick={() => quickLogin('customer@test.com', 'password')}
                className="w-full text-left text-sm p-2 hover:bg-emerald-50 rounded-lg transition-colors"
              >
                <strong className="text-emerald-600">Customer:</strong> customer@test.com
              </button>
              <button
                onClick={() => quickLogin('admin@test.com', 'password')}
                className="w-full text-left text-sm p-2 hover:bg-emerald-50 rounded-lg transition-colors"
              >
                <strong className="text-emerald-600">Admin:</strong> admin@test.com
              </button>
              <button
                onClick={() => quickLogin('owner@test.com', 'password')}
                className="w-full text-left text-sm p-2 hover:bg-emerald-50 rounded-lg transition-colors"
              >
                <strong className="text-emerald-600">Owner:</strong> owner@test.com
              </button>
              <button
                onClick={() => quickLogin('cashier@test.com', 'password')}
                className="w-full text-left text-sm p-2 hover:bg-emerald-50 rounded-lg transition-colors"
              >
                <strong className="text-emerald-600">Cashier:</strong> cashier@test.com
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}