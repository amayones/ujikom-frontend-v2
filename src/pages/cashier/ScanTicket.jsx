import { useState } from 'react';
import api from '../../lib/api';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import { Scan, CheckCircle, XCircle } from 'lucide-react';
import { formatRupiah } from '../../utils/currency';

export default function ScanTicket() {
  const [orderNumber, setOrderNumber] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const handleScan = async () => {
    if (!orderNumber.trim()) {
      setError('Masukkan nomor order');
      return;
    }

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const response = await api.post('/cashier/scan', {
        order_number: orderNumber.toUpperCase()
      });
      
      setResult(response.data.data);
      setOrderNumber('');
    } catch (err) {
      setError(err.response?.data?.message || 'Gagal scan tiket');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">🎫 Scan Tiket</h1>

      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex gap-3 mb-4">
          <Input
            placeholder="Masukkan nomor order (ORD-...)"
            value={orderNumber}
            onChange={(e) => setOrderNumber(e.target.value.toUpperCase())}
            onKeyPress={(e) => e.key === 'Enter' && handleScan()}
            className="flex-1"
            autoFocus
          />
          <Button onClick={handleScan} disabled={loading}>
            <Scan size={16} className="mr-2" />
            {loading ? 'Memproses...' : 'Scan'}
          </Button>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-6">
          <div className="flex items-start">
            <XCircle className="text-red-600 mr-3" size={24} />
            <div>
              <h3 className="font-bold text-red-900">Gagal Scan Tiket</h3>
              <p className="text-red-700">{error}</p>
            </div>
          </div>
        </div>
      )}

      {result && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-6">
          <div className="flex items-start mb-4">
            <CheckCircle className="text-green-600 mr-3" size={24} />
            <div>
              <h3 className="font-bold text-green-900 text-lg">✅ Tiket Valid - Pelanggan Dapat Masuk</h3>
              <p className="text-green-700 text-sm">Scan berhasil pada {new Date().toLocaleString('id-ID')}</p>
            </div>
          </div>

          <div className="bg-white rounded-lg p-4">
            <h4 className="font-semibold mb-3">Detail Tiket</h4>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-gray-600">No. Order</p>
                <p className="font-mono font-semibold">{result.order_number}</p>
              </div>
              <div>
                <p className="text-gray-600">Film</p>
                <p className="font-semibold">{result.schedule?.film?.title || 'N/A'}</p>
              </div>
              <div>
                <p className="text-gray-600">Studio</p>
                <p className="font-semibold">{result.schedule?.studio?.name || 'N/A'}</p>
              </div>
              <div>
                <p className="text-gray-600">Waktu Tayang</p>
                <p className="font-semibold">
                  {result.schedule?.show_time 
                    ? new Date(result.schedule.show_time).toLocaleString('id-ID')
                    : 'N/A'}
                </p>
              </div>
              <div>
                <p className="text-gray-600">Kursi</p>
                <p className="font-semibold">
                  {result.orderItems?.map(item => `${item.seat?.row}${item.seat?.column}`).join(', ') || '-'}
                </p>
              </div>
              <div>
                <p className="text-gray-600">Total</p>
                <p className="font-semibold">{formatRupiah(parseInt(result.total_amount))}</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
