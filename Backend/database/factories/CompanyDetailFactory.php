<?php

namespace Database\Factories;

use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\CompanyDetail>
 */
class CompanyDetailFactory extends Factory
{
    public function definition(): array
    {
        return [
            'user_id'          => User::factory()->company(),
            'company_phone'    => fake()->phoneNumber(),
            'pic_name'         => fake()->name(),
            'pic_phone'        => fake()->phoneNumber(),
            'pic_position'     => fake()->jobTitle(),
            'pic_email'        => fake()->safeEmail(),
            'address'          => fake()->address(),
            'company_country'  => 'ID',
            'company_field_id' => null,   // Set to null to avoid FK constraint issues in tests
            'website'          => fake()->url(),
            'description'      => fake()->paragraph(),
        ];
    }

    /** Detail with 100% completed fields */
    public function complete(): static
    {
        return $this->state(fn (array $attributes) => [
            'company_phone'    => '081234567890',
            'company_country'  => 'ID',
            'company_field_id' => 1,
            'brand_name'       => fake()->company(),
            'address'          => fake()->address(),
            'description'      => fake()->paragraph(),
            'pic_name'         => fake()->name(),
            'pic_position'     => 'General Manager',
            'pic_email'        => fake()->safeEmail(),
            'pic_phone'        => '081298765432',
        ]);
    }
}
