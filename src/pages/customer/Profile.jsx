import { useState, useCallback, useMemo, useEffect } from 'react';
import { useAuthStore } from '../../store/authStore';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';

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

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="mb-6 text-2xl font-bold sm:text-3xl sm:mb-8">Profile Saya</h1>
      
      <div className="p-4 bg-white rounded-lg shadow-md sm:p-6 lg:p-8">
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
      
      <div className="p-4 mt-6 bg-white rounded-lg shadow-md sm:p-6 lg:p-8">
        <h2 className="mb-4 text-lg font-bold sm:text-xl">Informasi Akun</h2>
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