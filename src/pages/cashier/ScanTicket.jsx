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

    try {
      const response = await api.post('/cashier/scan', {
        order_number: orderNumber.toUpperCase()
      });
      
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
      return <span className="px-3 py-1 rounded-full text-sm bg-blue-100 text-blue-800">✓ Sudah Masuk</span>;
    }
    return <span className="px-3 py-1 rounded-full text-sm bg-green-100 text-green-800">Lunas</span>;
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-2">🎫 Scan Tiket</h1>
        <p className="text-gray-600">Scan QR code atau input nomor order untuk verifikasi tiket</p>
      </div>

      {/* Input Section */}
      <div className="bg-white rounded-lg shadow-md p-6">
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
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-start">
            <XCircle className="text-red-600 mr-3 flex-shrink-0" size={24} />
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
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
            <div className="flex items-center">
              <CheckCircle className="text-green-600 mr-3" size={24} />
              <div>
                <h3 className="font-bold text-green-900">✅ Tiket Valid - Pelanggan Dapat Masuk</h3>
                <p className="text-sm text-green-700">Scan berhasil pada {new Date().toLocaleString('id-ID')}</p>
              </div>
            </div>
          </div>

          {/* Order Card - Same Style as History */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex justify-between items-start mb-4">
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
                <p className="text-sm text-gray-500 mt-1">
                  Customer: {order.customer_name || order.user?.name || 'N/A'}
                </p>
              </div>
              <div className="flex flex-col gap-2 items-end">
                {getStatusBadge(order.ticket_status)}
                <span className="px-3 py-1 rounded-full text-xs bg-gray-100 text-gray-800">
                  {order.order_type === 'online' ? 'Customer Online' : 'Kasir Tunai'}
                </span>
              </div>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
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
            
            <div className="flex justify-between items-center pt-4 border-t">
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
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h4 className="font-semibold text-blue-900 mb-2">ℹ️ Informasi</h4>
        <ul className="text-sm text-blue-800 space-y-1">
          <li>• Scan QR code atau input nomor order manual</li>
          <li>• Tiket harus sudah dibayar (status: Lunas)</li>
          <li>• Tiket hanya bisa di-scan 1 kali</li>
          <li>• Setelah di-scan, customer dapat masuk ke studio</li>
        </ul>
      </div>
    </div>
  );
}
