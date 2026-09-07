<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        Schema::dropIfExists('settings');

        Schema::create('settings', function (Blueprint $table) {
            $table->id();
            $table->string('key')->unique();
            $table->text('value')->nullable();
            $table->string('description')->nullable();
            $table->timestamps();
        });

        // Default values
        DB::table('settings')->insert([
            ['key' => 'payment_amount',      'value' => '500000',   'description' => 'Biaya Sertifikasi (IDR)', 'created_at' => now(), 'updated_at' => now()],
            ['key' => 'midtrans_client_key', 'value' => '',         'description' => 'Midtrans Client Key',    'created_at' => now(), 'updated_at' => now()],
            ['key' => 'midtrans_server_key', 'value' => '',         'description' => 'Midtrans Server Key',    'created_at' => now(), 'updated_at' => now()],
        ]);
    }

    public function down(): void
    {
        Schema::dropIfExists('settings');
    }
};
