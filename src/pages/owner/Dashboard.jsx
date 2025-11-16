import { useState, useEffect } from 'react';
import api from '../../lib/api';
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { formatRupiah } from '../../utils/currency';
import { TrendingUp, DollarSign, ShoppingCart, Calendar } from 'lucide-react';

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

  const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6'];

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

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm">Total Pendapatan</p>
              <p className="text-2xl font-bold text-blue-600">{formatRupiah(stats?.total_revenue || 0)}</p>
            </div>
            <DollarSign className="text-blue-600" size={40} />
          </div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm">Total Transaksi</p>
              <p className="text-2xl font-bold text-green-600">{stats?.total_transactions || 0}</p>
            </div>
            <ShoppingCart className="text-green-600" size={40} />
          </div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm">Total Tiket</p>
              <p className="text-2xl font-bold text-orange-600">{stats?.total_tickets || 0}</p>
            </div>
            <Calendar className="text-orange-600" size={40} />
          </div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm">Rata-rata/Transaksi</p>
              <p className="text-2xl font-bold text-purple-600">{formatRupiah(stats?.avg_transaction || 0)}</p>
            </div>
            <TrendingUp className="text-purple-600" size={40} />
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue Chart */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-bold mb-4">Pendapatan {period === 'day' ? 'Per Jam' : period === 'month' ? 'Per Hari' : 'Per Bulan'}</h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={stats?.revenue_chart || []}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="label" />
              <YAxis />
              <Tooltip formatter={(value) => formatRupiah(value)} />
              <Legend />
              <Bar dataKey="revenue" fill="#3B82F6" name="Pendapatan" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Transactions Chart */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-bold mb-4">Jumlah Transaksi {period === 'day' ? 'Per Jam' : period === 'month' ? 'Per Hari' : 'Per Bulan'}</h2>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={stats?.transaction_chart || []}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="label" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="count" stroke="#10B981" name="Transaksi" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Film Performance */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-bold mb-4">Film Terlaris</h2>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={stats?.top_films || []}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="revenue"
              >
                {(stats?.top_films || []).map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip formatter={(value) => formatRupiah(value)} />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Order Type Distribution */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-bold mb-4">Tipe Pembelian</h2>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={stats?.order_types || []}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, value }) => `${name}: ${value}`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="count"
              >
                {(stats?.order_types || []).map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
