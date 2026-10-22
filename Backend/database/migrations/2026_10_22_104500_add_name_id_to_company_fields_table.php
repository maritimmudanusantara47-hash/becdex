<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('company_fields', function (Blueprint $table) {
            $table->string('name_id')->nullable()->after('name');
        });
    }

    public function down(): void
    {
        Schema::table('company_fields', function (Blueprint $table) {
            $table->dropColumn('name_id');
        });
    }
};
