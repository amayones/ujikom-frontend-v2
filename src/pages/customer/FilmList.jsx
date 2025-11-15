import { useState, useEffect } from 'react';
import { useFilmsStore } from '../../store/filmsStore';
import ShowCard from '../../components/cinema/ShowCard';
import Button from '../../components/ui/Button';
import { Film, TrendingUp, Grid3x3 } from 'lucide-react';

export default function FilmList() {
  const { films, loading, fetchFilms, getPlayNowFilms, getComingSoonFilms, getAllFilms } = useFilmsStore();
  const [activeFilter, setActiveFilter] = useState('play_now');

  useEffect(() => {
    fetchFilms();
  }, []);

  const getFilteredFilms = () => {
    switch (activeFilter) {
      case 'play_now': return getPlayNowFilms();
      case 'coming_soon': return getComingSoonFilms();
      case 'all': return getAllFilms();
      default: return getPlayNowFilms();
    }
  };

  const filteredFilms = getFilteredFilms();

  const handleFilterChange = (newFilter) => {
    setActiveFilter(newFilter);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-pulse text-lg">Memuat film...</div>
      </div>
    );
  }

  const filterButtons = [
    { key: 'play_now', label: 'Sedang Tayang', icon: Film, count: getPlayNowFilms().length },
    { key: 'coming_soon', label: 'Segera Tayang', icon: TrendingUp, count: getComingSoonFilms().length },
    { key: 'all', label: 'Semua Film', icon: Grid3x3, count: getAllFilms().length }
  ];

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-black mb-2 bg-gradient-to-r from-red-600 to-purple-600 bg-clip-text text-transparent">
          🎬 Jelajahi Film
        </h1>
        <p className="text-gray-600">Temukan film favorit Anda dan pesan tiket sekarang!</p>
      </div>
      
      {/* Filter Buttons */}
      <div className="flex flex-wrap gap-3 mb-8">
        {filterButtons.map(({ key, label, icon: Icon, count }) => (
          <Button
            key={key}
            variant={activeFilter === key ? 'primary' : 'outline'}
            onClick={() => handleFilterChange(key)}
            className={`flex items-center space-x-2 px-6 py-3 font-semibold transition-all ${
              activeFilter === key 
                ? 'bg-red-600 hover:bg-red-700 shadow-lg scale-105' 
                : 'hover:border-red-600 hover:text-red-600'
            }`}
          >
            <Icon size={18} />
            <span>{label}</span>
            <span className={`px-2 py-0.5 rounded-full text-xs ${
              activeFilter === key ? 'bg-white text-red-600' : 'bg-gray-200 text-gray-700'
            }`}>
              {count}
            </span>
          </Button>
        ))}
      </div>

      {/* Films Grid */}
      {filteredFilms.length === 0 ? (
        <div className="text-center py-20">
          <div className="text-6xl mb-4">🎬</div>
          <p className="text-gray-500 text-xl font-semibold">Tidak ada film yang tersedia</p>
          <p className="text-gray-400 mt-2">Coba filter lain atau kembali lagi nanti</p>
        </div>
      ) : (
        <>
          <div className="mb-4 text-gray-600">
            Menampilkan <span className="font-bold text-red-600">{filteredFilms.length}</span> film
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredFilms.map(film => (
              <ShowCard key={film.id} film={film} />
            ))}
          </div>
        </>
      )}
    </div>
  );
}