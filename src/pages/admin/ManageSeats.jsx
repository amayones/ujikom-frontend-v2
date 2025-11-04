import { useState, useEffect } from 'react';
import { adminApi } from '../../api/adminApi';
import Button from '../../components/ui/Button';

export default function ManageSeats() {
  const [selectedStudio, setSelectedStudio] = useState(1);
  const [seats, setSeats] = useState([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    fetchSeats();
  }, []);

  const fetchSeats = async () => {
    try {
      const response = await adminApi.getSeats();
      setSeats(response.data);
    } catch (error) {
      console.error('Error fetching seats:', error);
    } finally {
      setLoading(false);
    }
  };
  
  const studioSeats = seats.filter(s => s.studio_id === selectedStudio);
  
  // Group seats by row
  const seatsByRow = studioSeats.reduce((acc, seat) => {
    if (!acc[seat.row]) acc[seat.row] = [];
    acc[seat.row].push(seat);
    return acc;
  }, {});

  const toggleSeatType = async (seatId) => {
    const seat = seats.find(s => s.id === seatId);
    if (!seat) return;
    
    try {
      const newCategory = seat.category === 'vip' ? 'regular' : 'vip';
      await adminApi.updateSeat(seatId, { ...seat, category: newCategory });
      await fetchSeats();
    } catch (error) {
      console.error('Error updating seat:', error);
      alert('Gagal mengubah tipe kursi');
    }
  };



  const getSeatClasses = (type) => {
    const baseClasses = 'w-8 h-8 m-1 rounded text-xs font-medium flex items-center justify-center cursor-pointer transition-colors border';
    
    switch (type) {
      case 'regular':
        return `${baseClasses} bg-green-200 hover:bg-green-300 text-green-800 border-green-300`;
      case 'vip':
        return `${baseClasses} bg-yellow-200 hover:bg-yellow-300 text-yellow-800 border-yellow-300`;
      case 'empty':
        return 'w-8 h-8 m-1';
      default:
        return baseClasses;
    }
  };

  const handleSave = async () => {
    alert('Perubahan sudah otomatis tersimpan');
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-lg">Memuat data...</div>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-3xl font-bold mb-8">Kelola Kursi</h1>

      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <div className="flex justify-between items-center mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Pilih Studio</label>
            <select
              className="px-3 py-2 border border-gray-300 rounded-md"
              value={selectedStudio}
              onChange={(e) => setSelectedStudio(parseInt(e.target.value))}
            >
              <option value={1}>Studio 1</option>
              <option value={2}>Studio 2</option>
              <option value={3}>Studio 3</option>
            </select>
          </div>
          <Button onClick={handleSave}>Simpan Layout</Button>
        </div>

        <div className="text-center mb-6">
          <div className="bg-gray-800 text-white py-2 px-8 rounded-lg inline-block">
            LAYAR
          </div>
        </div>

        <div className="flex flex-col items-center space-y-2 mb-6">
          {Object.keys(seatsByRow).sort().map((row) => (
            <div key={row} className="flex items-center">
              <span className="w-6 text-center text-sm font-medium text-gray-600 mr-2">
                {row}
              </span>
              <div className="flex">
                {seatsByRow[row].sort((a, b) => a.column - b.column).map((seat) => (
                  <div
                    key={seat.id}
                    className={getSeatClasses(seat.category)}
                    onClick={() => toggleSeatType(seat.id)}
                    title={`${seat.row}${seat.column} - ${seat.category} - Click to toggle`}
                  >
                    {seat.column}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="flex justify-center space-x-6 text-sm mb-6">
          <div className="flex items-center">
            <div className="w-4 h-4 bg-green-200 rounded mr-2 border border-green-300"></div>
            <span>Kursi Regular</span>
          </div>
          <div className="flex items-center">
            <div className="w-4 h-4 bg-yellow-200 rounded mr-2 border border-yellow-300"></div>
            <span>Kursi VIP</span>
          </div>
        </div>

        <div className="bg-gray-50 p-4 rounded-lg">
          <h3 className="font-semibold mb-2">Informasi Layout</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div>
              <span className="font-medium">Total Kursi:</span>
              <span className="ml-2">{studioSeats.length}</span>
            </div>
            <div>
              <span className="font-medium">Kursi Regular:</span>
              <span className="ml-2">{studioSeats.filter(s => s.category === 'regular').length}</span>
            </div>
            <div>
              <span className="font-medium">Kursi VIP:</span>
              <span className="ml-2">{studioSeats.filter(s => s.category === 'vip').length}</span>
            </div>
            <div>
              <span className="font-medium">Baris:</span>
              <span className="ml-2">{Object.keys(seatsByRow).length}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold mb-4">Petunjuk</h2>
        <ul className="space-y-2 text-sm text-gray-600">
          <li>• Klik pada kursi untuk mengubah tipe (Regular ↔ VIP)</li>
          <li>• Kursi kosong tidak dapat diubah</li>
          <li>• Perubahan akan tersimpan setelah menekan tombol "Simpan Layout"</li>
          <li>• Layout yang sudah digunakan dalam jadwal tidak dapat diubah</li>
        </ul>
      </div>
    </div>
  );
}