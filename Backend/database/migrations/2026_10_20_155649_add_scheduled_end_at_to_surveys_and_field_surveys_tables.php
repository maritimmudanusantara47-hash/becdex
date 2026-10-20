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
        Schema::table('surveys', function (Blueprint $table) {
            $table->dateTime('scheduled_end_at')->nullable()->after('scheduled_at');
        });

        Schema::table('field_surveys', function (Blueprint $table) {
            $table->dateTime('scheduled_end_at')->nullable()->after('scheduled_at');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('surveys', function (Blueprint $table) {
            $table->dropColumn('scheduled_end_at');
        });

        Schema::table('field_surveys', function (Blueprint $table) {
            $table->dropColumn('scheduled_end_at');
        });
    }
};
