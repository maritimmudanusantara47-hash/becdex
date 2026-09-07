<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // Level 1: Aspek (Environmental, Social, Economic)
        Schema::create('aspects', function (Blueprint $table) {
            $table->id();
            $table->string('name', 50)->unique();
            $table->timestamps();
        });

        // Level 2: Outcome per Aspek
        Schema::create('outcomes', function (Blueprint $table) {
            $table->id();
            $table->foreignId('aspect_id')->constrained()->cascadeOnDelete();
            $table->string('name');
            $table->timestamps();
        });

        // Level 3: Principle per Outcome
        Schema::create('principles', function (Blueprint $table) {
            $table->id();
            $table->foreignId('outcome_id')->constrained()->cascadeOnDelete();
            $table->string('name');
            $table->timestamps();
        });

        // Level 4: Indicator per Principle (total 50)
        Schema::create('indicators', function (Blueprint $table) {
            $table->id();
            $table->foreignId('principle_id')->constrained()->cascadeOnDelete();
            $table->text('name');
            $table->longText('description')->nullable();
            $table->unsignedSmallInteger('sort_order')->default(0);
            $table->timestamps();
        });

        // Level 5: Question per Indicator (N per indicator)
        Schema::create('questions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('indicator_id')->constrained()->cascadeOnDelete();
            $table->text('text');
            $table->unsignedSmallInteger('sort_order')->default(0);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('questions');
        Schema::dropIfExists('indicators');
        Schema::dropIfExists('principles');
        Schema::dropIfExists('outcomes');
        Schema::dropIfExists('aspects');
    }
};
