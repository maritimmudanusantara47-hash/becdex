<?php

namespace Tests\Unit\Models;

use App\Models\PaymentTransaction;
use App\Models\Submission;
use App\Models\User;
use Tests\TestCase;

class PaymentTransactionTest extends TestCase
{
    // ─── B-U2-01 ──────────────────────────────────────────────────────────────

    /** @test */
    public function it_returns_true_for_is_expired_when_expired_at_is_in_the_past()
    {
        $submission = Submission::factory()->create([
            'user_id' => User::factory()->company()->create()->id,
        ]);

        $tx = PaymentTransaction::factory()->create([
            'submission_id'      => $submission->id,
            'transaction_status' => 'pending',
            'expired_at'         => now()->subHour(),
        ]);

        $this->assertTrue($tx->isExpired());
    }

    // ─── B-U2-02 ──────────────────────────────────────────────────────────────

    /** @test */
    public function it_returns_false_for_is_expired_when_expired_at_is_in_the_future()
    {
        $submission = Submission::factory()->create([
            'user_id' => User::factory()->company()->create()->id,
        ]);

        $tx = PaymentTransaction::factory()->create([
            'submission_id'      => $submission->id,
            'transaction_status' => 'pending',
            'expired_at'         => now()->addDay(),
        ]);

        $this->assertFalse($tx->isExpired());
    }

    // ─── B-U2-03 ──────────────────────────────────────────────────────────────

    /** @test */
    public function it_returns_true_for_is_pending_when_status_is_pending()
    {
        $submission = Submission::factory()->create([
            'user_id' => User::factory()->company()->create()->id,
        ]);

        $tx = PaymentTransaction::factory()->pending()->create([
            'submission_id' => $submission->id,
        ]);

        $this->assertTrue($tx->isPending());
    }

    // ─── B-U2-04 ──────────────────────────────────────────────────────────────

    /** @test */
    public function it_returns_true_for_is_settled_when_status_is_settlement()
    {
        $submission = Submission::factory()->create([
            'user_id' => User::factory()->company()->create()->id,
        ]);

        $tx = PaymentTransaction::factory()->settled()->create([
            'submission_id' => $submission->id,
        ]);

        $this->assertTrue($tx->isSettled());
    }
}
