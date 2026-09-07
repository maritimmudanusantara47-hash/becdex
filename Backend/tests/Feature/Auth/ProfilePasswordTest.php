<?php

namespace Tests\Feature\Auth;

use App\Models\User;
use Tests\TestCase;

class ProfilePasswordTest extends TestCase
{
    // ─── B-F1-10 ──────────────────────────────────────────────────────────────

    /** @test */
    public function it_updates_company_profile_successfully()
    {
        $user = $this->actingAsCompany();

        $response = $this->putJson('/api/auth/profile', [
            'name'         => 'PT Updated Name',
            'company_phone'=> '0812999888',
            'pic_name'     => 'Budi Updated',
            'pic_position' => 'Director',
            'pic_phone'    => '0813777666',
            'pic_email'    => 'budi@updated.com',
            'address'      => 'Jl. Baru No. 99',
        ]);

        $response->assertStatus(200);
        $this->assertDatabaseHas('users', [
            'id'   => $user->id,
            'name' => 'PT Updated Name',
        ]);
    }

    /** @test */
    public function it_rejects_profile_update_with_invalid_email()
    {
        $this->actingAsCompany();

        $response = $this->putJson('/api/auth/profile', [
            'pic_email' => 'bukan-email-valid',
        ]);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['pic_email']);
    }

    // ─── B-F1-11 ──────────────────────────────────────────────────────────────

    /** @test */
    public function it_changes_password_successfully_with_correct_current_password()
    {
        $user = User::factory()->company()->create([
            'password' => bcrypt('current-password'),
        ]);
        $this->actingAs($user);

        $response = $this->putJson('/api/auth/password', [
            'current_password'      => 'current-password',
            'password'              => 'new-password-123',
            'password_confirmation' => 'new-password-123',
        ]);

        $response->assertStatus(200);

        // Pastikan password di DB benar-benar berubah
        $user->refresh();
        $this->assertTrue(
            \Illuminate\Support\Facades\Hash::check('new-password-123', $user->password),
            'Password harus berhasil diubah.'
        );
    }

    // ─── B-F1-12 ──────────────────────────────────────────────────────────────

    /** @test */
    public function it_rejects_password_change_if_current_password_is_wrong()
    {
        $user = User::factory()->company()->create([
            'password' => bcrypt('correct-password'),
        ]);
        $this->actingAs($user);

        $response = $this->putJson('/api/auth/password', [
            'current_password'      => 'wrong-password',
            'password'              => 'new-password-123',
            'password_confirmation' => 'new-password-123',
        ]);

        $response->assertStatus(422);
    }

    /** @test */
    public function it_rejects_password_change_if_confirmation_does_not_match()
    {
        $user = User::factory()->company()->create([
            'password' => bcrypt('correct-password'),
        ]);
        $this->actingAs($user);

        $response = $this->putJson('/api/auth/password', [
            'current_password'      => 'correct-password',
            'password'              => 'new-password-123',
            'password_confirmation' => 'different-password',
        ]);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['password']);
    }
}
