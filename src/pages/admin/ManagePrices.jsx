import { useState, useEffect } from 'react';
import { adminApi } from '../../api/adminApi';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import { formatRupiah } from '../../utils/currency';

export default function ManagePrices() {
  const [prices, setPrices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [priceSettings, setPriceSettings] = useState({
    weekday_regular: 35000,
    weekday_vip: 50000,
    weekend_regular: 45000,
    weekend_vip: 65000
  });

  useEffect(() => {
    fetchPrices();
  }, []);

  const fetchPrices = async () => {
    try {
      const response = await adminApi.getPrices();
      setPrices(response.data);
      
      // Map backend data to form
      const priceMap = {};
      response.data.forEach(price => {
        const key = `${price.day_type}_${price.seat_category}`;
        priceMap[key] = price.price;
      });
      setPriceSettings(priceMap);
    } catch (error) {
      console.error('Error fetching prices:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (key, value) => {
    setPriceSettings({
      ...priceSettings,
      [key]: parseInt(value) || 0
    });
  };

  const handleSave = async () => {
    try {
      // Update each price
      const updates = [
        { day_type: 'weekday', seat_category: 'regular', price: priceSettings.weekday_regular },
        { day_type: 'weekday', seat_category: 'vip', price: priceSettings.weekday_vip },
        { day_type: 'weekend', seat_category: 'regular', price: priceSettings.weekend_regular },
        { day_type: 'weekend', seat_category: 'vip', price: priceSettings.weekend_vip }
      ];

      for (const update of updates) {
        const existingPrice = prices.find(
          p => p.day_type === update.day_type && p.seat_category === update.seat_category
        );
        
        if (existingPrice) {
          await adminApi.updatePrice(existingPrice.id, update);
        } else {
          await adminApi.createPrice(update);
        }
      }

      await fetchPrices();
      alert('Pengaturan harga berhasil disimpan');
    } catch (error) {
      console.error('Error saving prices:', error);
      alert('Gagal menyimpan pengaturan harga');
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-lg">Memuat data...</div>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-3xl font-bold mb-8">Kelola Harga</h1>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
        <div className="bg-white rounded-lg shadow-md p-4 sm:p-6">
          <h2 className="text-xl font-bold mb-6">Pengaturan Harga Tiket</h2>
          
          <div className="space-y-6">
            <div>
              <h3 className="font-semibold text-lg mb-4 text-blue-600">Hari Biasa (Senin - Kamis)</h3>
              <div className="space-y-4">
                <Input
                  label="Kursi Regular"
                  type="number"
                  value={priceSettings.weekday_regular}
                  onChange={(e) => handleChange('weekday_regular', e.target.value)}
                />
                <Input
                  label="Kursi VIP"
                  type="number"
                  value={priceSettings.weekday_vip}
                  onChange={(e) => handleChange('weekday_vip', e.target.value)}
                />
              </div>
            </div>

            <div>
              <h3 className="font-semibold text-lg mb-4 text-green-600">Weekend (Jumat - Minggu)</h3>
              <div className="space-y-4">
                <Input
                  label="Kursi Regular"
                  type="number"
                  value={priceSettings.weekend_regular}
                  onChange={(e) => handleChange('weekend_regular', e.target.value)}
                />
                <Input
                  label="Kursi VIP"
                  type="number"
                  value={priceSettings.weekend_vip}
                  onChange={(e) => handleChange('weekend_vip', e.target.value)}
                />
              </div>
            </div>


          </div>

          <div className="mt-8">
            <Button onClick={handleSave} className="w-full">
              Simpan Pengaturan
            </Button>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-4 sm:p-6">
          <h2 className="text-xl font-bold mb-6">Preview Harga</h2>
          
          <div className="space-y-6">
            <div className="border rounded-lg p-4">
              <h3 className="font-semibold mb-3 text-blue-600">Hari Biasa</h3>
              <div className="flex justify-between items-center mb-2">
                <span>Kursi Regular</span>
                <span className="font-semibold">{formatRupiah(priceSettings.weekday_regular)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span>Kursi VIP</span>
                <span className="font-semibold">{formatRupiah(priceSettings.weekday_vip)}</span>
              </div>
            </div>

            <div className="border rounded-lg p-4">
              <h3 className="font-semibold mb-3 text-green-600">Weekend</h3>
              <div className="flex justify-between items-center mb-2">
                <span>Kursi Regular</span>
                <span className="font-semibold">{formatRupiah(priceSettings.weekend_regular)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span>Kursi VIP</span>
                <span className="font-semibold">{formatRupiah(priceSettings.weekend_vip)}</span>
              </div>
            </div>


          </div>

          <div className="mt-6 p-4 bg-gray-50 rounded-lg">
            <h4 className="font-semibold mb-2">Catatan:</h4>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• Harga sudah termasuk pajak</li>
              <li>• Perubahan harga berlaku untuk jadwal baru</li>
              <li>• Jadwal yang sudah ada tidak terpengaruh</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}