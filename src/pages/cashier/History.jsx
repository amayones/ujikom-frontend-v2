import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../lib/api';
import Button from '../../components/ui/Button';
import { formatRupiah } from '../../utils/currency';
import { Eye, RefreshCw } from 'lucide-react';

export default function CashierHistory() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterType, setFilterType] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const response = await api.get('/cashier/all-purchases');
      console.log('API Response:', response);
      console.log('Orders data:', response.data);
      const ordersData = response.data.data || [];
      console.log('Parsed orders:', ordersData);
      setOrders(ordersData);
    } catch (error) {
      console.error('Error fetching orders:', error);
      console.error('Error response:', error.response);
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status, ticketStatus) => {
    if (ticketStatus === 'scanned') return 'bg-blue-100 text-blue-800';
    if (status === 'paid') return 'bg-green-100 text-green-800';
    return 'bg-gray-100 text-gray-800';
  };

  const getStatusText = (status, ticketStatus) => {
    if (ticketStatus === 'scanned') return 'Sudah Masuk';
    if (status === 'paid') return 'Lunas';
    return status;
  };



  const filteredOrders = orders.filter(order => {
    const matchType = filterType === 'all' || order.order_type === filterType;
    const matchStatus = filterStatus === 'all' || order.payment_status === filterStatus;
    return matchType && matchStatus;
  });

  if (loading) {
    return <div className="flex justify-center items-center h-64">Memuat data...</div>;
  }

  console.log('Total orders:', orders.length);
  console.log('Filtered orders:', filteredOrders.length);
  console.log('Filter type:', filterType);
  console.log('Filter status:', filterStatus);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          <h1 className="text-3xl font-bold mb-2">📜 Semua Pembelian</h1>
          <p className="text-gray-600">Total: {filteredOrders.length} pembelian</p>
        </div>
        <div className="flex gap-2">
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md text-sm"
          >
            <option value="all">Semua Tipe</option>
            <option value="online">Online</option>
            <option value="offline">Offline</option>
          </select>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md text-sm"
          >
            <option value="all">Semua Status</option>
            <option value="paid">Lunas</option>
            <option value="pending">Pending</option>
            <option value="cancelled">Dibatalkan</option>
          </select>
          <Button onClick={fetchOrders} size="sm">
            <RefreshCw size={16} className="mr-2" />
            Refresh
          </Button>
        </div>
      </div>
      
      {filteredOrders.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-xl shadow-lg">
          <p className="text-gray-500 text-lg mb-6">
            {orders.length === 0 
              ? 'Belum ada pembelian sama sekali' 
              : 'Tidak ada pembelian yang sesuai filter'}
          </p>
          <p className="text-sm text-gray-400 mb-4">
            Total data: {orders.length} | Filter: {filterType} / {filterStatus}
          </p>
          <Link to="/cashier/offline-order">
            <Button>Buat Pesanan Offline</Button>
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredOrders.map(order => {
          const filmTitle = order.schedule?.film?.title || 'N/A';
          const studioName = order.schedule?.studio?.name || 'N/A';
          const showDate = order.schedule?.show_time 
            ? new Date(order.schedule.show_time).toLocaleDateString('id-ID') 
            : 'N/A';
          const showTime = order.schedule?.show_time 
            ? new Date(order.schedule.show_time).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) 
            : 'N/A';
          const orderItems = order.orderItems || order.order_items || [];
          const seats = orderItems
            .filter(item => item?.seat?.row && item?.seat?.column)
            .map(item => `${item.seat.row}${item.seat.column}`)
            .join(', ') || 'N/A';
          const total = parseFloat(order.total_amount) || 0;
          
          return (
            <div key={order.id} className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-xl font-bold">{filmTitle}</h3>
                  <p className="text-gray-600">{studioName} - {showDate} {showTime}</p>
                  <p className="text-sm text-gray-500 mt-1">
                    Customer: {order.customer_name || order.user?.name || 'N/A'}
                  </p>
                  <p className="text-xs text-gray-400 mt-1">
                    Tipe: {order.order_type === 'online' ? '🌐 Online' : '🏪 Offline'}
                  </p>
                </div>
                <div className="text-right">
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(order.payment_status, order.ticket_status)}`}>
                    {getStatusText(order.payment_status, order.ticket_status)}
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
                  ID Transaksi: {order.order_number}
                </p>
                <Link to={`/cashier/invoice/${order.id}`}>
                  <Button size="sm" className="flex items-center">
                    <Eye size={16} className="mr-2" />
                    Lihat Detail
                  </Button>
                </Link>
              </div>
            </div>
          );
        })}
      </div>
      )}
    </div>
  );
}
