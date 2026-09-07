<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('field_surveys', function (Blueprint $table) {
            $table->id();
            $table->uuid('submission_id');
            $table->foreignId('assessor_id')->nullable()->constrained('users')->nullOnDelete();
            $table->dateTime('scheduled_at')->nullable();
            $table->text('notes')->nullable();
            $table->string('file_path')->nullable(); // Uploaded report/photo
            $table->string('status')->default('scheduled'); // scheduled, completed, cancelled
            $table->timestamps();

            $table->foreign('submission_id')->references('id')->on('submissions')->cascadeOnDelete();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('field_surveys');
    }
};
