import { useState, useEffect } from 'react';
import { ownerApi } from '../../api/ownerApi';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import { Download, TrendingUp, Users, Film } from 'lucide-react';

export default function Reports() {
  const [reports, setReports] = useState(null);
  const [loading, setLoading] = useState(false);
  const [dateRange, setDateRange] = useState({
    start_date: new Date(new Date().setDate(new Date().getDate() - 30)).toISOString().split('T')[0],
    end_date: new Date().toISOString().split('T')[0]
  });

  const fetchReports = async () => {
    setLoading(true);
    try {
      const response = await ownerApi.getReports(dateRange);
      setReports(response.data);
    } catch (error) {
      console.error('Error fetching reports:', error);
      alert('Gagal memuat laporan: ' + (error.response?.data?.message || error.message));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, []);

  const handleExportPdf = async () => {
    try {
      await ownerApi.exportPDF(dateRange);
    } catch (error) {
      console.error('Error exporting PDF:', error);
      alert('Gagal mengekspor PDF');
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Laporan Keuangan</h1>
        <Button onClick={handleExportPdf} className="flex items-center">
          <Download size={16} className="mr-2" />
          Export PDF
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <Input
          label="Tanggal Mulai"
          type="date"
          value={dateRange.start_date}
          onChange={(e) => setDateRange({...dateRange, start_date: e.target.value})}
        />
        <Input
          label="Tanggal Akhir"
          type="date"
          value={dateRange.end_date}
          onChange={(e) => setDateRange({...dateRange, end_date: e.target.value})}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center">
            <div className="bg-green-100 p-3 rounded-full mr-4">
              <TrendingUp className="text-green-600" size={24} />
            </div>
            <div>
              <p className="text-sm text-gray-500">Total Pemasukan</p>
              <p className="text-2xl font-bold text-green-600">
                Rp {reports?.summary?.total_income?.toLocaleString('id-ID') || '0'}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center">
            <div className="bg-blue-100 p-3 rounded-full mr-4">
              <Users className="text-blue-600" size={24} />
            </div>
            <div>
              <p className="text-sm text-gray-500">Total Transaksi</p>
              <p className="text-2xl font-bold text-blue-600">{reports?.summary?.total_transactions || 0}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="mb-4">
        <Button onClick={fetchReports} disabled={loading}>
          {loading ? 'Memuat...' : 'Refresh Data'}
        </Button>
      </div>

      {reports && (
        <div className="bg-gray-100 rounded-lg p-4 mb-6">
          <p className="text-sm text-gray-600">
            Menampilkan data dari <strong>{dateRange.start_date}</strong> sampai <strong>{dateRange.end_date}</strong>
          </p>
        </div>
      )}

      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-bold mb-6">Detail Transaksi</h2>
        
        {loading ? (
          <p className="text-gray-500 text-center py-8">Memuat data...</p>
        ) : !reports?.transactions?.length ? (
          <p className="text-gray-500 text-center py-8">Tidak ada transaksi</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full table-auto">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 px-4">No. Order</th>
                  <th className="text-left py-3 px-4">Customer</th>
                  <th className="text-left py-3 px-4">Film</th>
                  <th className="text-left py-3 px-4">Kursi</th>
                  <th className="text-left py-3 px-4">Total</th>
                  <th className="text-left py-3 px-4">Tanggal</th>
                </tr>
              </thead>
              <tbody>
                {reports.transactions.map((transaction) => (
                  <tr key={transaction.id} className="border-b hover:bg-gray-50">
                    <td className="py-3 px-4 font-mono text-sm">{transaction.order_number}</td>
                    <td className="py-3 px-4">{transaction.customer_name}</td>
                    <td className="py-3 px-4">{transaction.film_title}</td>
                    <td className="py-3 px-4 text-sm">{transaction.seats}</td>
                    <td className="py-3 px-4 font-semibold">Rp {parseInt(transaction.total_amount).toLocaleString('id-ID')}</td>
                    <td className="py-3 px-4 text-sm">{new Date(transaction.created_at).toLocaleDateString('id-ID', { day: '2-digit', month: '2-digit', year: 'numeric' })}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}