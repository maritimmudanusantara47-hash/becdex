<?php

namespace Database\Factories;

use App\Models\Role;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\User>
 */
class UserFactory extends Factory
{
    /**
     * The current password being used by the factory.
     */
    protected static ?string $password;

    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'name'              => fake()->name(),
            'email'             => fake()->unique()->safeEmail(),
            'email_verified_at' => now(),
            'password'          => static::$password ??= Hash::make('password'),
            'remember_token'    => Str::random(10),
            'role_id'           => 2,  // company by default
            'is_active'         => 1,
        ];
    }

    /** Super Admin */
    public function admin(): static
    {
        return $this->state(fn (array $attributes) => [
            'role_id'   => 1,
            'is_active' => 1,
        ]);
    }

    /** Company user (role 2) */
    public function company(): static
    {
        return $this->state(fn (array $attributes) => [
            'role_id'   => 2,
            'is_active' => 1,
        ]);
    }

    /** Reviewer / Assessor (role 6) */
    public function reviewer(): static
    {
        return $this->state(fn (array $attributes) => [
            'role_id'   => 6,
            'is_active' => 1,
        ]);
    }

    /** Inactive / pending activation */
    public function inactive(): static
    {
        return $this->state(fn (array $attributes) => [
            'is_active' => 0,
        ]);
    }

    /** Rejected */
    public function rejected(): static
    {
        return $this->state(fn (array $attributes) => [
            'is_active' => 2,
        ]);
    }

    /**
     * Indicate that the model's email address should be unverified.
     */
    public function unverified(): static
    {
        return $this->state(fn (array $attributes) => [
            'email_verified_at' => null,
        ]);
    }
}

