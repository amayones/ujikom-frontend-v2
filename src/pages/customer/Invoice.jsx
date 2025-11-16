import { useParams } from 'react-router-dom';
import { useEffect, useState, useCallback, useMemo } from 'react';
import { useOrdersStore } from '../../store/ordersStore';
import Button from '../../components/ui/Button';
import { formatRupiah } from '../../utils/currency';

import { QRCodeSVG } from 'qrcode.react';

export default function Invoice() {
  const { id } = useParams();
  const { fetchOrderById } = useOrdersStore();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    
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
                <span>Status:</span>
                <span className="text-green-600 font-semibold capitalize">{order.status}</span>
              </div>
            </div>
          </div>
        </div>

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

        <div className="text-center text-sm text-gray-500 mb-6">
          <p>Terima kasih telah memilih Absolute Cinema</p>
          <p>Tiket ini berlaku untuk 1 kali masuk sesuai jadwal yang tertera</p>
        </div>


      </div>
    </div>
  );
}