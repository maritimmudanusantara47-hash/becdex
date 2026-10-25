<?php

namespace Tests\Feature\Submission;

use App\Models\CompanyDetail;
use App\Models\User;
use Database\Seeders\AssessmentFrameworkSeeder;
use Tests\TestCase;

class ProfileCompletionValidationTest extends TestCase
{
    protected function setUp(): void
    {
        parent::setUp();
        // Seed indicators and framework for submission creation
        $this->seed(AssessmentFrameworkSeeder::class);
    }

    /** @test */
    public function it_blocks_submission_creation_when_user_has_no_company_detail()
    {
        // User with no companyDetail relation at all
        $user = User::factory()->company()->create([
            'email_verified_at' => now(),
            'legal_documents' => 'docs/legal.pdf',
            'organizational_chart' => 'docs/org.pdf',
            'image' => 'images/logo.png',
        ]);
        $this->actingAs($user);

        $response = $this->postJson('/api/submissions');

        $response->assertStatus(422)
            ->assertJsonStructure([
                'message',
                'completion_percentage',
                'missing_fields',
                'missing_field_labels',
            ]);

        $this->assertContains('company_phone', $response->json('missing_fields'));
        $this->assertContains('address', $response->json('missing_fields'));
        $this->assertContains('pic_phone', $response->json('missing_fields'));
    }

    /** @test */
    public function it_blocks_submission_creation_when_mandatory_profile_fields_are_empty()
    {
        // User with companyDetail but missing documents, address, and company_phone
        $user = $this->actingAsCompany(null, false);
        $user->companyDetail->update([
            'address' => null,
            'company_phone' => null,
            'pic_phone' => '', // pic_phone is not nullable in DB, so test empty string
        ]);
        $user->forceFill([
            'legal_documents' => null,
            'organizational_chart' => null,
            'image' => '',
        ])->save();
        $this->actingAs($user->fresh());

        $response = $this->postJson('/api/submissions');

        $response->assertStatus(422);
        $missing = $response->json('missing_fields');

        $this->assertContains('legal_documents', $missing);
        $this->assertContains('organizational_chart', $missing);
        $this->assertContains('image', $missing);
        $this->assertContains('address', $missing);
        $this->assertContains('company_phone', $missing);
        $this->assertContains('pic_phone', $missing);
        $this->assertLessThan(100, $response->json('completion_percentage'));
    }

    /** @test */
    public function it_blocks_submission_creation_when_email_is_unverified()
    {
        $user = $this->actingAsCompany();
        $user->forceFill(['email_verified_at' => null])->save();
        $this->actingAs($user->fresh());

        $response = $this->postJson('/api/submissions');

        // verified middleware or strict validation blocks it with 403 or 422
        $this->assertTrue(in_array($response->status(), [403, 422]));
        $this->assertFalse($user->fresh()->hasVerifiedEmail());
        $this->assertContains('email_verified', $user->fresh()->getMissingProfileFields());
    }

    /** @test */
    public function it_allows_submission_creation_when_profile_is_100_percent_complete()
    {
        $user = $this->actingAsCompany(null, true);

        $this->assertTrue($user->isProfileComplete());
        $this->assertEquals(100, $user->getProfileCompletionPercentage());
        $this->assertEmpty($user->getMissingProfileFields());

        $response = $this->postJson('/api/submissions');

        $response->assertStatus(201);
        $this->assertDatabaseHas('submissions', [
            'user_id' => $user->id,
            'submission_status_id' => 2,
        ]);
    }

    /** @test */
    public function brand_name_falls_back_to_company_name_if_empty()
    {
        $user = $this->actingAsCompany(null, true);
        $user->companyDetail->update(['brand_name' => null]);

        // When company name is present, brand_name fallback is satisfied
        $this->assertFalse(in_array('brand_name', $user->getMissingProfileFields()));
        $this->assertTrue($user->isProfileComplete());
    }

    /** @test */
    public function it_returns_profile_completion_details_in_auth_me_endpoint()
    {
        $user = $this->actingAsCompany(null, true);

        $response = $this->getJson('/api/auth/me');

        $response->assertStatus(200)
            ->assertJsonPath('data.is_profile_complete', true)
            ->assertJsonPath('data.profile_completion_percentage', 100)
            ->assertJsonPath('data.missing_fields', []);
    }
}
