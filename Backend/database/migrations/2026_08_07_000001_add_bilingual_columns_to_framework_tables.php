<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // Add Indonesian names to tables that currently only have English names
        Schema::table('aspects', function (Blueprint $table) {
            $table->string('name_id', 100)->nullable()->after('name');
        });

        Schema::table('outcomes', function (Blueprint $table) {
            $table->string('name_id')->nullable()->after('name');
        });

        Schema::table('principles', function (Blueprint $table) {
            $table->string('name_id')->nullable()->after('name');
        });

        // Add bilingual columns to indicators
        Schema::table('indicators', function (Blueprint $table) {
            $table->text('name_id')->nullable()->after('name');
            $table->longText('description_en')->nullable()->after('description');
            $table->text('evidence_en')->nullable()->after('evidence');
            $table->text('verification_method_en')->nullable()->after('verification_method');
            $table->text('regulation_en')->nullable()->after('regulation');
        });

        // Add English question text
        Schema::table('questions', function (Blueprint $table) {
            $table->text('text_en')->nullable()->after('text');
        });
    }

    public function down(): void
    {
        Schema::table('aspects', function (Blueprint $table) {
            $table->dropColumn('name_id');
        });
        Schema::table('outcomes', function (Blueprint $table) {
            $table->dropColumn('name_id');
        });
        Schema::table('principles', function (Blueprint $table) {
            $table->dropColumn('name_id');
        });
        Schema::table('indicators', function (Blueprint $table) {
            $table->dropColumn(['name_id', 'description_en', 'evidence_en', 'verification_method_en', 'regulation_en']);
        });
        Schema::table('questions', function (Blueprint $table) {
            $table->dropColumn('text_en');
        });
    }
};
