import { useState, useEffect } from 'react';
import { adminApi } from '../../api/adminApi';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import { Plus, Edit, Trash2, UserCheck, UserX } from 'lucide-react';

export default function ManageCashiers() {
  const [cashiers, setCashiers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const itemsPerPage = 10;
  
  useEffect(() => {
    fetchCashiers();
  }, []);

  const fetchCashiers = async () => {
    try {
      const response = await adminApi.getUsers();
      setCashiers(response.data.filter(u => u.role === 'cashier'));
    } catch (error) {
      console.error('Error fetching cashiers:', error);
    } finally {
      setLoading(false);
    }
  };
  const [showForm, setShowForm] = useState(false);
  const [editingCashier, setEditingCashier] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: ''
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      const userData = {
        ...formData,
        role: 'cashier'
      };
      
      if (editingCashier) {
        await adminApi.updateUser(editingCashier.id, userData);
      } else {
        await adminApi.createUser(userData);
      }
      
      await fetchCashiers();
      resetForm();
      alert('Kasir berhasil disimpan');
    } catch (error) {
      console.error('Error saving cashier:', error);
      alert('Gagal menyimpan kasir');
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      email: '',
      password: ''
    });
    setShowForm(false);
    setEditingCashier(null);
  };

  const handleEdit = (cashier) => {
    setFormData({
      name: cashier.name,
      email: cashier.email,
      password: ''
    });
    setEditingCashier(cashier);
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (confirm('Yakin ingin menghapus kasir ini?')) {
      try {
        await adminApi.deleteUser(id);
        await fetchCashiers();
      } catch (error) {
        console.error('Error deleting cashier:', error);
        alert('Gagal menghapus kasir');
      }
    }
  };

  const handleToggleStatus = async (id) => {
    // Backend doesn't have status field, this is for future implementation
    alert('Fitur toggle status akan diimplementasikan di backend');
  };

  const filteredCashiers = cashiers.filter(cashier => {
    return cashier.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
           cashier.email.toLowerCase().includes(searchTerm.toLowerCase());
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
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Kelola Kasir</h1>
        <Button onClick={() => setShowForm(true)} className="flex items-center">
          <Plus size={16} className="mr-2" />
          Tambah Kasir
        </Button>
      </div>

      {!showForm && (
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="p-4 sm:p-6 border-b space-y-4">
            <h2 className="text-lg sm:text-xl font-semibold">Daftar Kasir</h2>
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
                {filteredCashiers.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="py-8 text-center text-gray-500">
                      {searchTerm ? 'Tidak ada data yang sesuai' : 'Belum ada data kasir'}
                    </td>
                  </tr>
                ) : filteredCashiers
                  .slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)
                  .map(cashier => (
                  <tr key={cashier.id} className="border-b hover:bg-gray-50">
                    <td className="py-3 px-4 font-mono">{cashier.id}</td>
                    <td className="py-3 px-4 font-semibold">{cashier.name}</td>
                    <td className="py-3 px-4">{cashier.email}</td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        (cashier.status || 'active') === 'active'
                          ? 'bg-green-100 text-green-800'
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {(cashier.status || 'active') === 'active' ? 'Aktif' : 'Nonaktif'}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex space-x-2">
                        <Button size="sm" variant="outline" onClick={() => handleEdit(cashier)}>
                          <Edit size={14} />
                        </Button>
                        <Button size="sm" variant="danger" onClick={() => handleDelete(cashier.id)}>
                          <Trash2 size={14} />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="flex items-center justify-between p-4 border-t">
            <p className="text-sm text-gray-600">
              Menampilkan {((currentPage - 1) * itemsPerPage) + 1} - {Math.min(currentPage * itemsPerPage, filteredCashiers.length)} dari {filteredCashiers.length} kasir
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
              {Array.from({ length: Math.ceil(filteredCashiers.length / itemsPerPage) }, (_, i) => i + 1)
                .filter(page => page === 1 || page === Math.ceil(filteredCashiers.length / itemsPerPage) || Math.abs(page - currentPage) <= 1)
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
                onClick={() => setCurrentPage(p => Math.min(Math.ceil(filteredCashiers.length / itemsPerPage), p + 1))}
                disabled={currentPage === Math.ceil(filteredCashiers.length / itemsPerPage)}
              >
                Next →
              </Button>
            </div>
          </div>
        </div>
      )}

      {showForm && (
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-xl font-bold mb-6">
            {editingCashier ? 'Edit Kasir' : 'Tambah Kasir Baru'}
          </h2>
          
          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Nama Lengkap"
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                required
              />
              
              <Input
                label="Email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
                required
              />
              
              <Input
                label={editingCashier ? "Password Baru (kosongkan jika tidak diubah)" : "Password"}
                type="password"
                value={formData.password}
                onChange={(e) => setFormData({...formData, password: e.target.value})}
                required={!editingCashier}
              />
            </div>
            
            <div className="flex space-x-4 mt-6">
              <Button type="submit">
                {editingCashier ? 'Update Kasir' : 'Tambah Kasir'}
              </Button>
              <Button type="button" variant="outline" onClick={resetForm}>
                Batal
              </Button>
            </div>
          </form>
        </div>
      )}

      <div className="mt-8 bg-white rounded-lg shadow-md p-4 sm:p-6">
        <h2 className="text-lg sm:text-xl font-semibold mb-4">Statistik Kasir</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
          <div className="text-center">
            <p className="text-3xl font-bold text-blue-600">{cashiers.length}</p>
            <p className="text-gray-600">Total Kasir</p>
          </div>
          <div className="text-center">
            <p className="text-3xl font-bold text-green-600">
              {cashiers.filter(c => (c.status || 'active') === 'active').length}
            </p>
            <p className="text-gray-600">Kasir Aktif</p>
          </div>
        </div>
      </div>
    </div>
  );
}