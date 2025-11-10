import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import { Film } from 'lucide-react';

export default function Register() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    password_confirmation: '',
    phone: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (formData.password !== formData.password_confirmation) {
      setError('Password tidak cocok');
      setLoading(false);
      return;
    }

    try {
      const apiUrl = import.meta.env.VITE_API_URL.replace('/api', '');
      const response = await fetch(`${apiUrl}/api/register`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify(formData)
      });

      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        throw new Error('Server error: Invalid response format');
      }

      const data = await response.json();

      if (!response.ok) {
        const errorMsg = data.message || data.errors ? Object.values(data.errors).flat().join(', ') : 'Registrasi gagal';
        throw new Error(errorMsg);
      }

      localStorage.setItem('token', data.data.token);
      alert('Registrasi berhasil! Silakan login.');
      navigate('/login');
    } catch (error) {
      console.error('Registration error:', error);
      setError(error.message || 'Registrasi gagal. Silakan coba lagi.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-6 sm:space-y-8">
        <div className="text-center">
          <div className="flex items-center justify-center mb-2">
            <Film size={48} className="text-blue-600" />
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900">
            Absolute Cinema
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Daftar akun baru untuk mulai memesan tiket
          </p>
        </div>
        
        <form className="mt-6 sm:mt-8 space-y-4 sm:space-y-6" onSubmit={handleSubmit}>
          <div className="bg-white p-6 sm:p-8 rounded-xl shadow-lg space-y-3 sm:space-y-4">
            <Input
              label="Nama Lengkap"
              name="name"
              type="text"
              value={formData.name}
              onChange={handleChange}
              required
              placeholder="John Doe"
            />
            
            <Input
              label="Email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              required
              placeholder="john@example.com"
            />

            <Input
              label="Nomor Telepon"
              name="phone"
              type="tel"
              value={formData.phone}
              onChange={handleChange}
              placeholder="081234567890"
            />
            
            <Input
              label="Password"
              name="password"
              type="password"
              value={formData.password}
              onChange={handleChange}
              required
              placeholder="Minimal 8 karakter"
            />

            <Input
              label="Konfirmasi Password"
              name="password_confirmation"
              type="password"
              value={formData.password_confirmation}
              onChange={handleChange}
              required
              placeholder="Ulangi password"
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
              {loading ? 'Mendaftar...' : 'Daftar Sekarang'}
            </Button>

            <div className="text-center mt-4">
              <p className="text-sm text-gray-600">
                Sudah punya akun?{' '}
                <Link to="/login" className="font-medium text-blue-600 hover:text-blue-500">
                  Masuk di sini
                </Link>
              </p>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
