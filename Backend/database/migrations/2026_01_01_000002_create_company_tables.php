<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // Lookup: Bidang usaha maritim
        Schema::create('company_fields', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->timestamps();
        });

        // Lookup: Negara (ISO 2-char code)
        Schema::create('countries', function (Blueprint $table) {
            $table->id();
            $table->string('iso', 3);
            $table->string('name');
            $table->timestamps();
        });

        // Lookup: Kategori BECdex (Not/Standard/Good/Excellent)
        Schema::create('becdex_categories', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->integer('max_score');
            $table->string('color', 20)->default('info');
            $table->timestamps();
        });

        // Detail profil perusahaan (1-to-1 dengan user)
        Schema::create('company_details', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->unique()->constrained()->cascadeOnDelete();
            $table->string('company_phone', 50)->nullable();
            $table->string('company_country', 3)->nullable();
            $table->foreignId('company_field_id')->nullable()->constrained('company_fields')->nullOnDelete();
            $table->string('pic_name');
            $table->string('pic_position');
            $table->string('pic_email');
            $table->string('pic_phone', 50);
            $table->foreignId('becdex_category_id')->nullable()->constrained('becdex_categories')->nullOnDelete();
            $table->text('description')->nullable();
            $table->text('address')->nullable();
            $table->string('website')->nullable();
            $table->string('brand_name')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('company_details');
        Schema::dropIfExists('becdex_categories');
        Schema::dropIfExists('countries');
        Schema::dropIfExists('company_fields');
    }
};
