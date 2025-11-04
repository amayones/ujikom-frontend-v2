import { useNavigate, useParams } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { useCartStore } from '../../store/cartStore';
import { useFilmsStore } from '../../store/filmsStore';
import SeatMap from '../../components/cinema/SeatMap';
import Button from '../../components/ui/Button';

export default function SeatSelection() {
  const navigate = useNavigate();
  const { scheduleId } = useParams();
  const { selectedSchedule, selectedSeats, totalPrice } = useCartStore();
  const { seats, fetchSeats } = useFilmsStore();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadSeats = async () => {
      if (scheduleId) {
        try {
          await fetchSeats(scheduleId);
        } catch (error) {
          console.error('Error loading seats:', error);
        } finally {
          setLoading(false);
        }
      }
    };
    loadSeats();
  }, [scheduleId, fetchSeats]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-lg">Memuat layout kursi...</div>
      </div>
    );
  }

  if (!selectedSchedule) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500 text-lg mb-4">Silakan pilih jadwal terlebih dahulu</p>
        <Button onClick={() => navigate('/customer/films')}>
          Kembali ke Daftar Film
        </Button>
      </div>
    );
  }
  
  const handleContinue = () => {
    if (selectedSeats.length === 0) {
      alert('Silakan pilih minimal 1 kursi');
      return;
    }
    navigate('/customer/checkout');
  };

  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-4">Pilih Kursi</h1>
        <div className="bg-white rounded-lg p-6 shadow-md">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div>
              <p className="font-semibold">Film</p>
              <p className="text-gray-600">{selectedSchedule.film_title}</p>
            </div>
            <div>
              <p className="font-semibold">Studio & Waktu</p>
              <p className="text-gray-600">{selectedSchedule.studio} - {selectedSchedule.time}</p>
            </div>
            <div>
              <p className="font-semibold">Tanggal</p>
              <p className="text-gray-600">{selectedSchedule.date}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <SeatMap seats={seats} />
        </div>
        
        <div className="bg-white rounded-lg p-6 shadow-md h-fit">
          <h3 className="text-xl font-bold mb-4">Ringkasan Pesanan</h3>
          
          <div className="space-y-3 mb-6">
            <div className="flex justify-between">
              <span>Kursi dipilih:</span>
              <span className="font-semibold">
                {selectedSeats.length > 0 
                  ? selectedSeats.map(s => `${s.row}${s.column}`).join(', ') 
                  : '-'}
              </span>
            </div>
            <div className="flex justify-between">
              <span>Jumlah tiket:</span>
              <span className="font-semibold">{selectedSeats.length}</span>
            </div>
            <div className="flex justify-between">
              <span>Harga dasar:</span>
              <span className="font-semibold">Rp {selectedSchedule.base_price?.toLocaleString('id-ID')}</span>
            </div>
            <hr />
            <div className="flex justify-between text-lg font-bold">
              <span>Total:</span>
              <span className="text-blue-600">Rp {totalPrice.toLocaleString('id-ID')}</span>
            </div>
          </div>
          
          <div className="space-y-3">
            <Button 
              className="w-full" 
              onClick={handleContinue}
              disabled={selectedSeats.length === 0}
            >
              Lanjut ke Pembayaran
            </Button>
            <Button 
              variant="outline" 
              className="w-full" 
              onClick={() => navigate(-1)}
            >
              Kembali
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}