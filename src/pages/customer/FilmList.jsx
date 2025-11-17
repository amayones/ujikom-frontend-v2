import { useState, useEffect, useMemo, useCallback } from 'react';
import { useFilmsStore } from '../../store/filmsStore';
import { useThemeClasses } from '../../hooks/useThemeClasses';
import ShowCard from '../../components/cinema/ShowCard';
import Button from '../../components/ui/Button';
import { Film, TrendingUp, LayoutGrid, Search } from 'lucide-react';

export default function FilmList() {
  const { loading, fetchFilms, getPlayNowFilms, getComingSoonFilms, getAllFilms } = useFilmsStore();
  const { text, textMuted, bgSolid, border } = useThemeClasses();
  const [activeFilter, setActiveFilter] = useState('play_now');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchFilms();
  }, [fetchFilms]);

  const playNowFilms = useMemo(() => {
    try {
      return getPlayNowFilms();
    } catch (err) {
      console.error('Error getting play now films:', err);
      return [];
    }
  }, [getPlayNowFilms]);
  
  const comingSoonFilms = useMemo(() => {
    try {
      return getComingSoonFilms();
    } catch (err) {
      console.error('Error getting coming soon films:', err);
      return [];
    }
  }, [getComingSoonFilms]);
  
  const allFilms = useMemo(() => {
    try {
      return getAllFilms();
    } catch (err) {
      console.error('Error getting all films:', err);
      return [];
    }
  }, [getAllFilms]);

  const filteredFilms = useMemo(() => {
    let films = [];
    if (activeFilter === 'coming_soon') films = comingSoonFilms;
    else if (activeFilter === 'all') films = allFilms;
    else films = playNowFilms;
    
    if (!searchQuery.trim()) return films;
    
    const query = searchQuery.toLowerCase().trim();
    return films.filter(film => 
      film.title?.toLowerCase().includes(query) ||
      film.genre?.toLowerCase().includes(query) ||
      film.description?.toLowerCase().includes(query)
    );
  }, [activeFilter, playNowFilms, comingSoonFilms, allFilms, searchQuery]);

  const filterButtons = useMemo(() => [
    { id: 'play_now', label: 'Sedang Tayang', icon: Film, count: playNowFilms.length },
    { id: 'coming_soon', label: 'Segera Tayang', icon: TrendingUp, count: comingSoonFilms.length },
    { id: 'all', label: 'Semua Film', icon: LayoutGrid, count: allFilms.length }
  ], [playNowFilms.length, comingSoonFilms.length, allFilms.length]);

  const handleFilterChange = useCallback((newFilter) => {
    if (newFilter !== activeFilter) {
      setActiveFilter(newFilter);
    }
  }, [activeFilter]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-pulse text-lg">Memuat film...</div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className={`text-3xl font-bold mb-2 ${text}`}>
          🎬 Jelajahi Film
        </h1>
        <p className={textMuted}>Temukan film favorit Anda dan pesan tiket sekarang!</p>
      </div>
      
      {/* Search Bar */}
      <div className="mb-6">
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
          <input
            type="text"
            placeholder="Cari film berdasarkan judul, genre, atau deskripsi..."
            value={searchQuery}
            onChange={(e) => {
              try {
                setSearchQuery(e.target.value || '');
              } catch (err) {
                console.error('Search input error:', err);
              }
            }}
            className={`w-full pl-10 pr-4 py-3 border ${border} ${bgSolid} ${text} rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent`}
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => {
                try {
                  setSearchQuery('');
                } catch (err) {
                  console.error('Clear search error:', err);
                }
              }}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
              aria-label="Clear search"
            >
              ✕
            </button>
          )}
        </div>
      </div>
      
      {/* Filter Buttons */}
      <div className="flex flex-wrap gap-3 mb-8">
        {filterButtons.map(({ id, label, icon: Icon, count }) => (
          <Button
            key={id}
            variant={activeFilter === id ? 'primary' : 'outline'}
            onClick={() => handleFilterChange(id)}
            className={`flex items-center space-x-2 px-6 py-3 font-semibold transition-all ${
              activeFilter === id 
                ? 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-lg scale-105' 
                : 'hover:border-emerald-600 hover:text-emerald-600'
            }`}
          >
            <Icon size={18} />
            <span>{label}</span>
            <span className={`px-2 py-0.5 rounded-full text-xs ${
              activeFilter === id ? 'bg-white text-emerald-600' : 'bg-gray-200 text-gray-700'
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
          <div className={`mb-4 ${textMuted}`}>
            Menampilkan <span className="font-bold text-emerald-600">{filteredFilms.length}</span> film
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {filteredFilms.map(film => (
              <ShowCard key={film.id} film={film} />
            ))}
          </div>
        </>
      )}
    </div>
  );
}