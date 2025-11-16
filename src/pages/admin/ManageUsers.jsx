import { useState, useEffect } from 'react';
import { adminApi } from '../../api/adminApi';
import Button from '../../components/ui/Button';
import { UserCheck, UserX, RotateCcw } from 'lucide-react';

export default function ManageUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const response = await adminApi.getUsers();
      setUsers(response.data.filter(u => u.role === 'customer'));
    } catch (error) {
      console.error('Error fetching users:', error);
      alert('Gagal memuat data pelanggan');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleStatus = async (userId) => {
    const user = users.find(u => u.id === userId);
    const action = user?.deleted_at ? 'mengaktifkan' : 'menonaktifkan';
    
    if (confirm(`Yakin ingin ${action} pelanggan ini?`)) {
      try {
        await adminApi.toggleUserStatus(userId);
        await fetchUsers();
        alert(`Pelanggan berhasil ${user?.deleted_at ? 'diaktifkan' : 'dinonaktifkan'}`);
      } catch (error) {
        console.error('Error toggling status:', error);
        alert('Gagal mengubah status pelanggan');
      }
    }
  };

  const handleResetPassword = async (userId) => {
    if (confirm('Yakin ingin reset password user ini? Password akan direset menjadi "password"')) {
      try {
        const response = await adminApi.resetUserPassword(userId);
        alert(`Password berhasil direset!\nEmail: ${response.data.email}\nPassword baru: ${response.data.new_password}`);
      } catch (error) {
        console.error('Error resetting password:', error);
        alert('Gagal reset password');
      }
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-lg">Memuat data...</div>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-3xl font-bold mb-8">Kelola Pelanggan</h1>

      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="p-4 sm:p-6 border-b">
          <h2 className="text-lg sm:text-xl font-semibold">Daftar Pelanggan</h2>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full min-w-[600px]">
            <thead className="bg-gray-50">
              <tr>
                <th className="text-left py-3 px-4">ID</th>
                <th className="text-left py-3 px-4">Nama</th>
                <th className="text-left py-3 px-4">Email</th>
                <th className="text-left py-3 px-4">Telepon</th>
                <th className="text-left py-3 px-4">Status</th>
                <th className="text-left py-3 px-4">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {users.length === 0 ? (
                <tr>
                  <td colSpan="6" className="py-8 text-center text-gray-500">
                    Belum ada data pelanggan
                  </td>
                </tr>
              ) : users.map(user => (
                <tr key={user.id} className="border-b hover:bg-gray-50">
                  <td className="py-3 px-4 font-mono">{user.id}</td>
                  <td className="py-3 px-4 font-semibold">{user.name}</td>
                  <td className="py-3 px-4">{user.email}</td>
                  <td className="py-3 px-4">{user.phone}</td>
                  <td className="py-3 px-4">
                    <span className={`px-2 py-1 rounded-full text-xs ${
                      !user.deleted_at
                        ? 'bg-green-100 text-green-800'
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {!user.deleted_at ? 'Aktif' : 'Nonaktif'}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex space-x-2">
                      <Button
                        size="sm"
                        variant={!user.deleted_at ? 'danger' : 'primary'}
                        onClick={() => handleToggleStatus(user.id)}
                        title={!user.deleted_at ? 'Nonaktifkan' : 'Aktifkan'}
                      >
                        {!user.deleted_at ? <UserX size={14} /> : <UserCheck size={14} />}
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleResetPassword(user.id)}
                        title="Reset Password"
                      >
                        <RotateCcw size={14} />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="mt-8 bg-white rounded-lg shadow-md p-4 sm:p-6">
        <h2 className="text-lg sm:text-xl font-semibold mb-4">Statistik Pelanggan</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
          <div className="text-center">
            <p className="text-3xl font-bold text-blue-600">{users.length}</p>
            <p className="text-gray-600">Total Pelanggan</p>
          </div>
          <div className="text-center">
            <p className="text-3xl font-bold text-green-600">
              {users.filter(u => !u.deleted_at).length}
            </p>
            <p className="text-gray-600">Pelanggan Aktif</p>
          </div>
          <div className="text-center">
            <p className="text-3xl font-bold text-red-600">
              {users.filter(u => u.deleted_at).length}
            </p>
            <p className="text-gray-600">Pelanggan Nonaktif</p>
          </div>
        </div>
      </div>
    </div>
  );
}