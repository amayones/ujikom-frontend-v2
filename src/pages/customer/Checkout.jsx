import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCartStore } from '../../store/cartStore';
import { useOrdersStore } from '../../store/ordersStore';
import { useAuthStore } from '../../store/authStore';
import { payWithMidtrans } from '../../services/midtransService';
import { formatRupiah } from '../../utils/currency';
import api from '../../lib/api';
import Button from '../../components/ui/Button';

export default function Checkout() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [clientKey, setClientKey] = useState('');
  
  const { selectedSchedule, selectedSeats, totalPrice, clearCart } = useCartStore();
  const { checkout } = useOrdersStore();
  const { user } = useAuthStore();

  useEffect(() => {
    let isMounted = true;
    
    const fetchClientKey = async () => {
      try {
        const response = await api.get('/payment/client-key');
        if (isMounted) {
          setClientKey(response.data?.data?.client_key || '');
        }
      } catch (error) {
        if (isMounted) {
          console.error('Failed to fetch client key:', error);
          alert('Gagal memuat konfigurasi pembayaran');
        }
      }
    };
    
    fetchClientKey();
    
    return () => {
      isMounted = false;
    };
  }, []);

  if (!selectedSchedule || selectedSeats.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500 text-lg mb-4">Tidak ada pesanan yang valid</p>
        <Button onClick={() => navigate('/customer/films')}>
          Kembali ke Daftar Film
        </Button>
      </div>
    );
  }

  const handlePayment = useCallback(async () => {
    if (!clientKey) {
      alert('Konfigurasi pembayaran belum siap');
      return;
    }
    
    setLoading(true);
    
    try {
      const orderData = {
        schedule_id: selectedSchedule.id,
        seat_ids: selectedSeats.map(seat => seat.id || seat)
      };

      const result = await checkout(orderData);
      
      if (!result?.order?.id) {
        throw new Error('Invalid response from server');
      }

      const orderId = result.order.id;
      
      // Get snap token
      const snapResponse = await api.get(`/payment/snap-token/${orderId}`);
      const snapToken = snapResponse.data?.data?.snap_token;
      
      if (!snapToken) {
        throw new Error('Failed to get payment token');
      }

      // Open Midtrans payment
      if (!snapToken || !clientKey) {
        throw new Error('Payment configuration incomplete');
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
          clearCart();
          navigate(`/customer/invoice/${orderId}`);
        },
        onPending: async (result) => {
          try {
            if (result?.order_id) {
              await api.get(`/payment/status/${result.order_id}`);
            }
          } catch (err) {
            console.error('Status check error:', err);
          }
          clearCart();
          navigate(`/customer/invoice/${orderId}`);
        },
        onError: (err) => {
          console.error('Payment error:', err);
          alert('Pembayaran gagal');
          setLoading(false);
        },
        onClose: () => {
          setLoading(false);
        }
      });
    } catch (error) {
      console.error('Checkout error:', error);
      alert(error.response?.data?.message || error.message || 'Terjadi kesalahan saat checkout');
      setLoading(false);
    }
  }, [clientKey, selectedSchedule, selectedSeats, checkout, clearCart, navigate]);

  // Display total from cart or show loading
  const finalTotal = totalPrice || 0;

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-8">Checkout</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
        <div className="bg-white rounded-lg shadow-md p-4 sm:p-6">
          <h2 className="text-xl font-bold mb-6">Detail Pesanan</h2>
          
          <div className="space-y-4">
            <div>
              <h3 className="font-semibold">Film</h3>
              <p className="text-gray-600">{selectedSchedule.film_title}</p>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <h3 className="font-semibold">Studio</h3>
                <p className="text-gray-600">{selectedSchedule.studio}</p>
              </div>
              <div>
                <h3 className="font-semibold">Waktu</h3>
                <p className="text-gray-600">{selectedSchedule.time}</p>
              </div>
            </div>
            
            <div>
              <h3 className="font-semibold">Tanggal</h3>
              <p className="text-gray-600">{selectedSchedule.date}</p>
            </div>
            
            <div>
              <h3 className="font-semibold">Kursi</h3>
              <p className="text-gray-600">
                {selectedSeats.map(s => `${s.row}${s.column}`).join(', ')}
              </p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-md p-4 sm:p-6">
          <h2 className="text-xl font-bold mb-6">Ringkasan Pembayaran</h2>
          
          <div className="space-y-3 mb-6">
            <div className="flex justify-between">
              <span>Jumlah Tiket:</span>
              <span className="font-semibold">{selectedSeats.length} tiket</span>
            </div>
            <div className="flex justify-between">
              <span>Harga per tiket:</span>
              <span>{formatRupiah(selectedSchedule.base_price)}</span>
            </div>
            <div className="flex justify-between">
              <span>Subtotal:</span>
              <span>{formatRupiah(totalPrice)}</span>
            </div>
            <hr />
            <div className="flex justify-between text-lg font-bold">
              <span>Total Pembayaran</span>
              <span className="text-blue-600">{formatRupiah(finalTotal)}</span>
            </div>
          </div>
          
          <div className="space-y-3">
            <Button 
              className="w-full" 
              onClick={handlePayment}
              disabled={loading}
            >
              {loading ? 'Memproses...' : 'Bayar Sekarang'}
            </Button>
            <Button 
              variant="outline" 
              className="w-full" 
              onClick={() => navigate(-1)}
            >
              Kembali
            </Button>
          </div>
          
          <div className="mt-6 text-sm text-gray-500">
            <p>✓ Pembayaran aman dengan Midtrans</p>
            <p>✓ Berbagai metode pembayaran tersedia</p>
            <p>✓ Tiket digital tersedia setelah pembayaran</p>
          </div>
        </div>
      </div>
    </div>
  );
}