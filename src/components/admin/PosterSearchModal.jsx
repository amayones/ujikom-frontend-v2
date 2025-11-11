import { useState } from 'react';
import { X, Search } from 'lucide-react';
import Button from '../ui/Button';

export default function PosterSearchModal({ isOpen, onClose, onSelectPoster }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);

  const searchMovies = async () => {
    if (!searchQuery.trim()) return;
    
    setLoading(true);
    try {
      const response = await fetch(
        `https://api.themoviedb.org/3/search/movie?api_key=e6ab9c3c97bffd5fc9c5d41ef9f0e269&query=${encodeURIComponent(searchQuery)}&language=id-ID`
      );
      const data = await response.json();
      setResults(data.results || []);
    } catch (error) {
      console.error('Error searching movies:', error);
      alert('Gagal mencari film');
    } finally {
      setLoading(false);
    }
  };

  const handleSelect = (movie) => {
    const posterUrl = movie.poster_path 
      ? `https://image.tmdb.org/t/p/w500${movie.poster_path}`
      : '';
    onSelectPoster(posterUrl);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        <div className="flex justify-between items-center p-4 border-b">
          <h2 className="text-xl font-bold">Cari Poster Film dari TMDB</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X size={24} />
          </button>
        </div>

        <div className="p-4 border-b">
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="Cari judul film..."
              className="flex-1 px-4 py-2 border border-gray-300 rounded-md"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && searchMovies()}
            />
            <Button onClick={searchMovies} disabled={loading}>
              <Search size={16} className="mr-2" />
              {loading ? 'Mencari...' : 'Cari'}
            </Button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4">
          {results.length === 0 ? (
            <div className="text-center text-gray-500 py-8">
              Cari film untuk melihat hasil
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {results.map((movie) => (
                <div
                  key={movie.id}
                  className="cursor-pointer hover:scale-105 transition-transform"
                  onClick={() => handleSelect(movie)}
                >
                  <img
                    src={
                      movie.poster_path
                        ? `https://image.tmdb.org/t/p/w500${movie.poster_path}`
                        : 'https://placehold.co/300x450/1e293b/e2e8f0?text=No+Poster'
                    }
                    alt={movie.title}
                    className="w-full rounded-lg shadow-md"
                  />
                  <p className="text-sm mt-2 text-center font-medium line-clamp-2">
                    {movie.title}
                  </p>
                  <p className="text-xs text-gray-500 text-center">
                    {movie.release_date?.split('-')[0] || 'N/A'}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
