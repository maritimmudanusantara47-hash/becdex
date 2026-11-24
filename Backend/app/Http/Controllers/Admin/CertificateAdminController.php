<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\CertificateUser;
use App\Models\CertificateTemplate;
use App\Models\Certificate;
use App\Models\User;
use App\Models\Submission;
use App\Services\CertificateNumberService;
use App\Notifications\SystemNotification;
use App\Services\AddressFormatter;
use App\Models\ActivityLog;
use Barryvdh\DomPDF\Facade\Pdf;
use Carbon\Carbon;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;

class CertificateAdminController extends Controller
{
    /**
     * GET /api/admin/certificates
     * List all issued certificates with search
     */
    public function index(Request $request): JsonResponse
    {
        $query = CertificateUser::with([
            'user:id,name,email',
            'submission:id,initial_score,valid_score',
            'certificate:id,category,file_path',
        ])->latest('published_at');

        if ($request->filled('search')) {
            $search = $request->search;
            $query->whereHas('user', fn ($u) =>
                $u->where('name', 'like', "%{$search}%")
                  ->orWhere('email', 'like', "%{$search}%")
            );
        }
        if ($request->filled('valid')) {
            if ($request->valid === 'active') {
                $query->where('valid_until', '>=', now());
            } else {
                $query->where('valid_until', '<', now());
            }
        }
        // Filter by approval status
        if ($request->filled('approval')) {
            if ($request->approval === 'pending') {
                $query->where('is_approved', false);
            } elseif ($request->approval === 'approved') {
                $query->where('is_approved', true);
            }
        }

        $certs = $query->paginate(20);

        $mapped = collect($certs->items())->map(fn ($c) => [
            'id'           => $c->id,
            'mmic'         => $c->mmic,
            'direktur'     => $c->direktur,
            'published_at' => $c->published_at?->format('Y-m-d'),
            'valid_until'      => $c->valid_until?->format('Y-m-d'),
            'is_approved'      => (bool) $c->is_approved,
            'is_detail_public' => (bool) $c->is_detail_public,
            'user'         => $c->user ? [
                'id'    => $c->user->id,
                'name'  => $c->user->name,
                'email' => $c->user->email,
            ] : null,
            'certificate'  => $c->certificate ? [
                'id'   => $c->certificate->id,
                'name' => ucfirst($c->certificate->category),
            ] : null,
            'submission'   => $c->submission ? [
                'id'            => $c->submission->id,
                'initial_score' => (float)$c->submission->initial_score,
                'valid_score'   => (float)$c->submission->valid_score,
            ] : null,
        ]);

        return response()->json([
            'data' => $mapped,
            'meta' => [
                'current_page' => $certs->currentPage(),
                'last_page'    => $certs->lastPage(),
                'per_page'     => $certs->perPage(),
                'total'        => $certs->total(),
            ],
        ]);
    }

    /**
     * GET /api/admin/certificates/{id}
     * Detail of one certificate
     */
    public function show(int $id): JsonResponse
    {
        $cert = CertificateUser::with([
            'user.companyDetail',
            'submission',
            'certificate',
        ])->findOrFail($id);

        return response()->json([
            'data' => [
                'id'           => $cert->id,
                'mmic'         => $cert->mmic,
                'direktur'     => $cert->direktur,
                'published_at' => $cert->published_at ? $cert->published_at->format('Y-m-d') : null,
                'valid_until'  => $cert->valid_until ? $cert->valid_until->format('Y-m-d') : null,
                'is_approved'  => (bool) $cert->is_approved,
                'is_detail_public' => (bool) $cert->is_detail_public,
                'user'         => $cert->user ? [
                    'id'            => $cert->user->id,
                    'name'          => $cert->user->name,
                    'email'         => $cert->user->email,
                    'companyDetail' => $cert->user->companyDetail,
                ] : null,
                'certificate'  => $cert->certificate ? [
                    'id'       => $cert->certificate->id,
                    'name'     => $cert->certificate->name,
                    'category' => $cert->certificate->category,
                ] : null,
                'submission'   => $cert->submission ? [
                    'id'            => $cert->submission->id,
                    'initial_score' => (float) $cert->submission->initial_score,
                    'valid_score'   => (float) $cert->submission->valid_score,
                ] : null,
            ],
        ]);
    }

    /**
     * POST /api/admin/certificates/{id}/approve
     * Super Admin menyetujui sertifikat → is_approved = true
     * Sertifikat baru aktif dan bisa dilihat user & publik
     */
    public function approve(int $id): JsonResponse
    {
        $cert = CertificateUser::with(['user.companyDetail.companyField', 'submission', 'certificate'])->findOrFail($id);

        if ($cert->is_approved) {
            return response()->json(['message' => 'Sertifikat ini sudah disetujui sebelumnya.'], 422);
        }

        $cert->update(['is_approved' => true]);

        // Notifikasi ke perusahaan
        if ($cert->user) {
            $cert->user->notify(new SystemNotification(
                'Sertifikat BECdex Disetujui!',
                'Selamat! Sertifikat BECdex Anda telah disetujui dan kini aktif. Anda dapat mengunduhnya sekarang.',
                '/dashboard/submissions/' . ($cert->submission_id ?? '')
            ));

            // Generate dan kirim PDF sertifikat via email
            try {
                $bgImageBase64 = '';
                if ($cert->certificate && $cert->certificate->file_path) {
                    $bgPath = storage_path('app/public/' . $cert->certificate->file_path);
                    if (file_exists($bgPath)) {
                        $bgImageBase64 = 'data:image/jpeg;base64,' . base64_encode(file_get_contents($bgPath));
                    }
                }

                $frontendBaseUrl = rtrim(config('app.frontend_url', env('FRONTEND_URL', 'http://localhost:3000')), '/');
                $targetSerial    = $cert->mmic ?? '';
                $qrUrl           = $targetSerial ? "{$frontendBaseUrl}/verified-companies/{$targetSerial}" : "{$frontendBaseUrl}/verified-companies";
                $qrBase64 = '';
                try {
                    $qrApiUrl          = "https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=" . urlencode($qrUrl);
                    $arrContextOptions = ["ssl" => ["verify_peer" => false, "verify_peer_name" => false]];
                    $qrData            = file_get_contents($qrApiUrl, false, stream_context_create($arrContextOptions));
                    if ($qrData) {
                        $qrBase64 = 'data:image/png;base64,' . base64_encode($qrData);
                    }
                } catch (\Exception $e) {}

                $publishedDate   = $cert->published_at ? str_replace('Agt', 'Agu', $cert->published_at->locale('id')->translatedFormat('d M Y')) : '';
                $validUntil      = $cert->valid_until   ? str_replace('Agt', 'Agu', $cert->valid_until->locale('id')->translatedFormat('d M Y')) : '';
                $publishedDateEn = $cert->published_at  ? $cert->published_at->locale('en')->translatedFormat('d M Y') : '';
                $validUntilEn    = $cert->valid_until   ? $cert->valid_until->locale('en')->translatedFormat('d M Y') : '';
                $activeTemplate  = CertificateTemplate::where('is_active', true)->first() ?: CertificateTemplate::latest()->first();

                $data = [
                    'bg_image_base64'    => $bgImageBase64,
                    'mmic_code'          => $cert->mmic ?? '',
                    'bicc_code'          => $cert->mmic ?? '',
                    'company_name'       => $cert->user->name,
                    'company_address'    => AddressFormatter::format($cert->user->companyDetail->address ?? ''),
                    'company_sector'     => $cert->user->companyDetail->companyField->name ?? 'Maritime Sector',
                    'becdex_category_id' => $cert->certificate->id ?? 10,
                    'qr_base64'          => $qrBase64,
                    'published_date'     => $publishedDate,
                    'valid_until'        => $validUntil,
                    'published_date_en'  => $publishedDateEn,
                    'valid_until_en'     => $validUntilEn,
                    'director_name'      => $cert->direktur ?? 'Rahmat Ihsan, S.H.',
                    'config'             => $activeTemplate ? $activeTemplate->config : CertificateTemplate::getDefaultConfig(),
                ];

                $pdf        = \Barryvdh\DomPDF\Facade\Pdf::loadView('pdf.certificate', $data);
                $pdf->setPaper('a4', 'portrait');
                $pdfContent = $pdf->output();
                $companyName = trim($cert->user->name ?? 'Company');
                $safeName    = preg_replace('[/\\:*?"<>|]', '', $companyName);
                $pdfFileName = 'BECdex Certificate_' . $safeName . '.pdf';

                if ($cert->submission) {
                    Mail::to($cert->user->email)->queue(new \App\Mail\CertificateIssuedMail($cert->submission, $pdfContent, $pdfFileName));
                }
            } catch (\Exception $e) {
                Log::error('Failed to send certificate approval email: ' . $e->getMessage());
            }
        }

        return response()->json([
            'message' => 'Sertifikat berhasil disetujui dan sekarang aktif. Notifikasi telah dikirim ke perusahaan.',
        ]);
    }

    /**
     * GET /api/admin/certificates/{id}/download
     * Admin preview atau download soft file PDF sertifikat.
     * Tidak ada batasan is_approved — admin berhak melihat semua sertifikat.
     * Query param: ?mode=inline (default, untuk iframe preview) | ?mode=download
     */
    public function download(int $id, Request $request)
    {
        $cert = CertificateUser::with([
            'user.companyDetail.companyField',
            'submission',
            'certificate',
        ])->findOrFail($id);

        // 1. Background image dari template aktif, fallback ke background kategori sertifikat
        $activeTemplate = CertificateTemplate::where('is_active', true)->first() ?: CertificateTemplate::latest()->first();
        $bgPath = null;

        if ($activeTemplate && $activeTemplate->background_path) {
            $bgPath = storage_path('app/public/' . $activeTemplate->background_path);
        } elseif ($cert->certificate && $cert->certificate->file_path) {
            $bgPath = storage_path('app/public/' . $cert->certificate->file_path);
        }

        if (!$bgPath || !file_exists($bgPath)) {
            $bgPath = public_path('assets/certificate_default_bg.jpg');
        }

        $bgImageBase64 = '';
        if (file_exists($bgPath)) {
            $mime          = mime_content_type($bgPath) ?: 'image/jpeg';
            $bgImageBase64 = 'data:' . $mime . ';base64,' . base64_encode(file_get_contents($bgPath));
        }

        // 2. Format tanggal (Bahasa Indonesia & English)
        $publishedDate   = $cert->published_at ? str_replace('Agt', 'Agu', $cert->published_at->locale('id')->translatedFormat('d M Y')) : '';
        $validUntil      = $cert->valid_until   ? str_replace('Agt', 'Agu', $cert->valid_until->locale('id')->translatedFormat('d M Y')) : '';
        $publishedDateEn = $cert->published_at  ? $cert->published_at->locale('en')->translatedFormat('d M Y') : '';
        $validUntilEn    = $cert->valid_until   ? $cert->valid_until->locale('en')->translatedFormat('d M Y') : '';

        // 3. QR Code
        $frontendBaseUrl = rtrim(config('app.frontend_url', env('FRONTEND_URL', 'http://localhost:3000')), '/');
        $targetSerial    = $cert->mmic ?? '';
        $qrUrl           = $targetSerial ? "{$frontendBaseUrl}/verified-companies/{$targetSerial}" : "{$frontendBaseUrl}/verified-companies";
        $qrBase64 = '';
        try {
            $qrApiUrl          = "https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=" . urlencode($qrUrl);
            $arrContextOptions = ["ssl" => ["verify_peer" => false, "verify_peer_name" => false]];
            $qrData            = file_get_contents($qrApiUrl, false, stream_context_create($arrContextOptions));
            if ($qrData) {
                $qrBase64 = 'data:image/png;base64,' . base64_encode($qrData);
            }
        } catch (\Exception $e) {
            // fallback jika QR API gagal
        }

        // 4. Mapping sektor perusahaan (EN → ID)
        $sectorEn   = $cert->user->companyDetail->companyField->name ?? 'Maritime Sector';
        $sectorIdMap = [
            "Marine Fisheries and Aquaculture"                 => "Perikanan dan Akuakultur Laut",
            "Maritime Transport, Shipping, and Ports"          => "Transportasi Maritim, Pelayaran, dan Pelabuhan",
            "Marine Tourism and Cruise Ships"                  => "Pariwisata Bahari dan Kapal Pesiar",
            "Biotechnology and Marine Bioproducts Processing"  => "Bioteknologi dan Pengolahan Bioproduk Laut",
            "Seawater Desalination"                            => "Desalinasi Air Laut",
            "Deep Sea Mining, Oil, and Gas"                    => "Pertambangan, Minyak, dan Gas Laut Dalam",
            "Marine Renewable Energy"                          => "Energi Terbarukan Laut",
            "Ship and Boat Building"                           => "Pembuatan Kapal dan Perahu",
            "Ocean Building"                                   => "Bangunan Laut",
            "Marine Defense and Security"                      => "Pertahanan dan Keamanan Laut",
            "Maritime Research and Education"                  => "Riset dan Edukasi Maritim",
            "Marine Communication, Equipment and Instrumentation" => "Komunikasi, Peralatan, dan Instrumentasi Kelautan",
        ];
        $sectorId = $sectorIdMap[$sectorEn] ?? 'Sektor Maritim';

        // 5. Data untuk blade view
        $data = [
            'bg_image_base64'    => $bgImageBase64,
            'mmic_code'          => $cert->mmic ?? '',
            'bicc_code'          => $cert->mmic ?? '',
            'company_name'       => $cert->user->name,
            'company_address'    => AddressFormatter::format($cert->user->companyDetail->address ?? ''),
            'company_sector'     => $sectorId,
            'company_sector_en'  => $sectorEn,
            'becdex_score'       => $cert->submission?->valid_score ?? $cert->submission?->initial_score ?? 0,
            'becdex_category_id' => $cert->certificate->id ?? 10,
            'qr_base64'          => $qrBase64,
            'published_date'     => $publishedDate,
            'valid_until'        => $validUntil,
            'published_date_en'  => $publishedDateEn,
            'valid_until_en'     => $validUntilEn,
            'director_name'      => $cert->direktur ?? 'Rahmat Ihsan, S.H.',
            'config'             => $activeTemplate ? $activeTemplate->config : CertificateTemplate::getDefaultConfig(),
        ];

        // 6. Generate PDF
        $pdf      = Pdf::loadView('pdf.certificate', $data);
        $pdf->setPaper('a4', 'portrait');
        $companyName = trim($cert->user->name ?? 'Company');
        $safeName    = preg_replace('[/\\:*?"<>|]', '', $companyName);
        $fileName    = 'BECdex Certificate_' . $safeName . '.pdf';

        // Mode inline = preview di iframe; mode download = force download file
        if ($request->query('mode') === 'download') {
            return $pdf->download($fileName);
        }

        return $pdf->stream($fileName);
    }

    /**
     * PATCH /api/admin/certificates/{id}/toggle-detail-public
     * Buka atau kunci halaman detail publik sertifikasi perusahaan
     */
    public function toggleDetailPublic(int $id): JsonResponse
    {
        $cert = CertificateUser::findOrFail($id);
        $cert->is_detail_public = !$cert->is_detail_public;
        $cert->save();

        \Illuminate\Support\Facades\Cache::forget('verified_companies_p1');

        return response()->json([
            'message' => $cert->is_detail_public
                ? 'Halaman detail perusahaan berhasil dibuka untuk publik.'
                : 'Halaman detail perusahaan berhasil dikunci (hanya tampil di katalog).',
            'data' => [
                'id'               => $cert->id,
                'is_detail_public' => (bool) $cert->is_detail_public,
            ],
        ]);
    }

    /**
     * PATCH /api/admin/certificates/{id}/toggle-catalog
     * Munculkan atau sembunyikan sertifikat dari katalog publik (toggle is_approved)
     * secara langsung di masing-masing sertifikat tanpa harus melalui alur asesmen.
     */
    public function toggleCatalog(int $id): JsonResponse
    {
        $cert = CertificateUser::with(['user.companyDetail', 'submission', 'certificate'])->findOrFail($id);
        $cert->is_approved = !$cert->is_approved;
        $cert->save();

        // Jika dimunculkan ke katalog dan submission belum status 5 (Certified), perbarui statusnya
        if ($cert->is_approved && $cert->submission && $cert->submission->submission_status_id !== 5) {
            $cert->submission->update(['submission_status_id' => 5]);
        }

        // Sinkronkan kategori ke companyDetail jika diperlukan
        if ($cert->is_approved && $cert->user && $cert->user->companyDetail && $cert->certificate) {
            $catMap = [
                'standard'  => 2,
                'good'      => 3,
                'excellent' => 4,
            ];
            $catId = $catMap[strtolower($cert->certificate->category ?? '')] ?? 3;
            $cert->user->companyDetail->update(['becdex_category_id' => $catId]);
        }

        if ($cert->submission_id) {
            ActivityLog::create([
                'user_id'       => Auth::id(),
                'submission_id' => $cert->submission_id,
                'action'        => $cert->is_approved ? 'published_to_catalog' : 'hidden_from_catalog',
                'description'   => ($cert->is_approved ? 'Memunculkan di katalog' : 'Menyembunyikan dari katalog') . ' untuk ' . ($cert->user->name ?? 'Perusahaan') . ' (Nomor BICC: ' . $cert->mmic . ')',
                'ip_address'    => request()->ip(),
            ]);
        }

        \Illuminate\Support\Facades\Cache::forget('verified_companies_p1');

        return response()->json([
            'message' => $cert->is_approved
                ? 'Sertifikat berhasil dimunculkan di katalog publik!'
                : 'Sertifikat berhasil disembunyikan dari katalog publik.',
            'data' => [
                'id'          => $cert->id,
                'is_approved' => (bool) $cert->is_approved,
            ],
        ]);
    }

    /**
     * PUT /api/admin/certificates/{id}
     * Update data sertifikat (BICC, Direktur, Tanggal Terbit, Tanggal Berlaku)
     */
    public function update(Request $request, int $id): JsonResponse
    {
        $cert = CertificateUser::with(['user.companyDetail.companyField', 'submission', 'certificate'])->findOrFail($id);

        $validated = $request->validate([
            'direktur'     => ['required', 'string', 'max:200'],
            'published_at' => ['required', 'date'],
            'valid_until'  => ['required', 'date'],
        ]);

        $publishedAt = Carbon::parse($validated['published_at']);
        $validUntil  = Carbon::parse($validated['valid_until']);

        $cert->update([
            'direktur'     => trim($validated['direktur']),
            'published_at' => $publishedAt,
            'valid_until'  => $validUntil,
        ]);

        if ($cert->submission_id) {
            ActivityLog::create([
                'user_id'       => Auth::id(),
                'submission_id' => $cert->submission_id,
                'action'        => 'updated_certificate',
                'description'   => 'Memperbarui data sertifikat (Nomor BICC: ' . $cert->mmic . ', Direktur: ' . $cert->direktur . ', Berlaku: ' . $cert->valid_until->format('d/m/Y') . ')',
                'ip_address'    => request()->ip(),
            ]);
        }

        \Illuminate\Support\Facades\Cache::forget('verified_companies_p1');

        return response()->json([
            'message' => 'Data sertifikat berhasil diperbarui.',
            'data'    => $cert->fresh(['user.companyDetail', 'submission', 'certificate']),
        ]);
    }

    /**
     * GET /api/admin/certificates/eligible-companies
     * Ambil daftar perusahaan (user role 2) beserta info status penerbitan sertifikat.
     */
    public function eligibleCompanies(): JsonResponse
    {
        $companies = User::where('role_id', 2)
            ->with(['companyDetail.companyField', 'companyDetail.becdexCategory'])
            ->orderBy('name')
            ->get()
            ->map(function ($u) {
                $latestCert = CertificateUser::where('user_id', $u->id)->latest('published_at')->first();
                $hasSubmission = $u->submissions()->exists();
                return [
                    'id'               => $u->id,
                    'name'             => $u->name,
                    'email'            => $u->email,
                    'brand_name'       => $u->companyDetail?->brand_name,
                    'pic_name'         => $u->companyDetail?->pic_name,
                    'company_country'  => $u->companyDetail?->company_country ?? 'ID',
                    'sector'           => $u->companyDetail?->companyField?->name,
                    'has_submission'   => $hasSubmission,
                    'is_certified'     => (bool) ($latestCert && $latestCert->is_approved),
                    'existing_cert'    => $latestCert ? [
                        'id'          => $latestCert->id,
                        'mmic'        => $latestCert->mmic,
                        'is_approved' => (bool) $latestCert->is_approved,
                        'valid_until' => $latestCert->valid_until?->format('Y-m-d'),
                    ] : null,
                ];
            });

        $certificates = Certificate::select('id', 'category', 'description')->get();
        $nextBicc = CertificateNumberService::generate(now()->toDateString(), 'ID');

        return response()->json([
            'companies'        => $companies,
            'certificates'     => $certificates,
            'next_bicc'        => $nextBicc,
            'default_director' => 'Rahmat Ihsan, S.H.',
        ]);
    }

    /**
     * POST /api/admin/certificates/direct-issue
     * Terbitkan sertifikat & munculkan ke katalog langsung tanpa mengharuskan perusahaan mengisi asesmen
     */
    public function directIssue(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'user_id'          => ['required', 'integer', 'exists:users,id'],
            'certificate_id'   => ['required', 'integer', 'exists:certificates,id'],
            'mmic'             => ['nullable', 'string', 'max:50'],
            'direktur'         => ['nullable', 'string', 'max:200'],
            'published_at'     => ['nullable', 'date'],
            'valid_until'      => ['nullable', 'date'],
            'is_approved'      => ['boolean'],
            'is_detail_public' => ['boolean'],
            'score'            => ['nullable', 'numeric', 'min:0', 'max:100'],
        ]);

        $user = User::with('companyDetail')->findOrFail($validated['user_id']);

        // 1. Tentukan submission: jika sudah ada gunakan yang ada, jika belum buatkan submission stub (status: 5 Certified)
        $submission = $user->submissions()->latest()->first();
        $score = isset($validated['score']) && is_numeric($validated['score']) ? number_format((float)$validated['score'], 2, '.', '') : '85.00';

        if (!$submission) {
            $submission = Submission::create([
                'user_id'              => $user->id,
                'submission_status_id' => 5, // Certified
                'initial_score'        => $score,
                'valid_score'          => $score,
                'survey_score'         => $score,
                'revision_count'       => 0,
                'current_upload_phase' => 1,
                'reason'               => 'Diterbitkan langsung ke katalog oleh Admin (Direct Issue)',
            ]);
        } else {
            // Update status submission jika belum certified
            if ($submission->submission_status_id !== 5) {
                $submission->update([
                    'submission_status_id' => 5,
                    'valid_score'          => $submission->valid_score > 0 ? $submission->valid_score : $score,
                ]);
            }
        }

        // 2. Generate nomor BICC jika tidak diisi manual
        $publishedAt = Carbon::parse($validated['published_at'] ?? now());
        $validUntil  = !empty($validated['valid_until'])
            ? Carbon::parse($validated['valid_until'])
            : $publishedAt->copy()->addYears(3)->subDay();

        $country = $user->companyDetail->company_country ?? 'ID';
        $mmic = !empty($validated['mmic'])
            ? trim($validated['mmic'])
            : CertificateNumberService::generate($publishedAt->toDateString(), $country);

        $directorName = !empty($validated['direktur'])
            ? trim($validated['direktur'])
            : 'Rahmat Ihsan, S.H.';

        $isApproved     = $request->boolean('is_approved', true);
        $isDetailPublic = $request->boolean('is_detail_public', true);

        // 3. Simpan / update sertifikat di certificate_users
        $certUser = CertificateUser::updateOrCreate(
            ['submission_id' => $submission->id],
            [
                'certificate_id'   => $validated['certificate_id'],
                'user_id'          => $user->id,
                'mmic'             => $mmic,
                'direktur'         => $directorName,
                'published_at'     => $publishedAt,
                'valid_until'      => $validUntil,
                'is_approved'      => $isApproved,
                'is_detail_public' => $isDetailPublic,
            ]
        );

        // 4. Sinkronkan kategori BECdex di companyDetail
        $certTemplate = Certificate::find($validated['certificate_id']);
        $catMap = [
            'standard'  => 2,
            'good'      => 3,
            'excellent' => 4,
        ];
        $catId = $catMap[strtolower($certTemplate->category ?? '')] ?? 3;

        if ($user->companyDetail) {
            $user->companyDetail->update([
                'becdex_category_id' => $catId,
            ]);
        }

        // 5. Catat log aktivitas
        ActivityLog::create([
            'user_id'       => Auth::id(),
            'submission_id' => $submission->id,
            'action'        => 'direct_issue_certificate',
            'description'   => 'Menerbitkan langsung ke katalog untuk ' . $user->name . ' (Nomor BICC: ' . $mmic . ')',
            'ip_address'    => request()->ip(),
        ]);

        // 6. Reset cache katalog publik
        \Illuminate\Support\Facades\Cache::forget('verified_companies_p1');

        return response()->json([
            'message' => 'Perusahaan berhasil diterbitkan ke katalog!',
            'data'    => $certUser->load(['user.companyDetail.companyField', 'certificate', 'submission']),
        ], 201);
    }

    /**
     * DELETE /api/admin/certificates/{id}
     * Hapus / cabut sertifikat dari katalog
     */
    public function destroy(int $id): JsonResponse
    {
        $cert = CertificateUser::with('user')->findOrFail($id);
        $companyName = $cert->user?->name ?? 'Perusahaan';
        $bicc = $cert->mmic;

        if ($cert->submission_id) {
            ActivityLog::create([
                'user_id'       => Auth::id(),
                'submission_id' => $cert->submission_id,
                'action'        => 'revoked_certificate',
                'description'   => 'Mencabut sertifikat BICC ' . $bicc . ' dari ' . $companyName,
                'ip_address'    => request()->ip(),
            ]);
        }

        $cert->delete();

        \Illuminate\Support\Facades\Cache::forget('verified_companies_p1');

        return response()->json([
            'message' => 'Sertifikat untuk ' . $companyName . ' berhasil dihapus dari katalog.',
        ]);
    }
}

