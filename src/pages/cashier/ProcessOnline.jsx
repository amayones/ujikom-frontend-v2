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
    
    const handleOrderCreated = () => fetchOrders();
    window.addEventListener('orderCreated', handleOrderCreated);
    return () => window.removeEventListener('orderCreated', handleOrderCreated);
  }, []);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const response = await api.get('/cashier/orders');
      setOrders(response.data.data || []);
    } catch (error) {
      console.error('Error:', error);
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  const filteredOrders = orders.filter(o => {
    if (o.payment_status !== 'paid') return false;
    if (filter === 'all') return true;
    if (filter === 'customer') return o.order_type === 'online';
    if (filter === 'cashier') return o.order_type === 'offline';
    return true;
  });

  if (loading) {
    return <div className="flex justify-center items-center h-64">Memuat...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">📋 Semua Pembelian</h1>
          <p className="text-gray-600">Transaksi dari customer dan kasir</p>
        </div>
        <Button onClick={fetchOrders} size="sm">
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
          Kasir ({orders.filter(o => o.order_type === 'offline' && o.payment_status === 'paid').length})
        </Button>
      </div>
      
      {filteredOrders.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg shadow">
          <p className="text-gray-500">Tidak ada pembelian</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredOrders.map(order => {
            const seats = (order.orderItems || [])
              .map(item => `${item.seat?.row}${item.seat?.column}`)
              .join(', ') || 'N/A';
            
            return (
              <div key={order.id} className="bg-white rounded-xl shadow-lg p-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-xl font-bold">{order.schedule?.film?.title || 'N/A'}</h3>
                    <p className="text-gray-600">
                      {order.schedule?.studio?.name || 'N/A'} - {' '}
                      {order.schedule?.show_time 
                        ? new Date(order.schedule.show_time).toLocaleDateString('id-ID')
                        : 'N/A'}
                    </p>
                    <p className="text-sm text-gray-500 mt-1">
                      Customer: {order.customer_name || order.user?.name || 'N/A'}
                    </p>
                  </div>
                  <div className="flex flex-col gap-2 items-end">
                    <span className="px-3 py-1 rounded-full text-sm bg-green-100 text-green-800">
                      Lunas
                    </span>
                    <span className="px-3 py-1 rounded-full text-xs bg-blue-100 text-blue-800">
                      {order.order_type === 'online' ? 'Customer Online' : 'Kasir Tunai'}
                    </span>
                  </div>
                </div>
                
                <div className="grid grid-cols-4 gap-4 text-sm">
                  <div>
                    <p className="text-gray-500">Tiket</p>
                    <p className="font-semibold">{order.orderItems?.length || 0}</p>
                  </div>
                  <div>
                    <p className="text-gray-500">Kursi</p>
                    <p className="font-semibold">{seats}</p>
                  </div>
                  <div>
                    <p className="text-gray-500">Total</p>
                    <p className="font-semibold text-green-600">{formatRupiah(order.total_amount)}</p>
                  </div>
                  <div>
                    <p className="text-gray-500">Tanggal</p>
                    <p className="font-semibold">{new Date(order.created_at).toLocaleDateString('id-ID')}</p>
                  </div>
                </div>
                
                <div className="mt-4 pt-4 border-t">
                  <p className="text-sm text-gray-500">ID: {order.order_number}</p>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
