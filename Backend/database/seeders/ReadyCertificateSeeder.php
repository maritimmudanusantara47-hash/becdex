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
use App\Models\User;
use App\Services\CertificateNumberService;
use Carbon\Carbon;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

class ReadyCertificateSeeder extends Seeder
{
    public function run(): void
    {
        $questions = Question::all();
        $adminUser = User::whereIn('role_id', RoleId::adminRoleIds())->first();
        $indicatorIds = $questions->pluck('indicator_id')->unique();
        $publishedAt = Carbon::now();

        // =========================================================================
        // AKUN 1: PT Bahari Sertifikasi Nusantara (Sertifikat SUDAH TERBIT & APPROVED)
        // Pengguna bisa langsung login dan langsung cek/download hasil PDF sertifikat
        // =========================================================================
        $userIssued = User::updateOrCreate(
            ['email' => 'sertifikat@becdex.com'],
            [
                'name'              => 'PT Bahari Sertifikasi Nusantara',
                'password'          => Hash::make('password123'),
                'role_id'           => RoleId::Company->value,
                'is_active'         => 1,
                'email_verified_at' => now(),
            ]
        );

        CompanyDetail::updateOrCreate(
            ['user_id' => $userIssued->id],
            [
                'company_phone'      => '02189012345',
                'company_country'    => 'ID',
                'company_field_id'   => 1, // Marine Fisheries and Aquaculture
                'pic_name'           => 'Dewi Lestari',
                'pic_position'       => 'Direktur Eksekutif',
                'pic_email'          => 'sertifikat@becdex.com',
                'pic_phone'          => '081298765432',
                'address'            => 'Kawasan Industri Maritim Blok A-12, Surabaya, Jawa Timur',
                'becdex_category_id' => 4, // Excellent Economy Company
            ]
        );

        // Cari atau buat submission untuk user ini
        $subIssued = Submission::firstOrCreate(
            ['user_id' => $userIssued->id],
            [
                'submission_status_id' => 5, // Certified
                'initial_score'        => 98.0,
                'valid_score'          => 98.0,
            ]
        );
        $subIssued->update([
            'submission_status_id' => 5,
            'initial_score'        => 98.0,
            'valid_score'          => 98.0,
        ]);

        // Seed SubmissionPerIndicator
        foreach ($indicatorIds as $indicatorId) {
            SubmissionPerIndicator::updateOrCreate(
                ['submission_id' => $subIssued->id, 'indicator_id' => $indicatorId],
                ['per_indicator_status_id' => 4] // Verified
            );
        }

        // Seed Answers
        foreach ($questions as $question) {
            Answer::updateOrCreate(
                ['submission_id' => $subIssued->id, 'question_id' => $question->id],
                ['value' => 2, 'valid_value' => 2]
            );
        }

        // 35 Dummy Documents
        $docIndicatorIds = $indicatorIds->take(35)->values();
        foreach ($docIndicatorIds as $i => $indicatorId) {
            Document::firstOrCreate(
                ['submission_id' => $subIssued->id, 'indicator_id' => $indicatorId],
                [
                    'file_path'     => 'documents/demo/doc_' . ($i + 1) . '.pdf',
                    'original_name' => 'Dokumen_Audit_' . ($i + 1) . '.pdf',
                    'mime_type'     => 'application/pdf',
                    'file_size'     => 102400,
                ]
            );
        }

        // Payment
        DB::table('payment_transactions')->updateOrInsert(
            ['submission_id' => $subIssued->id],
            [
                'user_id'            => $userIssued->id,
                'order_id'           => 'ORDER-CERT-' . strtoupper(Str::random(6)),
                'amount'             => 3500000,
                'transaction_status' => 'settlement',
                'payment_type'       => 'bank_transfer',
                'paid_at'            => now(),
                'created_at'         => now(),
                'updated_at'         => now(),
            ]
        );

        // Field survey
        FieldSurvey::updateOrCreate(
            ['submission_id' => $subIssued->id],
            [
                'assessor_id'   => $adminUser?->id ?? $userIssued->id,
                'scheduled_at'  => $publishedAt->copy()->subDays(3),
                'status'        => 'completed',
                'notes'         => 'Survei lapangan selesai dengan hasil sangat memuaskan.',
            ]
        );

        // Certificate User
        $certNumber = CertificateNumberService::generate($publishedAt->toDateString(), 'ID');
        CertificateUser::updateOrCreate(
            ['submission_id' => $subIssued->id],
            [
                'certificate_id' => 11, // Excellent
                'user_id'        => $userIssued->id,
                'mmic'           => $certNumber,
                'direktur'       => 'Rahmat Ihsan, S.H.',
                'published_at'   => $publishedAt->toDateString(),
                'valid_until'    => $publishedAt->copy()->addYears(3)->toDateString(),
                'is_approved'    => true, // langsung approved agar bisa dicek & didownload
            ]
        );

        // =========================================================================
        // AKUN 2: PT Samudera Siap Terbit (STATUS 7: Survei Selesai - SIAP DITERBITKAN)
        // Untuk menguji tombol "Terbitkan Sertifikat" di dashboard admin
        // =========================================================================
        $userReady = User::updateOrCreate(
            ['email' => 'siapterbit@becdex.com'],
            [
                'name'              => 'PT Samudera Siap Terbit',
                'password'          => Hash::make('password123'),
                'role_id'           => RoleId::Company->value,
                'is_active'         => 1,
                'email_verified_at' => now(),
            ]
        );

        CompanyDetail::updateOrCreate(
            ['user_id' => $userReady->id],
            [
                'company_phone'      => '02176543210',
                'company_country'    => 'ID',
                'company_field_id'   => 1,
                'pic_name'           => 'Budi Prasetyo',
                'pic_position'       => 'Direktur Operasional',
                'pic_email'          => 'siapterbit@becdex.com',
                'pic_phone'          => '081345678901',
                'address'            => 'Jl. Dermaga Pelabuhan No. 88, Tanjung Priok, Jakarta Utara',
                'becdex_category_id' => 4,
            ]
        );

        $subReady = Submission::firstOrCreate(
            ['user_id' => $userReady->id],
            [
                'submission_status_id' => 7, // Continue To Location Survey / Field Survey Completed
                'initial_score'        => 95.0,
                'valid_score'          => 95.0,
            ]
        );
        $subReady->update([
            'submission_status_id' => 7,
            'initial_score'        => 95.0,
            'valid_score'          => 95.0,
        ]);

        foreach ($indicatorIds as $indicatorId) {
            SubmissionPerIndicator::updateOrCreate(
                ['submission_id' => $subReady->id, 'indicator_id' => $indicatorId],
                ['per_indicator_status_id' => 4]
            );
        }

        foreach ($questions as $question) {
            Answer::updateOrCreate(
                ['submission_id' => $subReady->id, 'question_id' => $question->id],
                ['value' => 2, 'valid_value' => 2]
            );
        }

        foreach ($docIndicatorIds as $i => $indicatorId) {
            Document::firstOrCreate(
                ['submission_id' => $subReady->id, 'indicator_id' => $indicatorId],
                [
                    'file_path'     => 'documents/demo/ready_doc_' . ($i + 1) . '.pdf',
                    'original_name' => 'Dokumen_Bukti_' . ($i + 1) . '.pdf',
                    'mime_type'     => 'application/pdf',
                    'file_size'     => 102400,
                ]
            );
        }

        DB::table('payment_transactions')->updateOrInsert(
            ['submission_id' => $subReady->id],
            [
                'user_id'            => $userReady->id,
                'order_id'           => 'ORDER-READY-' . strtoupper(Str::random(6)),
                'amount'             => 3500000,
                'transaction_status' => 'settlement',
                'payment_type'       => 'bank_transfer',
                'paid_at'            => now(),
                'created_at'         => now(),
                'updated_at'         => now(),
            ]
        );

        FieldSurvey::updateOrCreate(
            ['submission_id' => $subReady->id],
            [
                'assessor_id'   => $adminUser?->id ?? $userReady->id,
                'scheduled_at'  => $publishedAt->copy()->subDays(2),
                'status'        => 'completed',
                'notes'         => 'Survei lokasi selesai. Seluruh kriteria kelulusan terpenuhi dan siap diterbitkan sertifikat.',
            ]
        );

        $this->command->info("✓ Akun 1 (Sertifikat Siap Download/Lihat): sertifikat@becdex.com / password123 (Sub ID: {$subIssued->id})");
        $this->command->info("✓ Akun 2 (Status 7 Siap Diterbitkan Admin): siapterbit@becdex.com / password123 (Sub ID: {$subReady->id})");
    }
}
