import { useEffect, useState, useMemo, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useFilmsStore } from '../../store/filmsStore';
import { useCartStore } from '../../store/cartStore';
import Button from '../../components/ui/Button';
import { formatRupiah } from '../../utils/currency';
import { Clock, Calendar, ChevronLeft, ChevronRight, Play } from 'lucide-react';

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
          <div className="flex items-center justify-between bg-emerald-50 p-4 rounded-lg">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentDayIndex(Math.max(0, currentDayIndex - 1))}
              disabled={currentDayIndex === 0}
            >
              <ChevronLeft size={20} />
            </Button>
            
            <div className="text-center">
              <p className="text-lg font-bold text-emerald-900">
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
                {(() => {
                  const showDate = new Date(schedule.show_time);
                  const dayOfWeek = showDate.getDay();
                  return (dayOfWeek === 0 || dayOfWeek === 6) ? '🎉 Weekend' : '📅 Weekday';
                })()}
              </p>
            </div>
            
            <div className="flex justify-between items-center">
              <div>
                <p className="text-2xl font-bold text-emerald-600">
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
  const [showTrailer, setShowTrailer] = useState(false);

  const getYouTubeId = (url) => {
    if (!url) return null;
    const match = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\n?#]+)/);
    return match ? match[1] : null;
  };

  const handleSelectSchedule = useCallback((schedule) => {
    console.log('Schedule selected:', schedule);
    console.log('Selected film:', selectedFilm);
    
    if (!schedule) {
      alert('Data jadwal tidak valid');
      return;
    }
    
    if (!schedule.id) {
      alert('ID jadwal tidak ditemukan');
      console.error('Schedule missing id:', schedule);
      return;
    }
    
    if (!selectedFilm?.id) {
      alert('Data film tidak valid');
      return;
    }
    
    try {
      const showDate = new Date(schedule.show_time);
      const dayOfWeek = showDate.getDay();
      const dayType = (dayOfWeek === 0 || dayOfWeek === 6) ? 'weekend' : 'weekday';
      
      const scheduleData = {
        id: schedule.id,
        film_id: selectedFilm.id,
        film_title: selectedFilm.title,
        studio: schedule.studio?.name || 'Studio',
        date: showDate.toLocaleDateString('id-ID'),
        time: showDate.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }),
        show_time: schedule.show_time,
        base_price: selectedFilm.base_price,
        day_type: dayType
      };
      
      console.log('Setting schedule data:', scheduleData);
      setSchedule(scheduleData);
      
      const targetUrl = `/customer/seats/${schedule.id}`;
      console.log('Navigating to:', targetUrl);
      navigate(targetUrl);
    } catch (error) {
      console.error('Error selecting schedule:', error);
      alert('Gagal memilih jadwal: ' + error.message);
    }
  }, [selectedFilm, setSchedule, navigate]);

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
        <div className="lg:col-span-1 space-y-4">
          <div className="relative group">
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
            {selectedFilm.trailer && (
              <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all rounded-xl flex items-center justify-center">
                <button
                  onClick={() => setShowTrailer(true)}
                  className="opacity-0 group-hover:opacity-100 transition-opacity bg-emerald-600 text-white p-4 rounded-full hover:bg-emerald-700 transform hover:scale-110"
                >
                  <Play size={32} fill="white" />
                </button>
              </div>
            )}
          </div>
          {selectedFilm.trailer && (
            <Button 
              className="w-full" 
              onClick={() => setShowTrailer(true)}
            >
              <Play size={16} className="mr-2" />
              Tonton Trailer
            </Button>
          )}
        </div>

        <div className="lg:col-span-2 bg-white rounded-xl shadow-lg p-6">
          <h1 className="text-3xl sm:text-4xl font-bold mb-4">{selectedFilm.title}</h1>
          
          <div className="flex flex-wrap gap-4 mb-6">
            <div className="flex items-center text-gray-600">
              <Clock size={20} className="mr-2" />
              <span>{selectedFilm.duration} menit</span>
            </div>
            <div className="px-3 py-1 bg-emerald-100 text-emerald-800 rounded-full text-sm font-semibold">
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

          <div className="bg-emerald-50 p-4 rounded-lg">
            <p className="text-lg">
              <span className="font-semibold">Harga Mulai:</span>{' '}
              <span className="text-2xl font-bold text-emerald-600">
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

      {showTrailer && getYouTubeId(selectedFilm.trailer) && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-90 p-4"
          onClick={() => setShowTrailer(false)}
        >
          <div 
            className="relative w-full max-w-4xl aspect-video"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setShowTrailer(false)}
              className="absolute -top-10 right-0 text-white hover:text-gray-300 text-xl font-bold"
            >
              ✕ Tutup
            </button>
            <iframe
              className="w-full h-full rounded-lg"
              src={`https://www.youtube.com/embed/${getYouTubeId(selectedFilm.trailer)}?autoplay=1`}
              title="Trailer"
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          </div>
        </div>
      )}
    </div>
  );
}
