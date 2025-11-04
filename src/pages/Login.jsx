import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const { login, loading: authLoading } = useAuthStore();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await login(email, password);
      const user = response.data.user;
      
      // Redirect based on role
      const redirectPaths = {
        customer: '/customer/home',
        admin: '/admin/films',
        owner: '/owner/reports',
        cashier: '/cashier/offline-order'
      };
      
      navigate(redirectPaths[user.role] || '/customer/home');
    } catch (error) {
      setError(error.response?.data?.message || 'Login gagal');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Absolute Cinema
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Masuk ke akun Anda
          </p>
        </div>
        
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="bg-white p-6 rounded-lg shadow-md">
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
              placeholder="password123"
            />
            
            {error && (
              <div className="text-red-600 text-sm mb-4">{error}</div>
            )}
            
            <Button 
              type="submit" 
              className="w-full" 
              disabled={loading}
            >
              {loading ? 'Masuk...' : 'Masuk'}
            </Button>
          </div>
        </form>
        
        <div className="bg-white p-4 rounded-lg shadow-md">
          <h3 className="font-semibold mb-2">Demo Accounts:</h3>
          <div className="text-sm space-y-1">
            <p><strong>Customer:</strong> customer@test.com / password</p>
            <p><strong>Admin:</strong> admin@test.com / password</p>
            <p><strong>Owner:</strong> owner@test.com / password</p>
            <p><strong>Cashier:</strong> cashier@test.com / password</p>
          </div>
        </div>
      </div>
    </div>
  );
}