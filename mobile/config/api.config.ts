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
// Machine IP: 10.109.64.43
export const API_BASE_URL = 'http://10.109.64.43:8000/api';

// 4. Production
// export const API_BASE_URL = 'https://your-production-domain.com/api';

/**
 * Cara menggunakan:
 * 
 * 1. Buka PowerShell di folder project root
 * 2. Jalankan: powershell -ExecutionPolicy Bypass -File CHECK_IP_CONFIG.ps1
 * 3. Dapatkan IP address dari output
 * 4. Update API_BASE_URL di bawah sesuai device Anda
 * 5. Save file ini
 * 6. Expo akan auto-reload
 */
