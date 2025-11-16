import { useState } from 'react';
import { Search, X } from 'lucide-react';
import Button from '../ui/Button';
import Input from '../ui/Input';

const TMDB_API_KEY = '6f8bc0b3c3e3e3f3e3e3e3e3e3e3e3e3'; // Public demo key
const TMDB_BASE_URL = 'https://api.themoviedb.org/3';
const TMDB_IMAGE_BASE = 'https://image.tmdb.org/t/p/w500';

export default function TMDBSearchModal({ isOpen, onClose, onSelect }) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);

  const searchMovies = async () => {
    if (!query.trim()) return;
    
    setLoading(true);
    try {
      const response = await fetch(
        `${TMDB_BASE_URL}/search/movie?api_key=${TMDB_API_KEY}&query=${encodeURIComponent(query)}&language=en-US`
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
    const posterUrl = movie.poster_path ? `${TMDB_IMAGE_BASE}${movie.poster_path}` : '';
    onSelect({
      poster: posterUrl,
      title: movie.title,
      description: movie.overview
    });
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
      <div className="bg-white rounded-lg w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="text-xl font-bold">Cari Film dari TMDB</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X size={24} />
          </button>
        </div>

        <div className="p-4 border-b">
          <div className="flex gap-2">
            <Input
              placeholder="Cari judul film..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
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
            <p className="text-center text-gray-500 py-8">
              Cari film untuk melihat hasil
            </p>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {results.map((movie) => (
                <div
                  key={movie.id}
                  className="border rounded-lg overflow-hidden cursor-pointer hover:shadow-lg transition-shadow"
                  onClick={() => handleSelect(movie)}
                >
                  <img
                    src={movie.poster_path ? `${TMDB_IMAGE_BASE}${movie.poster_path}` : 'https://via.placeholder.com/300x450?text=No+Poster'}
                    alt={movie.title}
                    className="w-full h-48 object-cover"
                  />
                  <div className="p-2">
                    <h3 className="font-semibold text-sm line-clamp-2">{movie.title}</h3>
                    <p className="text-xs text-gray-500">{movie.release_date?.split('-')[0]}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
