import { useCartStore } from '../../store/cartStore';

export default function SeatMap({ seats }) {
  const { selectedSeats, toggleSeat } = useCartStore();

  if (!seats || seats.length === 0) return <div>Loading seat map...</div>;

  // Group seats by row
  const seatsByRow = seats.reduce((acc, seat) => {
    if (!acc[seat.row]) acc[seat.row] = [];
    acc[seat.row].push(seat);
    return acc;
  }, {});

  const getSeatStatus = (seat) => {
    if (seat.is_booked) return 'booked';
    if (seat.status === 'maintenance') return 'maintenance';
    if (selectedSeats.some(s => (s.id || s) === seat.id)) return 'selected';
    if (seat.category === 'vip') return 'vip';
    return 'available';
  };

  const getSeatClasses = (status) => {
    const baseClasses = 'w-8 h-8 m-1 rounded text-xs font-medium flex items-center justify-center cursor-pointer transition-colors';
    
    switch (status) {
      case 'available':
        return `${baseClasses} bg-green-200 hover:bg-green-300 text-green-800`;
      case 'vip':
        return `${baseClasses} bg-yellow-200 hover:bg-yellow-300 text-yellow-800`;
      case 'selected':
        return `${baseClasses} bg-blue-600 text-white`;
      case 'booked':
        return `${baseClasses} bg-red-200 text-red-800 cursor-not-allowed`;
      case 'maintenance':
        return `${baseClasses} bg-gray-400 text-gray-600 cursor-not-allowed`;
      case 'empty':
        return 'w-8 h-8 m-1';
      default:
        return baseClasses;
    }
  };

  const handleSeatClick = (seat) => {
    const status = getSeatStatus(seat);
    if (status !== 'booked' && status !== 'maintenance' && status !== 'empty') {
      toggleSeat(seat);
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg">
      <div className="text-center mb-6">
        <div className="bg-gray-800 text-white py-2 px-8 rounded-lg inline-block">
          LAYAR
        </div>
      </div>
      
      <div className="flex flex-col items-center space-y-2">
        {Object.keys(seatsByRow).sort().map((row) => (
          <div key={row} className="flex items-center">
            <span className="w-6 text-center text-sm font-medium text-gray-600 mr-2">
              {row}
            </span>
            <div className="flex">
              {seatsByRow[row].sort((a, b) => a.column - b.column).map((seat) => {
                const status = getSeatStatus(seat);
                return (
                  <div
                    key={seat.id}
                    className={getSeatClasses(status)}
                    onClick={() => handleSeatClick(seat)}
                    title={`${seat.row}${seat.column} - ${seat.category}`}
                  >
                    {seat.column}
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
      
      <div className="mt-6 flex justify-center space-x-6 text-sm">
        <div className="flex items-center">
          <div className="w-4 h-4 bg-green-200 rounded mr-2"></div>
          <span>Tersedia</span>
        </div>
        <div className="flex items-center">
          <div className="w-4 h-4 bg-yellow-200 rounded mr-2"></div>
          <span>VIP</span>
        </div>
        <div className="flex items-center">
          <div className="w-4 h-4 bg-blue-600 rounded mr-2"></div>
          <span>Dipilih</span>
        </div>
        <div className="flex items-center">
          <div className="w-4 h-4 bg-red-200 rounded mr-2"></div>
          <span>Terisi</span>
        </div>
      </div>
    </div>
  );
}