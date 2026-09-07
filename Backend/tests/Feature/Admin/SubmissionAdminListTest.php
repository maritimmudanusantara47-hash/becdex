<?php

namespace Tests\Feature\Admin;

use App\Models\Submission;
use App\Models\User;
use Tests\TestCase;

class SubmissionAdminListTest extends TestCase
{
    // ─── B-F7-01 ──────────────────────────────────────────────────────────────

    /** @test */
    public function admin_can_list_submissions_default_shows_status_2_3_6_7()
    {
        $this->actingAsAdmin();

        $company = User::factory()->company()->create();

        // Buat 1 submission per status yang seharusnya tampil
        $visible = [];
        foreach ([1, 3, 6, 7, 8] as $statusId) {
            $visible[] = Submission::factory()->create([
                'user_id'              => $company->id,
                'submission_status_id' => $statusId,
            ]);
        }

        // Status yang tidak boleh tampil di default
        $hidden = Submission::factory()->create([
            'user_id'              => $company->id,
            'submission_status_id' => 5, // Certified — tidak dalam default filter
        ]);

        $response = $this->getJson('/api/admin/submissions');

        $response->assertStatus(200)
            ->assertJsonStructure(['data']);

        $returnedIds = collect($response->json('data'))->pluck('id')->toArray();

        foreach ($visible as $submission) {
            $this->assertContains($submission->id, $returnedIds, "Submission status {$submission->submission_status_id} seharusnya tampil.");
        }

        // Karena default filter dihapus, status 5 sekarang seharusnya tampil juga.
        $this->assertContains($hidden->id, $returnedIds, 'Submission status 5 (Certified) sekarang seharusnya tampil di default list.');
    }

    // ─── B-F7-02 ──────────────────────────────────────────────────────────────

    /** @test */
    public function admin_can_filter_submissions_by_specific_status()
    {
        $this->actingAsAdmin();

        $company = User::factory()->company()->create();

        $statusThree = Submission::factory()->create([
            'user_id'              => $company->id,
            'submission_status_id' => 3,
        ]);

        $statusSix = Submission::factory()->create([
            'user_id'              => $company->id,
            'submission_status_id' => 6,
        ]);

        // Filter hanya status 3
        $response = $this->getJson('/api/admin/submissions?status=3');

        $response->assertStatus(200);

        $returnedIds = collect($response->json('data'))->pluck('id')->toArray();

        $this->assertContains($statusThree->id, $returnedIds, 'Submission status 3 seharusnya tampil saat filter status=3.');
        $this->assertNotContains($statusSix->id, $returnedIds, 'Submission status 6 tidak seharusnya tampil saat filter status=3.');
    }

    /** @test */
    public function admin_can_filter_submissions_by_status_5_certified()
    {
        $this->actingAsAdmin();

        $company = User::factory()->company()->create();

        $certified = Submission::factory()->create([
            'user_id'              => $company->id,
            'submission_status_id' => 5,
        ]);

        $response = $this->getJson('/api/admin/submissions?status=5');

        $response->assertStatus(200);

        $returnedIds = collect($response->json('data'))->pluck('id')->toArray();

        $this->assertContains($certified->id, $returnedIds, 'Submission status 5 seharusnya tampil saat filter status=5.');
    }

    /** @test */
    public function non_admin_cannot_access_admin_submission_list()
    {
        $this->actingAsCompany();

        $response = $this->getJson('/api/admin/submissions');

        $response->assertStatus(403);
    }

    /** @test */
    public function admin_list_returns_correct_pagination_structure()
    {
        $this->actingAsAdmin();

        $response = $this->getJson('/api/admin/submissions');

        $response->assertStatus(200)
            ->assertJsonStructure([
                'data',
                'meta' => ['current_page', 'last_page', 'total'],
            ]);
    }
}
