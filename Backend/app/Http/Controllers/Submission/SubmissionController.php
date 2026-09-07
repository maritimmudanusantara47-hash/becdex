<?php

namespace App\Http\Controllers\Submission;

use App\Http\Controllers\Controller;
use App\Http\Resources\SubmissionResource;
use App\Models\Answer;
use App\Models\Indicator;
use App\Models\Question;
use App\Models\Submission;
use App\Models\SubmissionPerIndicator;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class SubmissionController extends Controller
{
    /**
     * GET /api/submissions
     * Daftar submission milik user yang login
     */
    public function index(Request $request): JsonResponse
    {
        $submissions = $request->user()
            ->submissions()
            ->with(['status', 'latestPayment', 'certificateUser.certificate'])
            ->withCount('documents')
            ->latest()
            ->paginate(10);

        return response()->json([
            'data'  => SubmissionResource::collection($submissions),
            'meta'  => [
                'current_page' => $submissions->currentPage(),
                'last_page'    => $submissions->lastPage(),
                'per_page'     => $submissions->perPage(),
                'total'        => $submissions->total(),
            ],
        ]);
    }

    /**
     * POST /api/submissions
     * Buat submission baru — otomatis generate 50 per-indicator rows dan answer rows
     */
    public function store(Request $request): JsonResponse
    {
        $user = $request->user();

        // Verifikasi profil perusahaan sudah diisi
        if (!$user->companyDetail) {
            return response()->json([
                'message' => 'Please complete your company profile before creating a submission.',
            ], 422);
        }

        // Cek apakah ada submission yang belum selesai / ditolak (selain status 5 Certified dan 9 Rejected)
        $activeExists = $user->submissions()
            ->whereNotIn('submission_status_id', [5, 9])
            ->exists();

        if ($activeExists) {
            return response()->json([
                'message' => 'You already have an active submission in progress. Please complete it first.',
            ], 422);
        }

        $submission = DB::transaction(function () use ($user) {
            $submission = Submission::create([
                'user_id'              => $user->id,
                'submission_status_id' => 2, // Document Submission
            ]);

            // Buat 50 baris submission_per_indicator (satu per indikator)
            $indicatorIds = Indicator::orderBy('id')->pluck('id');
            $perIndicatorRows = $indicatorIds->map(fn ($id) => [
                'submission_id'           => $submission->id,
                'indicator_id'            => $id,
                'per_indicator_status_id' => 1, // Not Uploaded
                'created_at'              => now(),
                'updated_at'              => now(),
            ])->all();
            SubmissionPerIndicator::insert($perIndicatorRows);

            // Buat baris answer untuk setiap question (kosong)
            $questionIds = Question::orderBy('id')->pluck('id');
            $answerRows = $questionIds->map(fn ($id) => [
                'submission_id' => $submission->id,
                'question_id'   => $id,
                'value'         => null,
                'valid_value'   => null,
                'created_at'    => now(),
                'updated_at'    => now(),
            ])->all();
            Answer::insert($answerRows);

            return $submission;
        });

        return response()->json([
            'message' => 'Submission created successfully.',
            'data'    => new SubmissionResource($submission->load('status')),
        ], 201);
    }

    /**
     * GET /api/submissions/{id}
     * Detail submission lengkap
     */
    public function show(Request $request, string $id): JsonResponse
    {
        $submission = $request->user()
            ->submissions()
            ->with([
                'user.companyDetail',
                'status',
                'perIndicators.indicator.questions',
                'perIndicators.indicator.principle.outcome.aspect',
                'perIndicators.status',
                'answers.question',
                'documents.indicator',
                'latestPayment',
                'certificateUser.certificate',
                'survey',
            ])
            ->findOrFail($id);

        return response()->json([
            'data' => new SubmissionResource($submission),
        ]);
    }

    /**
     * DELETE /api/submissions/{id}
     * Hapus submission draf (status 2)
     */
    public function destroy(Request $request, string $id): JsonResponse
    {
        $submission = $request->user()
            ->submissions()
            ->where('submission_status_id', 2) // Hanya bisa dihapus jika statusnya 2 (Document Submission)
            ->findOrFail($id);

        $submission->delete();

        return response()->json([
            'message' => 'Draft submission deleted successfully.',
        ]);
    }

    /**
     * POST /api/submissions/{id}/submit
     * Kunci submission dan arahkan user ke pembayaran (ubah status → 1 Pending Payment)
     * Setelah bayar, webhook Xendit akan ubah ke status 3 (On Verification Process)
     * EXCEPTION: Jika user sudah pernah bayar (dikembalikan dari survei untuk revisi),
     * langsung masuk ke Status 3 tanpa perlu bayar lagi.
     */
    public function submitForVerification(Request $request, string $id): JsonResponse
    {
        $submission = $request->user()
            ->submissions()
            ->whereIn('submission_status_id', [2, 4])
            ->findOrFail($id);

        $initialScore = $submission->calculateInitialScore();
        $docCount = $submission->getUploadedIndicatorsCount();

        if ($initialScore < 70 || $docCount < 35) {
            return response()->json([
                'message' => 'Pengajuan belum memenuhi syarat minimal (Skor >= 70 dan minimal 35 indikator memiliki bukti dokumen).'
            ], 422);
        }

        // Cek apakah pengajuan membutuhkan pembayaran (Pertama kali ATAU Revisi Pasca Survei)
        $requiresPayment = $submission->requiresPayment();

        if (!$requiresPayment) {
            // Revisi dokumen awal biasa: Langsung masuk ke verifikasi — gratis tanpa bayar lagi
            $submission->update([
                'submission_status_id' => 3, // On Verification Process
                'initial_score'        => $initialScore,
            ]);

            // Tandai semua per-indicator sebagai Submitted agar Admin bisa mereview ulang
            $submission->perIndicators()
                ->where('per_indicator_status_id', '!=', 4) // Jangan timpa yang sudah Verified
                ->update(['per_indicator_status_id' => 2]);

            return response()->json([
                'message' => 'Revisi berhasil dikirim ulang ke Admin untuk ditinjau kembali. Tidak diperlukan pembayaran ulang.',
                'data'    => new SubmissionResource($submission->load('status')),
            ]);
        }

        // Jika memerlukan pembayaran (Pertama kali ATAU Revisi Pasca Survei):
        // Simpan initial score, ubah status ke Pending Payment (1)
        $submission->update([
            'submission_status_id' => 1, // Pending Payment
            'initial_score'        => $initialScore,
        ]);

        $message = $submission->isPostSurveyRevision()
            ? 'Revisi pasca survei berhasil dikunci. Silakan lanjutkan ke pembayaran biaya survei.'
            : 'Submission berhasil dikunci. Silakan lanjutkan ke pembayaran biaya sertifikasi.';

        return response()->json([
            'message' => $message,
            'data'    => new SubmissionResource($submission->load('status')),
        ]);
    }

    /**
     * GET /api/public/submissions/{id}/certificate/download
     * Render and download PDF certificate
     */
    public function downloadCertificate(string $id)
    {
        $submission = Submission::with([
            'user.companyDetail.companyField',
            'certificateUser.certificate',
        ])
        ->where('submission_status_id', 5) // Harus status Certified
        ->findOrFail($id);

        $certUser = $submission->certificateUser;
        if (!$certUser) {
            abort(404, 'Certificate not issued yet.');
        }

        // Pastikan sertifikat sudah disetujui oleh Super Admin (kecuali jika mode preview admin: ?preview=1)
        if (!$certUser->is_approved && !request()->has('preview')) {
            abort(403, 'Certificate has not been approved yet. Please wait for Super Admin approval.');
        }

        // 1. Fetch active certificate template for layout and custom background
        $activeTemplate = \App\Models\CertificateTemplate::where('is_active', true)->first();

        $bgPath = null;
        
        // Priority 1: Use background from Certificate Designer if uploaded
        if ($activeTemplate && $activeTemplate->background_path) {
            $bgPath = storage_path('app/public/' . $activeTemplate->background_path);
        } 
        // Priority 2: Fallback to category-specific background (Excellent/Good/Standard)
        else if ($certUser->certificate && $certUser->certificate->file_path) {
            $bgPath = storage_path('app/public/' . $certUser->certificate->file_path);
        }
        
        if (!$bgPath || !file_exists($bgPath)) {
            $bgPath = public_path('assets/certificate_default_bg.jpg');
        }

        $bgImageBase64 = '';
        if (file_exists($bgPath)) {
            $mime = mime_content_type($bgPath) ?: 'image/jpeg';
            $bgImageBase64 = 'data:' . $mime . ';base64,' . base64_encode(file_get_contents($bgPath));
        }

        // 2. Format dates
        $publishedDate = $certUser->published_at ? $certUser->published_at->locale('id')->translatedFormat('d F Y') : '';
        $validUntil = $certUser->valid_until ? $certUser->valid_until->locale('id')->translatedFormat('d F Y') : '';
        $publishedDateEn = $certUser->published_at ? $certUser->published_at->locale('en')->translatedFormat('d F Y') : '';
        $validUntilEn = $certUser->valid_until ? $certUser->valid_until->locale('en')->translatedFormat('d F Y') : '';

        // 3. QR code points to the public verified companies registry
        $qrUrl = url('/verified-companies');
        $qrBase64 = '';
        try {
            $qrApiUrl = "https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=" . urlencode($qrUrl);
            // Disable SSL verification just in case local environment has issues
            $arrContextOptions = [
                "ssl" => [
                    "verify_peer" => false,
                    "verify_peer_name" => false,
                ],
            ];
            $qrData = file_get_contents($qrApiUrl, false, stream_context_create($arrContextOptions));
            if ($qrData) {
                $qrBase64 = 'data:image/png;base64,' . base64_encode($qrData);
            }
        } catch (\Exception $e) {
            // fallback if qr fails
        }

        // 4. Director name
        $directorName = $certUser->direktur ?? 'Rahmat Ihsan, S.H.';

        $publishedDatePrefix = $certUser->published_at ? $certUser->published_at->format('dmY') : '';

        // 5. Gather variables for blade
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
            'mmic_code'       => $certUser->mmic ?? '',
            'company_name'    => $submission->user->name,
            'company_address' => $submission->user->companyDetail->address ?? '',
            'company_sector'  => $sectorId,
            'company_sector_en' => $sectorEn,
            'becdex_score'    => $submission->valid_score ?? $submission->initial_score,
            'becdex_category_id' => $certUser->certificate->id ?? 10, // Default to Good (10) if unknown
            'qr_base64'       => $qrBase64,
            'published_date'  => $publishedDate,
            'valid_until'     => $validUntil,
            'published_date_en' => $publishedDateEn,
            'valid_until_en'    => $validUntilEn,
            'director_name'   => $directorName,
            'config'          => $activeTemplate ? $activeTemplate->config : \App\Models\CertificateTemplate::getDefaultConfig(),
        ];

        // 6. Generate PDF using Barryvdh\DomPDF\Facade\Pdf
        $pdf = \Barryvdh\DomPDF\Facade\Pdf::loadView('pdf.certificate', $data);
        $pdf->setPaper('a4', 'portrait'); // Changed to portrait to match image

        // Return PDF inline stream so it can be viewed in an iframe
        return $pdf->stream('certificate_' . str_replace(' ', '_', $submission->user->name) . '.pdf');
    }

    /**
     * Export all submissions to CSV
     */
    public function exportCsv(Request $request)
    {
        $headers = array(
            "Content-type"        => "text/csv",
            "Content-Disposition" => "attachment; filename=becdex_submissions.csv",
            "Pragma"              => "no-cache",
            "Cache-Control"       => "must-revalidate, post-check=0, pre-check=0",
            "Expires"             => "0"
        );

        $columns = array('ID', 'Company Name', 'Sector', 'Status', 'Initial Score', 'Valid Score', 'Submitted At');

        $startDate = $request->query('start_date');
        $endDate = $request->query('end_date');
        $statusId = $request->query('status_id');

        $callback = function() use($columns, $startDate, $endDate, $statusId) {
            $file = fopen('php://output', 'w');
            fputcsv($file, $columns);

            $query = Submission::with(['user.companyDetail.companyField', 'status']);
            
            if ($startDate) {
                $query->whereDate('created_at', '>=', $startDate);
            }
            if ($endDate) {
                $query->whereDate('created_at', '<=', $endDate);
            }
            if ($statusId && $statusId !== 'all') {
                $query->where('submission_status_id', $statusId);
            }

            $query->chunk(100, function ($submissions) use ($file) {
                foreach ($submissions as $submission) {
                    $row['ID']  = $submission->id;
                    $row['Company Name']    = $submission->user->name ?? 'N/A';
                    $row['Sector']    = $submission->user->companyDetail->companyField->name ?? 'N/A';
                    $row['Status']  = $submission->status->name ?? 'N/A';
                    $row['Initial Score']  = $submission->initial_score;
                    $row['Valid Score']  = $submission->valid_score;
                    $row['Submitted At']  = $submission->created_at->format('Y-m-d H:i');

                    fputcsv($file, array($row['ID'], $row['Company Name'], $row['Sector'], $row['Status'], $row['Initial Score'], $row['Valid Score'], $row['Submitted At']));
                }
            });

            fclose($file);
        };

        return response()->stream($callback, 200, $headers);
    }
}
