# Absolute Cinema - Frontend React

Frontend aplikasi pemesanan tiket bioskop dengan React, Tailwind CSS, dan Zustand.

## Fitur Utama

### 🎬 Customer (Pelanggan)
- Lihat daftar film (sedang tayang, segera tayang)
- Detail film dengan jadwal tayang
- Pilih kursi interaktif
- Checkout dan pembayaran (Midtrans placeholder)
- Riwayat pemesanan dan invoice
- Kelola profile

### 👨‍💼 Admin
- Kelola film (CRUD)
- Kelola pelanggan
- Kelola jadwal tayang
- Kelola harga tiket
- Kelola akun kasir
- Kelola layout kursi

### 👑 Owner
- Dashboard laporan keuangan
- Export laporan ke PDF
- Statistik penjualan

### 🏪 Kasir
- Pemesanan tiket offline
- Cetak tiket
- Verifikasi tiket online

## Tech Stack

- **React 18** dengan Vite
- **React Router v6** untuk routing
- **Tailwind CSS** untuk styling
- **Zustand** untuk state management
- **Axios** untuk HTTP client
- **jsPDF** untuk export PDF
- **Lucide React** untuk icons

## Instalasi

```bash
# Clone repository
git clone <repository-url>
cd frontend-ac

# Install dependencies
npm install

# Jalankan development server
npm run dev

# Build untuk production
npm run build
```

## Demo Accounts

Gunakan akun berikut untuk testing:

- **Customer**: customer@test.com / password123
- **Admin**: admin@test.com / admin123
- **Owner**: owner@test.com / owner123
- **Kasir**: kasir@test.com / kasir123

## Struktur Project

```
src/
├── components/          # Komponen reusable
│   ├── ui/             # Button, Input, Card, dll
│   ├── layout/         # Navbar, Sidebar, Layout
│   └── cinema/         # SeatMap, ShowCard, dll
├── pages/              # Halaman per role
│   ├── customer/       # Halaman customer
│   ├── admin/          # Halaman admin
│   ├── owner/          # Halaman owner
│   └── cashier/        # Halaman kasir
├── store/              # Zustand stores
├── mock-data/          # Data dummy (JSON)
├── lib/                # Utilities (API, PDF, Payment)
└── router/             # Konfigurasi routing
```

## Mock Data

Aplikasi menggunakan data dummy yang tersimpan di folder `src/mock-data/`:

- `films.json` - Data film
- `schedules.json` - Jadwal tayang
- `seatLayouts.json` - Layout kursi
- `users.json` - Data user
- `orders.json` - Data pesanan

## Integrasi API

Untuk mengganti mock data dengan API real:

1. Update `src/lib/api.js` dengan base URL API
2. Hapus import mock data dari stores
3. Implementasikan service functions di `src/services/`
4. Update environment variables

## Payment Integration

Placeholder Midtrans sudah disiapkan di `src/lib/payment.js`. Untuk integrasi real:

1. Install Midtrans SDK
2. Update environment variables
3. Implementasikan callback handling

## PDF Export

Menggunakan jsPDF untuk export laporan. Customize di `src/lib/pdf.js`.

## Deployment

```bash
# Build project
npm run build

# Deploy folder dist/ ke hosting
```

## Environment Variables

Buat file `.env` di root project:

```env
VITE_API_URL=http://localhost:3001/api
VITE_MIDTRANS_CLIENT_KEY=your_midtrans_client_key
```

## Kontribusi

1. Fork repository
2. Buat feature branch
3. Commit changes
4. Push ke branch
5. Buat Pull Request

## License

MIT License