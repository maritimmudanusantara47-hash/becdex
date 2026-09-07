<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Enums\RoleId;
use App\Http\Requests\Admin\IssueCertificateRequest;
use App\Http\Resources\SubmissionResource;
use App\Http\Resources\UserResource;
use App\Models\CertificateUser;
use App\Models\Submission;
use App\Models\SubmissionPerIndicator;
use App\Models\FieldSurvey;
use App\Models\ActivityLog;
use App\Notifications\SystemNotification;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;
use App\Mail\SubmissionStatusMail;
use App\Mail\CertificateIssuedMail;
use Illuminate\Support\Facades\Auth;
use App\Models\Answer;
use App\Services\CertificateNumberService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class SubmissionAdminController extends Controller
{
    /**
     * GET /api/admin/submissions
     * Semua submission yang perlu diverifikasi
     */
    public function index(Request $request): JsonResponse
    {
        $query = Submission::with(['user', 'status'])
            ->withCount('documents');

        // Filter by status
        if ($request->status) {
            $query->where('submission_status_id', $request->status);
        }

        $submissions = $query->latest()->paginate(15);

        return response()->json([
            'data' => SubmissionResource::collection($submissions),
            'meta' => [
                'current_page' => $submissions->currentPage(),
                'last_page'    => $submissions->lastPage(),
                'total'        => $submissions->total(),
            ],
        ]);
    }

    /**
     * GET /api/admin/submissions/{id}
     * Detail submission untuk admin
     */
    public function show(string $id): JsonResponse
    {
        $submission = Submission::with([
            'user.companyDetail.companyField',
            'status',
            'perIndicators.indicator.principle.outcome.aspect',
            'perIndicators.indicator.questions',
            'perIndicators.status',
            'answers.question.indicator',
            'documents.indicator',
            'latestPayment',
            'certificateUser.certificate',
            'survey',
        ])->findOrFail($id);

        // Auto-advance ke status 3 telah dihapus agar Admin bisa melakukan review tanpa mengubah status,
        // Status baru akan berubah ke 3 ketika user menekan tombol 'Kirim Verifikasi ke Admin' di frontend.
        return response()->json([
            'data' => new SubmissionResource($submission),
        ]);
    }

    /**
     * PUT /api/admin/submissions/{id}/indicators/{indicatorId}
     * Admin update status per-indikator (Verified/Declined) + valid_value
     */
    public function updateIndicator(Request $request, string $id, int $indicatorId): JsonResponse
    {
        $request->validate([
            'status_id'   => ['required', 'integer', 'exists:per_indicator_statuses,id'],
            'comment'     => ['nullable', 'string', 'max:1000'],
            'valid_values'=> ['nullable', 'array'],
            'valid_values.*.question_id' => ['integer', 'exists:questions,id'],
            'valid_values.*.valid_value' => ['required', 'numeric', 'in:0,0.5,1,2'],
        ]);

        $submission = Submission::findOrFail($id);

        if (!in_array($submission->submission_status_id, [2, 3, 4, 6, 7])) {
            return response()->json([
                'message' => 'Status tidak dapat diubah karena pengajuan sudah disetujui, tersertifikasi, atau ditolak permanen.',
            ], 422);
        }

        // Update status per-indikator
        SubmissionPerIndicator::where('submission_id', $id)
            ->where('indicator_id', $indicatorId)
            ->update([
                'per_indicator_status_id' => $request->status_id,
                'comment'                 => $request->comment,
            ]);

        // Update valid_value per jawaban
        if ($request->valid_values) {
            foreach ($request->valid_values as $v) {
                // If status is 6 (Invalid), force valid_value to 0
                $validValue = ($request->status_id == 6) ? 0 : $v['valid_value'];
                
                Answer::updateOrCreate(
                    ['submission_id' => $id, 'question_id' => $v['question_id']],
                    ['valid_value' => $validValue]
                );
            }

            // Recalculate valid_score
            $validScore = $submission->calculateValidScore();
            $submission->update(['valid_score' => $validScore]);
        }

        ActivityLog::create([
            'user_id' => Auth::id(),
            'submission_id' => $submission->id,
            'action' => 'updated_indicator',
            'description' => 'Memperbarui status indikator (ID: ' . $indicatorId . ') dan memperbarui skor menjadi ' . ($validScore ?? $submission->valid_score),
            'ip_address' => request()->ip(),
        ]);

        if ($request->status_id == 5) { // Declined (Need Revision)
            $message = 'Ada indikator yang perlu diperbaiki/direvisi. Silakan cek detail kuesioner Anda.';
            if ($submission->user) {
                $submission->user->notify(new \App\Notifications\SystemNotification(
                    'Revisi Dokumen Diperlukan',
                    $message,
                    '/dashboard/submissions/' . $submission->id
                ));
            }
        } else if ($request->status_id == 6) { // Invalid (Permanently Failed)
            $message = 'Ada indikator yang dinilai gagal (Invalid) dan tidak memenuhi standar.';
            if ($submission->user) {
                $submission->user->notify(new \App\Notifications\SystemNotification(
                    'Indikator Invalid',
                    $message,
                    '/dashboard/submissions/' . $submission->id
                ));
            }
        }

        return response()->json([
            'message'     => 'Indicator updated.',
            'valid_score' => (float) $submission->fresh()->valid_score,
        ]);
    }

    /**
     * POST /api/admin/submissions/{id}/survey
     * Tambah jadwal survei lokasi
     */
    public function addSurvey(Request $request, string $id): JsonResponse
    {
        $request->validate([
            'scheduled_at'  => ['required', 'date', 'after:now'],
            'location_link' => ['required', 'string'],
            'notes'         => ['nullable', 'string'],
        ]);

        $submission = Submission::findOrFail($id);

        if (!in_array($submission->submission_status_id, [8, 7])) {
            return response()->json([
                'message' => 'Survei lokasi hanya dapat dijadwalkan setelah Admin menyelesaikan verifikasi dokumen (Status 8) atau dijadwal ulang (Status 7).'
            ], 422);
        }

        $submission->update(['submission_status_id' => 7]); // Continue to Location Survey

        $survey = $submission->survey()->updateOrCreate(
            ['submission_id' => $submission->id],
            [
                'scheduled_at'  => $request->scheduled_at,
                'location_link' => $request->location_link,
                'notes'         => $request->notes,
            ]
        );

        // Auto-create logbook entry in field_surveys for Assessor reference
        FieldSurvey::firstOrCreate(
            [
                'submission_id' => $submission->id,
                'scheduled_at'  => $request->scheduled_at,
            ],
            [
                'assessor_id'   => Auth::id(),
                'status'        => 'scheduled',
                'notes'         => 'Jadwal observasi lapangan resmi (Dibuat otomatis oleh Sistem)',
            ]
        );

        ActivityLog::create([
            'submission_id' => $submission->id,
            'user_id'       => Auth::id(),
            'action'        => 'admin_schedule_survey',
            'description'   => "Admin menjadwalkan survei lapangan pada " . $request->scheduled_at
        ]);
        
        $message = 'Jadwal survei lokasi telah ditentukan pada: ' . date('d M Y H:i', strtotime($request->scheduled_at));
        if ($submission->user) {
            $submission->user->notify(new SystemNotification(
                'Jadwal Survei Lapangan',
                $message,
                '/dashboard/submissions/' . $submission->id
            ));
            try {
                Mail::to($submission->user->email)->queue(new SubmissionStatusMail($submission, $message));
            } catch (\Exception $e) {
                Log::error('Failed to send status email (Add Survey): ' . $e->getMessage());
            }
        }

        return response()->json([
            'message' => 'Jadwal survei berhasil ditambahkan',
            'data'    => [
                'scheduled_at'  => $survey->scheduled_at->toISOString(),
                'location_link' => $survey->location_link,
                'notes'         => $survey->notes,
            ],
        ]);
    }

    /**
     * POST /api/admin/submissions/{id}/certificate
     * Terbitkan sertifikat (valid 3 tahun)
     */
    public function issueCertificate(IssueCertificateRequest $request, string $id): JsonResponse
    {
        $submission = Submission::with(['user.companyDetail'])->findOrFail($id);

        // Bisa diterbitkan dari Status 7 (selesai survei) ATAU dari Status 3 (sudah direvisi paska survei)
        $hasSurvey = $submission->survey()->exists();
        
        if ($submission->submission_status_id != 7 && !($submission->submission_status_id == 3 && $hasSurvey)) {
            return response()->json([
                'message' => 'Sertifikat hanya dapat diterbitkan setelah tahapan survei lapangan selesai (Status 7) atau jika direvisi pasca survei.'
            ], 422);
        }

        // Pastikan skor masih memenuhi syarat kelulusan (Penting karena skor bisa turun saat direvisi)
        if ($submission->valid_score < 70 || $submission->getUploadedIndicatorsCount() < 35) {
            return response()->json([
                'message' => 'Tidak dapat menerbitkan sertifikat: Skor valid saat ini (' . $submission->valid_score . ') atau kelengkapan dokumen belum memenuhi syarat minimum kelulusan. Pastikan semua perbaikan telah di-Valid-kan.'
            ], 422);
        }

        $publishedAt = \Carbon\Carbon::parse($request->published_at);
        $validUntil  = $publishedAt->copy()->addYears(3);

        // Auto-generate nomor sertifikat (BICC format) jika tidak diisi manual
        $companyCountry = $submission->user->companyDetail->company_country ?? 'Indonesia';
        $mmicNumber = $request->mmic ?: CertificateNumberService::generate($request->published_at, $companyCountry);

        // Update atau insert certificate_user
        // is_approved = false: sertifikat menunggu persetujuan Super Admin
        CertificateUser::updateOrCreate(
            ['submission_id' => $submission->id],
            [
                'certificate_id' => $request->certificate_id,
                'user_id'        => $submission->user_id,
                'mmic'           => $mmicNumber,
                'direktur'       => $request->direktur,
                'published_at'   => $publishedAt,
                'valid_until'    => $validUntil,
                'is_approved'    => false,
            ]
        );

        // Update submission status ke Certified
        $submission->update(['submission_status_id' => 5]);

        // Update kategori BECdex di company_detail
        $submission->user->companyDetail?->update([
            'becdex_category_id' => $request->becdex_category_id,
        ]);

        ActivityLog::create([
            'user_id' => Auth::id(),
            'submission_id' => $submission->id,
            'action' => 'issued_certificate',
            'description' => 'Menerbitkan sertifikat dengan nomor MMIC: ' . $mmicNumber,
            'ip_address' => request()->ip(),
        ]);

        if ($submission->user) {
            // Kirim notifikasi ke Super Admin untuk approval sertifikat
            $superAdmins = \App\Models\User::whereIn('role_id', RoleId::superAdminRoleIds())->get();
            foreach ($superAdmins as $admin) {
                $admin->notify(new SystemNotification(
                    'Sertifikat Menunggu Persetujuan',
                    'Certification Manager telah menerbitkan sertifikat untuk ' . $submission->user->name . '. Silakan review dan setujui.',
                    '/admin/certificates'
                ));
            }

            // Notifikasi ke perusahaan bahwa sertifikat sedang diproses
            $submission->user->notify(new SystemNotification(
                'Sertifikat Sedang Diproses',
                'Sertifikat BECdex Anda sedang menunggu persetujuan akhir dari manajemen. Anda akan diberitahu setelah disetujui.',
                '/dashboard/submissions/' . $submission->id
            ));

            // Generate PDF
            try {
                $submission->load(['user.companyDetail.companyField', 'certificateUser.certificate']);
                $certUser = $submission->certificateUser;
                
                $activeTemplate = \App\Models\CertificateTemplate::where('is_active', true)->first();

                $bgPath = null;
                if ($activeTemplate && $activeTemplate->background_path) {
                    $bgPath = storage_path('app/public/' . $activeTemplate->background_path);
                } else if ($certUser && $certUser->certificate && $certUser->certificate->file_path) {
                    $bgPath = storage_path('app/public/' . $certUser->certificate->file_path);
                }
                
                if (!$bgPath || !file_exists($bgPath)) {
                    $bgPath = public_path('assets/certificate_default_bg.jpg');
                }

                $bgImageBase64 = '';
                if (file_exists($bgPath)) {
                    // Try to get mime type for proper base64, fallback to jpeg
                    $mime = mime_content_type($bgPath) ?: 'image/jpeg';
                    $bgImageBase64 = 'data:' . $mime . ';base64,' . base64_encode(file_get_contents($bgPath));
                }

                $qrUrl = url('/verified-companies');
                $qrBase64 = '';
                try {
                    $qrApiUrl = "https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=" . urlencode($qrUrl);
                    $arrContextOptions = ["ssl" => ["verify_peer" => false, "verify_peer_name" => false]];
                    $qrData = file_get_contents($qrApiUrl, false, stream_context_create($arrContextOptions));
                    if ($qrData) {
                        $qrBase64 = 'data:image/png;base64,' . base64_encode($qrData);
                    }
                } catch (\Exception $e) {}

                $sectorEn = $submission->user->companyDetail->companyField->name ?? 'Maritime Sector';
                $sectorIdMap = [
                    "Marine Fisheries and Aquaculture" => "Perikanan dan Akuakultur Laut",
                    "Maritime Transport, Shipping, and Ports" => "Transportasi Maritim, Pelayaran, dan Pelabuhan",
                    "Marine Tourism and Cruise Ships" => "Pariwisata Bahari dan Kapal Pesiar",
                    "Biotechnology and Marine Bioproducts Processing" => "Bioteknologi dan Pengolahan Bioproduk Laut",
                    "Seawater Desalination" => "Desalinasi Air Laut",
                    "Deep Sea Mining, Oil, and Gas" => "Pertambangan, Minyak, dan Gas Laut Dalam",
                    "Marine Renewable Energy" => "Energi Terbarukan Laut",
                    "Ship and Boat Building" => "Pembuatan Kapal dan Perahu",
                    "Ocean Building" => "Bangunan Laut",
                    "Marine Defense and Security" => "Pertahanan dan Keamanan Laut",
                    "Maritime Research and Education" => "Riset dan Edukasi Maritim",
                    "Marine Communication, Equipment and Instrumentation" => "Komunikasi, Peralatan, dan Instrumentasi Kelautan",
                ];
                $sectorId = $sectorIdMap[$sectorEn] ?? 'Sektor Maritim';

                $data = [
                    'bg_image_base64' => $bgImageBase64,
                    'mmic_code'       => ($certUser->published_at ? $certUser->published_at->format('dmY') : '') . ($certUser->mmic ?? ''),
                    'company_name'    => $submission->user->name,
                    'company_address' => $submission->user->companyDetail->address ?? '',
                    'company_sector'  => $sectorId,
                    'company_sector_en' => $sectorEn,
                    'becdex_category_id' => $certUser->certificate->id ?? 10,
                    'qr_base64'       => $qrBase64,
                    'published_date'  => $certUser->published_at ? $certUser->published_at->locale('id')->translatedFormat('d F Y') : '',
                    'valid_until'     => $certUser->valid_until ? $certUser->valid_until->locale('id')->translatedFormat('d F Y') : '',
                    'published_date_en' => $certUser->published_at ? $certUser->published_at->locale('en')->translatedFormat('d F Y') : '',
                    'valid_until_en'    => $certUser->valid_until ? $certUser->valid_until->locale('en')->translatedFormat('d F Y') : '',
                    'director_name'   => $certUser->direktur ?? 'Rahmat Ihsan, S.H.',
                    'config'          => $activeTemplate ? $activeTemplate->config : \App\Models\CertificateTemplate::getDefaultConfig(),
                ];

                $pdf = \Barryvdh\DomPDF\Facade\Pdf::loadView('pdf.certificate', $data);
                $pdf->setPaper('a4', 'portrait');
                $pdfContent = $pdf->output();

                $pdfFileName = 'certificate_' . str_replace(' ', '_', $submission->user->name) . '.pdf';
                
                Mail::to($submission->user->email)->queue(new CertificateIssuedMail($submission, $pdfContent, $pdfFileName));
            } catch (\Exception $e) {
                Log::error('Failed to send certificate email: ' . $e->getMessage());
            }
        }

        return response()->json([
            'message' => 'Sertifikat berhasil diterbitkan dan menunggu persetujuan Super Admin. Berlaku hingga ' . $validUntil->format('d M Y') . '.',
        ]);
    }

    /**
     * POST /api/admin/submissions/{id}/return
     * Kembalikan submission ke user untuk revisi (Ubah status -> 4)
     * Berlaku dari Status 3 (Verifikasi Dokumen) MAUPUN Status 7 (Survei Lapangan)
     */
    public function returnToUser(Request $request, string $id): JsonResponse
    {
        $request->validate([
            'reason' => 'required|string|max:1000',
        ]);

        $submission = Submission::with('user')->findOrFail($id);

        // Bisa dikembalikan dari Status 3 (verifikasi) ATAU Status 7 (survei lapangan)
        if (!in_array($submission->submission_status_id, [2, 3, 4, 6, 7])) {
            return response()->json([
                'message' => 'Pengajuan tidak sedang dalam tahap verifikasi, revisi, atau survei lapangan.',
            ], 422);
        }

        $fromSurvey = $submission->submission_status_id === 7;

        // Pastikan ada setidaknya satu indikator yang ditandai revisi (per_indicator_status_id = 5 = Declined)
        $hasRevision = \App\Models\SubmissionPerIndicator::where('submission_id', $submission->id)
            ->where('per_indicator_status_id', 5)
            ->exists();

        if (!$hasRevision) {
            return response()->json([
                'message' => 'Tidak ada indikator yang ditandai untuk revisi. Silakan tandai minimal satu indikator sebagai "Revisi" terlebih dahulu.',
            ], 422);
        }

        if ($submission->revision_count >= 1) {
            return response()->json([
                'message' => 'Batas revisi maksimal 1 kali telah habis. Silakan Tolak Permanen pengajuan ini.'
            ], 422);
        }

        $submission->update([
            'submission_status_id'  => 4, // Document Submission (2nd/3rd Attempt)
            'revision_count'        => $submission->revision_count + 1,
            'current_upload_phase'  => ($submission->current_upload_phase ?? 1) + 1, // Buka kuota fase baru (max 10 per fase)
        ]);

        $actionLabel = $fromSurvey ? 'admin_return_from_survey' : 'admin_return_submission';
        $actionDesc  = $fromSurvey
            ? "Admin mengembalikan dokumen untuk diperbaiki berdasarkan hasil survei lapangan. Alasan: {$request->reason}"
            : "Admin mengembalikan dokumen untuk diperbaiki (Alasan: {$request->reason})";

        ActivityLog::create([
            'submission_id' => $submission->id,
            'user_id'       => Auth::id(),
            'action'        => $actionLabel,
            'description'   => $actionDesc,
        ]);

        $notifTitle = $fromSurvey
            ? 'Revisi Diperlukan Pasca Survei Lapangan'
            : 'Pengajuan Dikembalikan (Perlu Revisi)';
        $message = $fromSurvey
            ? 'Berdasarkan hasil survei lapangan, terdapat dokumen yang perlu diperbaiki: ' . $request->reason
            : 'Pengajuan Anda dikembalikan oleh tim penilai karena: ' . $request->reason;

        if ($submission->user) {
            $submission->user->notify(new SystemNotification(
                $notifTitle,
                $message,
                '/dashboard/submissions/' . $submission->id
            ));
            try {
                Mail::to($submission->user->email)->queue(new SubmissionStatusMail($submission, $message));
            } catch (\Exception $e) {
                Log::error('Failed to send status email (Return to User): ' . $e->getMessage());
            }
        }

        $responseMsg = $fromSurvey
            ? 'Dokumen dikembalikan ke perusahaan untuk revisi pasca survei (Status 4). Perusahaan tidak perlu membayar ulang.'
            : 'Submission berhasil dikembalikan ke User (Status 4)';

        return response()->json(['message' => $responseMsg]);
    }

    /**
     * POST /api/admin/submissions/{id}/start
     * Admin memulai verifikasi dari status 6 (Payment Successful)
     */
    public function startVerification(string $id): JsonResponse
    {
        $submission = Submission::findOrFail($id);

        if ($submission->submission_status_id != 6) {
            return response()->json(['message' => 'Hanya submission dengan status Payment Successful yang bisa dimulai verifikasinya.'], 400);
        }

        $submission->update(['submission_status_id' => 3]); // On Verification Process

        ActivityLog::create([
            'submission_id' => $submission->id,
            'user_id'       => Auth::id(),
            'action'        => 'admin_start_verification',
            'description'   => "Admin memulai proses verifikasi dokumen pengajuan."
        ]);

        return response()->json([
            'message' => 'Proses verifikasi berhasil dimulai.',
            'status'  => 3
        ]);
    }

    /**
     * POST /api/admin/submissions/{id}/approve
     * Admin menyelesaikan verifikasi dan meluluskan submission (Status 8)
     */
    public function approve(string $id): JsonResponse
    {
        $submission = Submission::findOrFail($id);

        if ($submission->submission_status_id != 3) {
            return response()->json(['message' => 'Hanya submission dengan status Under Verification yang bisa diluluskan.'], 400);
        }

        if ($submission->valid_score < 70 || $submission->getUploadedIndicatorsCount() < 35) {
            return response()->json(['message' => 'Skor atau kelengkapan dokumen belum memenuhi syarat lolos (Minimal skor 70 dan 35 indikator memiliki bukti).'], 400);
        }

        // Pastikan tidak ada indikator yang masih berstatus "Uploaded" (2) atau "Need Revision" (5)
        // Jika ada yang Need Revision (5), Admin seharusnya mengklik "Kembalikan untuk Revisi", bukan meluluskan.
        $unresolvedIndicators = \App\Models\SubmissionPerIndicator::where('submission_id', $id)
            ->whereIn('per_indicator_status_id', [2, 5]) 
            ->get();

        if ($unresolvedIndicators->count() > 0) {
            $hasUploaded = $unresolvedIndicators->where('per_indicator_status_id', 2)->count() > 0;
            $hasRevision = $unresolvedIndicators->where('per_indicator_status_id', 5)->count() > 0;
            
            $messages = [];
            if ($hasUploaded) $messages[] = "indikator yang belum diperiksa (berstatus Uploaded)";
            if ($hasRevision) $messages[] = "indikator yang ditandai butuh revisi";
            
            $msgString = implode(" dan ", $messages);
            return response()->json([
                'message' => "Tidak dapat meluluskan pengajuan. Masih ada {$msgString}. Selesaikan pemeriksaan atau kembalikan ke perusahaan untuk direvisi."
            ], 422);
        }

        $submission->update([
            'submission_status_id' => 8,   // Approved — Ready for Survey
            'revision_count'       => 0,   // Reset revision quota untuk tahap survei
        ]);

        ActivityLog::create([
            'submission_id' => $submission->id,
            'user_id'       => Auth::id(),
            'action'        => 'admin_approve_verification',
            'description'   => "Admin menyelesaikan verifikasi dokumen dan meluluskan pengajuan untuk lanjut ke survei lapangan."
        ]);

        if ($submission->user) {
            $submission->user->notify(new SystemNotification(
                'Verifikasi Dokumen Selesai',
                'Selamat! Dokumen Anda telah diverifikasi dan disetujui. Tim kami akan segera menghubungi Anda untuk mengatur jadwal survei lapangan.',
                '/dashboard/submissions/' . $submission->id
            ));
            try {
                Mail::to($submission->user->email)->queue(new SubmissionStatusMail($submission, 'Dokumen kuesioner Anda telah berhasil diverifikasi dan disetujui oleh tim penilai BECdex. Tim kami akan segera menghubungi Anda untuk mengatur jadwal survei lapangan.'));
            } catch (\Exception $e) {
                Log::error('Failed to send status email (Approve): ' . $e->getMessage());
            }
        }

        return response()->json(['message' => 'Submission berhasil diluluskan. Siap untuk penjadwalan survei lapangan (Status 8)']);
    }

    /**
     * POST /api/admin/submissions/{id}/reject
     * Admin menolak submission secara permanen (Status 9)
     */
    public function reject(Request $request, string $id): JsonResponse
    {
        $request->validate([
            'reason' => 'required|string|max:1000'
        ]);

        $submission = Submission::findOrFail($id);

        $submission->update(['submission_status_id' => 9]);

        ActivityLog::create([
            'submission_id' => $submission->id,
            'user_id'       => Auth::id(),
            'action'        => 'admin_reject_submission',
            'description'   => "Admin menolak pengajuan secara permanen. Alasan: " . $request->reason
        ]);

        if ($submission->user) {
            $submission->user->notify(new SystemNotification(
                'Pengajuan Ditolak',
                'Mohon maaf, pengajuan sertifikasi Anda ditolak oleh Admin.',
                '/dashboard/submissions/' . $submission->id
            ));
            try {
                Mail::to($submission->user->email)->queue(new SubmissionStatusMail($submission, 'Pengajuan sertifikasi Anda telah ditolak oleh tim verifikator kami dengan alasan: ' . $request->reason));
            } catch (\Exception $e) {
                Log::error('Failed to send status email (Reject): ' . $e->getMessage());
            }
        }

        return response()->json(['message' => 'Submission berhasil ditolak permanen (Status 9)']);
    }

    /**
     * GET /api/admin/dashboard/stats
     * Get statistics for admin dashboard
     */
    public function stats(): JsonResponse
    {
        $totalSubmissions = Submission::count();
        $pendingReview    = Submission::whereIn('submission_status_id', [2, 3, 4, 6])->count();
        $certified        = Submission::where('submission_status_id', 5)->count();
        $totalUsers       = \App\Models\User::where('role_id', RoleId::Company->value)->where('is_active', 1)->count();

        $certificationsBySector = \App\Models\CertificateUser::with('user.companyDetail.companyField')
            ->get()
            ->groupBy(fn($c) => $c->user?->companyDetail?->companyField?->name ?? 'Lainnya')
            ->map(fn($group) => $group->count())
            ->map(fn($count, $sector) => ['sector' => $sector, 'count' => $count])
            ->values();

        $submissionsTrend = \Illuminate\Support\Facades\DB::table('submissions')
            ->selectRaw('DATE_FORMAT(created_at, "%Y-%m") as month, count(*) as count')
            ->whereDate('created_at', '>=', \Carbon\Carbon::now()->subMonths(6)->toDateString())
            ->groupBy('month')
            ->orderBy('month')
            ->get();
            
        $assessorWorkload = \App\Models\User::whereIn('role_id', RoleId::assessorRoleIds())
            ->where('is_active', 1)
            ->withCount(['assignedSubmissions as pending_count' => function($query) {
                $query->whereIn('submission_status_id', [2, 3, 4, 6]);
            }])
            ->get(['id', 'name', 'email', 'image']);

        return response()->json([
            'data' => [
                'total_submissions' => $totalSubmissions,
                'pending_review'    => $pendingReview,
                'certified'         => $certified,
                'total_users'       => $totalUsers,
                'certifications_by_sector' => $certificationsBySector,
                'submissions_trend' => $submissionsTrend,
                'assessor_workload' => $assessorWorkload,
            ]
        ]);
    }

    /**
     * DELETE /api/admin/submissions/{id}
     * Hapus submission sepenuhnya beserta relasinya (Hanya untuk Super Admin)
     */
    public function destroy(string $id): JsonResponse
    {
        $submission = Submission::with(['documents', 'certificateUser'])->findOrFail($id);
        
        // Hapus file dokumen yang diupload
        foreach ($submission->documents as $doc) {
            if (\Illuminate\Support\Facades\Storage::disk('public')->exists($doc->file_path)) {
                \Illuminate\Support\Facades\Storage::disk('public')->delete($doc->file_path);
            }
        }
        
        // Hapus file sertifikat background/template jika diupload spesifik
        if ($submission->certificateUser && $submission->certificateUser->certificate) {
            $cert = $submission->certificateUser->certificate;
            if ($cert->file_path && \Illuminate\Support\Facades\Storage::disk('public')->exists($cert->file_path)) {
                // Jangan hapus background template global
                // Tapi kalau memang spesifik user, bisa dihapus. Karena file_path di tabel certificates dipakai bersama, kita skip hapus file fisiknya agar aman.
            }
        }
        
        // Relasi lain akan otomatis terhapus via foreign key cascadeOnDelete di database
        $submission->delete();

        return response()->json([
            'message' => 'Pengajuan berhasil dihapus secara permanen dari sistem.',
        ]);
    }
}
