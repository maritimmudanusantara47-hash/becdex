<?php

namespace Tests\Feature\Auth;

use App\Models\Country;
use App\Models\CompanyField;
use App\Models\User;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Tests\TestCase;

class RegisterTest extends TestCase
{
    private function validRegisterPayload(array $overrides = []): array
    {
        return array_merge([
            'name'                  => 'PT Test Perusahaan',
            'email'                 => 'company@test.com',
            'password'              => 'password123',
            'password_confirmation' => 'password123',
            'company_phone'         => '0812345678',
            'pic_name'              => 'Budi Santoso',
            'pic_phone'             => '0812345679',
            'pic_email'             => 'budi@company.com',
            'pic_position'          => 'Manager',
            'address'               => 'Jl. Test No. 1, Jakarta',
            'terms_accepted'        => true,
        ], $overrides);
    }

    private function seedMasterData(): void
    {
        Country::updateOrCreate(['id' => 1], ['iso' => 'ID', 'name' => 'Indonesia']);
        CompanyField::updateOrCreate(['id' => 1], ['name' => 'Perikanan', 'description' => 'Sektor Perikanan']);
    }

    // ─── B-F1-01 ──────────────────────────────────────────────────────────────

    /** @test */
    public function it_registers_successfully_with_valid_data()
    {
        $this->seedMasterData();

        $response = $this->postJson('/api/auth/register', $this->validRegisterPayload());

        $response->assertStatus(201);
        $this->assertDatabaseHas('users', [
            'email'     => 'company@test.com',
            'role_id'   => 2,
            'is_active' => 0, // pending activation
        ]);
    }

    // ─── B-F1-02 ──────────────────────────────────────────────────────────────

    /** @test */
    public function it_fails_registration_if_email_is_already_taken()
    {
        $this->seedMasterData();
        User::factory()->company()->create(['email' => 'company@test.com']);

        $response = $this->postJson('/api/auth/register', $this->validRegisterPayload());

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['email']);
    }

    // ─── B-F1-03 ──────────────────────────────────────────────────────────────

    /** @test */
    public function it_fails_registration_if_required_fields_are_missing()
    {
        $response = $this->postJson('/api/auth/register', ['name' => 'Test']);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['email', 'password']);
    }
}
