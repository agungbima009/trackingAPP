# Analisa Masalah Integrasi Monitoring dengan Database

**Tanggal Analisa:** 20 Februari 2026  
**Status:** ⚠️ DITEMUKAN BEBERAPA MASALAH KRITIS

---

## 🔍 Executive Summary

Setelah melakukan analisa mendalam terhadap database schema, migrations, seeders, API controllers, dan kode frontend yang baru dibuat, ditemukan **5 MASALAH KRITIS** yang menyebabkan halaman monitoring tidak dapat terintegrasi dengan database dengan baik.

---

## ❌ MASALAH YANG DITEMUKAN

### **MASALAH #1: Backend API Tidak Menerima Filter `taken_task_id`**

**Lokasi:** `backend-laravel/app/Http/Controllers/API/ReportController.php` (method `index`)

**Kondisi Saat Ini:**
```php
public function index(Request $request)
{
    $query = ReportModel::with(['user:id,name,email', 'takenTask.task:task_id,title']);

    // Filter by user
    if ($request->has('user_id')) {
        $query->where('user_id', $request->user_id);
    }

    // Filter by task
    if ($request->has('task_id')) {
        $query->whereHas('takenTask', function ($q) use ($request) {
            $q->where('task_id', $request->task_id);
        });
    }

    // ❌ TIDAK ADA filter untuk taken_task_id!
    
    // Search in report description
    if ($request->has('search')) {
        $query->where('report', 'like', '%' . $request->search . '%');
    }

    $perPage = $request->get('per_page', 15);
    $reports = $query->orderBy('created_at', 'desc')->paginate($perPage);

    return response()->json($reports);
}
```

**Yang Diharapkan Frontend:**
```javascript
// File: frontend-web/src/services/api.js
export const getReportsByTakenTask = async (takenTaskId) => {
  const response = await api.get('/admin/reports', { 
    params: { taken_task_id: takenTaskId }  // ❌ Parameter ini tidak diproses!
  });
  return response.data;
};
```

**Dampak:**
- Frontend mengirim parameter `taken_task_id` tapi backend TIDAK memfilter berdasarkan parameter tersebut
- Monitoring page akan menampilkan SEMUA reports dari semua assignment, bukan hanya dari assignment yang dipilih
- User akan melihat report yang tidak relevan dengan assignment yang sedang dilihat

**Solusi yang Dibutuhkan:**
Tambahkan filter di ReportController.index():
```php
// Filter by taken_task_id
if ($request->has('taken_task_id')) {
    $query->where('taken_task_id', $request->taken_task_id);
}
```

---

### **MASALAH #2: Response Structure TakenTaskController Tidak Sesuai**

**Lokasi:** `backend-laravel/app/Http/Controllers/API/TakenTaskController.php` (method `show`)

**Kondisi Saat Ini:**
```php
public function show($id)
{
    $assignment = TakenTaskModel::with(['task'])->findOrFail($id);
    
    // Get assigned users
    $assignment->assigned_users = $assignment->getUsers();  // ❌ Field: assigned_users
    
    return response()->json([
        'assignment' => $assignment,
        'duration_minutes' => $duration
    ]);
}
```

Tapi di method `index()`, field yang digunakan berbeda:
```php
public function index(Request $request)
{
    // ...
    foreach ($assignments->items() as $assignment) {
        $assignment->assigned_users = $assignment->getUsers();  // ✅ Konsisten: assigned_users
    }
    
    return response()->json($assignments);
}
```

**Yang Diharapkan Frontend:**
```javascript
// File: frontend-web/src/pages/Monitoring/Monitoring.jsx
const memberLocations = assignment?.users?.map(user => {  // ❌ Menggunakan 'users'
    // ...
});
```

**Dampak:**
- Frontend mencari field `assignment.users` tapi backend mengirim `assignment.assigned_users`
- Monitoring page tidak bisa mendapatkan daftar team members dari assignment
- Map tidak akan menampilkan markers untuk team members
- Stats (Total Members, Reported, Pending) akan menampilkan 0

**Solusi yang Dibutuhkan:**
Ada 2 pilihan:

**Pilihan A (Ubah Backend - Recommended):**
Ubah field di TakenTaskController.show() menjadi `users` agar konsisten dengan struktur API lain:
```php
$assignment->users = $assignment->getUsers();
```

**Pilihan B (Ubah Frontend):**
Ubah kode frontend untuk menggunakan `assigned_users`:
```javascript
const memberLocations = assignment?.assigned_users?.map(user => {
```

---

### **MASALAH #3: Field `image` di Reports Tidak Konsisten**

**Lokasi Database:** `backend-laravel/database/migrations/2026_02_16_065243_create_reports_table.php`

**Schema Migration:**
```php
Schema::create('reports', function (Blueprint $table) {
    $table->uuid('report_id')->primary();
    $table->uuid('user_id');
    $table->uuid('taken_task_id');
    $table->text('report');
    $table->string('image')->nullable();  // ❌ STRING, bukan JSON
    $table->timestamps();
});
```

**Model Accessor:**
```php
// File: backend-laravel/app/Models/ReportModel.php
public function getPhotosAttribute()
{
    return json_decode($this->image, true) ?? [];  // ✅ Ada accessor 'photos'
}
```

**Controller Store (Create Report):**
```php
// File: backend-laravel/app/Http/Controllers/API/ReportController.php
$report = ReportModel::create([
    'user_id' => $request->user()->id,
    'taken_task_id' => $request->taken_task_id,
    'report' => $request->report,
    'image' => json_encode($photoPaths), // ✅ Store as JSON string
]);
```

**Seeder:**
```php
// File: backend-laravel/database/seeders/ReportSeeder.php
ReportModel::create([
    'user_id' => $userId,
    'taken_task_id' => $takenTask->taken_task_id,
    'report' => $reportContent,
    'image' => $imagePath,  // ❌ Single string path, NOT JSON!
    'created_at' => $takenTask->end_time ?? now(),
]);
```

**Yang Diharapkan Frontend:**
```javascript
// File: frontend-web/src/pages/Monitoring/ReportsPanel.jsx
{report.image && report.image.length > 0 && (  // ❌ Menggunakan 'image'
  <div className="report-images">
    {report.image.map((imagePath, idx) => (  // ❌ Mengharapkan array
      <div key={idx} className="report-image-container">
        <img src={`${API_BASE_URL}/storage/${imagePath}`} />
      </div>
    ))}
  </div>
)}
```

**Dampak:**
- Seeder menyimpan string biasa, bukan JSON array
- Frontend mengharapkan array tapi menerima string atau perlu menggunakan field `photos` (accessor)
- Images tidak akan ditampilkan di ReportsPanel
- Dapat menyebabkan JavaScript error saat mencoba `.map()` pada string

**Solusi yang Dibutuhkan:**

**Pilihan A (Ubah Seeder):**
Update ReportSeeder untuk menyimpan JSON array:
```php
'image' => $hasImage ? json_encode(['reports/' . uniqid() . '_report_image.jpg']) : null,
```

**Pilihan B (Ubah Frontend):**
Gunakan accessor `photos` di frontend:
```javascript
{report.photos && report.photos.length > 0 && (
  <div className="report-images">
    {report.photos.map((imagePath, idx) => (
```

**Pilihan C (Ubah Backend Response):**
Tambahkan transform di controller untuk selalu mengembalikan array:
```php
$reports->transform(function ($report) {
    $report->images = is_string($report->image) 
        ? json_decode($report->image, true) ?? []
        : [];
    return $report;
});
```

---

### **MASALAH #4: Field `latitude` dan `longitude` Tidak Ada di Tabel Reports**

**Lokasi:** `backend-laravel/database/migrations/2026_02_16_065243_create_reports_table.php`

**Schema Migration:**
```php
Schema::create('reports', function (Blueprint $table) {
    $table->uuid('report_id')->primary();
    $table->uuid('user_id');
    $table->uuid('taken_task_id');
    $table->text('report');
    $table->string('image')->nullable();
    $table->timestamps();
    // ❌ TIDAK ADA field latitude dan longitude!
});
```

**Yang Diharapkan Frontend:**
```javascript
// File: frontend-web/src/pages/Monitoring/Monitoring.jsx
const memberLocations = assignment?.users?.map(user => {
    const userReports = reports.filter(r => r.user_id === user.id);
    const latestReport = userReports.length > 0 ? userReports[userReports.length - 1] : null;
    
    return {
      id: user.id,
      name: user.name,
      email: user.email,
      status: latestReport ? 'active' : 'offline',
      lat: latestReport?.latitude || -6.2088,  // ❌ Field tidak ada!
      lng: latestReport?.longitude || 106.8456, // ❌ Field tidak ada!
      hasReport: !!latestReport
    };
}) || [];
```

**Catatan:**
Ada tabel `locations` yang terpisah untuk tracking GPS:
```php
// File: backend-laravel/database/migrations/2026_02_16_065250_create_locations_table.php
Schema::create('locations', function (Blueprint $table) {
    $table->uuid('location_id')->primary();
    $table->uuid('user_id');
    $table->uuid('taken_task_id');
    $table->decimal('latitude', 10, 8);
    $table->decimal('longitude', 11, 8);
    $table->timestamp('timestamp');
    $table->timestamps();
});
```

**Dampak:**
- Frontend mencoba mengambil koordinat dari reports tapi field tidak ada
- Akan selalu menggunakan default coordinates Jakarta (-6.2088, 106.8456)
- Map tidak menampilkan posisi real-time dari team members
- Semua markers akan berada di lokasi yang sama (overlap)

**Solusi yang Dibutuhkan:**

**Pilihan A (Gunakan Tabel Locations - RECOMMENDED):**
Fetch data location terpisah dan join dengan user data:
```javascript
// Fetch locations for this taken task
const locationsData = await getLocationsByTakenTask(takenTaskId);

const memberLocations = assignment?.users?.map(user => {
    const userLocation = locationsData.find(loc => loc.user_id === user.id);
    const hasReport = reports.some(r => r.user_id === user.id);
    
    return {
        id: user.id,
        name: user.name,
        lat: userLocation?.latitude || -6.2088,
        lng: userLocation?.longitude || 106.8456,
        status: hasReport ? 'active' : 'offline',
    };
});
```

**Pilihan B (Tambah Migration):**
Tambahkan field latitude/longitude ke tabel reports (kurang efisien karena duplikasi data)

---

### **MASALAH #5: API Endpoint untuk Locations Mungkin Tidak Ada**

**Yang Dibutuhkan Frontend:**
```javascript
// File: frontend-web/src/services/api.js (BELUM ADA)
export const getLocationsByTakenTask = async (takenTaskId) => {
  const response = await api.get('/admin/locations', { 
    params: { taken_task_id: takenTaskId } 
  });
  return response.data;
};
```

**Perlu Dicek:**
- Apakah ada endpoint `/api/admin/locations` di routes?
- Apakah LocationController punya method untuk filter by taken_task_id?
- Apakah ada seeder data untuk locations?

**Dampak:**
- Tanpa endpoint locations yang proper, map tidak bisa menampilkan posisi real-time
- Team member markers tidak akan akurat

---

## 📊 RINGKASAN STRUKTUR DATABASE

### Tabel `taken_tasks`:
```
- taken_task_id (UUID, PK)
- task_id (UUID, FK to tasks)
- user_ids (JSON array) ✅
- start_time (timestamp, nullable)
- end_time (timestamp, nullable)
- date (date, nullable)
- status (string, default: 'in_progress')
- created_at, updated_at
```

### Tabel `reports`:
```
- report_id (UUID, PK)
- user_id (UUID, FK to users)
- taken_task_id (UUID, FK to taken_tasks)
- report (text)
- image (string, nullable) ⚠️ Should be JSON
- ❌ NO latitude/longitude
- created_at, updated_at
```

### Tabel `locations`:
```
- location_id (UUID, PK)
- user_id (UUID, FK to users)
- taken_task_id (UUID, FK to taken_tasks)
- latitude (decimal 10,8) ✅
- longitude (decimal 11,8) ✅
- timestamp (timestamp)
- created_at, updated_at
```

---

## 🔧 SOLUSI YANG DIREKOMENDASIKAN

### Priority 1 - CRITICAL (Harus Diperbaiki):

1. ✅ **Tambahkan filter `taken_task_id` di ReportController.index()**
   ```php
   if ($request->has('taken_task_id')) {
       $query->where('taken_task_id', $request->taken_task_id);
   }
   ```

2. ✅ **Perbaiki field name di TakenTaskController.show()**
   - Ubah `assigned_users` → `users` untuk konsistensi

3. ✅ **Perbaiki ReportSeeder untuk menyimpan JSON array**
   ```php
   'image' => $hasImage ? json_encode(['reports/sample.jpg']) : null,
   ```

4. ✅ **Implementasi LocationController endpoint**
   - Buat endpoint GET `/api/admin/locations`
   - Support filter by `taken_task_id`
   - Return location data dengan user info

5. ✅ **Update Frontend untuk menggunakan tabel locations**
   - Fetch location data terpisah
   - Join dengan assignment users
   - Display pada map

### Priority 2 - ENHANCEMENTS:

6. Update migration untuk mengubah `image` column menjadi JSON type
7. Tambahkan seed data untuk locations table
8. Buat API documentation untuk endpoint locations

---

## 📝 CHECKLIST SEBELUM IMPLEMENTASI

### Backend yang Perlu Dicek/Diperbaiki:
- [ ] ReportController - tambah filter taken_task_id
- [ ] TakenTaskController - ubah assigned_users → users
- [ ] ReportSeeder - ubah image menjadi JSON array
- [ ] LocationController - cek apakah ada method index dengan filter
- [ ] routes/api.php - cek apakah endpoint locations sudah ada
- [ ] LocationSeeder - cek apakah ada data sample

### Frontend yang Perlu Diperbaiki:
- [ ] Monitoring.jsx - gunakan field 'users' atau 'assigned_users' konsisten
- [ ] Monitoring.jsx - fetch data locations terpisah
- [ ] ReportsPanel.jsx - gunakan field 'photos' atau handle JSON decode 'image'
- [ ] api.js - tambahkan function getLocationsByTakenTask()

### Database:
- [ ] Run migration fresh jika perlu
- [ ] Run seeder ulang dengan data yang benar
- [ ] Verifikasi data di database setelah seeder

---

## 🎯 KESIMPULAN

Halaman Monitoring **TIDAK AKAN BERFUNGSI** dengan kondisi saat ini karena:

1. ❌ Backend tidak memfilter reports by taken_task_id → menampilkan semua reports
2. ❌ Backend menggunakan field name berbeda (assigned_users vs users) → data tidak terbaca
3. ❌ Reports.image tidak konsisten (string vs JSON) → gambar tidak muncul
4. ❌ Reports tidak punya koordinat GPS → map markers tidak akurat
5. ❌ Belum ada integrasi dengan tabel locations → posisi real-time tidak tersedia

**REKOMENDASI:** Perbaiki 5 masalah di atas sebelum melanjutkan development atau testing.

---

**Analisa dilakukan oleh:** GitHub Copilot  
**Waktu Analisa:** ~10 menit  
**File yang Dianalisa:** 15 files (migrations, seeders, controllers, models, frontend components)
