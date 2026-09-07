<?php

namespace Database\Factories;

use App\Models\Submission;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\PaymentTransaction>
 */
class PaymentTransactionFactory extends Factory
{
    public function definition(): array
    {
        $submission = Submission::factory()->create();
        return [
            'submission_id'      => $submission->id,
            'user_id'            => $submission->user_id,
            'order_id'           => 'becdex-' . Str::random(12),
            'xendit_invoice_id'  => 'inv-' . Str::random(20),
            'invoice_url'        => 'https://checkout.xendit.co/web/' . Str::random(20),
            'amount'             => 100000,
            'transaction_status' => 'pending',
            'expired_at'         => now()->addDay(),
        ];
    }

    /** Masih pending dan belum expired */
    public function pending(): static
    {
        return $this->state(fn (array $attributes) => [
            'transaction_status' => 'pending',
            'expired_at'         => now()->addDay(),
        ]);
    }

    /** Sudah dibayar (settlement) */
    public function settled(): static
    {
        return $this->state(fn (array $attributes) => [
            'transaction_status' => 'settlement',
            'paid_at'            => now(),
            'expired_at'         => now()->addDay(),
        ]);
    }

    /** Invoice sudah kadaluarsa */
    public function expired(): static
    {
        return $this->state(fn (array $attributes) => [
            'transaction_status' => 'expire',
            'expired_at'         => now()->subDay(),
        ]);
    }

    /** Pending tapi sudah melewati waktu expired */
    public function pendingExpired(): static
    {
        return $this->state(fn (array $attributes) => [
            'transaction_status' => 'pending',
            'expired_at'         => now()->subHour(),
        ]);
    }
}
