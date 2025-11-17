import { Link } from 'react-router-dom';
import { Clock, Star, Play } from 'lucide-react';
import { memo } from 'react';
import { useThemeClasses } from '../../hooks/useThemeClasses';
import Button from '../ui/Button';
import { formatRupiah } from '../../utils/currency';

function ShowCard({ film }) {
  const { bgSolid, text, textMuted } = useThemeClasses();
  const statusBadge = {
    play_now: { text: 'NOW PLAYING', color: 'bg-red-600 text-white' },
    coming_soon: { text: 'COMING SOON', color: 'bg-blue-600 text-white' }
  };

  const badge = statusBadge[film.status] || statusBadge.play_now;

  return (
    <div className={`group ${bgSolid} rounded-xl shadow-lg overflow-hidden hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2`}>
      <div className="relative overflow-hidden">
        <img 
          src={film.poster || `https://placehold.co/400x600/1e293b/e2e8f0?text=${encodeURIComponent(film.title)}`} 
          alt={film.title}
          className="w-full h-80 object-cover transform group-hover:scale-110 transition-transform duration-500"
          onError={(e) => {
            e.target.onerror = null;
            e.target.src = `https://placehold.co/400x600/1e293b/e2e8f0?text=${encodeURIComponent(film.title)}`;
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        
        <div className="absolute top-3 right-3">
          <span className={`px-3 py-1 rounded-full text-xs font-bold ${badge.color} shadow-lg`}>
            {badge.text}
          </span>
        </div>
        
        <div className="absolute top-3 left-3 flex items-center bg-black/70 backdrop-blur-sm px-2 py-1 rounded-lg">
          <Star size={14} className="text-yellow-400" fill="currentColor" />
          <span className="ml-1 text-white text-sm font-semibold">8.5</span>
        </div>
        
        {/* Play Button Overlay */}
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <div className="bg-red-600 rounded-full p-4 transform scale-0 group-hover:scale-100 transition-transform duration-300">
            <Play size={32} className="text-white" fill="currentColor" />
          </div>
        </div>
      </div>
      
      <div className="p-5">
        <h3 className={`font-bold text-xl mb-3 line-clamp-2 group-hover:text-red-600 transition-colors ${text}`}>{film.title}</h3>
        
        <div className={`flex items-center space-x-4 text-sm ${textMuted} mb-3`}>
          <div className="flex items-center">
            <Clock size={16} className="mr-1" />
            <span>{film.duration} min</span>
          </div>
          <span className="px-2 py-1 bg-gray-100 rounded-full text-xs font-medium">
            {film.genre}
          </span>
        </div>
        
        <p className={`${textMuted} text-sm mb-4 line-clamp-2`}>
          {film.description}
        </p>
        
        <div className="flex items-center justify-between mb-4">
          <div>
            <p className="text-xs text-gray-500">Harga mulai</p>
            <p className="text-lg font-bold text-red-600">{formatRupiah(film.base_price)}</p>
          </div>
        </div>
        
        <Link to={`/customer/films/${film.id}`}>
          <Button className="w-full bg-red-600 hover:bg-red-700 font-semibold">
            Pesan Tiket
          </Button>
        </Link>
      </div>
    </div>
  );
}

export default memo(ShowCard);