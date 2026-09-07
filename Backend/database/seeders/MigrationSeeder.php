<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

class MigrationSeeder extends Seeder
{
    public function run(): void
    {
        DB::statement('SET FOREIGN_KEY_CHECKS=0;');

        // Truncate tables to prevent duplicates
        DB::table('users')->truncate();
        DB::table('company_details')->truncate();
        DB::table('submissions')->truncate();
        DB::table('answers')->truncate();
        DB::table('documents')->truncate();
        DB::table('submission_per_indicators')->truncate();
        DB::table('payment_transactions')->truncate();
        DB::table('certificate_users')->truncate();
        DB::table('surveys')->truncate();
        DB::table('help_messages')->truncate();
        DB::table('downloads')->truncate();

        // 1. Migrate Users
        $oldUsers = DB::table('db_bacdex.user')->get();
        foreach ($oldUsers as $u) {
            DB::table('users')->insert([
                'id' => $u->id,
                'name' => $u->name,
                'email' => $u->email,
                'password' => $u->password,
                'image' => $u->image ?: 'default.jpg',
                'role_id' => $u->role_id,
                'is_active' => $u->is_active,
                'legal_documents' => $u->legal_documents,
                'organizational_chart' => $u->organizational_chart,
                'created_at' => Carbon::createFromTimestamp($u->date_created),
                'updated_at' => Carbon::createFromTimestamp($u->date_created),
            ]);
        }

        // 2. Migrate Company Details
        $oldCompanyDetails = DB::table('db_bacdex.company_detail')->get();
        foreach ($oldCompanyDetails as $cd) {
            DB::table('company_details')->insert([
                'user_id' => $cd->user_id,
                'company_phone' => $cd->company_phone,
                'company_country' => substr($cd->company_country, 0, 3), // Ensure 3 chars max
                'company_field_id' => $cd->company_field,
                'pic_name' => $cd->pic_name,
                'pic_position' => $cd->pic_position,
                'pic_email' => $cd->pic_email,
                'pic_phone' => $cd->pic_phone,
                'becdex_category_id' => $cd->becdex_category_id,
                'description' => $cd->description_company,
                'address' => $cd->address,
                'website' => $cd->weblink,
                'brand_name' => $cd->company_brand,
                'created_at' => now(),
                'updated_at' => now(),
            ]);
        }

        // 3. Migrate Submissions
        $oldSubmissions = DB::table('db_bacdex.submission')->get();
        foreach ($oldSubmissions as $s) {
            DB::table('submissions')->insert([
                'id' => $s->id_submission,
                'user_id' => $s->user_id,
                'submission_status_id' => $s->submission_status_id,
                'initial_score' => $s->initial_score,
                'valid_score' => $s->valid_score,
                'survey_score' => 0,
                'reason' => $s->reason,
                'qr_code_path' => $s->qr_code_alamat,
                'created_at' => $s->date_started,
                'updated_at' => $s->date_started,
            ]);
        }

        // 4. Migrate Answers
        $insertedAnswers = [];
        $oldAnswers = DB::table('db_bacdex.answer')->get();
        foreach ($oldAnswers as $a) {
            $key = $a->submission_id . '-' . $a->question_id;
            if (in_array($key, $insertedAnswers)) {
                continue;
            }
            $insertedAnswers[] = $key;

            DB::table('answers')->insert([
                'id' => $a->id_answer,
                'submission_id' => $a->submission_id,
                'question_id' => $a->question_id,
                'value' => is_numeric($a->value) ? (int)$a->value : null,
                'valid_value' => is_numeric($a->valid_value) ? (int)$a->valid_value : null,
                'created_at' => now(),
                'updated_at' => now(),
            ]);
        }

        // 5. Migrate Documents
        $oldDocuments = DB::table('db_bacdex.document')->get();
        foreach ($oldDocuments as $d) {
            DB::table('documents')->insert([
                'id' => $d->id_document,
                'submission_id' => $d->submission_id,
                'indicator_id' => $d->indicator_id,
                'file_path' => 'documents/' . basename($d->file),
                'original_name' => basename($d->file),
                'mime_type' => 'application/pdf',
                'file_size' => null,
                'created_at' => $d->upload_date,
                'updated_at' => $d->upload_date,
            ]);
        }

        // 6. Migrate Submission Per Indicators
        $insertedSpi = [];
        $oldSubPerInd = DB::table('db_bacdex.submission_per_indicator')->get();
        foreach ($oldSubPerInd as $spi) {
            $key = $spi->submission_id . '-' . $spi->indicator_id;
            if (in_array($key, $insertedSpi)) {
                continue;
            }
            $insertedSpi[] = $key;

            DB::table('submission_per_indicators')->insert([
                'submission_id' => $spi->submission_id,
                'indicator_id' => $spi->indicator_id,
                'per_indicator_status_id' => $spi->status,
                'comment' => $spi->comment,
                'created_at' => now(),
                'updated_at' => now(),
            ]);
        }

        // 7. Migrate Payments
        $oldPayments = DB::table('db_bacdex.payment')->get();
        foreach ($oldPayments as $p) {
            $sub = DB::table('submissions')->where('id', $p->submission_id)->first();
            $userId = $sub ? $sub->user_id : 1;

            DB::table('payment_transactions')->insert([
                'id' => $p->id_payment,
                'submission_id' => $p->submission_id,
                'user_id' => $userId,
                'order_id' => 'MIGRATE-PAY-' . $p->id_payment,
                'amount' => 100000.00, // Default fee in IDR
                'payment_type' => 'manual_transfer',
                'transaction_status' => $p->status == 1 ? 'settlement' : 'pending',
                'va_number' => null,
                'bank' => 'Manual',
                'xendit_invoice_id' => null,
                'invoice_url' => null,
                'paid_at' => $p->status == 1 ? $p->upload_date : null,
                'created_at' => $p->upload_date,
                'updated_at' => $p->upload_date,
            ]);
        }

        // 8. Migrate Certificate Users
        $oldCertUsers = DB::table('db_bacdex.certificate_user')->get();
        foreach ($oldCertUsers as $cu) {
            DB::table('certificate_users')->insert([
                'id' => $cu->id_certificate_user,
                'submission_id' => $cu->id_submission,
                'certificate_id' => $cu->id_certificate,
                'user_id' => $cu->id_user,
                'mmic' => $cu->mmic,
                'direktur' => $cu->direktur,
                'published_at' => $cu->tanggal_publish,
                'valid_until' => $cu->valid_until,
                'created_at' => now(),
                'updated_at' => now(),
            ]);
        }

        // 9. Migrate Surveys
        $oldSurveys = DB::table('db_bacdex.survey')->get();
        foreach ($oldSurveys as $s) {
            DB::table('surveys')->insert([
                'id' => $s->id_survey,
                'submission_id' => $s->submission_id,
                'scheduled_at' => $s->datetime,
                'location_link' => $s->link,
                'notes' => $s->keterangan,
                'created_at' => now(),
                'updated_at' => now(),
            ]);
        }

        // 10. Migrate Help Messages
        $oldHelp = DB::table('db_bacdex.tb_help')->get();
        foreach ($oldHelp as $h) {
            DB::table('help_messages')->insert([
                'id' => $h->id,
                'name' => $h->nama,
                'email' => $h->email,
                'whatsapp' => $h->no_whatsapp,
                'issue_type' => $h->jenis_masalah,
                'detail' => $h->detail,
                'is_read' => 0,
                'created_at' => now(),
                'updated_at' => now(),
            ]);
        }

        // 11. Migrate Downloads
        $oldDownloads = DB::table('db_bacdex.download')->get();
        foreach ($oldDownloads as $d) {
            DB::table('downloads')->insert([
                'id' => $d->id,
                'title' => $d->title,
                'file_path' => 'downloads/' . basename($d->file),
                'created_at' => now(),
                'updated_at' => now(),
            ]);
        }

        DB::statement('SET FOREIGN_KEY_CHECKS=1;');
    }
}
