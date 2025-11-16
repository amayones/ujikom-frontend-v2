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

  // Calculate max columns
  const maxColumns = Object.values(seatsByRow).reduce((max, row) => 
    Math.max(max, row.length), 0
  );

  const getSeatClasses = () => {
    return 'w-8 h-8 m-1 rounded text-xs font-medium flex items-center justify-center bg-green-200 text-green-800 border border-green-300';
  };

  const handleSave = async () => {
    alert('Perubahan sudah otomatis tersimpan');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg">Memuat data...</div>
      </div>
    );
  }

  return (
    <div>
      <h1 className="mb-8 text-3xl font-bold">Kelola Kursi</h1>

      <div className="p-4 mb-8 bg-white rounded-lg shadow-md sm:p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <label className="block mb-2 text-sm font-medium text-gray-700">Pilih Studio</label>
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

        <div className="mb-6 text-center">
          <div className="inline-block px-8 py-2 text-white bg-gray-800 rounded-lg">
            LAYAR
          </div>
        </div>

        <div className="flex flex-col items-center mb-6 space-y-2">
          {Object.keys(seatsByRow).sort().map((row) => (
            <div key={row} className="flex items-center">
              <span className="w-6 mr-2 text-sm font-medium text-center text-gray-600">
                {row}
              </span>
              <div className="flex">
                {seatsByRow[row].sort((a, b) => a.column - b.column).map((seat) => (
                  <div
                    key={seat.id}
                    className={getSeatClasses()}
                    title={`${seat.row}${seat.column}`}
                  >
                    {seat.column}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="flex justify-center mb-6 space-x-6 text-sm">
          <div className="flex items-center">
            <div className="w-4 h-4 mr-2 bg-green-200 border border-green-300 rounded"></div>
            <span>Kursi Tersedia</span>
          </div>
        </div>

        <div className="p-4 rounded-lg bg-gray-50">
          <h3 className="mb-2 font-semibold">Informasi Layout</h3>
          <div className="grid grid-cols-2 gap-3 text-sm sm:grid-cols-3 sm:gap-4">
            <div>
              <span className="font-medium">Total Kursi:</span>
              <span className="ml-2">{studioSeats.length}</span>
            </div>
            <div>
              <span className="font-medium">Baris:</span>
              <span className="ml-2">{Object.keys(seatsByRow).length}</span>
            </div>
            <div>
              <span className="font-medium">Kolom:</span>
              <span className="ml-2">{maxColumns}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="p-4 bg-white rounded-lg shadow-md sm:p-6">
        <h2 className="mb-4 text-xl font-semibold">Petunjuk</h2>
        <ul className="space-y-2 text-sm text-gray-600">
          <li>• Semua kursi memiliki harga yang sama</li>
          <li>• Harga tiket ditentukan berdasarkan hari (weekday/weekend)</li>
          <li>• Layout kursi: 5 baris × 10 kolom per studio</li>
        </ul>
      </div>
    </div>
  );
}