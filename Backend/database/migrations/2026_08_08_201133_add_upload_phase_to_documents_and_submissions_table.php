<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // Tambah current_upload_phase ke submissions (mulai dari 1, naik tiap kali dikembalikan)
        Schema::table('submissions', function (Blueprint $table) {
            $table->unsignedTinyInteger('current_upload_phase')->default(1)->after('revision_count');
        });

        // Tambah upload_phase ke documents (mencatat di fase mana dokumen ini diunggah)
        Schema::table('documents', function (Blueprint $table) {
            $table->unsignedTinyInteger('upload_phase')->default(1)->after('file_size');
        });
    }

    public function down(): void
    {
        Schema::table('submissions', function (Blueprint $table) {
            $table->dropColumn('current_upload_phase');
        });

        Schema::table('documents', function (Blueprint $table) {
            $table->dropColumn('upload_phase');
        });
    }
};
