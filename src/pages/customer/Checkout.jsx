import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCartStore } from '../../store/cartStore';
import { useOrdersStore } from '../../store/ordersStore';
import { useAuthStore } from '../../store/authStore';
import { payWithMidtrans } from '../../services/midtransService';
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
    const fetchClientKey = async () => {
      try {
        const response = await api.get('/payment/client-key');
        setClientKey(response.data.data.client_key);
      } catch (error) {
        console.error('Failed to fetch client key:', error);
      }
    };
    fetchClientKey();
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

  const handlePayment = async () => {
    setLoading(true);
    
    try {
      const orderData = {
        schedule_id: selectedSchedule.id,
        seat_ids: selectedSeats.map(seat => seat.id || seat)
      };

      const result = await checkout(orderData);
      
      if (!result || !result.order) {
        throw new Error('Invalid response from server');
      }

      const orderId = result.order.id;
      
      // Get snap token
      const snapResponse = await api.get(`/payment/snap-token/${orderId}`);
      const snapToken = snapResponse.data.data.snap_token;

      // Open Midtrans payment
      await payWithMidtrans(snapToken, clientKey, {
        onSuccess: async (result) => {
          // Check payment status
          await api.get(`/payment/status/${result.order_id}`);
          clearCart();
          navigate(`/customer/invoice/${orderId}`);
        },
        onPending: async (result) => {
          await api.get(`/payment/status/${result.order_id}`);
          clearCart();
          navigate(`/customer/invoice/${orderId}`);
        },
        onError: (result) => {
          alert('Pembayaran gagal');
          setLoading(false);
        },
        onClose: () => {
          setLoading(false);
        }
      });
    } catch (error) {
      console.error('Checkout error:', error);
      alert(error.response?.data?.message || 'Terjadi kesalahan saat checkout');
      setLoading(false);
    }
  };

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
              <span>Tiket ({selectedSeats.length}x)</span>
              <span>Rp {totalPrice.toLocaleString('id-ID')}</span>
            </div>
            <hr />
            <div className="flex justify-between text-lg font-bold">
              <span>Total Pembayaran</span>
              <span className="text-blue-600">Rp {finalTotal.toLocaleString('id-ID')}</span>
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