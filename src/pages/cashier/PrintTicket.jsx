import { useState, useEffect } from 'react';
import api from '../../lib/api';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import { Printer, Search } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';

export default function PrintTicket() {
  const [searchQuery, setSearchQuery] = useState('');
  const [orders, setOrders] = useState([]);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const response = await api.get('/orders');
      const data = response.data.data || [];
      setOrders(data.filter(o => o.payment_status === 'paid'));
    } catch (error) {
      console.error('Error fetching orders:', error);
      setOrders([]);
    }
  };

  const handleSearch = async () => {
    if (!searchQuery) return;
    
    setLoading(true);
    try {
      const response = await api.get(`/orders/${searchQuery}`);
      if (response.data.data.payment_status === 'paid') {
        setSelectedOrder(response.data.data);
      } else {
        alert('Order belum dibayar');
      }
    } catch (error) {
      alert('Order tidak ditemukan');
    } finally {
      setLoading(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div>
      <h1 className="text-2xl sm:text-3xl font-bold mb-6 sm:mb-8 print:hidden">Cetak Tiket</h1>

      <div className="bg-white rounded-lg shadow-md p-4 sm:p-6 mb-6 sm:mb-8 print:hidden">
        <h2 className="text-xl font-bold mb-4">Cari Pesanan</h2>
        <div className="flex space-x-4">
          <Input
            placeholder="Masukkan ID Pesanan"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
          />
          <Button onClick={handleSearch} disabled={loading} className="flex items-center">
            <Search size={16} className="mr-2" />
            {loading ? 'Mencari...' : 'Cari'}
          </Button>
        </div>
      </div>

      {selectedOrder && (
        <div className="bg-white rounded-lg shadow-md p-4 sm:p-6 lg:p-8 print:shadow-none">
          <div className="flex justify-between items-start mb-8 print:mb-4">
            <div>
              <h1 className="text-3xl font-bold text-blue-600">🎬 Absolute Cinema</h1>
              <p className="text-gray-600">E-Ticket</p>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-500">Ticket #</p>
              <p className="font-bold font-mono">{selectedOrder.order_number}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
            <div>
              <h2 className="font-bold text-lg mb-4">Detail Film</h2>
              <div className="space-y-2">
                <div><span className="font-semibold">Film:</span> {selectedOrder.schedule?.film?.title || 'N/A'}</div>
                <div><span className="font-semibold">Studio:</span> {selectedOrder.schedule?.studio?.name || 'N/A'}</div>
                <div><span className="font-semibold">Waktu:</span> {selectedOrder.schedule?.show_time ? new Date(selectedOrder.schedule.show_time).toLocaleString('id-ID') : 'N/A'}</div>
                <div><span className="font-semibold">Kursi:</span> {selectedOrder.orderItems?.map(item => `${item.seat?.row}${item.seat?.column}`).join(', ') || '-'}</div>
              </div>
            </div>

            <div>
              <h2 className="font-bold text-lg mb-4">Detail Pembayaran</h2>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span>Jumlah Tiket:</span>
                  <span>{selectedOrder.orderItems?.length || 0}</span>
                </div>
                <div className="flex justify-between">
                  <span>Total:</span>
                  <span className="font-bold">Rp {parseInt(selectedOrder.total_amount).toLocaleString('id-ID')}</span>
                </div>
                <div className="flex justify-between">
                  <span>Status:</span>
                  <span className="text-green-600 font-semibold">LUNAS</span>
                </div>
              </div>
            </div>
          </div>

          <div className="border-t pt-6 mb-8">
            <div className="bg-gray-100 p-6 rounded-lg text-center">
              <div className="bg-white p-4 rounded border-2 border-dashed border-gray-300 inline-block">
                <p className="text-sm text-gray-600 mb-2">QR Code Tiket</p>
                <div className="flex justify-center">
                  <QRCodeSVG value={selectedOrder.order_number} size={128} level="H" />
                </div>
                <p className="text-xs text-gray-500 mt-2">Tunjukkan QR ini saat masuk</p>
                <p className="text-xs font-mono text-gray-400 mt-1">{selectedOrder.order_number}</p>
              </div>
            </div>
          </div>

          <div className="text-center text-sm text-gray-500 mb-6">
            <p>Terima kasih telah memilih Absolute Cinema</p>
            <p>Tiket ini berlaku untuk 1 kali masuk sesuai jadwal yang tertera</p>
            <p className="mt-2">Dicetak pada: {new Date().toLocaleString('id-ID')}</p>
          </div>

          <div className="flex justify-center print:hidden">
            <Button onClick={handlePrint} className="flex items-center">
              <Printer size={16} className="mr-2" />
              Print Tiket
            </Button>
          </div>
        </div>
      )}

      <div className="bg-white rounded-lg shadow-md p-4 sm:p-6 mt-6 sm:mt-8 print:hidden">
        <h2 className="text-xl font-semibold mb-4">Pesanan Terbaru</h2>
        {orders.length === 0 ? (
          <p className="text-gray-500 text-center py-8">Tidak ada pesanan</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[500px] text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="text-left py-2 px-3">No. Order</th>
                  <th className="text-left py-2 px-3">Film</th>
                  <th className="text-left py-2 px-3">Total</th>
                  <th className="text-left py-2 px-3">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {orders.length === 0 ? (
                  <tr><td colSpan="4" className="text-center py-8 text-gray-500">Tidak ada pesanan</td></tr>
                ) : orders.slice(0, 10).map(order => (
                  <tr key={order.id} className="border-b hover:bg-gray-50">
                    <td className="py-2 px-3 font-mono text-xs">{order.order_number}</td>
                    <td className="py-2 px-3">{order.schedule?.film?.title || 'N/A'}</td>
                    <td className="py-2 px-3">Rp {parseInt(order.total_amount).toLocaleString('id-ID')}</td>
                    <td className="py-2 px-3">
                      <Button size="sm" onClick={() => setSelectedOrder(order)}>
                        Pilih
                      </Button>
                    </td>
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
