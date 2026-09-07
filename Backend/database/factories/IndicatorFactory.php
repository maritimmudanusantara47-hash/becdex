<?php

namespace Database\Factories;

use App\Models\Principle;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Indicator>
 */
class IndicatorFactory extends Factory
{
    public function definition(): array
    {
        return [
            'principle_id' => Principle::factory(),
            'name'         => fake()->unique()->sentence(4),
            'description'  => null,
            'sort_order'   => fake()->numberBetween(1, 100),
        ];
    }
}
