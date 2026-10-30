<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Aspect;
use App\Models\Outcome;
use App\Models\Principle;
use Illuminate\Support\Facades\DB;

class AssessmentFrameworkSeeder extends Seeder
{
    public function run(): void
    {
        DB::statement('SET FOREIGN_KEY_CHECKS=0;');

        // 1. Aspects
        $aspects = [
            ['id' => 1, 'name' => 'Environmental Aspect', 'name_id' => 'Aspek Lingkungan'],
            ['id' => 2, 'name' => 'Social Aspect', 'name_id' => 'Aspek Sosial'],
            ['id' => 3, 'name' => 'Economic Aspect', 'name_id' => 'Aspek Ekonomi'],
        ];
        foreach ($aspects as $asp) {
            Aspect::updateOrCreate(['id' => $asp['id']], $asp);
        }

        // 2. Outcomes
        $outcomes = [
            ['id' => 1, 'aspect_id' => 1, 'name' => 'Food Security and Reduced Ecological Scarcities', 'name_id' => 'Ketahanan Pangan dan Berkurangnya Kelangkaan Ekologis'],
            ['id' => 2, 'aspect_id' => 1, 'name' => 'Food Security and Reduced Environmental Risk', 'name_id' => 'Ketahanan Pangan dan Pengurangan Risiko Lingkungan'],
            ['id' => 3, 'aspect_id' => 2, 'name' => 'Improved Human Well Being', 'name_id' => 'Peningkatan Kesejahteraan Manusia'],
            ['id' => 4, 'aspect_id' => 2, 'name' => 'Quality Jobs', 'name_id' => 'Pekerjaan Berkualitas'],
            ['id' => 5, 'aspect_id' => 3, 'name' => 'Poverty Eradication', 'name_id' => 'Pengentasan Kemiskinan'],
            ['id' => 6, 'aspect_id' => 3, 'name' => 'Economic Growth', 'name_id' => 'Pertumbuhan Ekonomi'],
            ['id' => 7, 'aspect_id' => 3, 'name' => 'Sustainable Production and Consumption', 'name_id' => 'Produksi dan Konsumsi Berkelanjutan'],
        ];
        foreach ($outcomes as $out) {
            Outcome::updateOrCreate(['id' => $out['id']], $out);
        }

        // 3. Principles
        $principles = [
            ['id' => 1, 'outcome_id' => 1, 'name' => 'Biodiversity Conservation', 'name_id' => null],
            ['id' => 2, 'outcome_id' => 2, 'name' => 'Pollution Control', 'name_id' => null],
            ['id' => 3, 'outcome_id' => 2, 'name' => 'Energy and Water Management', 'name_id' => null],
            ['id' => 4, 'outcome_id' => 3, 'name' => 'Safe and Healthy Working Environment', 'name_id' => null],
            ['id' => 5, 'outcome_id' => 3, 'name' => 'Social Inclusion', 'name_id' => null],
            ['id' => 6, 'outcome_id' => 3, 'name' => 'Social Equity', 'name_id' => null],
            ['id' => 7, 'outcome_id' => 4, 'name' => 'Labor Right Protection', 'name_id' => null],
            ['id' => 8, 'outcome_id' => 5, 'name' => 'Wage Standards Fulfillments', 'name_id' => null],
            ['id' => 9, 'outcome_id' => 6, 'name' => 'Tax and Insurance Compliances', 'name_id' => null],
            ['id' => 10, 'outcome_id' => 7, 'name' => 'Competitive and Circular Economy', 'name_id' => null],
        ];
        foreach ($principles as $pr) {
            Principle::updateOrCreate(['id' => $pr['id']], $pr);
        }

        DB::statement('SET FOREIGN_KEY_CHECKS=1;');

        $this->command->info('AssessmentFrameworkSeeder: Seeded ' . count($aspects) . ' aspects, ' . count($outcomes) . ' outcomes, and ' . count($principles) . ' principles matching production database.');
    }
}
