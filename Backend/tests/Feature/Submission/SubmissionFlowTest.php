<?php

namespace Tests\Feature\Submission;

use App\Mail\SubmissionStatusMail;
use App\Models\Document;
use App\Models\Indicator;
use App\Models\Aspect;
use App\Models\Outcome;
use App\Models\Principle;
use App\Models\Setting;
use App\Models\Submission;
use App\Models\SubmissionPerIndicator;
use App\Models\User;
use Database\Seeders\AssessmentFrameworkSeeder;
use Illuminate\Support\Facades\Mail;
use Tests\TestCase;

class SubmissionFlowTest extends TestCase
{
    private User $admin;
    private User $company;
    private Submission $submission;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed(AssessmentFrameworkSeeder::class);
        $this->company = User::factory()->company()->create();
        $this->admin   = User::factory()->admin()->create();
    }

    private function createIndicator(): Indicator
    {
        $aspect    = Aspect::factory()->create();
        $outcome   = Outcome::factory()->create(['aspect_id' => $aspect->id]);
        $principle = Principle::factory()->create(['outcome_id' => $outcome->id]);
        return Indicator::factory()->create(['principle_id' => $principle->id]);
    }

    private function buildApprovedSubmission(): Submission
    {
        $submission = Submission::factory()->approved()->create([
            'user_id' => $this->company->id,
        ]);

        for ($i = 0; $i < 35; $i++) {
            $indicator = $this->createIndicator();
            \App\Models\Document::factory()->create([
                'submission_id' => $submission->id,
                'indicator_id'  => $indicator->id,
            ]);
        }

        return $submission;
    }

    private function populateSubmissionWithHighScoresAndDocs(Submission $submission): void
    {
        $questions = \App\Models\Question::factory()->count(35)->create();
        $answers = $questions->map(function ($q) use ($submission) {
            return [
                'submission_id' => $submission->id,
                'question_id'   => $q->id,
                'value'         => 2, // Max score for each
                'valid_value'   => 2,
                'created_at'    => now(),
                'updated_at'    => now(),
            ];
        })->toArray();
        \App\Models\Answer::insert($answers);

        for ($i = 0; $i < 35; $i++) {
            $indicator = $this->createIndicator();
            \App\Models\Document::factory()->create([
                'submission_id' => $submission->id,
                'indicator_id'  => $indicator->id,
            ]);
        }
    }

    // ─── B-F3-01 ──────────────────────────────────────────────────────────────

    /** @test */
    public function company_can_submit_draft_to_pending_payment()
    {
        $this->actingAs($this->company);
        $submission = Submission::factory()->draft()->create(['user_id' => $this->company->id]);
        $this->populateSubmissionWithHighScoresAndDocs($submission);

        $response = $this->postJson("/api/submissions/{$submission->id}/submit");
        $response->assertStatus(200);
        $this->assertDatabaseHas('submissions', [
            'id'                   => $submission->id,
            'submission_status_id' => 1,
        ]);
    }

    // ─── B-F3-02 ──────────────────────────────────────────────────────────────

    /** @test */
    public function company_can_resubmit_from_revision_status()
    {
        $this->actingAs($this->company);
        $submission = Submission::factory()->revision()->create(['user_id' => $this->company->id]);
        $this->populateSubmissionWithHighScoresAndDocs($submission);

        // Simulate that the company has already paid
        \App\Models\PaymentTransaction::factory()->create([
            'submission_id'      => $submission->id,
            'transaction_status' => 'settlement',
        ]);

        $response = $this->postJson("/api/submissions/{$submission->id}/submit");

        $response->assertStatus(200);
        $this->assertDatabaseHas('submissions', [
            'id'                   => $submission->id,
            'submission_status_id' => 3,
        ]);
    }

    // ─── B-F3-03 ──────────────────────────────────────────────────────────────

    /** @test */
    public function company_cannot_submit_from_invalid_status()
    {
        $this->actingAs($this->company);
        $submission = Submission::factory()->paymentSuccessful()->create(['user_id' => $this->company->id]);

        $response = $this->postJson("/api/submissions/{$submission->id}/submit");

        $response->assertStatus(404);
    }

    // ─── B-F3-04 ──────────────────────────────────────────────────────────────

    /** @test */
    public function admin_can_approve_submission_when_score_and_documents_are_sufficient()
    {
        $this->actingAs($this->admin);
        $submission = $this->buildApprovedSubmission();
        $submission->update(['submission_status_id' => 3, 'valid_score' => 80.0]);

        $response = $this->postJson("/api/admin/submissions/{$submission->id}/approve");
        $response->assertStatus(200);
        $this->assertDatabaseHas('submissions', [
            'id'                   => $submission->id,
            'submission_status_id' => 8,
        ]);
        Mail::assertQueued(SubmissionStatusMail::class);
    }

    // ─── B-F3-05 ──────────────────────────────────────────────────────────────

    /** @test */
    public function admin_cannot_approve_if_valid_score_is_below_70()
    {
        $this->actingAs($this->admin);
        $indicator = $this->createIndicator();
        $submission = Submission::factory()->onVerification()->create([
            'user_id'     => $this->company->id,
            'valid_score' => 65.0,
        ]);
        for ($i = 0; $i < 35; $i++) {
            $indicator = $this->createIndicator();
            Document::factory()->create([
                'submission_id' => $submission->id,
                'indicator_id'  => $indicator->id,
            ]);
        }

        $response = $this->postJson("/api/admin/submissions/{$submission->id}/approve");

        $response->assertStatus(400);
        $this->assertDatabaseHas('submissions', [
            'id'                   => $submission->id,
            'submission_status_id' => 3,
        ]);
    }

    /** @test */
    public function admin_cannot_approve_if_35_docs_on_same_indicator()
    {
        $this->actingAs($this->admin);
        $indicator = $this->createIndicator();
        $submission = Submission::factory()->onVerification()->create([
            'user_id'     => $this->company->id,
            'valid_score' => 80.0,
        ]);
        
        // Create 35 docs on the SAME indicator
        Document::factory()->count(35)->create([
            'submission_id' => $submission->id,
            'indicator_id'  => $indicator->id,
        ]);

        $response = $this->postJson("/api/admin/submissions/{$submission->id}/approve");

        $response->assertStatus(400);
        $response->assertJsonFragment(['message' => 'Skor atau kelengkapan dokumen belum memenuhi syarat lolos (Minimal skor 70 dan 35 indikator memiliki bukti).']);
        $this->assertDatabaseHas('submissions', [
            'id'                   => $submission->id,
            'submission_status_id' => 3,
        ]);
    }

    // ─── B-F3-06 ──────────────────────────────────────────────────────────────

    /** @test */
    public function admin_cannot_approve_if_documents_are_below_35()
    {
        $this->actingAs($this->admin);
        $indicator = $this->createIndicator();
        $submission = Submission::factory()->onVerification()->create([
            'user_id'     => $this->company->id,
            'valid_score' => 80.0,
        ]);
        Document::factory()->count(10)->create([
            'submission_id' => $submission->id,
            'indicator_id'  => $indicator->id,
        ]);

        $response = $this->postJson("/api/admin/submissions/{$submission->id}/approve");

        $response->assertStatus(400);
    }

    // ─── B-F3-07 ──────────────────────────────────────────────────────────────

    /** @test */
    public function admin_can_return_submission_for_revision_when_indicator_is_marked()
    {
        $this->actingAs($this->admin);
        $submission = Submission::factory()->onVerification()->create([
            'user_id' => $this->company->id,
        ]);

        // Mark at least one indicator as needing revision (status 4)
        $indicator = $this->createIndicator();
        SubmissionPerIndicator::create([
            'submission_id'          => $submission->id,
            'indicator_id'           => $indicator->id,
            'per_indicator_status_id'=> 5, // Declined/needs revision
        ]);

        $response = $this->postJson("/api/admin/submissions/{$submission->id}/return", [
            'reason' => 'Dokumen tidak lengkap.',
        ]);

        $response->assertStatus(200);
        $this->assertDatabaseHas('submissions', [
            'id'                   => $submission->id,
            'submission_status_id' => 4,
        ]);
        Mail::assertQueued(SubmissionStatusMail::class);
    }

    // ─── B-F3-08 ──────────────────────────────────────────────────────────────

    /** @test */
    public function admin_cannot_return_submission_for_revision_when_no_indicator_is_marked()
    {
        $this->actingAs($this->admin);
        $submission = Submission::factory()->onVerification()->create([
            'user_id' => $this->company->id,
        ]);

        // Tidak ada indikator yang ditandai revisi (per_indicator_status_id = 5)
        // Hanya ada indikator yang diverifikasi (status 4 = Verified)
        $indicator = $this->createIndicator();
        SubmissionPerIndicator::create([
            'submission_id'          => $submission->id,
            'indicator_id'           => $indicator->id,
            'per_indicator_status_id'=> 4, // Verified — bukan revisi
        ]);

        $response = $this->postJson("/api/admin/submissions/{$submission->id}/return", [
            'reason' => 'Coba kembalikan tanpa ada indikator revisi.',
        ]);

        $response->assertStatus(422)
            ->assertJsonFragment(['message' => 'Tidak ada indikator yang ditandai untuk revisi. Silakan tandai minimal satu indikator sebagai "Revisi" terlebih dahulu.']);

        // Submission harus tetap di status 3 (On Verification)
        $this->assertDatabaseHas('submissions', [
            'id'                   => $submission->id,
            'submission_status_id' => 3,
        ]);

        // Tidak ada email yang dikirim
        Mail::assertNotQueued(SubmissionStatusMail::class);
    }

    /** @test */
    public function admin_cannot_return_submission_for_revision_when_no_indicators_exist_at_all()
    {
        $this->actingAs($this->admin);
        $submission = Submission::factory()->onVerification()->create([
            'user_id' => $this->company->id,
        ]);

        // Sama sekali tidak ada SubmissionPerIndicator
        $response = $this->postJson("/api/admin/submissions/{$submission->id}/return", [
            'reason' => 'Tidak ada indikator sama sekali.',
        ]);

        $response->assertStatus(422);

        $this->assertDatabaseHas('submissions', [
            'id'                   => $submission->id,
            'submission_status_id' => 3,
        ]);
    }

    // ─── B-F3-09 ──────────────────────────────────────────────────────────────

    /** @test */
    public function admin_can_permanently_reject_a_submission()
    {
        $this->actingAs($this->admin);
        $submission = Submission::factory()->onVerification()->create([
            'user_id' => $this->company->id,
        ]);

        $response = $this->postJson("/api/admin/submissions/{$submission->id}/reject", [
            'reason' => 'Perusahaan tidak memenuhi syarat.',
        ]);

        $response->assertStatus(200);
        $this->assertDatabaseHas('submissions', [
            'id'                   => $submission->id,
            'submission_status_id' => 9,
        ]);
        Mail::assertQueued(SubmissionStatusMail::class);
    }

    // ─── B-F3-10 ──────────────────────────────────────────────────────────────

    /** @test */
    public function admin_can_schedule_location_survey_from_status_8()
    {
        $this->actingAs($this->admin);
        $submission = Submission::factory()->approved()->create([
            'user_id' => $this->company->id,
        ]);

        $response = $this->postJson("/api/admin/submissions/{$submission->id}/survey", [
            'scheduled_at' => date('Y-m-d H:i:s', strtotime('+7 days')),
            'location'     => 'Jakarta Selatan',
            'location_link'=> 'https://maps.google.com/test',
            'notes'        => 'Survey perdana',
        ]);

        $response->assertStatus(200);
        $this->assertDatabaseHas('submissions', [
            'id'                   => $submission->id,
            'submission_status_id' => 7,
        ]);
        $this->assertDatabaseHas('surveys', [
            'submission_id' => $submission->id,
        ]);
        Mail::assertQueued(SubmissionStatusMail::class);
    }

    /** @test */
    public function admin_can_schedule_location_survey_from_status_7()
    {
        $this->actingAs($this->admin);
        $submission = Submission::factory()->create([
            'user_id' => $this->company->id,
            'submission_status_id' => 7,
        ]);

        $response = $this->postJson("/api/admin/submissions/{$submission->id}/survey", [
            'scheduled_at' => date('Y-m-d H:i:s', strtotime('+7 days')),
            'location'     => 'Jakarta Selatan',
            'location_link'=> 'https://maps.google.com/test',
            'notes'        => 'Survey reschedule',
        ]);

        $response->assertStatus(200);
        $this->assertDatabaseHas('submissions', [
            'id'                   => $submission->id,
            'submission_status_id' => 7,
        ]);
        $this->assertDatabaseHas('surveys', [
            'submission_id' => $submission->id,
        ]);
    }

    // ─── B-F3-11 ──────────────────────────────────────────────────────────────

    /** @test */
    public function admin_cannot_schedule_survey_with_past_date()
    {
        $this->actingAs($this->admin);
        $submission = Submission::factory()->paymentSuccessful()->create([
            'user_id' => $this->company->id,
        ]);

        $response = $this->postJson("/api/admin/submissions/{$submission->id}/survey", [
            'scheduled_at' => date('Y-m-d H:i:s', strtotime('-1 day')),
            'location'     => 'Jakarta Selatan',
            'location_link'=> 'https://maps.google.com/test',
        ]);

        $response->assertStatus(422);
    }

    // ─── B-F3-12 ──────────────────────────────────────────────────────────────

    /** @test */
    public function admin_can_issue_certificate_from_status_7()
    {
        $this->actingAs($this->admin);
        $submission = Submission::factory()->locationSurvey()->create([
            'user_id'     => $this->company->id,
            'valid_score' => 85.0,
        ]);
        $this->populateSubmissionWithHighScoresAndDocs($submission);

        // Ensure a certificate category exists
        \App\Models\Certificate::updateOrCreate(
            ['id' => 11],
            ['category' => 'excellent', 'file_path' => 'certificates/excellent.jpg', 'description' => 'Excellent']
        );

        $response = $this->postJson("/api/admin/submissions/{$submission->id}/certificate", [
            'mmic_code'         => 'MMIC-001-2026',
            'director_name'     => 'Direktur Test',
            'published_at'      => date('Y-m-d'),
            'certificate_id'    => 11,
            'becdex_category_id'=> 4, // id 4 = 'Excellent Economy Company' (seeded by BecdexLookupSeeder)
        ]);

        $response->assertStatus(200);
        $this->assertDatabaseHas('submissions', [
            'id'                   => $submission->id,
            'submission_status_id' => 5,
        ]);
        $this->assertDatabaseHas('certificate_users', [
            'submission_id' => $submission->id,
        ]);
    }

    /** @test */
    public function admin_can_assess_indicator_for_revision_even_if_total_documents_below_35()
    {
        $this->actingAs($this->admin);
        $submission = Submission::factory()->onVerification()->create([
            'user_id' => $this->company->id,
        ]);
        $indicator = $this->createIndicator();
        SubmissionPerIndicator::create([
            'submission_id'          => $submission->id,
            'indicator_id'           => $indicator->id,
            'per_indicator_status_id'=> 3,
        ]);

        $response = $this->putJson("/api/admin/submissions/{$submission->id}/indicators/{$indicator->id}", [
            'status_id' => 5, // Revisi
            'comment'   => 'Dokumen belum diunggah, silakan unggah berkas bukti.',
        ]);

        $response->assertStatus(200);
        $this->assertDatabaseHas('submission_per_indicators', [
            'submission_id'          => $submission->id,
            'indicator_id'           => $indicator->id,
            'per_indicator_status_id'=> 5,
        ]);
    }
}
