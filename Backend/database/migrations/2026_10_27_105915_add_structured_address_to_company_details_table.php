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
    Schema::table('company_details', function (Blueprint $table) {
        $table->string('street_address')->nullable()->after('address');
        $table->string('province')->nullable()->after('street_address');
        $table->string('city')->nullable()->after('province');
        $table->string('district')->nullable()->after('city');
        $table->string('postal_code', 10)->nullable()->after('district');
        $table->decimal('latitude', 10, 7)->nullable()->after('postal_code');
        $table->decimal('longitude', 10, 7)->nullable()->after('latitude');
    });
}
    public function down(): void
{
    Schema::table('company_details', function (Blueprint $table) {
        $table->dropColumn([
            'street_address', 'province', 'city',
            'district', 'postal_code', 'latitude', 'longitude'
        ]);
    });
    }
};
