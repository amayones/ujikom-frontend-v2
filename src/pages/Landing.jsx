import { Link } from 'react-router-dom';
import { Film, Ticket, Clock, Star, LogIn } from 'lucide-react';
import Button from '../components/ui/Button';

export default function Landing() {
  return (
    <div className="min-h-screen bg-gray-50 text-gray-800">
      {/* Navbar */}
      <nav className="bg-emerald-600 sticky top-0 z-50 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <div className="bg-white/10 p-2 rounded-lg">
              <Film size={24} className="text-white" />
            </div>
            <span className="text-xl font-bold text-white">Absolute Cinema</span>
          </div>
          <Link to="/login">
            <Button className="flex items-center gap-2 bg-white text-emerald-600 hover:bg-emerald-50">
              <LogIn size={18} />
              Login
            </Button>
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative py-20 px-4 bg-gradient-to-br from-emerald-50 to-emerald-100">
        <div className="max-w-6xl mx-auto text-center">
          <h1 className="text-5xl md:text-7xl font-bold mb-6 text-emerald-600">
            Absolute Cinema
          </h1>
          <p className="text-xl md:text-2xl text-gray-600 mb-8">
            Pengalaman Menonton Film Terbaik di Kota Anda
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/register">
              <Button size="lg" className="w-full sm:w-auto bg-emerald-600 hover:bg-emerald-700 text-white">
                Daftar Sekarang
              </Button>
            </Link>
            <Link to="/login">
              <Button size="lg" variant="outline" className="w-full sm:w-auto border-emerald-600 text-emerald-600 hover:bg-emerald-600 hover:text-white">
                Login
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-16 px-4 bg-white">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12 text-gray-800">Kenapa Memilih Kami?</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white p-6 rounded-xl border border-gray-200 hover:border-emerald-600 hover:shadow-lg transition-all">
              <div className="bg-emerald-600 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
                <Ticket size={24} className="text-white" />
              </div>
              <h3 className="text-xl font-bold mb-2 text-gray-800">Pemesanan Online</h3>
              <p className="text-gray-600">Pesan tiket kapan saja, dimana saja dengan mudah dan cepat</p>
            </div>
            
            <div className="bg-white p-6 rounded-xl border border-gray-200 hover:border-emerald-600 hover:shadow-lg transition-all">
              <div className="bg-emerald-600 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
                <Clock size={24} className="text-white" />
              </div>
              <h3 className="text-xl font-bold mb-2 text-gray-800">Jadwal Fleksibel</h3>
              <p className="text-gray-600">Berbagai pilihan waktu tayang untuk kenyamanan Anda</p>
            </div>
            
            <div className="bg-white p-6 rounded-xl border border-gray-200 hover:border-emerald-600 hover:shadow-lg transition-all">
              <div className="bg-emerald-600 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
                <Star size={24} className="text-white" />
              </div>
              <h3 className="text-xl font-bold mb-2 text-gray-800">Film Terbaru</h3>
              <p className="text-gray-600">Nikmati film-film blockbuster terbaru dengan kualitas terbaik</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 bg-emerald-600">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl font-bold mb-6 text-white">Siap Menonton?</h2>
          <p className="text-xl text-emerald-50 mb-8">
            Daftar sekarang dan dapatkan pengalaman menonton yang tak terlupakan
          </p>
          <Link to="/register">
            <Button size="lg" className="text-lg px-8 py-4 bg-white text-emerald-600 hover:bg-emerald-50">
              Mulai Sekarang
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-800 py-8 px-4">
        <div className="max-w-6xl mx-auto text-center text-gray-300">
          <p>&copy; 2024 Absolute Cinema. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
