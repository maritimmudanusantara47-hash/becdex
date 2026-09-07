<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('indicators', function (Blueprint $table) {
            $table->longText('evidence')->nullable()->after('description');
            $table->text('verification_method')->nullable()->after('evidence');
            $table->longText('regulation')->nullable()->after('verification_method');
        });

        // Fix typos in existing data
        DB::table('indicators')
            ->where('id', 1)
            ->update(['name' => 'Conformity to Marine Spatial Plans']);

        DB::table('principles')
            ->where('name', 'Wage Standards Fullfillments')
            ->update(['name' => 'Wage Standards Fulfillments']);
    }

    public function down(): void
    {
        Schema::table('indicators', function (Blueprint $table) {
            $table->dropColumn(['evidence', 'verification_method', 'regulation']);
        });

        // Revert typo fixes
        DB::table('indicators')
            ->where('id', 1)
            ->update(['name' => 'Conformity to Marine Special Plans']);

        DB::table('principles')
            ->where('name', 'Wage Standards Fulfillments')
            ->update(['name' => 'Wage Standards Fullfillments']);
    }
};
