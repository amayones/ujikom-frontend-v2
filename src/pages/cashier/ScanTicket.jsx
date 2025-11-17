import { useState } from 'react';
import api from '../../lib/api';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import { Scan, CheckCircle, XCircle } from 'lucide-react';
import { formatRupiah } from '../../utils/currency';

export default function ScanTicket() {
  const [orderNumber, setOrderNumber] = useState('');
  const [loading, setLoading] = useState(false);
  const [order, setOrder] = useState(null);
  const [error, setError] = useState(null);

  const handleScan = async () => {
    if (!orderNumber.trim()) {
      setError('Masukkan nomor order');
      return;
    }

    setLoading(true);
    setError(null);
    setOrder(null);

    const response = await api.post('/cashier/scan', {
      order_number: orderNumber.toUpperCase()
    });
    
    console.log(response);
    try {
      const response = await api.post('/cashier/scan', {
        order_number: orderNumber.toUpperCase()
      });
      // console.log(response);
      setOrder(response.data.data);
      setOrderNumber('');
    } catch (err) {
      setError(err.response?.data?.message || 'Gagal scan tiket');
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    if (status === 'scanned') {
      return <span className="px-3 py-1 text-sm text-blue-800 bg-blue-100 rounded-full">✓ Sudah Masuk</span>;
    }
    return <span className="px-3 py-1 text-sm text-green-800 bg-green-100 rounded-full">Lunas</span>;
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="mb-2 text-3xl font-bold">🎫 Scan Tiket</h1>
        <p className="text-gray-600">Scan QR code atau input nomor order untuk verifikasi tiket</p>
      </div>

      {/* Input Section */}
      <div className="p-6 bg-white rounded-lg shadow-md">
        <div className="flex gap-3">
          <Input
            placeholder="Masukkan nomor order (ORD-...)"
            value={orderNumber}
            onChange={(e) => setOrderNumber(e.target.value.toUpperCase())}
            onKeyPress={(e) => e.key === 'Enter' && handleScan()}
            className="flex-1"
            autoFocus
          />
          <Button onClick={handleScan} disabled={loading} className="flex items-center">
            <Scan size={18} className="mr-2" />
            {loading ? 'Memproses...' : 'Scan'}
          </Button>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="p-4 border border-red-200 rounded-lg bg-red-50">
          <div className="flex items-start">
            <XCircle className="flex-shrink-0 mr-3 text-red-600" size={24} />
            <div>
              <h3 className="font-bold text-red-900">Gagal Scan Tiket</h3>
              <p className="text-red-700">{error}</p>
            </div>
          </div>
        </div>
      )}

      {/* Success - Display Order Card (Like History) */}
      {order && (
        <div>
          <div className="p-4 mb-4 border border-green-200 rounded-lg bg-green-50">
            <div className="flex items-center">
              <CheckCircle className="mr-3 text-green-600" size={24} />
              <div>
                <h3 className="font-bold text-green-900">✅ Tiket Valid - Pelanggan Dapat Masuk</h3>
                <p className="text-sm text-green-700">Scan berhasil pada {new Date().toLocaleString('id-ID')}</p>
              </div>
            </div>
          </div>

          {/* Order Card - Same Style as History */}
          <div className="p-6 bg-white shadow-lg rounded-xl">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="text-xl font-bold">{order.schedule?.film?.title || 'N/A'}</h3>
                <p className="text-gray-600">
                  {order.schedule?.studio?.name || 'N/A'} - {' '}
                  {order.schedule?.show_time
                    ? new Date(order.schedule.show_time).toLocaleDateString('id-ID')
                    : 'N/A'} {' '}
                  {order.schedule?.show_time
                    ? new Date(order.schedule.show_time).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })
                    : ''}
                </p>
                <p className="mt-1 text-sm text-gray-500">
                  Customer: {order.customer_name || order.user?.name || 'N/A'}
                </p>
              </div>
              <div className="flex flex-col items-end gap-2">
                {getStatusBadge(order.ticket_status)}
                <span className="px-3 py-1 text-xs text-gray-800 bg-gray-100 rounded-full">
                  {order.order_type === 'online' ? 'Customer Online' : 'Kasir Tunai'}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 mb-4 sm:grid-cols-2 lg:grid-cols-4">
              <div>
                <p className="text-sm text-gray-500">Jumlah Tiket</p>
                <p className="font-semibold">{order.orderItems?.length || 0} tiket</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Kursi</p>
                <p className="font-semibold">
                  {order.orderItems?.map(item => `${item.seat?.row}${item.seat?.column}`).join(', ') || 'N/A'}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Total Pembayaran</p>
                <p className="font-semibold text-green-600">{formatRupiah(order.total_amount)}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Tanggal Pesan</p>
                <p className="font-semibold">{new Date(order.created_at).toLocaleDateString('id-ID')}</p>
              </div>
            </div>

            <div className="flex items-center justify-between pt-4 border-t">
              <p className="text-sm text-gray-500">ID Transaksi: {order.order_number}</p>
              {order.ticket_status === 'scanned' && (
                <p className="text-sm text-blue-600">
                  Di-scan: {new Date(order.scanned_at).toLocaleString('id-ID')}
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Info Box */}
      <div className="p-4 border border-blue-200 rounded-lg bg-blue-50">
        <h4 className="mb-2 font-semibold text-blue-900">ℹ️ Informasi</h4>
        <ul className="space-y-1 text-sm text-blue-800">
          <li>• Scan QR code atau input nomor order manual</li>
          <li>• Tiket harus sudah dibayar (status: Lunas)</li>
          <li>• Tiket hanya bisa di-scan 1 kali</li>
          <li>• Setelah di-scan, customer dapat masuk ke studio</li>
        </ul>
      </div>
    </div>
  );
}
