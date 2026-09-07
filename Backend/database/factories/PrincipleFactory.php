<?php

namespace Database\Factories;

use App\Models\Aspect;
use App\Models\Outcome;
use App\Models\Principle;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Principle>
 */
class PrincipleFactory extends Factory
{
    public function definition(): array
    {
        $outcome = Outcome::factory()->create();
        return [
            'outcome_id' => $outcome->id,
            'name'       => fake()->unique()->sentence(3),
        ];
    }
}
