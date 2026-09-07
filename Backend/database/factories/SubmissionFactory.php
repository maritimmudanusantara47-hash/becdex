<?php

namespace Database\Factories;

use App\Models\User;
use App\Models\SubmissionStatus;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Submission>
 */
class SubmissionFactory extends Factory
{
    public function definition(): array
    {
        return [
            'user_id'              => User::factory()->company(),
            'submission_status_id' => 2, // Document Submission (draft)
            'initial_score'        => 0,
            'valid_score'          => 0,
            'survey_score'         => 0,
            'reason'               => null,
        ];
    }

    /** Status 2: Draft / Document Submission */
    public function draft(): static
    {
        return $this->state(fn (array $attributes) => [
            'submission_status_id' => 2,
        ]);
    }

    /** Status 3: On Verification */
    public function onVerification(): static
    {
        return $this->state(fn (array $attributes) => [
            'submission_status_id' => 3,
        ]);
    }

    /** Status 4: Revision Required */
    public function revision(): static
    {
        return $this->state(fn (array $attributes) => [
            'submission_status_id' => 4,
        ]);
    }

    /** Status 8: Lolos Verifikasi (approved, pending payment) */
    public function approved(): static
    {
        return $this->state(fn (array $attributes) => [
            'submission_status_id' => 8,
            'valid_score'          => 75.00,
        ]);
    }

    /** Status 1: Pending Payment */
    public function pendingPayment(): static
    {
        return $this->state(fn (array $attributes) => [
            'submission_status_id' => 1,
            'valid_score'          => 75.00,
        ]);
    }

    /** Status 6: Payment Successful */
    public function paymentSuccessful(): static
    {
        return $this->state(fn (array $attributes) => [
            'submission_status_id' => 6,
            'valid_score'          => 75.00,
        ]);
    }

    /** Status 7: Location Survey */
    public function locationSurvey(): static
    {
        return $this->state(fn (array $attributes) => [
            'submission_status_id' => 7,
            'valid_score'          => 75.00,
        ]);
    }

    /** Status 5: Certified */
    public function certified(): static
    {
        return $this->state(fn (array $attributes) => [
            'submission_status_id' => 5,
            'valid_score'          => 85.00,
        ]);
    }

    /** Status 9: Permanently Rejected */
    public function rejected(): static
    {
        return $this->state(fn (array $attributes) => [
            'submission_status_id' => 9,
            'reason'               => 'Dokumen tidak valid.',
        ]);
    }

    /** With a passing score (>= 70) */
    public function withPassingScore(): static
    {
        return $this->state(fn (array $attributes) => [
            'initial_score' => 75.00,
            'valid_score'   => 75.00,
        ]);
    }

    /** With a failing score (< 70) */
    public function withFailingScore(): static
    {
        return $this->state(fn (array $attributes) => [
            'initial_score' => 60.00,
            'valid_score'   => 60.00,
        ]);
    }
}
