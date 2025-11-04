import { useNavigate } from 'react-router-dom';
import { useCartStore } from '../../store/cartStore';
import Button from '../ui/Button';

export default function ScheduleCard({ schedule, film }) {
  const navigate = useNavigate();
  const { setSchedule } = useCartStore();

  const handleSelectSchedule = () => {
    setSchedule({
      ...schedule,
      film_title: film.title,
      film_id: film.id
    });
    navigate(`/customer/seats/${schedule.id}`);
  };

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
      <div className="flex justify-between items-start mb-3">
        <div>
          <h4 className="font-semibold text-lg">{schedule.studio}</h4>
          <p className="text-gray-600">{schedule.date}</p>
        </div>
        <div className="text-right">
          <p className="text-2xl font-bold text-blue-600">{schedule.time}</p>
        </div>
      </div>
      
      <div className="flex justify-between items-center">
        <div>
          <p className="text-lg font-semibold text-green-600">
            Rp {schedule.price?.toLocaleString('id-ID')}
          </p>
          <p className="text-sm text-gray-500">per tiket</p>
        </div>
        
        <Button onClick={handleSelectSchedule}>
          Pilih Kursi
        </Button>
      </div>
    </div>
  );
}