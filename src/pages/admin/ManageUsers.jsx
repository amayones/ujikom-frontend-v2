import { useState, useEffect } from 'react';
import { adminApi } from '../../api/adminApi';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import { Trash2 } from 'lucide-react';

export default function ManageUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const itemsPerPage = 10;

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

  const handleDelete = async (id) => {
    if (confirm('Yakin ingin menghapus pelanggan ini?')) {
      try {
        await adminApi.deleteUser(id);
        await fetchUsers();
      } catch (error) {
        console.error('Error deleting user:', error);
        alert('Gagal menghapus pelanggan');
      }
    }
  };

  const filteredUsers = users.filter(user => {
    return user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
           user.email.toLowerCase().includes(searchTerm.toLowerCase());
  });

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
        <div className="p-4 sm:p-6 border-b space-y-4">
          <h2 className="text-lg sm:text-xl font-semibold">Daftar Pelanggan</h2>
          <input
            type="text"
            placeholder="Cari nama atau email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md"
          />
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full min-w-[600px]">
            <thead className="bg-gray-50">
              <tr>
                <th className="text-left py-3 px-4">ID</th>
                <th className="text-left py-3 px-4">Nama</th>
                <th className="text-left py-3 px-4">Email</th>
                <th className="text-left py-3 px-4">Status</th>
                <th className="text-left py-3 px-4">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan="5" className="py-8 text-center text-gray-500">
                    {searchTerm ? 'Tidak ada data yang sesuai' : 'Belum ada data pelanggan'}
                  </td>
                </tr>
              ) : filteredUsers
                .slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)
                .map(user => (
                <tr key={user.id} className="border-b hover:bg-gray-50">
                  <td className="py-3 px-4 font-mono">{user.id}</td>
                  <td className="py-3 px-4 font-semibold">{user.name}</td>
                  <td className="py-3 px-4">{user.email}</td>
                  <td className="py-3 px-4">
                    <span className="px-2 py-1 rounded-full text-xs bg-green-100 text-green-800">
                      Aktif
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <Button size="sm" variant="danger" onClick={() => handleDelete(user.id)}>
                      <Trash2 size={14} />
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="flex items-center justify-between p-4 border-t">
            <p className="text-sm text-gray-600">
              Menampilkan {((currentPage - 1) * itemsPerPage) + 1} - {Math.min(currentPage * itemsPerPage, filteredUsers.length)} dari {filteredUsers.length} pelanggan
            </p>
            <div className="flex gap-2">
              <Button 
                size="sm" 
                variant="outline" 
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
              >
                ← Prev
              </Button>
              {Array.from({ length: Math.ceil(filteredUsers.length / itemsPerPage) }, (_, i) => i + 1)
                .filter(page => page === 1 || page === Math.ceil(filteredUsers.length / itemsPerPage) || Math.abs(page - currentPage) <= 1)
                .map((page, idx, arr) => (
                  <span key={page}>
                    {idx > 0 && arr[idx - 1] !== page - 1 && <span className="px-2">...</span>}
                    <Button
                      size="sm"
                      variant={currentPage === page ? 'primary' : 'outline'}
                      onClick={() => setCurrentPage(page)}
                    >
                      {page}
                    </Button>
                  </span>
                ))}
              <Button 
                size="sm" 
                variant="outline" 
                onClick={() => setCurrentPage(p => Math.min(Math.ceil(filteredUsers.length / itemsPerPage), p + 1))}
                disabled={currentPage === Math.ceil(filteredUsers.length / itemsPerPage)}
              >
                Next →
              </Button>
            </div>
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
            <p className="text-3xl font-bold text-green-600">{users.length}</p>
            <p className="text-gray-600">Pelanggan Aktif</p>
          </div>
        </div>
      </div>
    </div>
  );
}