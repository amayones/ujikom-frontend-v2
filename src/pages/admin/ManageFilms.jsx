import { useState, useEffect } from 'react';
import { adminApi } from '../../api/adminApi';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import { Plus, Edit, Trash2, Image } from 'lucide-react';
import PosterSearchModal from '../../components/admin/PosterSearchModal';

export default function ManageFilms() {
  const [films, setFilms] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchFilms();
  }, []);

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
  const [showForm, setShowForm] = useState(false);
  const [editingFilm, setEditingFilm] = useState(null);
  const [showPosterModal, setShowPosterModal] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    duration: '',
    genre: '',
    status: 'play_now',
    poster: '',
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
      poster: formData.poster || `https://placehold.co/300x450/1e293b/e2e8f0?text=${encodeURIComponent(formData.title)}`,
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
                <label className="block text-sm font-medium text-gray-700 mb-1">URL Poster (opsional)</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md"
                    value={formData.poster}
                    onChange={(e) => setFormData({...formData, poster: e.target.value})}
                  />
                  <Button type="button" variant="outline" onClick={() => setShowPosterModal(true)}>
                    <Image size={16} className="mr-2" />
                    Cari Poster
                  </Button>
                </div>
                {formData.poster && (
                  <img src={formData.poster} alt="Preview" className="mt-2 w-32 h-48 object-cover rounded" />
                )}
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

      <div className="bg-white rounded-lg shadow-md overflow-hidden">
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
            {films.map(film => (
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
                <td className="py-3 px-4">Rp {parseFloat(film.base_price).toLocaleString('id-ID')}</td>
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
      </div>

      <PosterSearchModal
        isOpen={showPosterModal}
        onClose={() => setShowPosterModal(false)}
        onSelectPoster={(posterUrl) => setFormData({...formData, poster: posterUrl})}
      />
    </div>
  );
}