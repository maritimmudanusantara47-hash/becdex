<?php

namespace Database\Factories;

use App\Models\Indicator;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Question>
 */
class QuestionFactory extends Factory
{
    public function definition(): array
    {
        return [
            'indicator_id' => Indicator::factory(),
            'text'         => fake()->sentence() . '?',
            'sort_order'   => fake()->numberBetween(1, 100),
        ];
    }
}
