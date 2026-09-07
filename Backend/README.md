# BECdex Backend (Laravel)

This is the backend API for the BECdex (Blue Economy Company Index) platform, built with Laravel.

## 🚀 Prasyarat (Requirements)
Sebelum menjalankan backend ini, pastikan sistem Anda memiliki:
- **PHP** >= 8.2
- **Composer** (untuk manajemen dependensi PHP)
- **MySQL** atau MariaDB
- **Git**

## 🛠️ Cara Menjalankan di Local Development

Ikuti langkah-langkah berikut untuk menjalankan project ini di komputer lokal Anda:

1. **Clone Repository (Jika belum)**
   ```bash
   git clone https://github.com/rahmatez/becdex.git
   cd becdex/Backend
   ```

2. **Install Dependensi**
   ```bash
   composer install
   ```

3. **Konfigurasi Environment**
   Duplikat file `.env.example` menjadi `.env`:
   ```bash
   cp .env.example .env
   ```
   Buka file `.env` lalu sesuaikan konfigurasi database Anda:
   ```env
   DB_CONNECTION=mysql
   DB_HOST=127.0.0.1
   DB_PORT=3306
   DB_DATABASE=nama_database_lokal_anda
   DB_USERNAME=root
   DB_PASSWORD=
   ```

4. **Generate Application Key**
   ```bash
   php artisan key:generate
   ```

5. **Migrasi Database & Seeder**
   Jalankan perintah ini untuk membuat tabel di database dan mengisi data *dummy* (termasuk super admin, regulasi, kuesioner, dsb).
   ```bash
   php artisan migrate:fresh --seed
   ```
   > **Note:** Gunakan `migrate:fresh` hanya di lokal. **JANGAN** jalankan ini di production karena akan menghapus seluruh data!

6. **Link Storage**
   Untuk memastikan file upload (seperti dokumen PDF pengajuan atau background sertifikat) dapat diakses, jalankan:
   ```bash
   php artisan storage:link
   ```

7. **Jalankan Server Backend**
   ```bash
   php artisan serve
   ```
   Server backend akan berjalan di `http://127.0.0.1:8000`.

---

## 🌍 Cara Update di Production Server

Jika Anda baru saja menarik perubahan terbaru (`git pull`) ke server *production*, lakukan langkah berikut:

1. **Install dependensi baru (jika ada update package)**
   ```bash
   composer install --optimize-autoloader --no-dev
   ```

2. **Jalankan migrasi (Tanpa menghapus data)**
   ```bash
   php artisan migrate --force
   ```

3. **Jalankan Seeder Khusus (Opsional, jika ada update regulasi/teks indikator)**
   Misal untuk meng-update 50 indikator regulasi tanpa merusak data pengajuan user:
   ```bash
   php artisan db:seed --class=IndicatorAuditDataSeeder --force
   ```

4. **Bersihkan Cache**
   ```bash
   php artisan optimize:clear
   php artisan config:cache
   php artisan route:cache
   php artisan view:cache
   ```
