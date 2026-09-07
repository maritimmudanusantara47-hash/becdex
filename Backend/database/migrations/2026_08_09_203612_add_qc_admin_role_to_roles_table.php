<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        // Tambah role QC Admin (Quality Control and Standardization Manager)
        DB::table('roles')->insertOrIgnore([
            'id'         => 11,
            'name'       => 'qc_admin',
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        // Set semua sertifikat yang sudah ada (existing) sebagai approved = true
        // agar tidak merusak data lama yang sudah berjalan
        DB::table('certificate_users')->update(['is_approved' => true]);
    }

    public function down(): void
    {
        DB::table('roles')->where('id', 11)->delete();
    }
};
