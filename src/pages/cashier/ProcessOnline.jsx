import { useState, useEffect } from 'react';
import api from '../../lib/api';
import Button from '../../components/ui/Button';
import { formatRupiah } from '../../utils/currency';
import { RefreshCw } from 'lucide-react';

export default function ProcessOnline() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
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
    setLoading(true);
    try {
      const response = await api.get('/orders');
      const data = response.data.data || [];
      setOrders(data.sort((a, b) => new Date(b.created_at) - new Date(a.created_at)));
    } catch (error) {
      console.error('Error fetching orders:', error);
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    return status === 'paid' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800';
  };

  const getStatusText = (status) => {
    return status === 'paid' ? 'Lunas' : 'Pending';
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

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-lg">Memuat data pembelian...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold mb-2">📋 Semua Pembelian Tiket</h1>
          <p className="text-gray-600">Lihat semua transaksi dari customer dan kasir</p>
        </div>
        <Button onClick={fetchOrders} className="flex items-center" size="sm">
          <RefreshCw size={16} className="mr-2" />
          Refresh
        </Button>
      </div>

      <div className="flex gap-2">
        <Button size="sm" variant={filter === 'all' ? 'primary' : 'outline'} onClick={() => setFilter('all')}>
          Semua ({orders.filter(o => o.payment_status === 'paid').length})
        </Button>
        <Button size="sm" variant={filter === 'customer' ? 'primary' : 'outline'} onClick={() => setFilter('customer')}>
          Customer ({orders.filter(o => o.order_type === 'online' && o.payment_status === 'paid').length})
        </Button>
        <Button size="sm" variant={filter === 'cashier' ? 'primary' : 'outline'} onClick={() => setFilter('cashier')}>
          Kasir ({orders.filter(o => (o.order_type === 'offline' || o.order_type === 'cashier_online') && o.payment_status === 'paid').length})
        </Button>
      </div>
      
      {filteredOrders.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg shadow">
          <p className="text-gray-500 text-lg">Tidak ada pembelian</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredOrders.map(order => {
            const filmTitle = order.schedule?.film?.title || 'N/A';
            const studioName = order.schedule?.studio?.name || 'N/A';
            const showDate = order.schedule?.show_time ? new Date(order.schedule.show_time).toLocaleDateString('id-ID') : 'N/A';
            const showTime = order.schedule?.show_time ? new Date(order.schedule.show_time).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) : 'N/A';
            const orderItems = order.orderItems || order.order_items || [];
            const seats = orderItems
              .filter(item => item?.seat?.row && item?.seat?.column)
              .map(item => `${item.seat.row}${item.seat.column}`)
              .join(', ') || 'N/A';
            const total = parseFloat(order.total_amount) || 0;
            const customerName = order.customer_name || order.user?.name || 'N/A';
            
            return (
              <div key={order.id} className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-xl font-bold">{filmTitle}</h3>
                    <p className="text-gray-600">{studioName} - {showDate} {showTime}</p>
                    <p className="text-sm text-gray-500 mt-1">Customer: {customerName}</p>
                  </div>
                  <div className="flex flex-col gap-2 items-end">
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(order.payment_status)}`}>
                      {getStatusText(order.payment_status)}
                    </span>
                    <span className="px-3 py-1 rounded-full text-xs bg-blue-100 text-blue-800">
                      {getOrderTypeLabel(order.order_type)}
                    </span>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                  <div>
                    <p className="text-sm text-gray-500">Jumlah Tiket</p>
                    <p className="font-semibold">{orderItems.length || 0} tiket</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Kursi</p>
                    <p className="font-semibold">{seats}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Total Pembayaran</p>
                    <p className="font-semibold text-green-600">{formatRupiah(total)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Tanggal Pesan</p>
                    <p className="font-semibold">{new Date(order.created_at).toLocaleDateString('id-ID')}</p>
                  </div>
                </div>
                
                <div className="flex justify-between items-center pt-4 border-t">
                  <p className="text-sm text-gray-500">
                    ID: {order.order_number}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
