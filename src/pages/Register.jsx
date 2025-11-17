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
    password_confirmation: ''
  });
  const [error, setError] = useState('');
  const { register, loading } = useAuthStore();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (formData.password !== formData.password_confirmation) {
      setError('Password tidak cocok');
      return;
    }

    try {
      await register(formData);
      navigate('/customer/home');
    } catch (error) {
      console.error('Registration error:', error);
      let errorMsg = 'Registrasi gagal. Silakan coba lagi.';
      
      if (error.response?.data?.message) {
        errorMsg = error.response.data.message;
      } else if (error.response?.data?.errors) {
        const errors = error.response.data.errors;
        errorMsg = Object.values(errors).flat().join(', ');
      } else if (error.message) {
        errorMsg = error.message;
      }
      
      setError(errorMsg);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen px-4 py-12 bg-gradient-to-br from-gray-900 to-gray-800 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-6 sm:space-y-8">
        <div className="text-center">
          <div className="flex items-center justify-center mb-2">
            <Film size={48} className="text-red-600" />
          </div>
          <h2 className="text-3xl font-extrabold text-white sm:text-4xl">
            Absolute Cinema
          </h2>
          <p className="mt-2 text-sm text-gray-300">
            Daftar akun baru untuk mulai memesan tiket
          </p>
        </div>

        <form className="mt-6 space-y-4 sm:mt-8 sm:space-y-6" onSubmit={handleSubmit}>
          <div className="p-6 space-y-3 bg-white shadow-lg sm:p-8 rounded-xl sm:space-y-4">
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
              <div className="px-4 py-3 text-sm text-red-700 border border-red-200 rounded-lg bg-red-50">
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

            <div className="mt-4 text-center">
              <p className="text-sm text-gray-600">
                Sudah punya akun?{' '}
                <Link to="/login" className="font-medium text-red-600 hover:text-red-500">
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
