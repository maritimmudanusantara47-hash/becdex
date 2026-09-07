<?php

namespace Database\Factories;

use App\Models\Submission;
use App\Models\Indicator;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Document>
 */
class DocumentFactory extends Factory
{
    public function definition(): array
    {
        return [
            'submission_id' => Submission::factory(),
            'indicator_id'  => Indicator::factory(),
            'file_path'     => 'documents/' . fake()->uuid() . '/test.pdf',
            'original_name' => fake()->word() . '.pdf',
            'mime_type'     => 'application/pdf',
            'file_size'     => fake()->numberBetween(10000, 5000000),
        ];
    }
}
