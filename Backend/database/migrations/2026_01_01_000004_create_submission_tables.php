<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // Status alur submission (7 status)
        Schema::create('submission_statuses', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('color', 30)->default('info');
            $table->timestamps();
        });

        // Submission utama
        Schema::create('submissions', function (Blueprint $table) {
            $table->uuid('id')->primary(); // Ganti ke UUID (aman, tidak bisa ditebak)
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->foreignId('submission_status_id')->constrained('submission_statuses');
            $table->decimal('initial_score', 5, 2)->default(0); // Self-assessment score
            $table->decimal('valid_score', 5, 2)->default(0);   // Admin-verified score
            $table->decimal('survey_score', 5, 2)->default(0);  // Skor dari survei lapangan
            $table->text('reason')->nullable();                  // Catatan admin
            $table->string('qr_code_path')->nullable();
            $table->timestamps();
        });

        // Status per-indikator
        Schema::create('per_indicator_statuses', function (Blueprint $table) {
            $table->id();
            $table->string('name', 50);
            $table->string('color', 30)->default('secondary');
            $table->timestamps();
        });

        // Pivot: status per indikator per submission
        Schema::create('submission_per_indicators', function (Blueprint $table) {
            $table->id();
            $table->uuid('submission_id');
            $table->foreignId('indicator_id')->constrained()->cascadeOnDelete();
            $table->foreignId('per_indicator_status_id')
                  ->default(1)
                  ->constrained('per_indicator_statuses');
            $table->text('comment')->nullable();
            $table->timestamps();

            $table->foreign('submission_id')
                  ->references('id')->on('submissions')
                  ->cascadeOnDelete();
            $table->unique(['submission_id', 'indicator_id']);
        });

        // Jawaban kuesioner
        Schema::create('answers', function (Blueprint $table) {
            $table->id();
            $table->uuid('submission_id');
            $table->foreignId('question_id')->constrained()->cascadeOnDelete();
            $table->tinyInteger('value')->nullable();       // 0/1 - self answer
            $table->tinyInteger('valid_value')->nullable(); // 0/1 - admin verified
            $table->timestamps();

            $table->foreign('submission_id')
                  ->references('id')->on('submissions')
                  ->cascadeOnDelete();
            $table->unique(['submission_id', 'question_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('answers');
        Schema::dropIfExists('submission_per_indicators');
        Schema::dropIfExists('per_indicator_statuses');
        Schema::dropIfExists('submissions');
        Schema::dropIfExists('submission_statuses');
    }
};
