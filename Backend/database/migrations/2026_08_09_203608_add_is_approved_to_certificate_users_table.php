<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('certificate_users', function (Blueprint $table) {
            // is_approved: false = Pending Approval (menunggu persetujuan Super Admin)
            //              true  = Active (sudah disetujui, user & publik bisa lihat)
            $table->boolean('is_approved')->default(false)->after('valid_until');
        });
    }

    public function down(): void
    {
        Schema::table('certificate_users', function (Blueprint $table) {
            $table->dropColumn('is_approved');
        });
    }
};
