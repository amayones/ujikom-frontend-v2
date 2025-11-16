import { useEffect, useState, useMemo, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useFilmsStore } from '../../store/filmsStore';
import { useCartStore } from '../../store/cartStore';
import Button from '../../components/ui/Button';
import { formatRupiah } from '../../utils/currency';
import { Clock, Calendar, ChevronLeft, ChevronRight } from 'lucide-react';

function SchedulesByDay({ schedules, onSelectSchedule }) {
  const [currentDayIndex, setCurrentDayIndex] = useState(0);

  const schedulesByDay = useMemo(() => {
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

  if (schedules.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h2 className="text-2xl font-bold mb-6 flex items-center">
          <Calendar className="mr-2" />
          Jadwal Tayang
        </h2>
        <div className="text-center py-8">
          <p className="text-gray-500">Belum ada jadwal tersedia untuk film ini</p>
        </div>
      </div>
    );
  }

  const [currentDate, currentSchedules] = schedulesByDay[currentDayIndex] || [null, []];
  const totalDays = schedulesByDay.length;

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold flex items-center">
          <Calendar className="mr-2" />
          Jadwal Tayang
        </h2>
        {totalDays > 1 && (
          <div className="text-sm text-gray-600">
            Hari {currentDayIndex + 1} dari {totalDays}
          </div>
        )}
      </div>

      {currentDate && (
        <div className="mb-6">
          <div className="flex items-center justify-between bg-blue-50 p-4 rounded-lg">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentDayIndex(Math.max(0, currentDayIndex - 1))}
              disabled={currentDayIndex === 0}
            >
              <ChevronLeft size={20} />
            </Button>
            
            <div className="text-center">
              <p className="text-lg font-bold text-blue-900">
                {new Date(currentSchedules[0].show_time).toLocaleDateString('id-ID', {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </p>
              <p className="text-sm text-gray-600">{currentSchedules.length} jadwal tersedia</p>
            </div>
            
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentDayIndex(Math.min(totalDays - 1, currentDayIndex + 1))}
              disabled={currentDayIndex === totalDays - 1}
            >
              <ChevronRight size={20} />
            </Button>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
        {currentSchedules.map((schedule) => (
          <div 
            key={schedule.id}
            className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
          >
            <div className="mb-3">
              <h4 className="font-semibold text-lg">{schedule.studio?.name || 'Studio'}</h4>
              <p className="text-sm text-gray-500">
                {schedule.day_type === 'weekend' ? '🎉 Weekend' : '📅 Weekday'}
              </p>
            </div>
            
            <div className="flex justify-between items-center">
              <div>
                <p className="text-2xl font-bold text-blue-600">
                  {new Date(schedule.show_time).toLocaleTimeString('id-ID', {
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </p>
              </div>
              
              <Button onClick={() => onSelectSchedule(schedule)}>
                Pilih
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function FilmDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { selectedFilm, schedules, fetchFilmById, fetchSchedules } = useFilmsStore();
  const { setSchedule } = useCartStore();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    
    const loadFilmData = async () => {
      try {
        await fetchFilmById(id);
        await fetchSchedules(id);
      } catch (error) {
        if (isMounted) {
          console.error('Error loading film:', error);
          alert('Gagal memuat data film');
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };
    
    loadFilmData();
    
    return () => {
      isMounted = false;
    };
  }, [id, fetchFilmById, fetchSchedules]);

  const handleSelectSchedule = useCallback((schedule) => {
    if (!schedule?.id || !selectedFilm?.id) {
      alert('Data jadwal tidak valid');
      return;
    }
    
    try {
      const scheduleData = {
        id: schedule.id,
        film_id: selectedFilm.id,
        film_title: selectedFilm.title,
        studio: schedule.studio?.name || 'Studio',
        date: new Date(schedule.show_time).toLocaleDateString('id-ID'),
        time: new Date(schedule.show_time).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }),
        base_price: schedule.base_price || selectedFilm.base_price,
        day_type: schedule.day_type || 'weekday'
      };
      
      setSchedule(scheduleData);
      navigate(`/customer/seats/${schedule.id}`);
    } catch (error) {
      console.error('Error selecting schedule:', error);
      alert('Gagal memilih jadwal');
    }
  }, [selectedFilm, setSchedule, navigate]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-lg">Memuat detail film...</div>
      </div>
    );
  }

  if (!selectedFilm) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500 text-lg mb-4">Film tidak ditemukan</p>
        <Button onClick={() => navigate('/customer/films')}>
          Kembali ke Daftar Film
        </Button>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold mb-2">🎬 Detail Film</h1>
          <p className="text-gray-600">Informasi lengkap dan jadwal tayang</p>
        </div>
        <Button 
          variant="outline" 
          onClick={() => navigate('/customer/films')}
        >
          ← Kembali
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
        <div className="lg:col-span-1">
          <img 
            src={selectedFilm.poster || `https://placehold.co/400x600/1e293b/e2e8f0?text=${encodeURIComponent(selectedFilm.title)}`} 
            alt={selectedFilm.title}
            className="w-full rounded-xl shadow-xl"
            onError={(e) => {
              if (e.target.src !== `https://placehold.co/400x600/1e293b/e2e8f0?text=${encodeURIComponent(selectedFilm.title)}`) {
                e.target.onerror = null;
                e.target.src = `https://placehold.co/400x600/1e293b/e2e8f0?text=${encodeURIComponent(selectedFilm.title)}`;
              }
            }}
          />
        </div>

        <div className="lg:col-span-2 bg-white rounded-xl shadow-lg p-6">
          <h1 className="text-3xl sm:text-4xl font-bold mb-4">{selectedFilm.title}</h1>
          
          <div className="flex flex-wrap gap-4 mb-6">
            <div className="flex items-center text-gray-600">
              <Clock size={20} className="mr-2" />
              <span>{selectedFilm.duration} menit</span>
            </div>
            <div className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-semibold">
              {selectedFilm.genre}
            </div>
            <div className={`px-3 py-1 rounded-full text-sm font-semibold ${
              selectedFilm.status === 'play_now' 
                ? 'bg-green-100 text-green-800' 
                : 'bg-yellow-100 text-yellow-800'
            }`}>
              {selectedFilm.status === 'play_now' ? 'Sedang Tayang' : 'Segera Tayang'}
            </div>
          </div>

          <div className="mb-6">
            <h2 className="text-xl font-semibold mb-2">Sinopsis</h2>
            <p className="text-gray-700 leading-relaxed">{selectedFilm.description}</p>
          </div>

          <div className="bg-blue-50 p-4 rounded-lg">
            <p className="text-lg">
              <span className="font-semibold">Harga Mulai:</span>{' '}
              <span className="text-2xl font-bold text-blue-600">
                {formatRupiah(selectedFilm.base_price)}
              </span>
            </p>
            <p className="text-sm text-gray-600 mt-1">*Harga dapat berbeda tergantung hari dan kategori kursi</p>
          </div>
        </div>
      </div>

      <SchedulesByDay 
        schedules={schedules || []}
        onSelectSchedule={handleSelectSchedule}
      />
    </div>
  );
}
