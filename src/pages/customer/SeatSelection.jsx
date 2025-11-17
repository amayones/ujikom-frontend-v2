import { useNavigate, useParams } from 'react-router-dom';
import { useEffect, useState, useCallback } from 'react';
import { useCartStore } from '../../store/cartStore';
import { useFilmsStore } from '../../store/filmsStore';
import SeatMap from '../../components/cinema/SeatMap';
import Button from '../../components/ui/Button';
import { formatRupiah } from '../../utils/currency';

export default function SeatSelection() { 
  const navigate = useNavigate();
  const { scheduleId } = useParams();
  const { selectedSchedule, selectedSeats, totalPrice } = useCartStore();
  const { seats, fetchSeats } = useFilmsStore();
  const [loading, setLoading] = useState(true);

  const handleContinue = useCallback(() => {
    if (!selectedSchedule?.id) {
      alert('Data jadwal tidak valid');
      return;
    }
    
    if (!selectedSeats || selectedSeats.length === 0) {
      alert('Silakan pilih minimal 1 kursi');
      return;
    }
    
    if (!totalPrice || totalPrice <= 0) {
      alert('Total harga tidak valid');
      return;
    }
    
    try {
      navigate('/customer/checkout');
    } catch (err) {
      console.error('Navigation error:', err);
    }
  }, [selectedSeats, selectedSchedule?.id, totalPrice, navigate]);

  useEffect(() => {
    let isMounted = true;
    
    const loadData = async () => {
      if (!scheduleId) {
        setLoading(false);
        return;
      }
      
      try {
        await fetchSeats(scheduleId);
        
        // If no schedule selected, redirect back
        if (!selectedSchedule && isMounted) {
          alert('Silakan pilih jadwal terlebih dahulu');
          navigate('/customer/films');
        }
      } catch (error) {
        if (isMounted) {
          console.error('Error loading data:', error);
          alert('Gagal memuat data');
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };
    
    loadData();
    
    return () => {
      isMounted = false;
    };
  }, [scheduleId, fetchSeats, selectedSchedule, navigate]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg">Memuat layout kursi...</div>
      </div>
    );
  }

  if (!selectedSchedule) {
    return (
      <div className="py-12 text-center">
        <p className="mb-4 text-lg text-gray-500">Silakan pilih jadwal terlebih dahulu</p>
        <Button onClick={() => navigate('/customer/films')}>
          Kembali ke Daftar Film
        </Button>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <div>
        <h1 className="mb-2 text-3xl font-bold">🎫 Pilih Kursi</h1>
        <p className="text-gray-600">Pilih kursi terbaik untuk pengalaman menonton yang nyaman</p>
      </div>
      
      <div className="p-6 bg-white shadow-lg rounded-xl">
        <div className="grid grid-cols-1 gap-3 text-sm sm:grid-cols-3 sm:gap-4">
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

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3 lg:gap-8">
        <div className="lg:col-span-2">
          <SeatMap seats={seats} />
        </div>
        
        <div className="p-6 bg-white shadow-lg rounded-xl h-fit">
          <h3 className="mb-3 text-lg font-bold sm:text-xl sm:mb-4">Ringkasan Pesanan</h3>
          
          <div className="mb-4 space-y-2 text-sm sm:space-y-3 sm:mb-6 sm:text-base">
            <div className="flex items-start justify-between">
              <span>Kursi dipilih:</span>
              <span className="font-semibold text-right break-words max-w-[60%]">
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
              <span className="font-semibold">{formatRupiah(selectedSchedule.base_price)}</span>
            </div>
            <hr />
            <div className="flex justify-between text-lg font-bold">
              <span>Total:</span>
              <span className="text-emerald-600">{formatRupiah(totalPrice)}</span>
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