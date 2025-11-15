import { useState, useEffect } from 'react';
import { adminApi } from '../../api/adminApi';
import { filmApi } from '../../api/filmApi';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import { Plus, Edit, Trash2, Film, Monitor, Calendar, Check } from 'lucide-react';
import { formatRupiah } from '../../utils/currency';

export default function ManageSchedules() {
  const [films, setFilms] = useState([]);
  const [schedules, setSchedules] = useState([]);
  const [studios, setStudios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingSchedule, setEditingSchedule] = useState(null);
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    film_id: '',
    studio_id: '',
    show_time: ''
  });
  const [selectedFilm, setSelectedFilm] = useState(null);
  const [selectedStudio, setSelectedStudio] = useState(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [filmsRes, schedulesRes] = await Promise.all([
        filmApi.getFilms(),
        adminApi.getSchedules()
      ]);
      setFilms([...filmsRes.data.play_now, ...filmsRes.data.coming_soon]);
      setSchedules(schedulesRes.data);
      // Mock studios - ideally should come from API
      setStudios([{id: 1, name: 'Studio 1'}, {id: 2, name: 'Studio 2'}, {id: 3, name: 'Studio 3'}]);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
    
    const showTime = new Date(formData.show_time);
    if (showTime <= new Date()) {
      alert('Waktu tayang harus di masa depan');
      return;
    }
    
    setLoading(true);
    try {
      if (editingSchedule) {
        await adminApi.updateSchedule(editingSchedule.id, formData);
      } else {
        await adminApi.createSchedule(formData);
      }
      await fetchData();
      resetForm();
      alert('Jadwal berhasil disimpan');
    } catch (error) {
      console.error('Error saving schedule:', error);
      const errorMsg = error.response?.data?.message || 'Gagal menyimpan jadwal';
      alert(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      film_id: '',
      studio_id: '',
      show_time: ''
    });
    setShowForm(false);
    setEditingSchedule(null);
    setStep(1);
    setSelectedFilm(null);
    setSelectedStudio(null);
  };

  const handleFilmSelect = (film) => {
    setSelectedFilm(film);
    setFormData({...formData, film_id: film.id});
  };

  const handleStudioSelect = (studio) => {
    setSelectedStudio(studio);
    setFormData({...formData, studio_id: studio.id});
  };

  const handleEdit = (schedule) => {
    const film = films.find(f => f.id === schedule.film_id);
    const studio = studios.find(s => s.id === schedule.studio_id);
    
    setFormData({
      film_id: schedule.film_id,
      studio_id: schedule.studio_id,
      show_time: schedule.show_time.slice(0, 16)
    });
    setSelectedFilm(film);
    setSelectedStudio(studio);
    setEditingSchedule(schedule);
    setStep(4);
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (confirm('Yakin ingin menghapus jadwal ini?')) {
      try {
        await adminApi.deleteSchedule(id);
        await fetchData();
      } catch (error) {
        console.error('Error deleting schedule:', error);
        alert('Gagal menghapus jadwal');
      }
    }
  };

  const initialLoading = loading && schedules.length === 0;

  if (initialLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-lg">Memuat data...</div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Kelola Jadwal</h1>
        <Button onClick={() => setShowForm(true)} className="flex items-center">
          <Plus size={16} className="mr-2" />
          Tambah Jadwal
        </Button>
      </div>

      {showForm && (
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-xl font-bold mb-6">
            {editingSchedule ? 'Edit Jadwal' : 'Tambah Jadwal Baru'}
          </h2>
          
          {/* Step Indicator */}
          <div className="flex items-center justify-center mb-8">
            {[1, 2, 3, 4].map(num => (
              <div key={num} className="flex items-center">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center font-medium transition-colors ${
                  step >= num ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-600'
                }`}>
                  {step > num ? <Check size={20} /> : num}
                </div>
                {num < 4 && <div className={`w-16 h-1 transition-colors ${step > num ? 'bg-blue-600' : 'bg-gray-200'}`} />}
              </div>
            ))}
          </div>

          <div className="text-center mb-6">
            <p className="text-sm text-gray-600">
              {step === 1 && 'Pilih Film'}
              {step === 2 && 'Pilih Studio'}
              {step === 3 && 'Pilih Waktu Tayang'}
              {step === 4 && 'Konfirmasi Jadwal'}
            </p>
          </div>

          {/* Step 1: Pilih Film */}
          {step === 1 && (
            <div>
              <h3 className="text-lg font-semibold mb-4 flex items-center">
                <Film className="mr-2" size={20} />
                Pilih Film
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 max-h-96 overflow-y-auto">
                {films.length === 0 ? (
                  <div className="col-span-3 text-center py-8 text-gray-500">
                    Tidak ada film tersedia. Silakan tambah film terlebih dahulu.
                  </div>
                ) : films.map(film => (
                  <div
                    key={film.id}
                    className={`border rounded-lg p-4 cursor-pointer transition-all hover:shadow-md ${
                      selectedFilm?.id === film.id ? 'border-blue-500 bg-blue-50 ring-2 ring-blue-200' : 'border-gray-200'
                    }`}
                    onClick={() => handleFilmSelect(film)}
                  >
                    <img 
                      src={film.poster || `https://placehold.co/300x450/1e293b/e2e8f0?text=${encodeURIComponent(film.title)}`} 
                      alt={film.title} 
                      className="w-full h-32 object-cover rounded mb-2"
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = `https://placehold.co/300x450/1e293b/e2e8f0?text=${encodeURIComponent(film.title)}`;
                      }}
                    />
                    <h4 className="font-semibold text-sm">{film.title}</h4>
                    <p className="text-xs text-gray-600">{film.genre} • {film.duration} min</p>
                    <p className="text-xs text-blue-600 font-medium mt-1">{formatRupiah(film.base_price)}</p>
                  </div>
                ))}
              </div>
              <div className="flex justify-between mt-6">
                <Button variant="outline" onClick={resetForm}>Batal</Button>
                <Button onClick={() => setStep(2)} disabled={!selectedFilm}>Lanjut</Button>
              </div>
            </div>
          )}

          {/* Step 2: Pilih Studio */}
          {step === 2 && (
            <div>
              <h3 className="text-lg font-semibold mb-4 flex items-center">
                <Monitor className="mr-2" size={20} />
                Pilih Studio
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
                {studios.map(studio => (
                  <div
                    key={studio.id}
                    className={`border rounded-lg p-6 cursor-pointer transition-all hover:shadow-md ${
                      selectedStudio?.id === studio.id ? 'border-blue-500 bg-blue-50 ring-2 ring-blue-200' : 'border-gray-200'
                    }`}
                    onClick={() => handleStudioSelect(studio)}
                  >
                    <div className="text-center">
                      <Monitor size={40} className="mx-auto mb-2 text-blue-600" />
                      <h4 className="font-semibold text-lg">{studio.name}</h4>
                      <p className="text-sm text-gray-600">Kapasitas: 50 kursi</p>
                    </div>
                  </div>
                ))}
              </div>
              <div className="flex justify-between mt-6">
                <Button variant="outline" onClick={() => setStep(1)}>Kembali</Button>
                <Button onClick={() => setStep(3)} disabled={!selectedStudio}>Lanjut</Button>
              </div>
            </div>
          )}

          {/* Step 3: Pilih Waktu */}
          {step === 3 && (
            <div>
              <h3 className="text-lg font-semibold mb-4 flex items-center">
                <Calendar className="mr-2" size={20} />
                Pilih Waktu Tayang
              </h3>
              <div className="max-w-md mx-auto">
                <Input
                  label="Tanggal & Waktu Tayang"
                  type="datetime-local"
                  value={formData.show_time}
                  onChange={(e) => setFormData({...formData, show_time: e.target.value})}
                  required
                />
                <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <p className="text-sm text-yellow-800">
                    <strong>Tips:</strong> Pastikan waktu tayang tidak bentrok dengan jadwal lain di studio yang sama.
                  </p>
                </div>
              </div>
              <div className="flex justify-between mt-6">
                <Button variant="outline" onClick={() => setStep(2)}>Kembali</Button>
                <Button onClick={() => setStep(4)} disabled={!formData.show_time}>Lanjut</Button>
              </div>
            </div>
          )}

          {/* Step 4: Konfirmasi */}
          {step === 4 && (
            <div>
              <h3 className="text-lg font-semibold mb-4 flex items-center">
                <Check className="mr-2" size={20} />
                Konfirmasi Jadwal
              </h3>
              <div className="max-w-md mx-auto bg-gray-50 rounded-lg p-6">
                <div className="space-y-4">
                  <div className="flex items-start">
                    <Film className="mr-3 mt-1 text-blue-600" size={20} />
                    <div>
                      <p className="text-sm text-gray-600">Film</p>
                      <p className="font-semibold">{selectedFilm?.title}</p>
                      <p className="text-xs text-gray-500">{selectedFilm?.genre} • {selectedFilm?.duration} min</p>
                    </div>
                  </div>
                  <div className="flex items-start">
                    <Monitor className="mr-3 mt-1 text-blue-600" size={20} />
                    <div>
                      <p className="text-sm text-gray-600">Studio</p>
                      <p className="font-semibold">{selectedStudio?.name}</p>
                    </div>
                  </div>
                  <div className="flex items-start">
                    <Calendar className="mr-3 mt-1 text-blue-600" size={20} />
                    <div>
                      <p className="text-sm text-gray-600">Waktu Tayang</p>
                      <p className="font-semibold">
                        {formData.show_time && new Date(formData.show_time).toLocaleDateString('id-ID', {
                          weekday: 'long',
                          day: 'numeric',
                          month: 'long',
                          year: 'numeric'
                        })}
                      </p>
                      <p className="text-sm text-gray-600">
                        {formData.show_time && new Date(formData.show_time).toLocaleTimeString('id-ID', {
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="flex justify-between mt-6">
                <Button variant="outline" onClick={() => editingSchedule ? resetForm() : setStep(3)}>
                  {editingSchedule ? 'Batal' : 'Kembali'}
                </Button>
                <Button onClick={handleSubmit} disabled={loading}>
                  {loading ? 'Menyimpan...' : editingSchedule ? 'Update Jadwal' : 'Simpan Jadwal'}
                </Button>
              </div>
            </div>
          )}
        </div>
      )}

      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="p-6 border-b">
          <h2 className="text-xl font-semibold">Daftar Jadwal</h2>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="text-left py-3 px-4">Film</th>
                <th className="text-left py-3 px-4">Studio</th>
                <th className="text-left py-3 px-4">Tanggal</th>
                <th className="text-left py-3 px-4">Waktu</th>
                <th className="text-left py-3 px-4">Harga</th>
                <th className="text-left py-3 px-4">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {schedules.length === 0 ? (
                <tr>
                  <td colSpan="6" className="text-center py-8 text-gray-500">
                    Belum ada jadwal. Klik "Tambah Jadwal" untuk membuat jadwal baru.
                  </td>
                </tr>
              ) : schedules.map(schedule => (
                <tr key={schedule.id} className="border-b hover:bg-gray-50">
                  <td className="py-3 px-4 font-semibold">{schedule.film?.title || 'N/A'}</td>
                  <td className="py-3 px-4">{schedule.studio?.name || 'N/A'}</td>
                  <td className="py-3 px-4">
                    {new Date(schedule.show_time).toLocaleDateString('id-ID')}
                  </td>
                  <td className="py-3 px-4">
                    {new Date(schedule.show_time).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
                  </td>
                  <td className="py-3 px-4">{schedule.film?.base_price ? formatRupiah(schedule.film.base_price) : 'N/A'}</td>
                  <td className="py-3 px-4">
                    <div className="flex space-x-2">
                      <Button size="sm" variant="outline" onClick={() => handleEdit(schedule)}>
                        <Edit size={14} />
                      </Button>
                      <Button size="sm" variant="danger" onClick={() => handleDelete(schedule.id)}>
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
    </div>
  );
}