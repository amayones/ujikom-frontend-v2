import { useParams, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { useOrdersStore } from '../../store/ordersStore';
import Button from '../../components/ui/Button';
import { formatRupiah } from '../../utils/currency';
import { payWithMidtrans } from '../../services/midtransService';
import api from '../../lib/api';
import { QRCodeSVG } from 'qrcode.react';

export default function Invoice() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { fetchOrderById } = useOrdersStore();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [clientKey, setClientKey] = useState('');

  useEffect(() => {
    let isMounted = true;
    
    const fetchClientKey = async () => {
      try {
        const response = await api.get('/payment/client-key');
        if (isMounted && response?.data?.data?.client_key) {
          setClientKey(response.data.data.client_key);
        }
      } catch (error) {
        console.error('Failed to fetch client key:', error);
      }
    };
    
    fetchClientKey();
    
    const loadOrder = async () => {
      if (!id) {
        setLoading(false);
        return;
      }
      
      try {
        const orderData = await fetchOrderById(id);
        if (!isMounted) return;
        
        if (!orderData) {
          throw new Error('Order not found');
        }
        
        const seats = (orderData.orderItems || []).reduce((acc, item) => {
          if (item?.seat?.row && item?.seat?.column) {
            acc.push(`${item.seat.row}${item.seat.column}`);
          }
          return acc;
        }, []);
        
        const transformedOrder = {
          id: orderData.id,
          transaction_id: orderData.order_number || 'N/A',
          film_title: orderData.schedule?.film?.title || 'N/A',
          studio: orderData.schedule?.studio?.name || 'N/A',
          date: orderData.schedule?.show_time 
            ? new Date(orderData.schedule.show_time).toLocaleDateString('id-ID') 
            : 'N/A',
          time: orderData.schedule?.show_time 
            ? new Date(orderData.schedule.show_time).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) 
            : 'N/A',
          seats,
          total: parseFloat(orderData.total_amount) || 0,
          payment_method: orderData.order_type === 'online' ? 'Online Payment' : 'Cash',
          status: orderData.payment_status || 'unknown',
          ticket_status: orderData.ticket_status || 'unused',
          scanned_at: orderData.scanned_at,
          created_at: orderData.created_at
        };
        setOrder(transformedOrder);
      } catch (error) {
        if (isMounted) {
          console.error('Error loading order:', error);
          alert('Gagal memuat invoice');
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };
    
    loadOrder();
    
    return () => {
      isMounted = false;
    };
  }, [id, fetchOrderById]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-lg">Memuat invoice...</div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500 text-lg">Invoice tidak ditemukan</p>
      </div>
    );
  }

  const handlePayNow = async () => {
    if (!clientKey) {
      alert('Konfigurasi pembayaran belum siap');
      return;
    }
    
    setProcessing(true);
    try {
      const snapResponse = await api.get(`/payment/snap-token/${order.id}`);
      const snapToken = snapResponse.data?.data?.snap_token;
      
      if (!snapToken) {
        throw new Error('Failed to get payment token');
      }

      await payWithMidtrans(snapToken, clientKey, {
        onSuccess: async (result) => {
          try {
            if (result?.order_id) {
              await api.get(`/payment/status/${result.order_id}`);
            }
          } catch (err) {
            console.error('Status check error:', err);
          }
          window.location.reload();
        },
        onPending: async (result) => {
          try {
            if (result?.order_id) {
              await api.get(`/payment/status/${result.order_id}`);
            }
          } catch (err) {
            console.error('Status check error:', err);
          }
          setProcessing(false);
        },
        onError: () => {
          alert('Pembayaran gagal');
          setProcessing(false);
        },
        onClose: () => {
          setProcessing(false);
        }
      });
    } catch (error) {
      alert(error.response?.data?.message || 'Gagal memproses pembayaran');
      setProcessing(false);
    }
  };

  const handleCancelOrder = async () => {
    if (!confirm('Apakah Anda yakin ingin membatalkan pesanan ini?')) {
      return;
    }
    
    setProcessing(true);
    try {
      await api.post(`/orders/${order.id}/cancel`);
      alert('Pesanan berhasil dibatalkan');
      navigate('/customer/history');
    } catch (error) {
      alert(error.response?.data?.message || 'Gagal membatalkan pesanan');
      setProcessing(false);
    }
  };

  const isPending = order.status === 'pending';
  const isCancelled = order.status === 'cancelled';
  const isScanned = order.ticket_status === 'scanned';

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-bold mb-2">🎫 E-Ticket & Invoice</h1>
        <p className="text-gray-600">Simpan atau cetak tiket Anda untuk masuk ke bioskop</p>
      </div>
      
      <div className="bg-white rounded-xl shadow-xl p-8 print:shadow-none">
        <div className="flex justify-between items-start mb-8 print:mb-4">
          <div>
            <h1 className="text-3xl font-bold text-blue-600">Absolute Cinema</h1>
            <p className="text-gray-600">E-Ticket & Invoice</p>
          </div>
          <div className="text-right">
            <p className="text-sm text-gray-500">Invoice #</p>
            <p className="font-bold">{order.transaction_id}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 sm:gap-8 mb-6 sm:mb-8">
          <div>
            <h2 className="font-bold text-lg mb-4">Detail Film</h2>
            <div className="space-y-2">
              <div>
                <span className="font-semibold">Film:</span>
                <span className="ml-2">{order.film_title}</span>
              </div>
              <div>
                <span className="font-semibold">Studio:</span>
                <span className="ml-2">{order.studio}</span>
              </div>
              <div>
                <span className="font-semibold">Tanggal:</span>
                <span className="ml-2">{order.date}</span>
              </div>
              <div>
                <span className="font-semibold">Waktu:</span>
                <span className="ml-2">{order.time}</span>
              </div>
              <div>
                <span className="font-semibold">Kursi:</span>
                <span className="ml-2">{order.seats.join(', ')}</span>
              </div>
            </div>
          </div>

          <div>
            <h2 className="font-bold text-lg mb-4">Detail Pembayaran</h2>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span>Jumlah Tiket:</span>
                <span className="font-semibold">{order.seats.length} tiket</span>
              </div>
              <div className="flex justify-between">
                <span>Total Pembayaran:</span>
                <span className="font-bold">{formatRupiah(order.total)}</span>
              </div>
              <div className="flex justify-between">
                <span>Metode Pembayaran:</span>
                <span className="capitalize">{order.payment_method}</span>
              </div>
              <div className="flex justify-between">
                <span>Status Pembayaran:</span>
                <span className={`font-semibold capitalize ${
                  order.status === 'paid' ? 'text-green-600' : 
                  order.status === 'pending' ? 'text-yellow-600' : 'text-red-600'
                }`}>{order.status === 'paid' ? 'Lunas' : order.status === 'pending' ? 'Menunggu' : 'Dibatalkan'}</span>
              </div>
              {order.status === 'paid' && (
                <div className="flex justify-between">
                  <span>Status Tiket:</span>
                  <span className={`font-semibold ${
                    order.ticket_status === 'scanned' ? 'text-blue-600' : 'text-green-600'
                  }`}>{order.ticket_status === 'scanned' ? '✓ Sudah Masuk' : 'Belum Digunakan'}</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {isScanned ? (
          <div className="border-t pt-6 mb-8">
            <div className="bg-blue-50 border border-blue-200 p-6 rounded-lg text-center">
              <p className="text-blue-800 font-semibold mb-2">✓ Tiket Sudah Digunakan</p>
              <p className="text-sm text-blue-700">Tiket ini sudah di-scan pada {new Date(order.scanned_at).toLocaleString('id-ID')}</p>
            </div>
          </div>
        ) : isCancelled ? (
          <div className="border-t pt-6 mb-8">
            <div className="bg-red-50 border border-red-200 p-6 rounded-lg text-center">
              <p className="text-red-800 font-semibold mb-2">❌ Pesanan Dibatalkan</p>
              <p className="text-sm text-red-700">Pesanan ini telah dibatalkan. Kursi sudah tersedia untuk dipesan kembali.</p>
            </div>
          </div>
        ) : isPending ? (
          <div className="border-t pt-6 mb-8">
            <div className="bg-yellow-50 border border-yellow-200 p-6 rounded-lg">
              <div className="text-center mb-4">
                <p className="text-yellow-800 font-semibold mb-2">⚠️ Pembayaran Belum Selesai</p>
                <p className="text-sm text-yellow-700">Silakan selesaikan pembayaran atau batalkan pesanan</p>
              </div>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Button 
                  onClick={handlePayNow}
                  disabled={processing}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  {processing ? 'Memproses...' : '💳 Bayar Sekarang'}
                </Button>
                <Button 
                  variant="outline"
                  onClick={handleCancelOrder}
                  disabled={processing}
                  className="border-red-500 text-red-600 hover:bg-red-50"
                >
                  ❌ Batalkan Pesanan
                </Button>
              </div>
            </div>
          </div>
        ) : (
          <div className="border-t pt-6 mb-8">
            <div className="bg-gray-100 p-6 rounded-lg text-center">
              <div className="bg-white p-4 rounded border-2 border-dashed border-gray-300 inline-block">
                <p className="text-sm text-gray-600 mb-2">QR Code Tiket</p>
                <div className="flex justify-center">
                  <QRCodeSVG value={order.transaction_id} size={128} level="H" />
                </div>
                <p className="text-xs text-gray-500 mt-2">Tunjukkan QR ini saat masuk</p>
                <p className="text-xs font-mono text-gray-400 mt-1">{order.transaction_id}</p>
              </div>
            </div>
          </div>
        )}

        <div className="text-center text-sm text-gray-500 mb-6">
          <p>Terima kasih telah memilih Absolute Cinema</p>
          <p>Tiket ini berlaku untuk 1 kali masuk sesuai jadwal yang tertera</p>
        </div>


      </div>
    </div>
  );
}