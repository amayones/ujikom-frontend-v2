import { useState, useEffect } from 'react';
import { adminApi } from '../../api/adminApi';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import { Plus, Edit, Trash2, Image, Search } from 'lucide-react';

import { formatRupiah } from '../../utils/currency';

export default function ManageFilms() {
  const [films, setFilms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [showPosterSearch, setShowPosterSearch] = useState(false);
  const [posterSearchTerm, setPosterSearchTerm] = useState('');
  const [posterResults, setPosterResults] = useState([]);
  const [searchingPosters, setSearchingPosters] = useState(false);
  const itemsPerPage = 10;

  useEffect(() => {
    fetchFilms();
  }, []);

  const [showForm, setShowForm] = useState(false);

  const fetchFilms = async () => {
    try {
      const response = await adminApi.getFilms();
      const filmsData = response.data?.data || response.data;
      setFilms(Array.isArray(filmsData) ? filmsData : filmsData.data || []);
    } catch (error) {
      console.error('Error fetching films:', error);
      setFilms([]);
    } finally {
      setLoading(false);
    }
  };
  const [editingFilm, setEditingFilm] = useState(null);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    duration: '',
    genre: '',
    status: 'play_now',
    poster: '',
    trailer: '',
    base_price: '50000'
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const filmData = {
      title: formData.title,
      description: formData.description,
      duration: parseInt(formData.duration),
      genre: formData.genre,
      status: formData.status,
      poster: formData.poster || '',
      trailer: formData.trailer || '',
      base_price: parseFloat(formData.base_price)
    };

    try {
      if (editingFilm) {
        await adminApi.updateFilm(editingFilm.id, filmData);
      } else {
        await adminApi.createFilm(filmData);
      }
      await fetchFilms();
      resetForm();
    } catch (error) {
      console.error('Error saving film:', error);
      alert('Gagal menyimpan film');
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      duration: '',
      genre: '',
      status: 'play_now',
      poster: '',
      trailer: '',
      base_price: '50000'
    });
    setShowForm(false);
    setEditingFilm(null);
  };

  const handleEdit = (film) => {
    setFormData({
      title: film.title,
      description: film.description,
      duration: film.duration.toString(),
      genre: film.genre,
      status: film.status,
      poster: film.poster,
      trailer: film.trailer || '',
      base_price: film.base_price.toString()
    });
    setEditingFilm(film);
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (confirm('Yakin ingin menghapus film ini?')) {
      try {
        await adminApi.deleteFilm(id);
        await fetchFilms();
      } catch (error) {
        console.error('Error deleting film:', error);
        alert('Gagal menghapus film');
      }
    }
  };

  const searchPosters = async () => {
    if (!posterSearchTerm.trim()) return;
    setSearchingPosters(true);
    try {
      const response = await fetch(
        `https://api.themoviedb.org/3/search/movie?api_key=15d2ea6d0dc1d476efbca3eba2b9bbfb&query=${encodeURIComponent(posterSearchTerm)}`
      );
      const data = await response.json();
      setPosterResults(data.results || []);
    } catch (error) {
      console.error('Error searching posters:', error);
      alert('Gagal mencari poster');
    } finally {
      setSearchingPosters(false);
    }
  };

  const selectPoster = (movie) => {
    setFormData({
      ...formData,
      poster: `https://image.tmdb.org/t/p/w500${movie.poster_path}`,
      trailer: ''
    });
    setShowPosterSearch(false);
    setPosterResults([]);
    setPosterSearchTerm('');
  };

  const filteredFilms = films.filter(film => {
    const matchSearch = film.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                       film.genre.toLowerCase().includes(searchTerm.toLowerCase());
    const matchStatus = filterStatus === 'all' || film.status === filterStatus;
    return matchSearch && matchStatus;
  });

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-lg">Memuat data film...</div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Kelola Film</h1>
        <Button onClick={() => setShowForm(true)} className="flex items-center">
          <Plus size={16} className="mr-2" />
          Tambah Film
        </Button>
      </div>

      {!showForm && (
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="p-4 border-b space-y-4">
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                  <input
                    type="text"
                    placeholder="Cari judul atau genre..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md"
                  />
                </div>
              </div>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-md"
              >
                <option value="all">Semua Status</option>
                <option value="play_now">Sedang Tayang</option>
                <option value="coming_soon">Segera Tayang</option>
              </select>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[800px]">
              <thead className="bg-gray-50">
                <tr>
                  <th className="text-left py-3 px-4">Poster</th>
                  <th className="text-left py-3 px-4">Judul</th>
                  <th className="text-left py-3 px-4">Genre</th>
                  <th className="text-left py-3 px-4">Durasi</th>
                  <th className="text-left py-3 px-4">Harga</th>
                  <th className="text-left py-3 px-4">Status</th>
                  <th className="text-left py-3 px-4">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {filteredFilms.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="py-8 text-center text-gray-500">
                      {searchTerm || filterStatus !== 'all' ? 'Tidak ada data yang sesuai' : 'Belum ada data film'}
                    </td>
                  </tr>
                ) : filteredFilms
                  .slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)
                  .map(film => (
                  <tr key={film.id} className="border-b hover:bg-gray-50">
                    <td className="py-3 px-4">
                      <img 
                        src={film.poster || `https://placehold.co/300x450/1e293b/e2e8f0?text=${encodeURIComponent(film.title)}`} 
                        alt={film.title} 
                        className="w-12 h-16 object-cover rounded"
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src = `https://placehold.co/300x450/1e293b/e2e8f0?text=${encodeURIComponent(film.title)}`;
                        }}
                      />
                    </td>
                    <td className="py-3 px-4 font-semibold">{film.title}</td>
                    <td className="py-3 px-4">{film.genre}</td>
                    <td className="py-3 px-4">{film.duration} min</td>
                    <td className="py-3 px-4">{formatRupiah(parseFloat(film.base_price))}</td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        film.status === 'play_now' 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-blue-100 text-blue-800'
                      }`}>
                        {film.status === 'play_now' ? 'Tayang' : 'Segera'}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex space-x-2">
                        <Button size="sm" variant="outline" onClick={() => handleEdit(film)}>
                          <Edit size={14} />
                        </Button>
                        <Button size="sm" variant="danger" onClick={() => handleDelete(film.id)}>
                          <Trash2 size={14} />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="flex items-center justify-between p-4 border-t">
              <p className="text-sm text-gray-600">
                Menampilkan {((currentPage - 1) * itemsPerPage) + 1} - {Math.min(currentPage * itemsPerPage, filteredFilms.length)} dari {filteredFilms.length} film
              </p>
              <div className="flex gap-2">
                <Button 
                  size="sm" 
                  variant="outline" 
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                >
                  ← Prev
                </Button>
                {Array.from({ length: Math.ceil(filteredFilms.length / itemsPerPage) }, (_, i) => i + 1)
                  .filter(page => page === 1 || page === Math.ceil(filteredFilms.length / itemsPerPage) || Math.abs(page - currentPage) <= 1)
                  .map((page, idx, arr) => (
                    <span key={page}>
                      {idx > 0 && arr[idx - 1] !== page - 1 && <span className="px-2">...</span>}
                      <Button
                        size="sm"
                        variant={currentPage === page ? 'primary' : 'outline'}
                        onClick={() => setCurrentPage(page)}
                      >
                        {page}
                      </Button>
                    </span>
                  ))}
                <Button 
                  size="sm" 
                  variant="outline" 
                  onClick={() => setCurrentPage(p => Math.min(Math.ceil(filteredFilms.length / itemsPerPage), p + 1))}
                  disabled={currentPage === Math.ceil(filteredFilms.length / itemsPerPage)}
                >
                  Next →
                </Button>
              </div>
            </div>
        </div>
      )}

      {showForm && (
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-xl font-bold mb-6">
            {editingFilm ? 'Edit Film' : 'Tambah Film Baru'}
          </h2>
          
          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Judul Film"
                value={formData.title}
                onChange={(e) => setFormData({...formData, title: e.target.value})}
                required
              />
              
              <Input
                label="Genre"
                value={formData.genre}
                onChange={(e) => setFormData({...formData, genre: e.target.value})}
                required
              />
              
              <Input
                label="Durasi (menit)"
                type="number"
                value={formData.duration}
                onChange={(e) => setFormData({...formData, duration: e.target.value})}
                required
              />
              
              <Input
                label="Harga Dasar (Rp)"
                type="number"
                value={formData.base_price}
                onChange={(e) => setFormData({...formData, base_price: e.target.value})}
                required
              />
              
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                <select
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  value={formData.status}
                  onChange={(e) => setFormData({...formData, status: e.target.value})}
                >
                  <option value="play_now">Sedang Tayang</option>
                  <option value="coming_soon">Segera Tayang</option>
                </select>
              </div>
              
              <div className="md:col-span-2">
                <div className="flex gap-2 items-end">
                  <div className="flex-1">
                    <Input
                      label="URL Poster"
                      value={formData.poster}
                      onChange={(e) => setFormData({...formData, poster: e.target.value})}
                      placeholder="https://image.tmdb.org/t/p/w500/..."
                    />
                  </div>
                  <Button type="button" onClick={() => setShowPosterSearch(true)}>
                    Cari Poster
                  </Button>
                </div>
                {formData.poster && (
                  <img src={formData.poster} alt="Preview" className="mt-2 w-32 h-48 object-cover rounded" onError={(e) => e.target.src = 'https://via.placeholder.com/300x450?text=Invalid+URL'} />
                )}
              </div>
              
              <div className="md:col-span-2">
                <Input
                  label="URL Trailer YouTube"
                  value={formData.trailer}
                  onChange={(e) => setFormData({...formData, trailer: e.target.value})}
                  placeholder="https://www.youtube.com/watch?v=..."
                />
              </div>
              
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Deskripsi</label>
                <textarea
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  rows="4"
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  required
                />
              </div>
            </div>
            
            <div className="flex space-x-4 mt-6">
              <Button type="submit">
                {editingFilm ? 'Update Film' : 'Tambah Film'}
              </Button>
              <Button type="button" variant="outline" onClick={resetForm}>
                Batal
              </Button>
            </div>
          </form>
        </div>
      )}

      {showPosterSearch && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <h3 className="text-xl font-bold mb-4">Cari Poster Film</h3>
            <div className="flex gap-2 mb-4">
              <input
                type="text"
                value={posterSearchTerm}
                onChange={(e) => setPosterSearchTerm(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && searchPosters()}
                placeholder="Masukkan judul film..."
                className="flex-1 px-3 py-2 border border-gray-300 rounded-md"
              />
              <Button onClick={searchPosters} disabled={searchingPosters}>
                {searchingPosters ? 'Mencari...' : 'Cari'}
              </Button>
              <Button variant="outline" onClick={() => setShowPosterSearch(false)}>
                Tutup
              </Button>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {posterResults.map((movie) => (
                <div
                  key={movie.id}
                  className="cursor-pointer border rounded-lg p-2 hover:shadow-lg transition-shadow"
                  onClick={() => selectPoster(movie)}
                >
                  <img
                    src={movie.poster_path ? `https://image.tmdb.org/t/p/w500${movie.poster_path}` : 'https://via.placeholder.com/300x450?text=No+Image'}
                    alt={movie.title}
                    className="w-full h-48 object-cover rounded mb-2"
                  />
                  <p className="text-sm font-semibold line-clamp-2">{movie.title}</p>
                  <p className="text-xs text-gray-500">{movie.release_date?.substring(0, 4)}</p>
                </div>
              ))}
            </div>
            {posterResults.length === 0 && !searchingPosters && posterSearchTerm && (
              <p className="text-center text-gray-500 py-8">Tidak ada hasil. Coba kata kunci lain.</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}