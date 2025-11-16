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
      <div className="flex justify-center items-center h-64">
        <div className="text-lg">Memuat data...</div>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-3xl font-bold mb-8">Kelola Kursi</h1>

      <div className="bg-white rounded-lg shadow-md p-4 sm:p-6 mb-8">
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

        <div className="flex justify-center space-x-6 text-sm mb-6">
          <div className="flex items-center">
            <div className="w-4 h-4 bg-green-200 rounded mr-2 border border-green-300"></div>
            <span>Kursi Tersedia</span>
          </div>
        </div>

        <div className="bg-gray-50 p-4 rounded-lg">
          <h3 className="font-semibold mb-2">Informasi Layout</h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4 text-sm">
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

      <div className="bg-white rounded-lg shadow-md p-4 sm:p-6">
        <h2 className="text-xl font-semibold mb-4">Petunjuk</h2>
        <ul className="space-y-2 text-sm text-gray-600">
          <li>• Semua kursi memiliki harga yang sama</li>
          <li>• Harga tiket ditentukan berdasarkan hari (weekday/weekend)</li>
          <li>• Layout kursi: 5 baris × 10 kolom per studio</li>
        </ul>
      </div>
    </div>
  );
}