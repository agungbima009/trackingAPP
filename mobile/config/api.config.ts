/**
 * Configuration file untuk API URL
 * Ganti nilai API_BASE_URL sesuai dengan device yang digunakan
 */

// Pilih salah satu berdasarkan device Anda:

// 1. Android Emulator (LOCAL DEVELOPMENT)
// export const API_BASE_URL = 'http://10.0.2.2:8000/api';

// 2. iOS Simulator (LOCAL DEVELOPMENT)
// export const API_BASE_URL = 'http://localhost:8000/api';

// 3. Physical Device (LOCAL DEVELOPMENT)
// UPDATED: Get your current IP by running: php artisan serve:urls
export const API_BASE_URL = 'http://172.16.100.232:8000/api';

// 4. Production
// export const API_BASE_URL = 'https://your-production-domain.com/api';

/**
 * Cara mendapatkan IP yang benar:
 * 
 * 1. Buka terminal di backend-laravel folder
 * 2. Jalankan: php artisan serve:urls
 * 3. Lihat "Network" address yang muncul
 * 4. Update API_BASE_URL di atas dengan IP tersebut
 * 5. Pastikan port sama dengan yang ditampilkan (default: 8000)
 * 6. Save file ini dan reload Expo app
 */
