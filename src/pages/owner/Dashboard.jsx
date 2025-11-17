import { useState, useEffect } from 'react';
import api from '../../lib/api';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { formatRupiah } from '../../utils/currency';
import { DollarSign } from 'lucide-react';

export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const [period, setPeriod] = useState('month');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, [period]);

  const fetchStats = async () => {
    try {
      const response = await api.get(`/owner/reports?period=${period}`);
      setStats(response.data.data);
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="flex items-center justify-center h-64">Loading...</div>;
  }



  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Dashboard Laporan</h1>
        <div className="flex gap-2">
          <button
            onClick={() => setPeriod('day')}
            className={`px-4 py-2 rounded ${period === 'day' ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}
          >
            Hari Ini
          </button>
          <button
            onClick={() => setPeriod('month')}
            className={`px-4 py-2 rounded ${period === 'month' ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}
          >
            Bulan Ini
          </button>
          <button
            onClick={() => setPeriod('year')}
            className={`px-4 py-2 rounded ${period === 'year' ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}
          >
            Tahun Ini
          </button>
        </div>
      </div>

      {/* Summary Card */}
      <div className="bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-xl p-8 shadow-lg">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-blue-100 text-sm font-medium mb-2">Total Pemasukan</p>
            <p className="text-5xl font-bold">{formatRupiah(stats?.total_revenue || 0)}</p>
            <p className="text-blue-100 text-sm mt-2">Total Tiket Terjual: {stats?.total_tickets || 0}</p>
          </div>
          <DollarSign className="text-blue-200" size={80} />
        </div>
      </div>

      {/* Ticket Chart */}
      <div className="bg-white p-6 rounded-lg shadow-lg">
        <h2 className="text-2xl font-bold mb-4">📊 Tiket Terjual {period === 'day' ? 'Per Jam' : period === 'month' ? 'Per Hari' : 'Per Bulan'}</h2>
        <ResponsiveContainer width="100%" height={400}>
          <BarChart data={stats?.ticket_chart || []}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="label" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="value" fill="#3B82F6" name="Tiket Terjual" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
