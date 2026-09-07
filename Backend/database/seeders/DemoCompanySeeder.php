<?php

namespace Database\Seeders;

use App\Enums\RoleId;
use App\Models\Answer;
use App\Models\Certificate;
use App\Models\CertificateUser;
use App\Models\CompanyDetail;
use App\Models\Document;
use App\Models\FieldSurvey;
use App\Models\Question;
use App\Models\Submission;
use App\Models\SubmissionPerIndicator;
use App\Models\Survey;
use App\Models\User;
use App\Services\CertificateNumberService;
use Carbon\Carbon;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

class DemoCompanySeeder extends Seeder
{
    /**
     * Seed 3 demo companies with fully completed submission flow (certified).
     */
    public function run(): void
    {
        $companies = [
            [
                'name'             => 'Aqua Bio Fresh',
                'email'            => 'aquabiofresh@gmail.com',
                'company_phone'    => '081200000001',
                'company_country'  => 'ID',
                'company_field_id' => 1, // Marine Fisheries and Aquaculture
                'pic_name'         => 'Budi Santoso',
                'pic_position'     => 'CEO',
                'pic_email'        => 'aquabiofresh@gmail.com',
                'pic_phone'        => '081200000001',
                'address'          => 'Jl. Raya Bogor No. 1, Jakarta Timur',
                'certificate_category' => 11, // excellent
                'becdex_category_id'   => 4,  // Excellent Economy Company
            ],
            [
                'name'             => 'Crustea',
                'email'            => 'crustea@gmail.com',
                'company_phone'    => '081200000002',
                'company_country'  => 'ID',
                'company_field_id' => 1, // Marine Fisheries and Aquaculture
                'pic_name'         => 'Siti Rahayu',
                'pic_position'     => 'Direktur',
                'pic_email'        => 'crustea@gmail.com',
                'pic_phone'        => '081200000002',
                'address'          => 'Jl. Pantura No. 55, Semarang',
                'certificate_category' => 10, // good
                'becdex_category_id'   => 3,  // Good Blue Economy Company
            ],
            [
                'name'             => 'Ikan Segar Indonesia',
                'email'            => 'ikansegarid@gmail.com',
                'company_phone'    => '081200000003',
                'company_country'  => 'ID',
                'company_field_id' => 1, // Marine Fisheries and Aquaculture
                'pic_name'         => 'Ahmad Fauzi',
                'pic_position'     => 'Direktur Utama',
                'pic_email'        => 'ikansegarid@gmail.com',
                'pic_phone'        => '081200000003',
                'address'          => 'Jl. Ikan Mas No. 12, Surabaya',
                'certificate_category' => 10, // good
                'becdex_category_id'   => 3,  // Good Blue Economy Company
            ],
        ];

        $questions  = Question::all();
        $adminUser  = User::whereIn('role_id', RoleId::adminRoleIds())->first();
        $publishedAt = Carbon::create(2026, 7, 1); // July 2026

        foreach ($companies as $companyData) {
            // ── 1. Create or update user ───────────────────────────────────────────
            $user = User::firstOrCreate(
                ['email' => $companyData['email']],
                [
                    'name'              => $companyData['name'],
                    'password'          => Hash::make('user12345'),
                    'role_id'           => RoleId::Company->value,
                    'is_active'         => 1,
                    'email_verified_at' => now(),
                ]
            );

            // Ensure password, active status, and verified status are correct even if user existed
            $user->update([
                'password'          => Hash::make('user12345'),
                'is_active'         => 1,
                'email_verified_at' => now(),
            ]);


            // ── 2. Create or update company detail ────────────────────────────────
            CompanyDetail::updateOrCreate(
                ['user_id' => $user->id],
                [
                    'company_phone'    => $companyData['company_phone'],
                    'company_country'  => $companyData['company_country'],
                    'company_field_id' => $companyData['company_field_id'],
                    'pic_name'         => $companyData['pic_name'],
                    'pic_position'     => $companyData['pic_position'],
                    'pic_email'        => $companyData['pic_email'],
                    'pic_phone'        => $companyData['pic_phone'],
                    'address'          => $companyData['address'],
                    'becdex_category_id' => $companyData['becdex_category_id'],
                ]
            );

            // ── 3. Skip if already certified ──────────────────────────────────────
            $existingCert = Submission::where('user_id', $user->id)
                ->where('submission_status_id', 5)
                ->exists();

            if ($existingCert) {
                $this->command->info("Skipping {$companyData['name']} — already certified.");
                continue;
            }

            // ── 4. Create submission (Status 2: Document Submission) ───────────────
            $submission = Submission::create([
                'user_id'              => $user->id,
                'submission_status_id' => 2,
                'initial_score'        => 100,
                'valid_score'          => 100,
            ]);

            // ── 5. Seed SubmissionPerIndicator rows (one per question/indicator) ───
            $indicatorIds = $questions->pluck('indicator_id')->unique();
            foreach ($indicatorIds as $indicatorId) {
                SubmissionPerIndicator::firstOrCreate([
                    'submission_id'          => $submission->id,
                    'indicator_id'           => $indicatorId,
                ], [
                    'per_indicator_status_id' => 3, // Verified
                ]);
            }

            // ── 6. Seed Answers (all questions answered with value 2 = max) ────────
            foreach ($questions as $question) {
                Answer::updateOrCreate(
                    ['submission_id' => $submission->id, 'question_id' => $question->id],
                    ['value' => 2, 'valid_value' => 2]
                );
            }

            // ── 7. Upload 35 dummy documents ──────────────────────────────────────
            $docIndicatorIds = $indicatorIds->take(35)->values();
            foreach ($docIndicatorIds as $i => $indicatorId) {
                Document::create([
                    'submission_id' => $submission->id,
                    'indicator_id'  => $indicatorId,
                    'file_path'     => 'documents/demo/placeholder_doc_' . ($i + 1) . '.pdf',
                    'original_name' => 'Dokumen_Bukti_' . ($i + 1) . '.pdf',
                    'mime_type'     => 'application/pdf',
                    'file_size'     => 102400, // 100KB
                ]);
            }

            // ── 8. Move to Status 3: On Verification ──────────────────────────────
            $submission->update([
                'submission_status_id' => 3,
                'initial_score'        => 100,
                'valid_score'          => 100,
            ]);

            // ── 9. Move to Status 8: Approved (passed verification) ───────────────
            $submission->update(['submission_status_id' => 8]);

            // ── 10. Simulate payment ──────────────────────────────────────────────
            DB::table('payment_transactions')->insert([
                'submission_id'      => $submission->id,
                'user_id'            => $user->id,
                'order_id'           => 'ORDER-DEMO-' . strtoupper(Str::random(8)),
                'amount'             => 3500000,
                'transaction_status' => 'settlement',
                'payment_type'       => 'demo',
                'paid_at'            => now(),
                'created_at'         => now(),
                'updated_at'         => now(),
            ]);

            // ── 11. Move to Status 6: Payment Successful ──────────────────────────
            $submission->update(['submission_status_id' => 6]);

            // ── 12. Schedule + complete field survey → Status 7 ───────────────────
            FieldSurvey::create([
                'submission_id' => $submission->id,
                'assessor_id'   => $adminUser?->id ?? $user->id,
                'scheduled_at'  => $publishedAt->copy()->subDays(7),
                'status'        => 'completed',
                'notes'         => 'Survei lapangan selesai dilaksanakan. Semua dokumen terverifikasi.',
            ]);

            $submission->update(['submission_status_id' => 7]);

            // ── 13. Issue Certificate ─────────────────────────────────────────────
            $certNumber = CertificateNumberService::generate(
                $publishedAt->toDateString(),
                $companyData['company_country']
            );

            CertificateUser::updateOrCreate(
                ['submission_id' => $submission->id],
                [
                    'certificate_id' => $companyData['certificate_category'],
                    'user_id'        => $user->id,
                    'mmic'           => $certNumber,
                    'direktur'       => 'Rahmat Ihsan, S.H.',
                    'published_at'   => $publishedAt->toDateString(),
                    'valid_until'    => $publishedAt->copy()->addYears(3)->toDateString(),
                ]
            );

            // ── 14. Move to Status 5: Certified ───────────────────────────────────
            $submission->update(['submission_status_id' => 5]);

            $this->command->info("✓ {$companyData['name']} certified with number: {$certNumber}");
        }

        $this->command->info('DemoCompanySeeder completed.');
    }
}
