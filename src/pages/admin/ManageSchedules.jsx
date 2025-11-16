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
  const [currentPage, setCurrentPage] = useState(1);
  const [viewMode, setViewMode] = useState('grouped'); // 'grouped' or 'list'
  const itemsPerPage = 10;

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
      <div className="flex items-center justify-center h-64">
        <div className="text-lg">Memuat data...</div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold">Kelola Jadwal</h1>
        <Button onClick={() => setShowForm(true)} className="flex items-center">
          <Plus size={16} className="mr-2" />
          Tambah Jadwal
        </Button>
      </div>

      {showForm && (
        <div className="p-6 mb-8 bg-white rounded-lg shadow-md">
          <h2 className="mb-6 text-xl font-bold">
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

          <div className="mb-6 text-center">
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
              <h3 className="flex items-center mb-4 text-lg font-semibold">
                <Film className="mr-2" size={20} />
                Pilih Film
              </h3>
              <div className="grid grid-cols-1 gap-3 overflow-y-auto sm:grid-cols-2 lg:grid-cols-3 sm:gap-4 max-h-96">
                {films.length === 0 ? (
                  <div className="col-span-3 py-8 text-center text-gray-500">
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
                      className="object-cover w-full h-32 mb-2 rounded"
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = `https://placehold.co/300x450/1e293b/e2e8f0?text=${encodeURIComponent(film.title)}`;
                      }}
                    />
                    <h4 className="text-sm font-semibold">{film.title}</h4>
                    <p className="text-xs text-gray-600">{film.genre} • {film.duration} min</p>
                    <p className="mt-1 text-xs font-medium text-blue-600">{formatRupiah(film.base_price)}</p>
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
              <h3 className="flex items-center mb-4 text-lg font-semibold">
                <Monitor className="mr-2" size={20} />
                Pilih Studio
              </h3>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 sm:gap-4">
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
                      <h4 className="text-lg font-semibold">{studio.name}</h4>
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
              <h3 className="flex items-center mb-4 text-lg font-semibold">
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
                <div className="p-4 mt-4 border border-yellow-200 rounded-lg bg-yellow-50">
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
              <h3 className="flex items-center mb-4 text-lg font-semibold">
                <Check className="mr-2" size={20} />
                Konfirmasi Jadwal
              </h3>
              <div className="max-w-md p-6 mx-auto rounded-lg bg-gray-50">
                <div className="space-y-4">
                  <div className="flex items-start">
                    <Film className="mt-1 mr-3 text-blue-600" size={20} />
                    <div>
                      <p className="text-sm text-gray-600">Film</p>
                      <p className="font-semibold">{selectedFilm?.title}</p>
                      <p className="text-xs text-gray-500">{selectedFilm?.genre} • {selectedFilm?.duration} min</p>
                    </div>
                  </div>
                  <div className="flex items-start">
                    <Monitor className="mt-1 mr-3 text-blue-600" size={20} />
                    <div>
                      <p className="text-sm text-gray-600">Studio</p>
                      <p className="font-semibold">{selectedStudio?.name}</p>
                    </div>
                  </div>
                  <div className="flex items-start">
                    <Calendar className="mt-1 mr-3 text-blue-600" size={20} />
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

      <div className="overflow-hidden bg-white rounded-lg shadow-md">
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-semibold">Daftar Jadwal ({schedules.length})</h2>
          <div className="flex gap-2">
            <Button 
              size="sm" 
              variant={viewMode === 'grouped' ? 'primary' : 'outline'}
              onClick={() => setViewMode('grouped')}
            >
              Per Tanggal
            </Button>
            <Button 
              size="sm" 
              variant={viewMode === 'list' ? 'primary' : 'outline'}
              onClick={() => setViewMode('list')}
            >
              Semua
            </Button>
          </div>
        </div>
        
        {schedules.length === 0 ? (
          <div className="py-12 text-center text-gray-500">
            Belum ada jadwal. Klik "Tambah Jadwal" untuk membuat jadwal baru.
          </div>
        ) : viewMode === 'grouped' ? (
          <div className="p-6 space-y-6">
            {Object.entries(
              schedules.reduce((acc, schedule) => {
                const date = new Date(schedule.show_time).toLocaleDateString('id-ID', {
                  weekday: 'long',
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric'
                });
                if (!acc[date]) acc[date] = [];
                acc[date].push(schedule);
                return acc;
              }, {})
            ).sort((a, b) => new Date(b[1][0].show_time) - new Date(a[1][0].show_time)).map(([date, daySchedules]) => (
              <div key={date} className="border rounded-lg">
                <div className="p-4 font-semibold text-white bg-gradient-to-r from-blue-600 to-blue-700">
                  📅 {date} ({daySchedules.length} jadwal)
                </div>
                <div className="grid grid-cols-1 gap-3 p-4 md:grid-cols-2 lg:grid-cols-3">
                  {daySchedules.map(schedule => (
                    <div key={schedule.id} className="p-4 transition-shadow border rounded-lg hover:shadow-md">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <h4 className="font-semibold text-blue-600">{schedule.film?.title || 'N/A'}</h4>
                          <p className="text-sm text-gray-600">{schedule.studio?.name || 'N/A'}</p>
                        </div>
                        <span className="px-2 py-1 text-xs font-bold text-white bg-blue-600 rounded">
                          {new Date(schedule.show_time).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-semibold text-green-600">
                          {schedule.film?.base_price ? formatRupiah(schedule.film.base_price) : 'N/A'}
                        </span>
                        <div className="flex gap-2">
                          <Button size="sm" variant="outline" onClick={() => handleEdit(schedule)}>
                            <Edit size={14} />
                          </Button>
                          <Button size="sm" variant="danger" onClick={() => handleDelete(schedule.id)}>
                            <Trash2 size={14} />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left">Film</th>
                    <th className="px-4 py-3 text-left">Studio</th>
                    <th className="px-4 py-3 text-left">Tanggal</th>
                    <th className="px-4 py-3 text-left">Waktu</th>
                    <th className="px-4 py-3 text-left">Harga</th>
                    <th className="px-4 py-3 text-left">Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {schedules
                    .slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)
                    .map(schedule => (
                    <tr key={schedule.id} className="border-b hover:bg-gray-50">
                      <td className="px-4 py-3 font-semibold">{schedule.film?.title || 'N/A'}</td>
                      <td className="px-4 py-3">{schedule.studio?.name || 'N/A'}</td>
                      <td className="px-4 py-3">
                        {new Date(schedule.show_time).toLocaleDateString('id-ID')}
                      </td>
                      <td className="px-4 py-3">
                        {new Date(schedule.show_time).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
                      </td>
                      <td className="px-4 py-3">{schedule.film?.base_price ? formatRupiah(schedule.film.base_price) : 'N/A'}</td>
                      <td className="px-4 py-3">
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
            {Math.ceil(schedules.length / itemsPerPage) > 1 && (
              <div className="flex items-center justify-between p-4 border-t">
                <p className="text-sm text-gray-600">
                  Menampilkan {((currentPage - 1) * itemsPerPage) + 1} - {Math.min(currentPage * itemsPerPage, schedules.length)} dari {schedules.length} jadwal
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
                  {Array.from({ length: Math.ceil(schedules.length / itemsPerPage) }, (_, i) => i + 1)
                    .filter(page => page === 1 || page === Math.ceil(schedules.length / itemsPerPage) || Math.abs(page - currentPage) <= 1)
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
                    onClick={() => setCurrentPage(p => Math.min(Math.ceil(schedules.length / itemsPerPage), p + 1))}
                    disabled={currentPage === Math.ceil(schedules.length / itemsPerPage)}
                  >
                    Next →
                  </Button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}