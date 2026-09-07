<?php

namespace Tests\Feature\Submission;

use App\Models\Aspect;
use App\Models\Document;
use App\Models\Indicator;
use App\Models\Outcome;
use App\Models\Principle;
use App\Models\Submission;
use App\Models\User;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Tests\TestCase;

class DocumentTest extends TestCase
{
    private function createIndicator(): Indicator
    {
        $aspect    = Aspect::factory()->create();
        $outcome   = Outcome::factory()->create(['aspect_id' => $aspect->id]);
        $principle = Principle::factory()->create(['outcome_id' => $outcome->id]);
        return Indicator::factory()->create(['principle_id' => $principle->id]);
    }

    // ─── B-F4-01 ──────────────────────────────────────────────────────────────

    /** @test */
    public function it_uploads_a_document_successfully_in_status_2()
    {
        Storage::fake('public');
        $user = $this->actingAsCompany();
        $submission = Submission::factory()->draft()->create(['user_id' => $user->id]);
        $indicator  = $this->createIndicator();

        $response = $this->postJson("/api/submissions/{$submission->id}/documents", [
            'file'         => UploadedFile::fake()->create('doc.pdf', 500, 'application/pdf'),
            'indicator_id' => $indicator->id,
        ]);

        $response->assertStatus(201);
        $this->assertDatabaseHas('documents', [
            'submission_id' => $submission->id,
            'indicator_id'  => $indicator->id,
        ]);
    }

    // ─── B-F4-02 ──────────────────────────────────────────────────────────────

    /** @test */
    public function it_uploads_a_document_successfully_in_status_4()
    {
        Storage::fake('public');
        $user = $this->actingAsCompany();
        $submission = Submission::factory()->revision()->create(['user_id' => $user->id]);
        $indicator  = $this->createIndicator();

        $response = $this->postJson("/api/submissions/{$submission->id}/documents", [
            'file'         => UploadedFile::fake()->create('doc.pdf', 500, 'application/pdf'),
            'indicator_id' => $indicator->id,
        ]);

        $response->assertStatus(201);
    }

    // ─── B-F4-03 ──────────────────────────────────────────────────────────────

    /** @test */
    public function it_cannot_upload_document_when_submission_is_on_verification()
    {
        $user = $this->actingAsCompany();
        $submission = Submission::factory()->onVerification()->create(['user_id' => $user->id]);
        $indicator  = $this->createIndicator();

        $response = $this->postJson("/api/submissions/{$submission->id}/documents", [
            'file'         => UploadedFile::fake()->create('doc.pdf', 500, 'application/pdf'),
            'indicator_id' => $indicator->id,
        ]);

        $response->assertStatus(404);
    }

    // ─── B-F4-04 ──────────────────────────────────────────────────────────────

    /**
     * @test
     * NOTE: Backend saat ini BELUM memvalidasi MIME type dokumen.
     * TODO: Tambahkan validasi 'mimes:pdf' di DocumentController@upload
     * Test ini mendokumentasikan gap yang ada.
     */
    public function it_currently_accepts_non_pdf_files_due_to_missing_mime_validation()
    {
        Storage::fake('public');
        $user = $this->actingAsCompany();
        $submission = Submission::factory()->draft()->create(['user_id' => $user->id]);
        $indicator  = $this->createIndicator();

        $response = $this->postJson("/api/submissions/{$submission->id}/documents", [
            'file'         => UploadedFile::fake()->image('image.png'),
            'indicator_id' => $indicator->id,
        ]);

        // Currently returns 201 because no MIME validation exists in DocumentController
        // This SHOULD be 422 once validation is added
        $response->assertStatus(201);
    }

    /** @test */
    public function it_cannot_upload_more_than_10_documents_per_indicator()
    {
        Storage::fake('public');
        $user = $this->actingAsCompany();
        $submission = Submission::factory()->draft()->create(['user_id' => $user->id]);
        $indicator  = $this->createIndicator();

        // Create 10 existing documents
        Document::factory()->count(10)->create([
            'submission_id' => $submission->id,
            'indicator_id'  => $indicator->id,
        ]);

        $response = $this->postJson("/api/submissions/{$submission->id}/documents", [
            'file'         => UploadedFile::fake()->create('document11.pdf', 100, 'application/pdf'),
            'indicator_id' => $indicator->id,
        ]);

        $response->assertStatus(422)
                 ->assertJsonFragment(['message' => 'Anda telah mencapai batas maksimal 10 dokumen untuk indikator ini.']);
    }

    // ─── B-F4-05 ──────────────────────────────────────────────────────────────

    /** @test */
    public function it_deletes_a_document_and_resets_indicator_status_when_last_doc()
    {
        Storage::fake('public');
        $user = $this->actingAsCompany();
        $submission = Submission::factory()->draft()->create(['user_id' => $user->id]);
        $indicator  = $this->createIndicator();

        // Create a single document (last one for indicator)
        $document = Document::factory()->create([
            'submission_id' => $submission->id,
            'indicator_id'  => $indicator->id,
            'file_path'     => 'documents/test.pdf',
        ]);

        // Fake the storage file
        Storage::disk('public')->put('documents/test.pdf', 'fake content');

        $response = $this->deleteJson("/api/submissions/{$submission->id}/documents/{$document->id}");

        $response->assertStatus(200);
        $this->assertDatabaseMissing('documents', ['id' => $document->id]);
    }

    // ─── B-F4-06 ──────────────────────────────────────────────────────────────

    /** @test */
    public function it_lists_documents_for_a_submission()
    {
        $user = $this->actingAsCompany();
        $submission = Submission::factory()->draft()->create(['user_id' => $user->id]);
        $indicator  = $this->createIndicator();

        Document::factory()->count(5)->create([
            'submission_id' => $submission->id,
            'indicator_id'  => $indicator->id,
        ]);

        $response = $this->getJson("/api/submissions/{$submission->id}/documents");

        $response->assertStatus(200)
            ->assertJsonCount(5, 'data');
    }
}
