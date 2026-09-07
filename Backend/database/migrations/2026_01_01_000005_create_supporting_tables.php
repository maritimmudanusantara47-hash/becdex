<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // Dokumen pendukung per indikator
        Schema::create('documents', function (Blueprint $table) {
            $table->id();
            $table->uuid('submission_id');
            $table->foreignId('indicator_id')->constrained()->cascadeOnDelete();
            $table->string('file_path');
            $table->string('original_name')->nullable();
            $table->string('mime_type', 50)->nullable();
            $table->unsignedBigInteger('file_size')->nullable(); // bytes
            $table->timestamps();

            $table->foreign('submission_id')
                  ->references('id')->on('submissions')
                  ->cascadeOnDelete();
        });

        // Transaksi pembayaran via Midtrans
        Schema::create('payment_transactions', function (Blueprint $table) {
            $table->id();
            $table->uuid('submission_id');
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->string('order_id')->unique(); // Midtrans order_id
            $table->decimal('amount', 15, 2);
            $table->string('payment_type', 50)->nullable();  // bank_transfer, gopay, etc.
            $table->string('transaction_status', 50)->default('pending'); // pending/settlement/expire
            $table->string('va_number', 50)->nullable();
            $table->string('bank', 20)->nullable();
            $table->string('snap_token')->nullable(); // Midtrans snap token
            $table->timestamp('paid_at')->nullable();
            $table->timestamp('expired_at')->nullable();
            $table->timestamps();

            $table->foreign('submission_id')
                  ->references('id')->on('submissions')
                  ->cascadeOnDelete();

            $table->index(['submission_id', 'transaction_status']);
        });

        // Template sertifikat (standard/good/excellent)
        Schema::create('certificates', function (Blueprint $table) {
            $table->id();
            $table->enum('category', ['standard', 'good', 'excellent']);
            $table->string('file_path');
            $table->string('description')->nullable();
            $table->timestamps();
        });

        // Sertifikat yang diterbitkan per submission/user
        Schema::create('certificate_users', function (Blueprint $table) {
            $table->id();
            $table->uuid('submission_id')->unique();
            $table->foreignId('certificate_id')->constrained()->restrictOnDelete();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->string('mmic', 50)->nullable();    // MMIC number
            $table->string('direktur')->nullable();    // Nama direktur
            $table->date('published_at')->nullable();
            $table->date('valid_until')->nullable();   // published_at + 3 tahun
            $table->timestamps();

            $table->foreign('submission_id')
                  ->references('id')->on('submissions')
                  ->cascadeOnDelete();
        });

        // Survei lokasi lapangan
        Schema::create('surveys', function (Blueprint $table) {
            $table->id();
            $table->uuid('submission_id');
            $table->dateTime('scheduled_at');
            $table->text('location_link')->nullable();
            $table->text('notes')->nullable();
            $table->timestamps();

            $table->foreign('submission_id')
                  ->references('id')->on('submissions')
                  ->cascadeOnDelete();
        });

        // Konfigurasi sistem (Midtrans keys, nominal biaya)
        Schema::create('settings', function (Blueprint $table) {
            $table->id();
            $table->string('key')->unique();
            $table->text('value')->nullable();
            $table->string('description')->nullable();
            $table->timestamps();
        });

        // Pesan bantuan dari publik
        Schema::create('help_messages', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('email');
            $table->string('whatsapp', 20)->nullable();
            $table->string('issue_type', 100)->nullable();
            $table->text('detail');
            $table->boolean('is_read')->default(false);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('help_messages');
        Schema::dropIfExists('settings');
        Schema::dropIfExists('surveys');
        Schema::dropIfExists('certificate_users');
        Schema::dropIfExists('certificates');
        Schema::dropIfExists('payment_transactions');
        Schema::dropIfExists('documents');
    }
};
