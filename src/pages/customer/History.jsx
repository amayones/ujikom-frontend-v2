import { Link } from 'react-router-dom';
import { useEffect } from 'react';
import { useOrdersStore } from '../../store/ordersStore';
import { useAuthStore } from '../../store/authStore';
import Button from '../../components/ui/Button';
import { Eye } from 'lucide-react';

export default function History() {
  const { orders, loading, fetchOrders } = useOrdersStore();
  const { user } = useAuthStore();
  
  useEffect(() => {
    fetchOrders();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-lg">Memuat riwayat pesanan...</div>
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="text-center py-12">
        <h1 className="text-3xl font-bold mb-4">Riwayat Pemesanan</h1>
        <p className="text-gray-500 text-lg mb-6">Anda belum memiliki riwayat pemesanan</p>
        <Link to="/customer/films">
          <Button>Pesan Tiket Sekarang</Button>
        </Link>
      </div>
    );
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'paid':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'paid':
        return 'Lunas';
      case 'pending':
        return 'Menunggu';
      case 'cancelled':
        return 'Dibatalkan';
      default:
        return status;
    }
  };

  return (
    <div>
      <h1 className="text-3xl font-bold mb-8">Riwayat Pemesanan</h1>
      
      <div className="space-y-3 sm:space-y-4">
        {orders.map(order => {
          const filmTitle = order.schedule?.film?.title || 'N/A';
          const studioName = order.schedule?.studio?.name || 'N/A';
          const showDate = order.schedule?.show_time ? new Date(order.schedule.show_time).toLocaleDateString('id-ID') : 'N/A';
          const showTime = order.schedule?.show_time ? new Date(order.schedule.show_time).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) : 'N/A';
          const seats = (order.orderItems || order.order_items)?.map(item => `${item.seat?.row}${item.seat?.column}`).join(', ') || 'N/A';
          const total = parseFloat(order.total_amount);
          
          return (
            <div key={order.id} className="bg-white rounded-lg shadow-md p-6">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-xl font-bold">{filmTitle}</h3>
                  <p className="text-gray-600">{studioName} - {showDate} {showTime}</p>
                </div>
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(order.payment_status)}`}>
                  {getStatusText(order.payment_status)}
                </span>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 mb-4">
                <div>
                  <p className="text-sm text-gray-500">Kursi</p>
                  <p className="font-semibold">{seats}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Total Pembayaran</p>
                  <p className="font-semibold text-green-600">Rp {total.toLocaleString('id-ID')}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Tanggal Pesan</p>
                  <p className="font-semibold">{new Date(order.created_at).toLocaleDateString('id-ID')}</p>
                </div>
              </div>
              
              <div className="flex justify-between items-center">
                <p className="text-sm text-gray-500">
                  ID Transaksi: {order.order_number}
                </p>
                <Link to={`/customer/invoice/${order.id}`}>
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
    </div>
  );
}