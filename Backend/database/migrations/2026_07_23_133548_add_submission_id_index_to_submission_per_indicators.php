<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Menambahkan standalone index pada submission_per_indicators.submission_id.
 *
 * Masalah:
 *   Composite UNIQUE index (submission_id, indicator_id) yang ada tidak dipakai
 *   oleh MySQL ketika query hanya memfilter WHERE submission_id = ?, karena
 *   MySQL tidak bisa menggunakan composite index secara efisien jika kolom
 *   pertama adalah bagian dari UNIQUE constraint dengan kolom lain.
 *   Hasil EXPLAIN: type=ALL, key=NULL, rows=1550 (full table scan).
 *
 * Solusi:
 *   Tambahkan index standalone pada submission_id saja, sehingga query:
 *   - WHERE submission_id = ?
 *   - WHERE submission_id = ? AND per_indicator_status_id != 3
 *   dapat menggunakan index dengan type=ref (jauh lebih efisien).
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::table('submission_per_indicators', function (Blueprint $table) {
            $table->index('submission_id', 'spi_submission_id_index');
        });
    }

    public function down(): void
    {
        Schema::table('submission_per_indicators', function (Blueprint $table) {
            $table->dropIndex('spi_submission_id_index');
        });
    }
};
