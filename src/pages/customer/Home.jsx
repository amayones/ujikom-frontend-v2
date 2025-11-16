import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useFilmsStore } from '../../store/filmsStore';
import ShowCard from '../../components/cinema/ShowCard';
import Button from '../../components/ui/Button';
import { formatRupiah } from '../../utils/currency';
import { Film, Sparkles, Ticket, Star, Clock, TrendingUp, ChevronRight, Play } from 'lucide-react';

export default function Home() {
  const navigate = useNavigate();
  const { films, loading, fetchFilms, getPlayNowFilms, getComingSoonFilms } = useFilmsStore();
  const playingNow = getPlayNowFilms();
  const comingSoon = getComingSoonFilms();
  const [featuredIndex, setFeaturedIndex] = useState(0);
  const [showTrailer, setShowTrailer] = useState(false);

  const getYouTubeId = (url) => {
    if (!url) return null;
    const match = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\n?#]+)/);
    return match ? match[1] : null;
  };

  useEffect(() => {
    fetchFilms();
  }, [fetchFilms]);

  useEffect(() => {
    if (playingNow.length > 0) {
      const maxIndex = Math.min(3, playingNow.length);
      const interval = setInterval(() => {
        setFeaturedIndex((prev) => (prev + 1) % maxIndex);
      }, 5000);
      return () => clearInterval(interval);
    }
  }, [playingNow.length]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-pulse text-lg">Memuat film...</div>
      </div>
    );
  }

  const featured = playingNow[featuredIndex];

  return (
    <div className="space-y-8">
      {/* Hero Section with Featured Film */}
      {featured && (
        <div className="relative h-[500px] rounded-2xl overflow-hidden shadow-2xl">
          <div 
            className="absolute inset-0 bg-cover bg-center"
            style={{
              backgroundImage: `url(${featured.poster || 'https://placehold.co/1920x1080/1e293b/e2e8f0'})`,
            }}
          >
            <div className="absolute inset-0 bg-gradient-to-r from-black/90 via-black/70 to-transparent" />
          </div>
          
          <div className="relative h-full flex items-center px-8 lg:px-16">
            <div className="max-w-2xl space-y-6">
              <div className="flex items-center space-x-3">
                <span className="px-3 py-1 bg-red-600 text-white text-sm font-bold rounded-full">NOW PLAYING</span>
                <div className="flex items-center text-yellow-400">
                  <Star size={20} fill="currentColor" />
                  <span className="ml-1 text-white font-semibold">8.5</span>
                </div>
              </div>
              
              <h1 className="text-4xl lg:text-6xl font-black text-white leading-tight">
                {featured.title}
              </h1>
              
              <div className="flex items-center space-x-6 text-gray-300">
                <div className="flex items-center">
                  <Clock size={18} className="mr-2" />
                  <span>{featured.duration} min</span>
                </div>
                <span className="px-3 py-1 bg-white/20 backdrop-blur-sm rounded-full text-sm">
                  {featured.genre}
                </span>
              </div>
              
              <p className="text-gray-200 text-lg line-clamp-3">
                {featured.description}
              </p>
              
              <div className="flex space-x-4">
                <Button 
                  onClick={() => navigate(`/customer/films/${featured.id}`)}
                  className="bg-red-600 hover:bg-red-700 text-white px-8 py-3 text-lg font-semibold flex items-center"
                >
                  <Ticket size={20} className="mr-2" />
                  Pesan Sekarang
                </Button>
                {featured.trailer && (
                  <Button 
                    onClick={() => setShowTrailer(true)}
                    variant="outline"
                    className="border-2 border-white text-white hover:bg-white hover:text-black px-8 py-3 text-lg font-semibold flex items-center"
                  >
                    <Play size={20} className="mr-2" fill="currentColor" />
                    Tonton Trailer
                  </Button>
                )}
                <Button 
                  onClick={() => navigate(`/customer/films/${featured.id}`)}
                  variant="outline"
                  className="border-2 border-white text-white hover:bg-white hover:text-black px-8 py-3 text-lg font-semibold"
                >
                  Info Lengkap
                </Button>
              </div>
            </div>
          </div>
          
          {/* Carousel Indicators */}
          <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 flex space-x-2">
            {playingNow.slice(0, 3).map((_, idx) => (
              <button
                key={idx}
                onClick={() => setFeaturedIndex(idx)}
                className={`h-1 rounded-full transition-all ${
                  idx === featuredIndex ? 'w-8 bg-white' : 'w-4 bg-white/50'
                }`}
              />
            ))}
          </div>
        </div>
      )}

      {/* Stats Section */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-xl p-6 shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-100 text-sm font-medium">Film Tayang</p>
              <p className="text-4xl font-bold mt-2">{playingNow.length}</p>
            </div>
            <Film size={48} className="text-blue-200" />
          </div>
        </div>
        <div className="bg-gradient-to-br from-purple-500 to-purple-600 text-white rounded-xl p-6 shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-purple-100 text-sm font-medium">Segera Tayang</p>
              <p className="text-4xl font-bold mt-2">{comingSoon.length}</p>
            </div>
            <TrendingUp size={48} className="text-purple-200" />
          </div>
        </div>
        <div className="bg-gradient-to-br from-red-500 to-red-600 text-white rounded-xl p-6 shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-red-100 text-sm font-medium">Harga Mulai</p>
              <p className="text-4xl font-bold mt-2">{formatRupiah(35000)}</p>
            </div>
            <Ticket size={48} className="text-red-200" />
          </div>
        </div>
      </div>

      {/* Now Playing Section */}
      <section>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-3xl font-bold">🎬 Sedang Tayang</h2>
          <Button 
            variant="outline" 
            onClick={() => navigate('/customer/films')}
            className="flex items-center"
          >
            Lihat Semua
            <ChevronRight size={18} className="ml-1" />
          </Button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {playingNow.slice(0, 4).map(film => (
            <ShowCard key={film.id} film={film} />
          ))}
        </div>
      </section>

      {/* Coming Soon Section */}
      {comingSoon.length > 0 && (
        <section>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-3xl font-bold">🔥 Segera Tayang</h2>
            <Button 
              variant="outline" 
              onClick={() => navigate('/customer/films')}
              className="flex items-center"
            >
              Lihat Semua
              <ChevronRight size={18} className="ml-1" />
            </Button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {comingSoon.slice(0, 4).map(film => (
              <ShowCard key={film.id} film={film} />
            ))}
          </div>
        </section>
      )}

      {/* Features Section */}
      <section className="bg-gradient-to-br from-gray-900 to-gray-800 text-white rounded-2xl p-8 lg:p-12 shadow-xl">
        <h2 className="text-3xl font-bold mb-8 text-center">Mengapa Memilih Absolute Cinema?</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="text-center group">
            <div className="bg-gradient-to-br from-blue-500 to-blue-600 w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-4 transform group-hover:scale-110 transition-transform shadow-lg">
              <Film size={40} />
            </div>
            <h3 className="font-bold text-xl mb-3">Film Terbaru</h3>
            <p className="text-gray-300">Selalu menampilkan film-film terbaru dan terpopuler dari seluruh dunia</p>
          </div>
          <div className="text-center group">
            <div className="bg-gradient-to-br from-purple-500 to-purple-600 w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-4 transform group-hover:scale-110 transition-transform shadow-lg">
              <Sparkles size={40} />
            </div>
            <h3 className="font-bold text-xl mb-3">Kualitas Premium</h3>
            <p className="text-gray-300">Audio visual berkualitas tinggi dengan teknologi Dolby Atmos</p>
          </div>
          <div className="text-center group">
            <div className="bg-gradient-to-br from-red-500 to-red-600 w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-4 transform group-hover:scale-110 transition-transform shadow-lg">
              <Ticket size={40} />
            </div>
            <h3 className="font-bold text-xl mb-3">Booking Mudah</h3>
            <p className="text-gray-300">Sistem pemesanan online yang mudah, cepat, dan aman</p>
          </div>
        </div>
      </section>

      {/* Trailer Modal */}
      {showTrailer && featured?.trailer && getYouTubeId(featured.trailer) && (
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
              src={`https://www.youtube.com/embed/${getYouTubeId(featured.trailer)}?autoplay=1`}
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