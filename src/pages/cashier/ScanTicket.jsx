import { useState } from 'react';
import api from '../../lib/api';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import { Scan, CheckCircle, XCircle, Clock } from 'lucide-react';
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
      // Cari order berdasarkan order_number
      const ordersResponse = await api.get('/cashier/orders');
      const orders = ordersResponse.data.data || [];
      const order = orders.find(o => o.order_number === orderNumber.toUpperCase());

      if (!order) {
        setError('Tiket tidak ditemukan');
        setLoading(false);
        return;
      }

      if (order.payment_status !== 'paid') {
        setError('Tiket belum dibayar');
        setLoading(false);
        return;
      }

      if (order.ticket_status === 'scanned') {
        setError('Tiket sudah digunakan pada ' + new Date(order.scanned_at).toLocaleString('id-ID'));
        setLoading(false);
        return;
      }

      // Update ticket status menjadi scanned
      await api.put(`/cashier/update-ticket/${order.id}`, {
        ticket_status: 'scanned',
        scanned_at: new Date().toISOString()
      });

      // Fetch order detail lagi untuk tampilkan
      const detailResponse = await api.get(`/orders/${order.id}`);
      setResult({ data: detailResponse.data.data });
      setOrderNumber('');
    } catch (err) {
      setError(err.response?.data?.message || 'Gagal scan tiket');
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleScan();
    }
  };

  return (
    <div>
      <h1 className="text-2xl sm:text-3xl font-bold mb-6 sm:mb-8">Scan Tiket</h1>

      <div className="bg-white rounded-lg shadow-md p-4 sm:p-6 mb-6">
        <div className="flex items-center mb-4">
          <Scan className="text-blue-600 mr-2" size={24} />
          <h2 className="text-xl font-bold">Scan QR Code Tiket</h2>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 mb-4">
          <Input
            placeholder="Masukkan atau scan nomor order (ORD-...)"
            value={orderNumber}
            onChange={(e) => setOrderNumber(e.target.value.toUpperCase())}
            onKeyPress={handleKeyPress}
            className="flex-1"
            autoFocus
          />
          <Button onClick={handleScan} disabled={loading} className="flex items-center justify-center">
            <Scan size={16} className="mr-2" />
            {loading ? 'Memproses...' : 'Scan'}
          </Button>
        </div>

        <p className="text-sm text-gray-500">
          💡 Tip: Gunakan scanner barcode atau ketik manual nomor order
        </p>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 sm:p-6 mb-6">
          <div className="flex items-start">
            <XCircle className="text-red-600 mr-3 flex-shrink-0" size={24} />
            <div>
              <h3 className="font-bold text-red-900 mb-1">Gagal Scan Tiket</h3>
              <p className="text-red-700">{error}</p>
            </div>
          </div>
        </div>
      )}

      {result && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 sm:p-6 mb-6">
          <div className="flex items-start mb-4">
            <CheckCircle className="text-green-600 mr-3 flex-shrink-0" size={24} />
            <div>
              <h3 className="font-bold text-green-900 text-lg">✅ Tiket Valid - Pelanggan Dapat Masuk</h3>
              <p className="text-green-700 text-sm">Tiket berhasil di-scan pada {new Date().toLocaleString('id-ID')}</p>
            </div>
          </div>

          <div className="bg-white rounded-lg p-4 mt-4">
            <h4 className="font-semibold mb-3">Detail Tiket</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-gray-600">No. Order</p>
                <p className="font-mono font-semibold">{result.data.order_number}</p>
              </div>
              <div>
                <p className="text-gray-600">Film</p>
                <p className="font-semibold">{result.data.schedule?.film?.title || 'N/A'}</p>
              </div>
              <div>
                <p className="text-gray-600">Studio</p>
                <p className="font-semibold">{result.data.schedule?.studio?.name || 'N/A'}</p>
              </div>
              <div>
                <p className="text-gray-600">Waktu Tayang</p>
                <p className="font-semibold">
                  {result.data.schedule?.show_time 
                    ? new Date(result.data.schedule.show_time).toLocaleString('id-ID')
                    : 'N/A'}
                </p>
              </div>
              <div>
                <p className="text-gray-600">Kursi</p>
                <p className="font-semibold">
                  {result.data.orderItems?.map(item => `${item.seat?.row}${item.seat?.column}`).join(', ') || '-'}
                </p>
              </div>
              <div>
                <p className="text-gray-600">Jumlah Tiket</p>
                <p className="font-semibold">{result.data.orderItems?.length || 0} tiket</p>
              </div>
              <div>
                <p className="text-gray-600">Total Pembayaran</p>
                <p className="font-semibold">{formatRupiah(parseInt(result.data.total_amount))}</p>
              </div>
              <div>
                <p className="text-gray-600">Status Pembayaran</p>
                <p className="font-semibold text-green-600">LUNAS</p>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 sm:p-6">
        <div className="flex items-start">
          <Clock className="text-blue-600 mr-3 flex-shrink-0" size={20} />
          <div className="text-sm">
            <h4 className="font-semibold text-blue-900 mb-2">Informasi Penting</h4>
            <ul className="space-y-1 text-blue-800">
              <li>• Tiket hanya dapat di-scan 30 menit sebelum jadwal tayang</li>
              <li>• Tiket yang sudah di-scan tidak dapat digunakan lagi</li>
              <li>• Pastikan nomor order sesuai dengan yang tertera di tiket customer</li>
              <li>• Tiket harus sudah dibayar (status: LUNAS)</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
