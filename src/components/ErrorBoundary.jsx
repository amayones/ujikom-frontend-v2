import { useRouteError, useNavigate } from 'react-router-dom';
import Button from './ui/Button';

export default function ErrorBoundary() {
  const error = useRouteError();
  const navigate = useNavigate();

  console.error('Route error:', error);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
        <div className="text-6xl mb-4">😕</div>
        <h1 className="text-2xl font-bold text-gray-800 mb-2">
          Oops! Halaman Tidak Ditemukan
        </h1>
        <p className="text-gray-600 mb-6">
          {error?.status === 404 
            ? 'Halaman yang Anda cari tidak ditemukan.'
            : 'Terjadi kesalahan. Silakan coba lagi.'}
        </p>
        <div className="space-y-3">
          <Button 
            onClick={() => navigate(-1)}
            className="w-full"
          >
            Kembali
          </Button>
          <Button 
            onClick={() => navigate('/customer/home')}
            variant="outline"
            className="w-full"
          >
            Ke Beranda
          </Button>
        </div>
      </div>
    </div>
  );
}
