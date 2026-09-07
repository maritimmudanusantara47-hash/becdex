<?php

namespace Database\Factories;

use App\Models\Submission;
use App\Models\Question;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Answer>
 */
class AnswerFactory extends Factory
{
    public function definition(): array
    {
        return [
            'submission_id' => Submission::factory(),
            'question_id'   => Question::factory(),
            'value'         => fake()->randomElement([0, 0.5, 1, 2]),
            'valid_value'   => null,
        ];
    }

    /** Value maksimal (2) */
    public function maxValue(): static
    {
        return $this->state(fn (array $attributes) => [
            'value'       => 2,
            'valid_value' => 2,
        ]);
    }

    /** Value setengah (1) */
    public function halfValue(): static
    {
        return $this->state(fn (array $attributes) => [
            'value'       => 1,
            'valid_value' => 1,
        ]);
    }

    /** Value nol */
    public function zeroValue(): static
    {
        return $this->state(fn (array $attributes) => [
            'value'       => 0,
            'valid_value' => 0,
        ]);
    }

    /** Sudah divalidasi admin */
    public function validated(): static
    {
        return $this->state(fn (array $attributes) => [
            'valid_value' => $attributes['value'] ?? 1,
        ]);
    }
}
