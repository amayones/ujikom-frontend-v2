import { useState, useEffect } from 'react';
import { discountApi } from '../../api/discountApi';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import { Plus, Edit, Trash2, Tag, Calendar } from 'lucide-react';
import { formatRupiah } from '../../utils/currency';

export default function ManageDiscounts() {
  const [discounts, setDiscounts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingDiscount, setEditingDiscount] = useState(null);
  const [formData, setFormData] = useState({
    code: '',
    name: '',
    description: '',
    type: 'percentage',
    value: '',
    max_uses: '',
    valid_from: '',
    valid_until: '',
    is_active: true
  });

  useEffect(() => {
    fetchDiscounts();
  }, []);

  const fetchDiscounts = async () => {
    try {
      const response = await discountApi.getAll();
      setDiscounts(response.data.data);
    } catch (error) {
      console.error('Error fetching discounts:', error);
      alert('Gagal memuat data diskon');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      if (editingDiscount) {
        await discountApi.update(editingDiscount.id, formData);
        alert('Diskon berhasil diperbarui');
      } else {
        await discountApi.create(formData);
        alert('Diskon berhasil dibuat');
      }
      
      await fetchDiscounts();
      resetForm();
    } catch (error) {
      console.error('Error saving discount:', error);
      alert(error.response?.data?.message || 'Gagal menyimpan diskon');
    }
  };

  const resetForm = () => {
    setFormData({
      code: '',
      name: '',
      description: '',
      type: 'percentage',
      value: '',
      max_uses: '',
      valid_from: '',
      valid_until: '',
      is_active: true
    });
    setShowForm(false);
    setEditingDiscount(null);
  };

  const handleEdit = (discount) => {
    setFormData({
      code: discount.code,
      name: discount.name,
      description: discount.description || '',
      type: discount.type,
      value: discount.value,
      max_uses: discount.max_uses || '',
      valid_from: discount.valid_from,
      valid_until: discount.valid_until,
      is_active: discount.is_active
    });
    setEditingDiscount(discount);
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (confirm('Yakin ingin menghapus diskon ini?')) {
      try {
        await discountApi.delete(id);
        await fetchDiscounts();
        alert('Diskon berhasil dihapus');
      } catch (error) {
        console.error('Error deleting discount:', error);
        alert('Gagal menghapus diskon');
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
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Kelola Diskon</h1>
        <Button onClick={() => setShowForm(true)} className="flex items-center bg-emerald-600 hover:bg-emerald-700">
          <Plus size={16} className="mr-2" />
          Tambah Diskon
        </Button>
      </div>

      {!showForm && (
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="p-6 border-b">
            <h2 className="text-xl font-semibold">Daftar Diskon</h2>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="text-left py-3 px-4">Kode</th>
                  <th className="text-left py-3 px-4">Nama</th>
                  <th className="text-left py-3 px-4">Tipe</th>
                  <th className="text-left py-3 px-4">Nilai</th>
                  <th className="text-left py-3 px-4">Penggunaan</th>
                  <th className="text-left py-3 px-4">Periode</th>
                  <th className="text-left py-3 px-4">Status</th>
                  <th className="text-left py-3 px-4">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {discounts.length === 0 ? (
                  <tr>
                    <td colSpan="8" className="py-8 text-center text-gray-500">
                      Belum ada data diskon
                    </td>
                  </tr>
                ) : discounts.map(discount => (
                  <tr key={discount.id} className="border-b hover:bg-gray-50">
                    <td className="py-3 px-4">
                      <div className="flex items-center">
                        <Tag size={16} className="mr-2 text-emerald-600" />
                        <span className="font-mono font-bold">{discount.code}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4">{discount.name}</td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        discount.type === 'percentage' 
                          ? 'bg-blue-100 text-blue-800' 
                          : 'bg-purple-100 text-purple-800'
                      }`}>
                        {discount.type === 'percentage' ? 'Persentase' : 'Nominal'}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-semibold text-emerald-600">
                      {discount.type === 'percentage' 
                        ? `${discount.value}%` 
                        : formatRupiah(discount.value)}
                    </td>
                    <td className="py-3 px-4">
                      {discount.max_uses 
                        ? `${discount.used_count}/${discount.max_uses}` 
                        : `${discount.used_count}/∞`}
                    </td>
                    <td className="py-3 px-4 text-sm">
                      <div className="flex items-center text-gray-600">
                        <Calendar size={14} className="mr-1" />
                        {new Date(discount.valid_from).toLocaleDateString('id-ID')} - {new Date(discount.valid_until).toLocaleDateString('id-ID')}
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        discount.is_active 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {discount.is_active ? 'Aktif' : 'Nonaktif'}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex space-x-2">
                        <Button size="sm" variant="outline" onClick={() => handleEdit(discount)}>
                          <Edit size={14} />
                        </Button>
                        <Button size="sm" variant="danger" onClick={() => handleDelete(discount.id)}>
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
      )}

      {showForm && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-bold mb-6">
            {editingDiscount ? 'Edit Diskon' : 'Tambah Diskon Baru'}
          </h2>
          
          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Kode Diskon"
                value={formData.code}
                onChange={(e) => setFormData({...formData, code: e.target.value.toUpperCase()})}
                placeholder="DISKON50"
                required
              />
              
              <Input
                label="Nama Diskon"
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                placeholder="Diskon 50%"
                required
              />
              
              <div className="md:col-span-2">
                <label className="block text-sm font-medium mb-1">Deskripsi</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  rows="3"
                  placeholder="Deskripsi diskon..."
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Tipe Diskon</label>
                <select
                  value={formData.type}
                  onChange={(e) => setFormData({...formData, type: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  required
                >
                  <option value="percentage">Persentase (%)</option>
                  <option value="fixed">Nominal (Rp)</option>
                </select>
              </div>
              
              <Input
                label={formData.type === 'percentage' ? 'Nilai (%)' : 'Nilai (Rp)'}
                type="number"
                value={formData.value}
                onChange={(e) => setFormData({...formData, value: e.target.value})}
                placeholder={formData.type === 'percentage' ? '50' : '50000'}
                min="0"
                step={formData.type === 'percentage' ? '0.01' : '1000'}
                required
              />
              
              <Input
                label="Maksimal Penggunaan"
                type="number"
                value={formData.max_uses}
                onChange={(e) => setFormData({...formData, max_uses: e.target.value})}
                placeholder="Kosongkan untuk unlimited"
                min="1"
              />
              
              <Input
                label="Berlaku Dari"
                type="date"
                value={formData.valid_from}
                onChange={(e) => setFormData({...formData, valid_from: e.target.value})}
                required
              />
              
              <Input
                label="Berlaku Sampai"
                type="date"
                value={formData.valid_until}
                onChange={(e) => setFormData({...formData, valid_until: e.target.value})}
                required
              />
              
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="is_active"
                  checked={formData.is_active}
                  onChange={(e) => setFormData({...formData, is_active: e.target.checked})}
                  className="mr-2"
                />
                <label htmlFor="is_active" className="text-sm font-medium">Aktif</label>
              </div>
            </div>
            
            <div className="flex gap-4 mt-6">
              <Button type="submit" className="bg-emerald-600 hover:bg-emerald-700">
                {editingDiscount ? 'Update' : 'Simpan'}
              </Button>
              <Button type="button" variant="outline" onClick={resetForm}>
                Batal
              </Button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
