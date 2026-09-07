<?php

namespace Tests\Feature\Submission;

use App\Models\Submission;
use App\Models\User;
use Database\Seeders\AssessmentFrameworkSeeder;
use Tests\TestCase;

class SubmissionCrudTest extends TestCase
{
    protected function setUp(): void
    {
        parent::setUp();
        // Need framework data so indicators exist for per_indicator rows
        $this->seed(AssessmentFrameworkSeeder::class);
    }

    // ─── B-F2-01 ──────────────────────────────────────────────────────────────

    /** @test */
    public function it_creates_a_new_submission_successfully()
    {
        $user = $this->actingAsCompany();

        $response = $this->postJson('/api/submissions');

        $response->assertStatus(201);
        $this->assertDatabaseHas('submissions', [
            'user_id'              => $user->id,
            'submission_status_id' => 2,
        ]);
    }

    // ─── B-F2-02 ──────────────────────────────────────────────────────────────

    /** @test */
    public function it_prevents_creating_a_duplicate_active_submission()
    {
        $user = $this->actingAsCompany();
        Submission::factory()->draft()->create(['user_id' => $user->id]);

        $response = $this->postJson('/api/submissions');

        $response->assertStatus(422);
    }

    // ─── B-F2-03 ──────────────────────────────────────────────────────────────

    /** @test */
    public function it_only_returns_submissions_belonging_to_the_authenticated_user()
    {
        $userA = $this->actingAsCompany();
        $userASubmission = Submission::factory()->create(['user_id' => $userA->id]);

        $userB = User::factory()->company()->create();
        Submission::factory()->create(['user_id' => $userB->id]);

        $response = $this->getJson('/api/submissions');

        $response->assertStatus(200);
        // User A's submissions only — there should be exactly 1 item in response
        $data = $response->json('data');
        $this->assertCount(1, $data);
        // The returned submission ID should match the one created for userA
        $this->assertEquals($userASubmission->id, $data[0]['id']);
    }

    // ─── B-F2-04 ──────────────────────────────────────────────────────────────

    /** @test */
    public function it_shows_submission_detail_to_its_owner()
    {
        $user = $this->actingAsCompany();
        $submission = Submission::factory()->create(['user_id' => $user->id]);

        $response = $this->getJson("/api/submissions/{$submission->id}");

        $response->assertStatus(200)
            ->assertJsonPath('data.id', $submission->id);
    }

    // ─── B-F2-05 ──────────────────────────────────────────────────────────────

    /** @test */
    public function it_returns_404_when_accessing_another_users_submission()
    {
        $userA = $this->actingAsCompany();
        $userB = User::factory()->company()->create();
        $submissionB = Submission::factory()->create(['user_id' => $userB->id]);

        $response = $this->getJson("/api/submissions/{$submissionB->id}");

        $response->assertStatus(404);
    }

    // ─── B-F2-06 ──────────────────────────────────────────────────────────────

    /** @test */
    public function it_deletes_a_draft_submission_successfully()
    {
        $user = $this->actingAsCompany();
        $submission = Submission::factory()->draft()->create(['user_id' => $user->id]);

        $response = $this->deleteJson("/api/submissions/{$submission->id}");

        $response->assertStatus(200);
        $this->assertDatabaseMissing('submissions', ['id' => $submission->id]);
    }

    // ─── B-F2-07 ──────────────────────────────────────────────────────────────

    /** @test */
    public function it_cannot_delete_a_submission_that_is_not_in_draft_status()
    {
        $user = $this->actingAsCompany();
        $submission = Submission::factory()->onVerification()->create(['user_id' => $user->id]);

        $response = $this->deleteJson("/api/submissions/{$submission->id}");

        $response->assertStatus(404);
        $this->assertDatabaseHas('submissions', ['id' => $submission->id]);
    }
}
