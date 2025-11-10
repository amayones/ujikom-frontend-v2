import { Link } from 'react-router-dom';
import { Clock, Star } from 'lucide-react';
import { memo } from 'react';
import Button from '../ui/Button';

function ShowCard({ film }) {
  const statusBadge = {
    play_now: { text: 'Sedang Tayang', color: 'bg-green-100 text-green-800' },
    coming_soon: { text: 'Segera Tayang', color: 'bg-blue-100 text-blue-800' }
  };

  const badge = statusBadge[film.status] || statusBadge.play_now;

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
      <div className="relative">
        <img 
          src={film.poster || `https://placehold.co/400x600/1e293b/e2e8f0?text=${encodeURIComponent(film.title)}`} 
          alt={film.title}
          className="w-full h-64 object-cover"
          onError={(e) => {
            e.target.onerror = null;
            e.target.src = `https://placehold.co/400x600/1e293b/e2e8f0?text=${encodeURIComponent(film.title)}`;
          }}
        />
        <div className="absolute top-2 right-2">
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${badge.color}`}>
            {badge.text}
          </span>
        </div>
      </div>
      
      <div className="p-4">
        <h3 className="font-bold text-lg mb-2 line-clamp-2">{film.title}</h3>
        
        <div className="flex items-center space-x-4 text-sm text-gray-600 mb-3">
          <div className="flex items-center">
            <Clock size={16} className="mr-1" />
            <span>{film.duration} min</span>
          </div>
          <div className="flex items-center">
            <Star size={16} className="mr-1 text-yellow-500" />
            <span>8.5</span>
          </div>
        </div>
        
        <p className="text-gray-600 text-sm mb-3 line-clamp-2">
          {film.description}
        </p>
        
        <p className="text-xs text-gray-500 mb-4">{film.genre}</p>
        
        <Link to={`/customer/films/${film.id}`}>
          <Button className="w-full">
            Detail Film
          </Button>
        </Link>
      </div>
    </div>
  );
}

export default memo(ShowCard);