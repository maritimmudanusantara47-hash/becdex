<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\CertificateUser;
use App\Models\CertificateTemplate;
use App\Notifications\SystemNotification;
use Barryvdh\DomPDF\Facade\Pdf;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
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
            'valid_until'  => $c->valid_until?->format('Y-m-d'),
            'is_approved'  => (bool) $c->is_approved,
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

        return response()->json(['data' => $cert]);
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

                $qrUrl    = url('/verified-companies');
                $qrBase64 = '';
                try {
                    $qrApiUrl          = "https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=" . urlencode($qrUrl);
                    $arrContextOptions = ["ssl" => ["verify_peer" => false, "verify_peer_name" => false]];
                    $qrData            = file_get_contents($qrApiUrl, false, stream_context_create($arrContextOptions));
                    if ($qrData) {
                        $qrBase64 = 'data:image/png;base64,' . base64_encode($qrData);
                    }
                } catch (\Exception $e) {}

                $data = [
                    'bg_image_base64'    => $bgImageBase64,
                    'mmic_code'          => ($cert->published_at ? $cert->published_at->format('dmY') : '') . ($cert->mmic ?? ''),
                    'company_name'       => $cert->user->name,
                    'company_address'    => $cert->user->companyDetail->address ?? '',
                    'company_sector'     => $cert->user->companyDetail->companyField->name ?? 'Maritime Sector',
                    'becdex_category_id' => $cert->certificate->id ?? 10,
                    'qr_base64'          => $qrBase64,
                    'published_date'     => $cert->published_at ? $cert->published_at->format('d-m-Y') : '',
                    'valid_until'        => $cert->valid_until ? $cert->valid_until->format('d-m-Y') : '',
                    'director_name'      => $cert->direktur ?? 'Rahmat Ihsan, S.H.',
                ];

                $pdf        = \Barryvdh\DomPDF\Facade\Pdf::loadView('pdf.certificate', $data);
                $pdf->setPaper('a4', 'portrait');
                $pdfContent = $pdf->output();
                $pdfFileName = 'certificate_' . str_replace(' ', '_', $cert->user->name) . '.pdf';

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
        $activeTemplate = CertificateTemplate::where('is_active', true)->first();
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
        $publishedDate   = $cert->published_at ? $cert->published_at->locale('id')->translatedFormat('d F Y') : '';
        $validUntil      = $cert->valid_until   ? $cert->valid_until->locale('id')->translatedFormat('d F Y') : '';
        $publishedDateEn = $cert->published_at  ? $cert->published_at->locale('en')->translatedFormat('d F Y') : '';
        $validUntilEn    = $cert->valid_until   ? $cert->valid_until->locale('en')->translatedFormat('d F Y') : '';

        // 3. QR Code
        $qrUrl    = url('/verified-companies');
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
            'company_name'       => $cert->user->name,
            'company_address'    => $cert->user->companyDetail->address ?? '',
            'company_sector'     => $sectorId,
            'company_sector_en'  => $sectorEn,
            'becdex_score'       => $cert->submission->valid_score ?? $cert->submission->initial_score ?? 0,
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
        $fileName = 'certificate_' . str_replace(' ', '_', $cert->user->name) . '.pdf';

        // Mode inline = preview di iframe; mode download = force download file
        if ($request->query('mode') === 'download') {
            return $pdf->download($fileName);
        }

        return $pdf->stream($fileName);
    }
}
