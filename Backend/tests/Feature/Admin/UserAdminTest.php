<?php

namespace Tests\Feature\Admin;

use App\Models\User;
use App\Models\Role;
use App\Enums\RoleId;
use Tests\TestCase;
use Illuminate\Foundation\Testing\RefreshDatabase;

class UserAdminTest extends TestCase
{
    use RefreshDatabase;

    // ─── B-F8-01 ──────────────────────────────────────────────────────────────

    /** @test */
    public function admin_can_list_all_users()
    {
        $this->actingAsAdmin();
        User::factory()->count(5)->company()->create();

        $response = $this->getJson('/api/admin/users');

        $response->assertStatus(200)
            ->assertJsonStructure(['data', 'meta']);
    }

    // ─── B-F8-02 ──────────────────────────────────────────────────────────────

    /** @test */
    public function admin_can_create_a_new_user()
    {
        $this->actingAsAdmin();

        $response = $this->postJson('/api/admin/users', [
            'name'      => 'New Company',
            'email'     => 'newcompany@test.com',
            'password'  => 'password123',
            'role_id'   => 2,
            'is_active' => 1,
        ]);

        $response->assertStatus(201);
        $this->assertDatabaseHas('users', ['email' => 'newcompany@test.com']);
    }

    // ─── B-F8-03 ──────────────────────────────────────────────────────────────

    /** @test */
    public function admin_cannot_create_user_with_duplicate_email()
    {
        $this->actingAsAdmin();
        User::factory()->create(['email' => 'existing@test.com']);

        $response = $this->postJson('/api/admin/users', [
            'name'      => 'Another User',
            'email'     => 'existing@test.com',
            'password'  => 'password123',
            'role_id'   => 2,
            'is_active' => 1,
        ]);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['email']);
    }

    // ─── B-F8-04 ──────────────────────────────────────────────────────────────

    /** @test */
    public function admin_can_activate_a_user()
    {
        $this->actingAsAdmin();
        $user = User::factory()->company()->inactive()->create();

        $response = $this->putJson("/api/admin/users/{$user->id}/status", [
            'is_active' => 1,
        ]);

        $response->assertStatus(200);
        $this->assertDatabaseHas('users', [
            'id'        => $user->id,
            'is_active' => 1,
        ]);
    }

    // ─── B-F8-05 ──────────────────────────────────────────────────────────────

    /** @test */
    public function admin_can_delete_a_user()
    {
        $this->actingAsAdmin();
        $user = User::factory()->company()->create();

        $response = $this->deleteJson("/api/admin/users/{$user->id}");

        $response->assertStatus(200);
        $this->assertDatabaseMissing('users', ['id' => $user->id]);
    }

    // ─── B-F8-06 ──────────────────────────────────────────────────────────────

    /** @test */
    public function test_admin_cannot_delete_their_own_account()
    {
        $admin = $this->actingAsAdmin();
        $response = $this->deleteJson('/api/admin/users/' . $admin->id);

        $response->assertStatus(403);
        $this->assertDatabaseHas('users', [
            'id' => $admin->id,
        ]);
    }

    public function test_admin_can_manually_verify_user_email()
    {
        $admin = $this->actingAsAdmin();
        $companyUser = User::factory()->create([
            'role_id' => RoleId::Company->value,
            'is_active' => 0,
            'email_verified_at' => null,
        ]);

        $response = $this->postJson('/api/admin/users/' . $companyUser->id . '/verify');

        $response->assertStatus(200);
        $response->assertJsonFragment([
            'message' => 'Email pengguna berhasil diverifikasi secara manual.',
        ]);

        $this->assertNotNull($companyUser->fresh()->email_verified_at);
    }
}
