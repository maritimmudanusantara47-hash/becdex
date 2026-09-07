<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     * Migrate payment_transactions table from Midtrans to Xendit:
     * - Rename: snap_token → xendit_invoice_id (Xendit's invoice external ID)
     * - Add:    invoice_url (Xendit hosted payment page URL)
     */
    public function up(): void
    {
        Schema::table('payment_transactions', function (Blueprint $table) {
            // Rename snap_token column to xendit_invoice_id
            $table->renameColumn('snap_token', 'xendit_invoice_id');

            // Add Xendit-specific columns
            $table->string('invoice_url')->nullable()->after('xendit_invoice_id');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('payment_transactions', function (Blueprint $table) {
            $table->dropColumn('invoice_url');
            $table->renameColumn('xendit_invoice_id', 'snap_token');
        });
    }
};
