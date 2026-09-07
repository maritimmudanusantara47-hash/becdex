<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

/**
 * Menambahkan index performa pada kolom-kolom yang sering di-WHERE/ORDER BY
 * tetapi belum memiliki index (teridentifikasi dari audit optimasi 2026-07-23).
 */
return new class extends Migration
{
    public function up(): void
    {
        // certificate_users: valid_until & published_at
        Schema::table('certificate_users', function (Blueprint $table) {
            $table->index('valid_until',  'certificate_users_valid_until_index');
            $table->index('published_at', 'certificate_users_published_at_index');
        });

        // submissions: created_at
        Schema::table('submissions', function (Blueprint $table) {
            $table->index('created_at', 'submissions_created_at_index');
        });
    }

    public function down(): void
    {
        Schema::table('certificate_users', function (Blueprint $table) {
            $table->dropIndex('certificate_users_valid_until_index');
            $table->dropIndex('certificate_users_published_at_index');
        });

        Schema::table('submissions', function (Blueprint $table) {
            $table->dropIndex('submissions_created_at_index');
        });
    }
};
