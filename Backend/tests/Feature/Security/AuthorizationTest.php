<?php

namespace Tests\Feature\Security;

use App\Models\Submission;
use App\Models\User;
use Tests\TestCase;

class AuthorizationTest extends TestCase
{
    // ─── B-F13-01 ──────────────────────────────────────────────────────────────

    /** @test */
    public function unauthenticated_request_to_protected_endpoint_returns_401()
    {
        $response = $this->getJson('/api/submissions');

        $response->assertStatus(401);
    }

    // ─── B-F13-02 ──────────────────────────────────────────────────────────────

    /** @test */
    public function company_user_cannot_access_admin_endpoints()
    {
        $this->actingAsCompany();

        $response = $this->getJson('/api/admin/submissions');

        $response->assertStatus(403);
    }

    // ─── B-F13-03 ──────────────────────────────────────────────────────────────

    /** @test */
    public function company_user_cannot_approve_a_submission_via_admin_endpoint()
    {
        $company = $this->actingAsCompany();
        $submission = Submission::factory()->onVerification()->create(['user_id' => $company->id]);

        $response = $this->postJson("/api/admin/submissions/{$submission->id}/approve");

        $response->assertStatus(403);
    }

    // ─── B-F13-04 ──────────────────────────────────────────────────────────────

    /** @test */
    public function company_user_cannot_view_another_companys_submission()
    {
        $userA = $this->actingAsCompany();
        $userB = User::factory()->company()->create();
        $submissionB = Submission::factory()->create(['user_id' => $userB->id]);

        $response = $this->getJson("/api/submissions/{$submissionB->id}");

        $response->assertStatus(404);
    }

    // ─── B-F13-05 ──────────────────────────────────────────────────────────────

    /** @test */
    public function xendit_webhook_with_missing_token_is_rejected()
    {
        $this->setXenditWebhookToken('secure-token');

        $response = $this->postJson('/api/payment/webhook', [
            'status'      => 'PAID',
            'external_id' => 'becdex-test-order',
        ]);
        // No x-callback-token header sent

        $response->assertStatus(401);
    }

    /** @test */
    public function xendit_webhook_with_wrong_token_is_rejected()
    {
        $this->setXenditWebhookToken('correct-token');

        $response = $this->postJson('/api/payment/webhook', [
            'status'      => 'PAID',
            'external_id' => 'becdex-test-order',
        ], [
            'x-callback-token' => 'wrong-token',
        ]);

        $response->assertStatus(401);
    }
}
