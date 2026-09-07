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
}
