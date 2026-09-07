<?php

namespace Tests\Unit\Models;

use App\Models\Answer;
use App\Models\Document;
use App\Models\Indicator;
use App\Models\Outcome;
use App\Models\Aspect;
use App\Models\PaymentTransaction;
use App\Models\Principle;
use App\Models\Question;
use App\Models\Submission;
use App\Models\User;
use Tests\TestCase;

class SubmissionEligibilityTest extends TestCase
{
    private function createPassingSubmission(): Submission
    {
        $user = User::factory()->company()->create();
        $submission = Submission::factory()->create([
            'user_id'              => $user->id,
            'submission_status_id' => 1,
            'initial_score'        => 75.0,
        ]);

        // Add 35 documents on distinct indicators
        for ($i = 0; $i < 35; $i++) {
            $indicator = $this->createIndicator();
            Document::factory()->create([
                'submission_id' => $submission->id,
                'indicator_id'  => $indicator->id,
            ]);
        }

        return $submission;
    }

    private function createIndicator(): Indicator
    {
        $aspect    = Aspect::factory()->create();
        $outcome   = Outcome::factory()->create(['aspect_id' => $aspect->id]);
        $principle = Principle::factory()->create(['outcome_id' => $outcome->id]);
        return Indicator::factory()->create(['principle_id' => $principle->id]);
    }

    // ─── B-U3-01 ──────────────────────────────────────────────────────────────

    /** @test */
    public function it_can_proceed_to_payment_when_all_requirements_are_met()
    {
        $submission = $this->createPassingSubmission();

        $this->assertTrue($submission->fresh()->canProceedToPayment());
    }

    // ─── B-U3-02 ──────────────────────────────────────────────────────────────

    /** @test */
    public function it_cannot_proceed_to_payment_when_valid_score_is_below_70()
    {
        $user = User::factory()->company()->create();
        $indicator = $this->createIndicator();

        $submission = Submission::factory()->create([
            'user_id'              => $user->id,
            'submission_status_id' => 8,
            'valid_score'          => 65.0, // failing score
        ]);

        for ($i = 0; $i < 35; $i++) {
            $indicator = $this->createIndicator();
            Document::factory()->create([
                'submission_id' => $submission->id,
                'indicator_id'  => $indicator->id,
            ]);
        }

        $this->assertFalse($submission->fresh()->canProceedToPayment());
    }

    // ─── B-U3-03 ──────────────────────────────────────────────────────────────

    /** @test */
    public function it_cannot_proceed_to_payment_when_documents_are_below_35()
    {
        $user = User::factory()->company()->create();
        $indicator = $this->createIndicator();

        $submission = Submission::factory()->create([
            'user_id'              => $user->id,
            'submission_status_id' => 8,
            'valid_score'          => 80.0,
        ]);

        // Only 20 documents — not enough
        Document::factory()->count(20)->create([
            'submission_id' => $submission->id,
            'indicator_id'  => $indicator->id,
        ]);

        $this->assertFalse($submission->fresh()->canProceedToPayment());
    }

    // ─── B-U3-04 ──────────────────────────────────────────────────────────────

    /** @test */
    public function it_has_successful_payment_when_a_settlement_transaction_exists()
    {
        $user = User::factory()->company()->create();
        $submission = Submission::factory()->create(['user_id' => $user->id]);

        PaymentTransaction::factory()->settled()->create([
            'submission_id' => $submission->id,
        ]);

        $this->assertTrue($submission->fresh()->hasSuccessfulPayment());
    }

    // ─── B-U3-05 ──────────────────────────────────────────────────────────────

    /** @test */
    public function it_does_not_have_successful_payment_when_only_pending_transaction_exists()
    {
        $user = User::factory()->company()->create();
        $submission = Submission::factory()->create(['user_id' => $user->id]);

        PaymentTransaction::factory()->pending()->create([
            'submission_id' => $submission->id,
        ]);

        $this->assertFalse($submission->fresh()->hasSuccessfulPayment());
    }
}
