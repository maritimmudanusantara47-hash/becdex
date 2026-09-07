<?php

namespace Database\Factories;

use App\Models\Aspect;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Outcome>
 */
class OutcomeFactory extends Factory
{
    public function definition(): array
    {
        return [
            'aspect_id' => Aspect::factory(),
            'name'      => fake()->unique()->sentence(3),
        ];
    }
}
