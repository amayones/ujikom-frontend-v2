import { useState, useEffect } from 'react';
import { adminApi } from '../../api/adminApi';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import { formatRupiah } from '../../utils/currency';

export default function ManagePrices() {
  const [prices, setPrices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [priceSettings, setPriceSettings] = useState({
    weekday: 35000,
    weekend: 45000
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
        priceMap[price.day_type] = price.price;
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
        { day_type: 'weekday', price: priceSettings.weekday },
        { day_type: 'weekend', price: priceSettings.weekend }
      ];

      for (const update of updates) {
        const existingPrice = prices.find(p => p.day_type === update.day_type);
        
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
              <Input
                label="Harga Tiket"
                type="number"
                value={priceSettings.weekday}
                onChange={(e) => handleChange('weekday', e.target.value)}
              />
            </div>

            <div>
              <h3 className="font-semibold text-lg mb-4 text-green-600">Weekend (Jumat - Minggu)</h3>
              <Input
                label="Harga Tiket"
                type="number"
                value={priceSettings.weekend}
                onChange={(e) => handleChange('weekend', e.target.value)}
              />
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
              <div className="flex justify-between items-center">
                <span>Harga Tiket</span>
                <span className="font-semibold">{formatRupiah(priceSettings.weekday)}</span>
              </div>
            </div>

            <div className="border rounded-lg p-4">
              <h3 className="font-semibold mb-3 text-green-600">Weekend</h3>
              <div className="flex justify-between items-center">
                <span>Harga Tiket</span>
                <span className="font-semibold">{formatRupiah(priceSettings.weekend)}</span>
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