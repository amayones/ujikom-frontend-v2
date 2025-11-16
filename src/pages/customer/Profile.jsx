import { useState, useCallback, useMemo, useEffect } from 'react';
import { useAuthStore } from '../../store/authStore';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import api from '../../lib/api';

export default function Profile() {
  const { user, updateProfile } = useAuthStore();
  const initialFormData = useMemo(() => ({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || ''
  }), [user]);
  
  const [formData, setFormData] = useState(initialFormData);
  
  useEffect(() => {
    if (user?.name || user?.email || user?.phone) {
      setFormData({
        name: user.name || '',
        email: user.email || '',
        phone: user.phone || ''
      });
    }
  }, [user]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  
  const [passwordData, setPasswordData] = useState({
    current_password: '',
    new_password: '',
    new_password_confirmation: ''
  });
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [passwordMessage, setPasswordMessage] = useState('');

  const handleChange = useCallback((e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  }, []);

  const handleSubmit = useCallback(async (e) => {
    e.preventDefault();
    
    if (!formData.name?.trim() || !formData.phone?.trim()) {
      setMessage('Nama dan nomor telepon harus diisi');
      return;
    }
    
    setLoading(true);
    setMessage('');

    try {
      await updateProfile({
        name: formData.name.trim(),
        phone: formData.phone.trim()
      });
      setMessage('Profile berhasil diperbarui');
    } catch (error) {
      setMessage(error.message || error.response?.data?.message || 'Gagal memperbarui profile');
    } finally {
      setLoading(false);
    }
  }, [formData, updateProfile]);

  const handlePasswordChange = useCallback((e) => {
    const { name, value } = e.target;
    setPasswordData(prev => ({
      ...prev,
      [name]: value
    }));
  }, []);

  const handlePasswordSubmit = useCallback(async (e) => {
    e.preventDefault();
    setPasswordMessage('');

    if (!passwordData.current_password || !passwordData.new_password || !passwordData.new_password_confirmation) {
      setPasswordMessage('Semua field password harus diisi');
      return;
    }

    if (passwordData.new_password.length < 8) {
      setPasswordMessage('Password baru minimal 8 karakter');
      return;
    }

    if (passwordData.new_password !== passwordData.new_password_confirmation) {
      setPasswordMessage('Konfirmasi password tidak cocok');
      return;
    }

    setPasswordLoading(true);

    try {
      const response = await api.put('/profile/password', {
        current_password: passwordData.current_password,
        new_password: passwordData.new_password,
        new_password_confirmation: passwordData.new_password_confirmation
      });
      
      if (response?.data) {
        setPasswordMessage('Password berhasil diubah');
        setPasswordData({
          current_password: '',
          new_password: '',
          new_password_confirmation: ''
        });
      } else {
        throw new Error('Invalid response from server');
      }
    } catch (error) {
      console.error('Password update error:', error);
      let errorMsg = 'Gagal mengubah password';
      
      if (error.response?.data?.message) {
        errorMsg = error.response.data.message;
      } else if (error.response?.data?.errors) {
        const errors = error.response.data.errors;
        errorMsg = Object.values(errors).flat().join(', ');
      } else if (error.message) {
        errorMsg = error.message;
      }
      
      setPasswordMessage(errorMsg);
    } finally {
      setPasswordLoading(false);
    }
  }, [passwordData]);

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-bold mb-2">👤 Profile Saya</h1>
        <p className="text-gray-600">Kelola informasi akun dan keamanan Anda</p>
      </div>
      
      <div className="p-6 bg-white rounded-xl shadow-lg">
        <form onSubmit={handleSubmit}>
          <Input
            label="Nama Lengkap"
            name="name"
            value={formData.name}
            onChange={handleChange}
            required
          />
          
          <Input
            label="Email"
            name="email"
            type="email"
            value={formData.email}
            disabled
          />
          
          <Input
            label="Nomor Telepon"
            name="phone"
            value={formData.phone}
            onChange={handleChange}
            required
          />
          
          {message && (
            <div className={`p-3 rounded mb-4 ${
              message.includes('berhasil') 
                ? 'bg-green-100 text-green-700' 
                : 'bg-red-100 text-red-700'
            }`}>
              {message}
            </div>
          )}
          
          <div className="flex flex-col gap-3 sm:flex-row sm:gap-4">
            <Button type="submit" disabled={loading}>
              {loading ? 'Menyimpan...' : 'Simpan Perubahan'}
            </Button>
            <Button 
              type="button" 
              variant="outline"
              onClick={() => setFormData(initialFormData)}
            >
              Reset
            </Button>
          </div>
        </form>
      </div>
      
      <div className="p-6 bg-white rounded-xl shadow-lg">
        <h2 className="text-xl font-bold mb-4">Ubah Password</h2>
        <form onSubmit={handlePasswordSubmit}>
          <Input
            label="Password Saat Ini"
            name="current_password"
            type="password"
            value={passwordData.current_password}
            onChange={handlePasswordChange}
            placeholder="Masukkan password saat ini"
            required
          />
          
          <Input
            label="Password Baru"
            name="new_password"
            type="password"
            value={passwordData.new_password}
            onChange={handlePasswordChange}
            placeholder="Minimal 8 karakter"
            required
          />
          
          <Input
            label="Konfirmasi Password Baru"
            name="new_password_confirmation"
            type="password"
            value={passwordData.new_password_confirmation}
            onChange={handlePasswordChange}
            placeholder="Ulangi password baru"
            required
          />
          
          {passwordMessage && (
            <div className={`p-3 rounded mb-4 ${
              passwordMessage.includes('berhasil') 
                ? 'bg-green-100 text-green-700' 
                : 'bg-red-100 text-red-700'
            }`}>
              {passwordMessage}
            </div>
          )}
          
          <Button type="submit" disabled={passwordLoading}>
            {passwordLoading ? 'Mengubah...' : 'Ubah Password'}
          </Button>
        </form>
      </div>
      
      <div className="p-6 bg-gradient-to-br from-blue-50 to-purple-50 rounded-xl shadow-lg">
        <h2 className="text-xl font-bold mb-4">Informasi Akun</h2>
        <div className="space-y-3">
          <div>
            <span className="font-semibold">Role:</span>
            <span className="ml-2 capitalize">{user?.role}</span>
          </div>
          <div>
            <span className="font-semibold">Member sejak:</span>
            <span className="ml-2">Januari 2024</span>
          </div>
          <div>
            <span className="font-semibold">Status:</span>
            <span className="ml-2 text-green-600">Aktif</span>
          </div>
        </div>
      </div>
    </div>
  );
}