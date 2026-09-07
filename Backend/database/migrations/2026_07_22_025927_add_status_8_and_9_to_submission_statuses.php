<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        DB::table('submission_statuses')->insert([
            [
                'id' => 8,
                'name' => 'Verification Approved',
                'color' => 'success',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'id' => 9,
                'name' => 'Rejected',
                'color' => 'danger',
                'created_at' => now(),
                'updated_at' => now(),
            ],
        ]);
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        DB::table('submission_statuses')->whereIn('id', [8, 9])->delete();
    }
};
