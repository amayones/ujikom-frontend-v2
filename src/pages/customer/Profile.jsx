import { useState } from 'react';
import { useAuthStore } from '../../store/authStore';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';

export default function Profile() {
  const { user, updateProfile } = useAuthStore();
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || ''
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      await updateProfile({
        name: formData.name,
        phone: formData.phone
      });
      setMessage('Profile berhasil diperbarui');
    } catch (error) {
      setMessage(error.response?.data?.message || 'Gagal memperbarui profile');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-2xl sm:text-3xl font-bold mb-6 sm:mb-8">Profile Saya</h1>
      
      <div className="bg-white rounded-lg shadow-md p-4 sm:p-6 lg:p-8">
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
          
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
            <Button type="submit" disabled={loading}>
              {loading ? 'Menyimpan...' : 'Simpan Perubahan'}
            </Button>
            <Button 
              type="button" 
              variant="outline"
              onClick={() => setFormData({
                name: user?.name || '',
                email: user?.email || '',
                phone: user?.phone || ''
              })}
            >
              Reset
            </Button>
          </div>
        </form>
      </div>
      
      <div className="bg-white rounded-lg shadow-md p-4 sm:p-6 lg:p-8 mt-6">
        <h2 className="text-lg sm:text-xl font-bold mb-4">Informasi Akun</h2>
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