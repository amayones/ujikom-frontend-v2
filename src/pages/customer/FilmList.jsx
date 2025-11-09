import { useState, useEffect } from 'react';
import { useFilmsStore } from '../../store/filmsStore';
import ShowCard from '../../components/cinema/ShowCard';
import Button from '../../components/ui/Button';

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
        <div className="text-lg">Memuat film...</div>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Daftar Film</h1>
      
      <div className="flex flex-wrap gap-3 sm:gap-4 mb-6 sm:mb-8">
        <Button
          variant={activeFilter === 'play_now' ? 'primary' : 'outline'}
          onClick={() => handleFilterChange('play_now')}
        >
          Sedang Tayang
        </Button>
        <Button
          variant={activeFilter === 'coming_soon' ? 'primary' : 'outline'}
          onClick={() => handleFilterChange('coming_soon')}
        >
          Segera Tayang
        </Button>
        <Button
          variant={activeFilter === 'all' ? 'primary' : 'outline'}
          onClick={() => handleFilterChange('all')}
        >
          Semua Film
        </Button>
      </div>

      {filteredFilms.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500 text-lg">Tidak ada film yang tersedia</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredFilms.map(film => (
            <ShowCard key={film.id} film={film} />
          ))}
        </div>
      )}
    </div>
  );
}