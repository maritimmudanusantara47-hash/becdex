<?php

namespace Tests\Feature\Auth;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Password;
use Tests\TestCase;
use App\Enums\RoleId;
use Illuminate\Support\Facades\Hash;

class PasswordResetTest extends TestCase
{
    use RefreshDatabase;

    public function test_forgot_password_sends_reset_link()
    {
        $user = User::factory()->create(['role_id' => RoleId::Company->value]);

        $response = $this->postJson('/api/auth/forgot-password', [
            'email' => $user->email,
        ]);

        $response->assertStatus(200);
        $response->assertJsonStructure(['message']);
    }

    public function test_reset_password_resets_password()
    {
        $user = User::factory()->create([
            'role_id' => RoleId::Company->value,
            'password' => Hash::make('oldpassword123')
        ]);

        $token = Password::createToken($user);

        $response = $this->postJson('/api/auth/reset-password', [
            'token' => $token,
            'email' => $user->email,
            'password' => 'newpassword123',
            'password_confirmation' => 'newpassword123',
        ]);

        $response->assertStatus(200);
        $response->assertJsonStructure(['message']);
        
        $this->assertTrue(Hash::check('newpassword123', $user->fresh()->password));
    }
}
