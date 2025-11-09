import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { cashierApi } from '../../api/cashierApi';
import { payWithMidtrans } from '../../services/midtransService';
import api from '../../lib/api';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import { ChevronLeft, ChevronRight, Calendar } from 'lucide-react';

function SchedulesByDayCashier({ schedules, selectedSchedule, onSelectSchedule }) {
  const [currentDayIndex, setCurrentDayIndex] = useState(0);

  const schedulesByDay = useMemo(() => {
    if (!Array.isArray(schedules) || schedules.length === 0) return [];
    const grouped = {};
    schedules.forEach(schedule => {
      const date = new Date(schedule.show_time).toLocaleDateString('id-ID');
      if (!grouped[date]) grouped[date] = [];
      grouped[date].push(schedule);
    });
    return Object.entries(grouped).sort((a, b) => 
      new Date(a[1][0].show_time) - new Date(b[1][0].show_time)
    );
  }, [schedules]);

  if (!Array.isArray(schedules) || schedules.length === 0) {
    return <p className="text-gray-500 text-center py-8">Tidak ada jadwal tersedia</p>;
  }

  const [currentDate, currentSchedules] = schedulesByDay[currentDayIndex] || [null, []];
  const totalDays = schedulesByDay.length;

  return (
    <div>
      {currentDate && totalDays > 0 && (
        <div className="mb-4">
          <div className="flex items-center justify-between bg-blue-50 p-3 rounded-lg">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentDayIndex(Math.max(0, currentDayIndex - 1))}
              disabled={currentDayIndex === 0}
            >
              <ChevronLeft size={18} />
            </Button>
            
            <div className="text-center">
              <p className="font-bold text-blue-900">
                {new Date(currentSchedules[0].show_time).toLocaleDateString('id-ID', {
                  weekday: 'long',
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric'
                })}
              </p>
              <p className="text-xs text-gray-600">Hari {currentDayIndex + 1} dari {totalDays} • {currentSchedules.length} jadwal</p>
            </div>
            
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentDayIndex(Math.min(totalDays - 1, currentDayIndex + 1))}
              disabled={currentDayIndex === totalDays - 1}
            >
              <ChevronRight size={18} />
            </Button>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {currentSchedules.map(schedule => (
          <div
            key={schedule.id}
            className={`border rounded-lg p-4 cursor-pointer transition-colors ${
              selectedSchedule?.id === schedule.id ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-gray-300'
            }`}
            onClick={() => onSelectSchedule(schedule)}
          >
            <h3 className="font-semibold">{schedule.studio?.name || 'Studio'}</h3>
            <p className="text-gray-600">{new Date(schedule.show_time).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function OfflineOrder() {
  const [films, setFilms] = useState([]);
  const [schedules, setSchedules] = useState([]);
  const [seats, setSeats] = useState([]);
  const [selectedFilm, setSelectedFilm] = useState(null);
  const [selectedSchedule, setSelectedSchedule] = useState(null);
  const [selectedSeats, setSelectedSeats] = useState([]);
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('cash');
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1);
  const [clientKey, setClientKey] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    fetchFilms();
    fetchClientKey();
  }, []);

  const fetchClientKey = async () => {
    try {
      const response = await api.get('/payment/client-key');
      setClientKey(response.data.data.client_key);
    } catch (error) {
      console.error('Failed to fetch client key:', error);
    }
  };

  const fetchFilms = async () => {
    try {
      const response = await api.get('/films');
      const playNow = response.data?.data?.play_now || [];
      setFilms(Array.isArray(playNow) ? playNow : []);
    } catch (error) {
      console.error('Error fetching films:', error);
      setFilms([]);
    }
  };

  const fetchSchedules = async (filmId) => {
    try {
      const response = await api.get(`/schedules/${filmId}`);
      setSchedules(Array.isArray(response.data.data) ? response.data.data : []);
    } catch (error) {
      console.error('Error fetching schedules:', error);
      setSchedules([]);
    }
  };

  const fetchSeats = async (scheduleId) => {
    try {
      const response = await api.get(`/seats/${scheduleId}`);
      setSeats(Array.isArray(response.data.data) ? response.data.data : []);
    } catch (error) {
      console.error('Error fetching seats:', error);
      setSeats([]);
    }
  };

  const handleFilmSelect = (film) => {
    setSelectedFilm(film);
    setSelectedSchedule(null);
    setSelectedSeats([]);
    fetchSchedules(film.id);
  };

  const handleScheduleSelect = (schedule) => {
    setSelectedSchedule(schedule);
    setSelectedSeats([]);
    fetchSeats(schedule.id);
  };

  const handleCreateOrder = async () => {
    if (!customerName || !customerPhone || selectedSeats.length === 0) {
      alert('Mohon lengkapi semua data');
      return;
    }

    setLoading(true);
    try {
      if (paymentMethod === 'cash') {
        const orderData = {
          schedule_id: selectedSchedule.id,
          seat_ids: selectedSeats.map(s => s.id),
          customer_name: customerName,
          customer_phone: customerPhone
        };
        const response = await cashierApi.offlineOrder(orderData);
        alert(`Pesanan berhasil dibuat! No. Order: ${response.data.order_number}`);
        resetForm();
      } else {
        const orderData = {
          schedule_id: selectedSchedule.id,
          seat_ids: selectedSeats.map(s => s.id)
        };
        const response = await cashierApi.onlineOrder(orderData);
        console.log('Order response:', response.data);
        const orderId = response.data.data?.order?.id || response.data.data?.id || response.data.id;
        console.log('Extracted order ID:', orderId);
        
        if (!orderId) {
          throw new Error('Order ID not found in response');
        }
        
        const snapResponse = await api.get(`/payment/snap-token/${orderId}`);
        const snapToken = snapResponse.data.data.snap_token;

        await payWithMidtrans(snapToken, clientKey, {
          onSuccess: async (result) => {
            await api.get(`/payment/status/${result.order_id}`);
            alert('Pembayaran berhasil!');
            resetForm();
          },
          onPending: async (result) => {
            await api.get(`/payment/status/${result.order_id}`);
            alert('Pembayaran pending, silakan selesaikan pembayaran');
            setLoading(false);
          },
          onError: () => {
            alert('Pembayaran gagal');
            setLoading(false);
          },
          onClose: () => {
            setLoading(false);
          }
        });
      }
    } catch (error) {
      alert(error.response?.data?.message || 'Gagal membuat pesanan');
      setLoading(false);
    }
  };

  const resetForm = () => {
    setStep(1);
    setSelectedFilm(null);
    setSelectedSchedule(null);
    setSelectedSeats([]);
    setCustomerName('');
    setCustomerPhone('');
    setPaymentMethod('cash');
    setLoading(false);
    fetchFilms();
  };

  const calculateTotal = () => {
    if (!selectedSchedule || selectedSeats.length === 0) return 0;
    const basePrice = selectedSchedule.base_price || 50000;
    return selectedSeats.reduce((sum, seat) => {
      const price = seat.category === 'vip' ? basePrice * 1.5 : basePrice;
      return sum + price;
    }, 0);
  };

  return (
    <div>
      <h1 className="text-3xl font-bold mb-8">Pesan Tiket Offline</h1>

      <div className="bg-white rounded-lg shadow-md p-4 sm:p-6">
        <div className="flex flex-wrap items-center gap-3 mb-6">
          {[1, 2, 3, 4].map(num => (
            <div key={num} className="flex items-center">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                step >= num ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-600'
              }`}>
                {num}
              </div>
              {num < 4 && <div className={`w-12 h-1 ${step > num ? 'bg-blue-600' : 'bg-gray-200'}`} />}
            </div>
          ))}
        </div>

        {step === 1 && (
          <div>
            <h2 className="text-lg sm:text-xl font-bold mb-4">1. Pilih Film</h2>
            {!Array.isArray(films) || films.length === 0 ? (
              <p className="text-gray-500 text-center py-8">Tidak ada film tersedia</p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
                {films.map(film => (
                  <div
                    key={film.id}
                    className={`border rounded-lg p-4 cursor-pointer transition-colors ${
                      selectedFilm?.id === film.id ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-gray-300'
                    }`}
                    onClick={() => handleFilmSelect(film)}
                  >
                    <h3 className="font-semibold">{film.title}</h3>
                    <p className="text-sm text-gray-600">{film.duration} min</p>
                  </div>
                ))}
              </div>
            )}
            <div className="mt-6">
              <Button onClick={() => setStep(2)} disabled={!selectedFilm}>
                Lanjut
              </Button>
            </div>
          </div>
        )}

        {step === 2 && (
          <div>
            <h2 className="text-lg sm:text-xl font-bold mb-4">2. Pilih Jadwal</h2>
            <SchedulesByDayCashier 
              schedules={schedules}
              selectedSchedule={selectedSchedule}
              onSelectSchedule={handleScheduleSelect}
            />
            <div className="flex space-x-4 mt-6">
              <Button variant="outline" onClick={() => setStep(1)}>Kembali</Button>
              <Button onClick={() => setStep(3)} disabled={!selectedSchedule}>Lanjut</Button>
            </div>
          </div>
        )}

        {step === 3 && (
          <div>
            <h2 className="text-lg sm:text-xl font-bold mb-4">3. Pilih Kursi</h2>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
              <div className="lg:col-span-2">
                {!Array.isArray(seats) || seats.length === 0 ? (
                  <p className="text-gray-500 text-center py-8">Tidak ada kursi tersedia</p>
                ) : (
                  <div className="bg-white p-6 rounded-lg border">
                    <div className="text-center mb-6">
                      <div className="bg-gray-800 text-white py-2 px-8 rounded-lg inline-block">LAYAR</div>
                    </div>
                    <div className="flex flex-col items-center space-y-2">
                      {Object.keys(seats.reduce((acc, seat) => {
                        if (!acc[seat.row]) acc[seat.row] = [];
                        acc[seat.row].push(seat);
                        return acc;
                      }, {})).sort().map((row) => (
                        <div key={row} className="flex items-center">
                          <span className="w-6 text-center text-sm font-medium text-gray-600 mr-2">{row}</span>
                          <div className="flex">
                            {seats.filter(s => s.row === row).sort((a, b) => a.column - b.column).map((seat) => {
                              const isSelected = selectedSeats.some(s => s.id === seat.id);
                              const isBooked = seat.is_booked;
                              return (
                                <div
                                  key={seat.id}
                                  className={`w-8 h-8 m-1 rounded text-xs font-medium flex items-center justify-center cursor-pointer transition-colors ${
                                    isBooked ? 'bg-red-200 text-red-800 cursor-not-allowed' :
                                    isSelected ? 'bg-blue-600 text-white' :
                                    seat.category === 'vip' ? 'bg-yellow-200 hover:bg-yellow-300 text-yellow-800' :
                                    'bg-green-200 hover:bg-green-300 text-green-800'
                                  }`}
                                  onClick={() => {
                                    if (!isBooked) {
                                      if (isSelected) {
                                        setSelectedSeats(selectedSeats.filter(s => s.id !== seat.id));
                                      } else {
                                        setSelectedSeats([...selectedSeats, seat]);
                                      }
                                    }
                                  }}
                                >
                                  {seat.column}
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      ))}
                    </div>
                    <div className="mt-6 flex justify-center space-x-6 text-sm">
                      <div className="flex items-center"><div className="w-4 h-4 bg-green-200 rounded mr-2"></div><span>Tersedia</span></div>
                      <div className="flex items-center"><div className="w-4 h-4 bg-yellow-200 rounded mr-2"></div><span>VIP</span></div>
                      <div className="flex items-center"><div className="w-4 h-4 bg-blue-600 rounded mr-2"></div><span>Dipilih</span></div>
                      <div className="flex items-center"><div className="w-4 h-4 bg-red-200 rounded mr-2"></div><span>Terisi</span></div>
                    </div>
                  </div>
                )}
              </div>
              <div>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="font-semibold mb-4">Ringkasan</h3>
                  <div className="space-y-2 text-sm">
                    <div><strong>Film:</strong> {selectedFilm?.title}</div>
                    <div><strong>Studio:</strong> {selectedSchedule?.studio?.name}</div>
                    <div><strong>Kursi:</strong> {selectedSeats.map(s => `${s.row}${s.column}`).join(', ') || '-'}</div>
                    <div><strong>Total:</strong> Rp {calculateTotal().toLocaleString('id-ID')}</div>
                  </div>
                </div>
              </div>
            </div>
            <div className="flex space-x-4 mt-6">
              <Button variant="outline" onClick={() => setStep(2)}>Kembali</Button>
              <Button onClick={() => setStep(4)} disabled={selectedSeats.length === 0}>Lanjut</Button>
            </div>
          </div>
        )}

        {step === 4 && (
          <div>
            <h2 className="text-lg sm:text-xl font-bold mb-4">4. Data Pelanggan & Pembayaran</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <Input
                label="Nama Pelanggan"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                required
              />
              <Input
                label="Nomor Telepon"
                value={customerPhone}
                onChange={(e) => setCustomerPhone(e.target.value)}
                required
              />
            </div>

            <div className="mb-6">
              <h3 className="font-semibold mb-3">Metode Pembayaran</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                <div
                  className={`border rounded-lg p-4 cursor-pointer transition-colors ${
                    paymentMethod === 'cash' ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-gray-300'
                  }`}
                  onClick={() => setPaymentMethod('cash')}
                >
                  <div className="font-semibold">💵 Cash</div>
                  <p className="text-sm text-gray-600">Bayar tunai di kasir</p>
                </div>
                <div
                  className={`border rounded-lg p-4 cursor-pointer transition-colors ${
                    paymentMethod === 'qris' ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-gray-300'
                  }`}
                  onClick={() => setPaymentMethod('qris')}
                >
                  <div className="font-semibold">📱 QRIS/Online</div>
                  <p className="text-sm text-gray-600">Bayar via Midtrans</p>
                </div>
              </div>
            </div>
            
            <div className="bg-gray-50 p-4 rounded-lg mb-6">
              <h3 className="font-semibold mb-4">Konfirmasi Pesanan</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div><strong>Film:</strong> {selectedFilm?.title}</div>
                <div><strong>Studio:</strong> {selectedSchedule?.studio?.name}</div>
                <div><strong>Kursi:</strong> {selectedSeats.map(s => `${s.row}${s.column}`).join(', ')}</div>
                <div><strong>Pelanggan:</strong> {customerName}</div>
                <div><strong>Telepon:</strong> {customerPhone}</div>
                <div><strong>Pembayaran:</strong> {paymentMethod === 'cash' ? 'Cash' : 'QRIS/Online'}</div>
              </div>
              <div className="mt-4 pt-4 border-t">
                <div className="text-lg font-bold">Total: Rp {calculateTotal().toLocaleString('id-ID')}</div>
              </div>
            </div>
            
            <div className="flex space-x-4">
              <Button variant="outline" onClick={() => setStep(3)}>Kembali</Button>
              <Button onClick={handleCreateOrder} disabled={loading}>
                {loading ? 'Memproses...' : paymentMethod === 'cash' ? 'Buat Pesanan' : 'Bayar Sekarang'}
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
