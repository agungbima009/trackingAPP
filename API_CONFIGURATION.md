# API Configuration Guide

## Cara Setup API URL untuk Mobile App

### Step 1: Check IP Configuration
Buka PowerShell di folder project root dan jalankan:

```powershell
powershell -ExecutionPolicy Bypass -File CHECK_IP_CONFIG.ps1
```

Atau langsung di folder project:
```powershell
.\CHECK_IP_CONFIG.ps1
```

Script ini akan:
- ✓ Menampilkan IPv4 Address machine Anda
- ✓ Memberikan URL yang sesuai untuk setiap device
- ✓ Mengecek apakah backend Laravel sudah berjalan

### Step 2: Pilih URL Sesuai Device

#### Android Emulator
```
http://10.0.2.2:8000/api
```
**Sudah dikonfigurasi sebagai default)**

#### iOS Simulator  
```
http://localhost:8000/api
```

#### Physical Device (Android/iOS)
```
http://[IP_ADDRESS_ANDA]:8000/api
```
Contoh:
```
http://192.168.1.100:8000/api
```

### Step 3: Update API URL

Edit file: `mobile/config/api.config.ts`

```typescript
// Uncomment salah satu sesuai device Anda:

// Android Emulator
export const API_BASE_URL = 'http://10.0.2.2:8000/api';

// iOS Simulator
// export const API_BASE_URL = 'http://localhost:8000/api';

// Physical Device
// export const API_BASE_URL = 'http://192.168.1.100:8000/api';
```

### Step 4: Restart App

App akan auto-reload setelah save. Jika tidak, bisa manual restart Expo.

## Troubleshooting

### "Network Error" saat login
1. Pastikan backend Laravel sudah running: `php artisan serve`
2. Check IP config dengan script `CHECK_IP_CONFIG.ps1`
3. Pastikan device dan machine dalam 1 network yang sama

### Backend tidak terdeteksi
```bash
# Di backend folder, jalankan:
cd backend-laravel
php artisan serve
```

### Port 8000 sudah digunakan
Ubah port dan update API URL:
```bash
php artisan serve --port=8001
```

Lalu update `api.config.ts`:
```typescript
export const API_BASE_URL = 'http://10.0.2.2:8001/api';
```

## File-file yang berkaitan:

- `mobile/config/api.config.ts` - Konfigurasi API URL
- `mobile/services/api.ts` - API service dengan interceptors
- `CHECK_IP_CONFIG.ps1` - Script untuk check IP configuration

Happy coding! 🚀
