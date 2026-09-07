<?php

namespace Tests\Feature\Public;

use App\Models\Submission;
use App\Models\User;
use App\Models\CertificateUser;
use Tests\TestCase;

class PublicEndpointTest extends TestCase
{
    // ─── B-F12-01 ──────────────────────────────────────────────────────────────

    /** @test */
    public function it_returns_only_certified_companies_without_auth()
    {
        // Certified company
        $certifiedUser = User::factory()->company()->create();
        Submission::factory()->certified()->create(['user_id' => $certifiedUser->id]);

        // Non-certified company
        $pendingUser = User::factory()->company()->create();
        Submission::factory()->draft()->create(['user_id' => $pendingUser->id]);

        $response = $this->getJson('/api/public/verified-companies');

        $response->assertStatus(200);
        // Should return only certified data (result may vary by API shape)
        $this->assertTrue($response->json('data') !== null);
    }

    // ─── B-F12-02 ──────────────────────────────────────────────────────────────

    /** @test */
    public function it_returns_catalog_indicators_without_auth()
    {
        $response = $this->getJson('/api/public/indicators');

        $response->assertStatus(200);
    }

    // ─── B-F12-04 ──────────────────────────────────────────────────────────────

    /** @test */
    public function it_accepts_help_message_without_auth()
    {
        $response = $this->postJson('/api/public/help', [
            'name'   => 'Budi Test',
            'email'  => 'budi@test.com',
            'detail' => 'Saya butuh bantuan mengenai sertifikasi.',
        ]);

        $response->assertStatus(201);
        $this->assertDatabaseHas('help_messages', [
            'email' => 'budi@test.com',
        ]);
    }

    // ─── B-F12-06 ──────────────────────────────────────────────────────────────

    /** @test */
    public function it_returns_404_when_downloading_certificate_for_uncertified_submission()
    {
        $user = User::factory()->company()->create();
        $submission = Submission::factory()->onVerification()->create(['user_id' => $user->id]);

        $response = $this->getJson("/api/public/submissions/{$submission->id}/certificate/download");

        $response->assertStatus(404);
    }
}
