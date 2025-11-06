import { useEffect } from 'react';
import { useFilmsStore } from '../../store/filmsStore';
import ShowCard from '../../components/cinema/ShowCard';
import { Film, Sparkles, Ticket } from 'lucide-react';

export default function Home() {
  const { films, loading, fetchFilms, getPlayNowFilms } = useFilmsStore();
  const playingNow = getPlayNowFilms().slice(0, 6);

  useEffect(() => {
    fetchFilms();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-lg">Memuat film...</div>
      </div>
    );
  }

  return (
    <div>
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg p-8 mb-8">
        <h1 className="text-4xl font-bold mb-4">Selamat Datang di Absolute Cinema</h1>
        <p className="text-xl">Nikmati pengalaman menonton terbaik dengan teknologi terdepan</p>
      </div>

      <section className="mb-8">
        <h2 className="text-2xl font-bold mb-6">Sedang Tayang</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {playingNow.map(film => (
            <ShowCard key={film.id} film={film} />
          ))}
        </div>
      </section>

      <section className="bg-white rounded-lg p-6">
        <h2 className="text-2xl font-bold mb-4">Mengapa Memilih Absolute Cinema?</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center">
            <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <Film size={32} className="text-blue-600" />
            </div>
            <h3 className="font-semibold mb-2">Film Terbaru</h3>
            <p className="text-gray-600">Selalu menampilkan film-film terbaru dan terpopuler</p>
          </div>
          <div className="text-center">
            <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <Sparkles size={32} className="text-blue-600" />
            </div>
            <h3 className="font-semibold mb-2">Kualitas Premium</h3>
            <p className="text-gray-600">Audio visual berkualitas tinggi untuk pengalaman terbaik</p>
          </div>
          <div className="text-center">
            <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <Ticket size={32} className="text-blue-600" />
            </div>
            <h3 className="font-semibold mb-2">Booking Mudah</h3>
            <p className="text-gray-600">Sistem pemesanan online yang mudah dan cepat</p>
          </div>
        </div>
      </section>
    </div>
  );
}