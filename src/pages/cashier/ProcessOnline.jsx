import { useState, useEffect } from 'react';
import { cashierApi } from '../../api/cashierApi';
import api from '../../lib/api';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import { Search } from 'lucide-react';
import { formatRupiah } from '../../utils/currency';

export default function ProcessOnline() {
  const [searchQuery, setSearchQuery] = useState('');
  const [orders, setOrders] = useState([]);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const response = await api.get('/orders');
      const data = response.data.data || [];
      setOrders(data.filter(o => o.order_type === 'online' && o.payment_status === 'paid'));
    } catch (error) {
      console.error('Error fetching orders:', error);
      setOrders([]);
    }
  };

  const handleSearch = async () => {
    if (!searchQuery) return;
    
    setLoading(true);
    try {
      const response = await api.get(`/orders/${searchQuery}`);
      setSelectedOrder(response.data.data);
    } catch (error) {
      alert('Order tidak ditemukan');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    return status === 'paid' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800';
  };

  return (
    <div>
      <h1 className="text-2xl sm:text-3xl font-bold mb-6 sm:mb-8">Proses Tiket Online</h1>

      <div className="bg-white rounded-lg shadow-md p-4 sm:p-6 mb-6 sm:mb-8">
        <h2 className="text-xl font-bold mb-4">Cari Pesanan</h2>
        <div className="flex space-x-4">
          <Input
            placeholder="Masukkan ID Pesanan"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
          />
          <Button onClick={handleSearch} disabled={loading} className="flex items-center">
            <Search size={16} className="mr-2" />
            {loading ? 'Mencari...' : 'Cari'}
          </Button>
        </div>
      </div>

      {selectedOrder && (
        <div className="bg-white rounded-lg shadow-md p-4 sm:p-6 mb-6 sm:mb-8">
          <div className="flex justify-between items-start mb-6">
            <h2 className="text-xl font-bold">Detail Pesanan</h2>
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(selectedOrder.payment_status)}`}>
              {selectedOrder.payment_status === 'paid' ? 'LUNAS' : selectedOrder.payment_status.toUpperCase()}
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-semibold mb-3">Informasi Tiket</h3>
              <div className="space-y-2 text-sm">
                <div><strong>No. Order:</strong> {selectedOrder.order_number}</div>
                <div><strong>Film:</strong> {selectedOrder.schedule?.film?.title || 'N/A'}</div>
                <div><strong>Studio:</strong> {selectedOrder.schedule?.studio?.name || 'N/A'}</div>
                <div><strong>Waktu:</strong> {selectedOrder.schedule?.show_time ? new Date(selectedOrder.schedule.show_time).toLocaleString('id-ID') : 'N/A'}</div>
                <div><strong>Kursi:</strong> {selectedOrder.orderItems?.map(item => `${item.seat?.row}${item.seat?.column}`).join(', ') || '-'}</div>
              </div>
            </div>

            <div>
              <h3 className="font-semibold mb-3">Informasi Pembayaran</h3>
              <div className="space-y-2 text-sm">
                <div><strong>Total:</strong> {formatRupiah(parseFloat(selectedOrder.total_amount || 0))}</div>
                <div><strong>Jumlah Tiket:</strong> {selectedOrder.orderItems?.length || 0}</div>
                <div><strong>Tanggal Pesan:</strong> {new Date(selectedOrder.created_at).toLocaleString('id-ID')}</div>
              </div>
            </div>
          </div>

          {selectedOrder.payment_status === 'paid' && (
            <div className="mt-6 bg-green-50 p-4 rounded-lg">
              <p className="text-green-800">✅ Pesanan telah dibayar. Pelanggan dapat masuk ke bioskop.</p>
            </div>
          )}
        </div>
      )}

      <div className="bg-white rounded-lg shadow-md p-4 sm:p-6">
        <h2 className="text-lg sm:text-xl font-semibold mb-4">Pesanan Online Terbaru</h2>
        {orders.length === 0 ? (
          <p className="text-gray-500 text-center py-8">Tidak ada pesanan online</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[600px] text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="text-left py-3 px-4">No. Order</th>
                  <th className="text-left py-3 px-4">Film</th>
                  <th className="text-left py-3 px-4">Total</th>
                  <th className="text-left py-3 px-4">Status</th>
                  <th className="text-left py-3 px-4">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {orders.slice(0, 10).map(order => (
                  <tr key={order.id} className="border-b hover:bg-gray-50">
                    <td className="py-3 px-4 font-mono text-xs">{order.order_number}</td>
                    <td className="py-3 px-4">{order.schedule?.film?.title || 'N/A'}</td>
                    <td className="py-3 px-4">{formatRupiah(parseFloat(order.total_amount || 0))}</td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-1 rounded-full text-xs ${getStatusColor(order.payment_status)}`}>
                        {order.payment_status === 'paid' ? 'LUNAS' : order.payment_status.toUpperCase()}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <Button size="sm" onClick={() => setSelectedOrder(order)}>
                        Lihat
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
