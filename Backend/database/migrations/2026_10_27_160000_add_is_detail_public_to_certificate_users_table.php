<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('certificate_users', function (Blueprint $table) {
            // is_detail_public: false = Detail terkunci/privat (hanya tampil di katalog tanpa tautan detail)
            //                   true  = Detail publik terbuka (dapat diakses di /verified-companies/{serial_id})
            $table->boolean('is_detail_public')->default(false)->after('is_approved');
        });
    }

    public function down(): void
    {
        Schema::table('certificate_users', function (Blueprint $table) {
            $table->dropColumn('is_detail_public');
        });
    }
};
