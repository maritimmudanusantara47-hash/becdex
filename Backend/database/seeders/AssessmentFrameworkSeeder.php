<?php
namespace Database\Seeders;
use Illuminate\Database\Seeder;
use App\Models\Aspect;
use App\Models\Outcome;
use App\Models\Principle;

class AssessmentFrameworkSeeder extends Seeder
{
    public function run(): void
    {
        $framework = [
            [
                'name'    => 'Environmental Aspect',
                'name_id' => 'Aspek Lingkungan',
                'outcomes' => [
                    [
                        'name'    => 'Food Security and Reduced Ecological Scarcities',
                        'name_id' => 'Ketahanan Pangan dan Pengurangan Kelangkaan Ekologis',
                        'principles' => [
                            ['name' => 'Biodiversity Conservation', 'name_id' => 'Konservasi Keanekaragaman Hayati'],
                        ],
                    ],
                    [
                        'name'    => 'Food Security and Reduced Environmental Risk',
                        'name_id' => 'Ketahanan Pangan dan Pengurangan Risiko Lingkungan',
                        'principles' => [
                            ['name' => 'Pollution Control',          'name_id' => 'Pengendalian Pencemaran'],
                            ['name' => 'Energy and Water Management','name_id' => 'Manajemen Energi dan Air'],
                        ],
                    ],
                ],
            ],
            [
                'name'    => 'Social Aspect',
                'name_id' => 'Aspek Sosial',
                'outcomes' => [
                    [
                        'name'    => 'Improved Human Well Being',
                        'name_id' => 'Peningkatan Kesejahteraan Manusia',
                        'principles' => [
                            ['name' => 'Safe and Healthy Working Environment', 'name_id' => 'Lingkungan Kerja yang Aman dan Sehat'],
                            ['name' => 'Social Inclusion',                     'name_id' => 'Inklusi Sosial'],
                            ['name' => 'Social Equity',                        'name_id' => 'Keadilan Sosial'],
                        ],
                    ],
                    [
                        'name'    => 'Quality Jobs',
                        'name_id' => 'Pekerjaan Berkualitas',
                        'principles' => [
                            ['name' => 'Labor Right Protection', 'name_id' => 'Perlindungan Hak Tenaga Kerja'],
                        ],
                    ],
                ],
            ],
            [
                'name'    => 'Economic Aspect',
                'name_id' => 'Aspek Ekonomi',
                'outcomes' => [
                    [
                        'name'    => 'Poverty Eradication',
                        'name_id' => 'Pemberantasan Kemiskinan',
                        'principles' => [
                            ['name' => 'Wage Standards Fullfillments', 'name_id' => 'Pemenuhan Standar Upah'],
                        ],
                    ],
                    [
                        'name'    => 'Economic Growth',
                        'name_id' => 'Pertumbuhan Ekonomi',
                        'principles' => [
                            ['name' => 'Tax and Insurance Compliances', 'name_id' => 'Kepatuhan Pajak dan Asuransi'],
                        ],
                    ],
                    [
                        'name'    => 'Sustainable Production and Consumption',
                        'name_id' => 'Produksi dan Konsumsi Berkelanjutan',
                        'principles' => [
                            ['name' => 'Competitive and Circular Economy', 'name_id' => 'Ekonomi Kompetitif dan Sirkular'],
                        ],
                    ],
                ],
            ],
        ];

        foreach ($framework as $asp) {
            $aspect = Aspect::updateOrCreate(
                ['name' => $asp['name']],
                ['name_id' => $asp['name_id']]
            );
            foreach ($asp['outcomes'] as $out) {
                $outcome = Outcome::updateOrCreate(
                    ['name' => $out['name']],
                    ['aspect_id' => $aspect->id, 'name_id' => $out['name_id']]
                );
                foreach ($out['principles'] as $p) {
                    Principle::updateOrCreate(
                        ['name' => $p['name'], 'outcome_id' => $outcome->id],
                        ['name_id' => $p['name_id']]
                    );
                }
            }
        }
    }
}
