import { useState, useEffect } from 'react';
import { adminApi } from '../../api/adminApi';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import { Plus, Edit, Trash2, UserCheck, UserX } from 'lucide-react';

export default function ManageCashiers() {
  const [cashiers, setCashiers] = useState([]);
  const [loading, setLoading] = useState(true);
  
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
    phone: '',
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
      phone: '',
      password: ''
    });
    setShowForm(false);
    setEditingCashier(null);
  };

  const handleEdit = (cashier) => {
    setFormData({
      name: cashier.name,
      email: cashier.email,
      phone: cashier.phone,
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
                label="Nomor Telepon"
                value={formData.phone}
                onChange={(e) => setFormData({...formData, phone: e.target.value})}
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

      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="p-4 sm:p-6 border-b">
          <h2 className="text-lg sm:text-xl font-semibold">Daftar Kasir</h2>
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
              {cashiers.map(cashier => (
                <tr key={cashier.id} className="border-b hover:bg-gray-50">
                  <td className="py-3 px-4 font-mono">{cashier.id}</td>
                  <td className="py-3 px-4 font-semibold">{cashier.name}</td>
                  <td className="py-3 px-4">{cashier.email}</td>
                  <td className="py-3 px-4">{cashier.phone}</td>
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
                      <Button
                        size="sm"
                        variant={(cashier.status || 'active') === 'active' ? 'danger' : 'primary'}
                        onClick={() => handleToggleStatus(cashier.id)}
                      >
                        {(cashier.status || 'active') === 'active' ? <UserX size={14} /> : <UserCheck size={14} />}
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
      </div>

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