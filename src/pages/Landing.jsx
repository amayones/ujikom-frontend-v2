import { Link } from 'react-router-dom';
import { Film, Ticket, Clock, Star, LogIn } from 'lucide-react';
import Button from '../components/ui/Button';

export default function Landing() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black text-white">
      {/* Navbar */}
      <nav className="bg-black/50 backdrop-blur-md sticky top-0 z-50 border-b border-gray-800">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <div className="bg-red-600 p-2 rounded-lg">
              <Film size={24} />
            </div>
            <span className="text-xl font-bold">Absolute Cinema</span>
          </div>
          <Link to="/login">
            <Button className="flex items-center gap-2">
              <LogIn size={18} />
              Login
            </Button>
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative py-20 px-4">
        <div className="max-w-6xl mx-auto text-center">
          <h1 className="text-5xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-red-500 to-red-700 bg-clip-text text-transparent">
            Absolute Cinema
          </h1>
          <p className="text-xl md:text-2xl text-gray-300 mb-8">
            Pengalaman Menonton Film Terbaik di Kota Anda
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/register">
              <Button size="lg" className="w-full sm:w-auto">
                Daftar Sekarang
              </Button>
            </Link>
            <Link to="/login">
              <Button size="lg" variant="outline" className="w-full sm:w-auto border-white text-white hover:bg-white hover:text-black">
                Login
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-16 px-4 bg-black/30">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12">Kenapa Memilih Kami?</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-gray-800/50 p-6 rounded-xl border border-gray-700 hover:border-red-600 transition-all">
              <div className="bg-red-600 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
                <Ticket size={24} />
              </div>
              <h3 className="text-xl font-bold mb-2">Pemesanan Online</h3>
              <p className="text-gray-400">Pesan tiket kapan saja, dimana saja dengan mudah dan cepat</p>
            </div>
            
            <div className="bg-gray-800/50 p-6 rounded-xl border border-gray-700 hover:border-red-600 transition-all">
              <div className="bg-red-600 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
                <Clock size={24} />
              </div>
              <h3 className="text-xl font-bold mb-2">Jadwal Fleksibel</h3>
              <p className="text-gray-400">Berbagai pilihan waktu tayang untuk kenyamanan Anda</p>
            </div>
            
            <div className="bg-gray-800/50 p-6 rounded-xl border border-gray-700 hover:border-red-600 transition-all">
              <div className="bg-red-600 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
                <Star size={24} />
              </div>
              <h3 className="text-xl font-bold mb-2">Film Terbaru</h3>
              <p className="text-gray-400">Nikmati film-film blockbuster terbaru dengan kualitas terbaik</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl font-bold mb-6">Siap Menonton?</h2>
          <p className="text-xl text-gray-300 mb-8">
            Daftar sekarang dan dapatkan pengalaman menonton yang tak terlupakan
          </p>
          <Link to="/register">
            <Button size="lg" className="text-lg px-8 py-4">
              Mulai Sekarang
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-black border-t border-gray-800 py-8 px-4">
        <div className="max-w-6xl mx-auto text-center text-gray-400">
          <p>&copy; 2024 Absolute Cinema. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
