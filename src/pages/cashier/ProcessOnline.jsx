import { useState, useEffect } from 'react';
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
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    fetchOrders();
    
    const handleOrderCreated = () => {
      fetchOrders();
    };
    
    window.addEventListener('orderCreated', handleOrderCreated);
    return () => window.removeEventListener('orderCreated', handleOrderCreated);
  }, []);

  const fetchOrders = async () => {
    try {
      const response = await api.get('/orders');
      console.log('All orders from API:', response.data.data);
      const data = response.data.data || [];
      console.log('Total orders:', data.length);
      setOrders(data.sort((a, b) => new Date(b.created_at) - new Date(a.created_at)));
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

  const getOrderTypeLabel = (type) => {
    if (type === 'online') return 'Customer Online';
    if (type === 'offline') return 'Kasir Tunai';
    return 'Kasir Online';
  };

  const filteredOrders = orders.filter(o => {
    if (o.payment_status !== 'paid') return false;
    if (filter === 'all') return true;
    if (filter === 'customer') return o.order_type === 'online';
    if (filter === 'cashier') return o.order_type === 'offline' || o.order_type === 'cashier_online';
    return true;
  });

  return (
    <div>
      <h1 className="text-2xl sm:text-3xl font-bold mb-6 sm:mb-8">Semua Pembelian Tiket</h1>

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
            <div className="flex gap-2">
              <span className="px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                {getOrderTypeLabel(selectedOrder.order_type)}
              </span>
              <span className="px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                LUNAS
              </span>
            </div>
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
                {selectedOrder.customer_name && <div><strong>Nama:</strong> {selectedOrder.customer_name}</div>}
                {selectedOrder.customer_phone && <div><strong>Telepon:</strong> {selectedOrder.customer_phone}</div>}
              </div>
            </div>

            <div>
              <h3 className="font-semibold mb-3">Informasi Pembayaran</h3>
              <div className="space-y-2 text-sm">
                <div><strong>Total:</strong> {formatRupiah(parseFloat(selectedOrder.total_amount || 0))}</div>
                <div><strong>Jumlah Tiket:</strong> {selectedOrder.orderItems?.length || 0}</div>
                <div><strong>Tanggal Pesan:</strong> {new Date(selectedOrder.created_at).toLocaleString('id-ID')}</div>
                <div><strong>Tipe Order:</strong> {getOrderTypeLabel(selectedOrder.order_type)}</div>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="bg-white rounded-lg shadow-md p-4 sm:p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg sm:text-xl font-semibold">Daftar Pembelian ({filteredOrders.length})</h2>
          <div className="flex gap-2">
            <Button size="sm" variant={filter === 'all' ? 'primary' : 'outline'} onClick={() => setFilter('all')}>Semua</Button>
            <Button size="sm" variant={filter === 'customer' ? 'primary' : 'outline'} onClick={() => setFilter('customer')}>Customer</Button>
            <Button size="sm" variant={filter === 'cashier' ? 'primary' : 'outline'} onClick={() => setFilter('cashier')}>Kasir</Button>
            <Button size="sm" variant="outline" onClick={fetchOrders}>Refresh</Button>
          </div>
        </div>
        {filteredOrders.length === 0 ? (
          <p className="text-gray-500 text-center py-8">Tidak ada pesanan</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[700px] text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="text-left py-3 px-4">No. Order</th>
                  <th className="text-left py-3 px-4">Film</th>
                  <th className="text-left py-3 px-4">Total</th>
                  <th className="text-left py-3 px-4">Tipe</th>
                  <th className="text-left py-3 px-4">Tanggal</th>
                  <th className="text-left py-3 px-4">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {filteredOrders.map(order => (
                  <tr key={order.id} className="border-b hover:bg-gray-50">
                    <td className="py-3 px-4 font-mono text-xs">{order.order_number}</td>
                    <td className="py-3 px-4">{order.schedule?.film?.title || 'N/A'}</td>
                    <td className="py-3 px-4">{formatRupiah(parseFloat(order.total_amount || 0))}</td>
                    <td className="py-3 px-4">
                      <span className="px-2 py-1 rounded-full text-xs bg-blue-100 text-blue-800">
                        {getOrderTypeLabel(order.order_type)}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-xs">{new Date(order.created_at).toLocaleDateString('id-ID')}</td>
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
