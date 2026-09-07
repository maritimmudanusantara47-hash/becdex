<?php

namespace Tests;

use App\Models\User;
use App\Models\Submission;
use App\Models\Setting;
use Database\Seeders\BecdexLookupSeeder;
use Database\Seeders\RoleSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Foundation\Testing\TestCase as BaseTestCase;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Notification;

abstract class TestCase extends BaseTestCase
{
    use RefreshDatabase;

    /**
     * Set up lookup data required for almost all tests.
     * Runs before each test.
     */
    protected function setUp(): void
    {
        parent::setUp();

        // Seed the minimal required lookup data
        $this->seed(RoleSeeder::class);
        $this->seed(BecdexLookupSeeder::class);

        // Fake mail & notifications by default so nothing is sent
        Mail::fake();
        Notification::fake();

        // Enable session for all tests (needed for Sanctum SPA auth)
        $this->withSession([]);
    }

    // ─── Auth Helpers ──────────────────────────────────────────────────────────

    /**
     * Log in as a Super Admin user and return the user model.
     */
    protected function actingAsAdmin(?User $user = null): User
    {
        $user ??= User::factory()->admin()->create();
        $this->actingAs($user);
        return $user;
    }

    /**
     * Log in as a Company user and return the user model.
     */
    protected function actingAsCompany(?User $user = null): User
    {
        $user ??= User::factory()->company()->create();
        if (!$user->companyDetail) {
            \App\Models\CompanyDetail::factory()->create(['user_id' => $user->id]);
            $user->load('companyDetail');
        }
        $this->actingAs($user);
        return $user;
    }

    /**
     * Log in as a Reviewer / Assessor user.
     */
    protected function actingAsReviewer(?User $user = null): User
    {
        $user ??= User::factory()->reviewer()->create();
        $this->actingAs($user);
        return $user;
    }

    // ─── Submission Helpers ────────────────────────────────────────────────────

    /**
     * Create a submission in a specific status for a given user.
     * Also seeds minimum required indicator data if none exists.
     */
    protected function createSubmission(User $user, int $statusId = 2): Submission
    {
        return Submission::factory()
            ->state(['user_id' => $user->id, 'submission_status_id' => $statusId])
            ->create();
    }

    /**
     * Create a submission with enough documents (35) to pass requirement.
     */
    protected function createSubmissionWithDocuments(User $user, int $statusId = 8, int $count = 35): Submission
    {
        $submission = $this->createSubmission($user, $statusId);
        \App\Models\Document::factory()
            ->count($count)
            ->state(['submission_id' => $submission->id])
            ->create();
        return $submission;
    }

    // ─── Setting Helpers ───────────────────────────────────────────────────────

    /**
     * Set the Xendit webhook token in the settings table.
     */
    protected function setXenditWebhookToken(string $token = 'test-webhook-token'): void
    {
        Setting::updateOrCreate(
            ['key' => 'xendit_webhook_token'],
            ['value' => $token]
        );
    }

    /**
     * Set Xendit secret key in settings.
     */
    protected function setXenditSecretKey(string $key = 'xnd_test_key'): void
    {
        Setting::updateOrCreate(
            ['key' => 'xendit_secret_key'],
            ['value' => $key]
        );
    }

    /**
     * Set payment amount in settings.
     */
    protected function setPaymentAmount(int $amount = 100000): void
    {
        Setting::updateOrCreate(
            ['key' => 'payment_amount'],
            ['value' => (string) $amount]
        );
    }
}
