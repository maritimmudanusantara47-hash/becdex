<?php

namespace App\Http\Controllers;

use App\Models\CertificateUser;
use App\Models\Indicator;
use App\Models\Download;
use App\Models\HelpMessage;
use App\Models\Country;
use App\Models\CompanyField;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;

class PublicController extends Controller
{
    /**
     * GET /api/public/verified-companies
     * Public list of certified companies — paginasi 20/halaman, cache 5 menit
     */
    public function verifiedCompanies(Request $request): JsonResponse
    {
        $search  = trim((string) $request->query('search', ''));
        $page    = (int) $request->query('page', 1);
        $perPage = 20;

        // Cache page 1 tanpa pencarian selama 60 detik untuk mempercepat Time Behaviour publik
        if ($search === '' && $page <= 1) {
            $data = Cache::remember('verified_companies_p1', 60, function () use ($search, $perPage) {
                return $this->fetchVerifiedCompanies($search, $perPage);
            });
        } else {
            $data = $this->fetchVerifiedCompanies($search, $perPage);
        }

        return response()->json($data);
    }

    private function fetchVerifiedCompanies(string $search, int $perPage): array
    {
        $query = CertificateUser::with([
            'user.companyDetail.companyField',
            'user.companyDetail.becdexCategory',
            'certificate',
        ])
        ->where('valid_until', '>=', now())
        ->where('is_approved', true)
        ->latest('published_at');

        if ($search) {
            $query->whereHas('user', fn ($q) =>
                $q->where('name', 'like', "%{$search}%")
            );
        }

        $paginated = $query->paginate(20);

        $items = collect($paginated->items())->map(fn ($cert) => [
            'id'           => $cert->id,
            'mmic'         => $cert->mmic,
            'published_at' => $cert->published_at?->toISOString(),
            'valid_until'  => $cert->valid_until?->toISOString(),
            'user'         => $cert->user ? [
                'id'    => $cert->user->id,
                'name'  => $cert->user->name,
                'email' => $cert->user->email,
                'image' => $cert->user->image,
                'company' => $cert->user->companyDetail ? [
                    'company_name'    => $cert->user->name,
                    'company_country' => $cert->user->companyDetail->company_country,
                    'company_field'   => $cert->user->companyDetail->companyField ? [
                        'name' => $cert->user->companyDetail->companyField->name,
                    ] : null,
                    'becdex_category' => $cert->user->companyDetail->becdexCategory ? [
                        'name' => $cert->user->companyDetail->becdexCategory->name,
                    ] : null,
                ] : null,
            ] : null,
            'certificate'  => $cert->certificate ? [
                'name' => ucfirst($cert->certificate->category),
            ] : null,
        ]);

        return [
            'data' => $items,
            'meta' => [
                'current_page' => $paginated->currentPage(),
                'last_page'    => $paginated->lastPage(),
                'per_page'     => $paginated->perPage(),
                'total'        => $paginated->total(),
            ],
        ];
    }

    /**
     * GET /api/public/indicators
     * Public listing of assessment framework (catalog) — cache 30 menit
     * Data ini hampir tidak berubah, sangat cocok di-cache
     */
    public function catalogIndicators(): JsonResponse
    {
        $indicators = Cache::remember('catalog_indicators', 1800, function () {
            return Indicator::with([
                'principle.outcome.aspect:id,name',
                'principle.outcome:id,aspect_id,name',
                'principle:id,outcome_id,name',
                'questions:id,indicator_id,text',
            ])->get();
        });

        return response()->json(['data' => $indicators]);
    }

    /**
     * GET /api/public/downloads
     * Get public downloads — cache 10 menit
     */
    public function downloads(): JsonResponse
    {
        $downloads = Cache::remember('public_downloads', 600, function () {
            return Download::latest()->get();
        });

        return response()->json(['data' => $downloads]);
    }

    /**
     * POST /api/public/help
     * Submit help request from landing page
     */
    public function sendHelp(Request $request): JsonResponse
    {
        $request->validate([
            'name'       => 'required|string|max:255',
            'email'      => 'required|email|max:255',
            'whatsapp'   => 'nullable|string|max:20',
            'issue_type' => 'nullable|string|max:100',
            'detail'     => 'required|string',
        ]);

        $msg = HelpMessage::create([
            'name'       => $request->name,
            'email'      => $request->email,
            'whatsapp'   => $request->whatsapp,
            'issue_type' => $request->issue_type,
            'detail'     => $request->detail,
            'is_read'    => false,
        ]);

        return response()->json([
            'message' => 'Your message has been sent. We will contact you shortly.',
            'data'    => $msg,
        ], 201);
    }

    /**
     * GET /api/public/lookups
     * Get lookup tables — cache 1 jam (data sangat statis)
     */
    public function lookups(): JsonResponse
    {
        $data = Cache::remember('public_lookups', 3600, function () {
            return [
                'countries'      => Country::select('id', 'iso', 'name')->orderBy('name')->get(),
                'company_fields' => CompanyField::select('id', 'name', 'name_id')->orderBy('name')->get(),
            ];
        });

        return response()->json(['data' => $data]);
    }

    /**
     * GET /api/public/verified-companies/{serial_id}
     * Detail verification for a certified company by serial ID (BICC / MMIC number or ID)
     */
    public function showVerifiedCompany(string $serialId): JsonResponse
    {
        $cert = CertificateUser::with([
            'user.companyDetail.companyField',
            'certificate',
            'submission',
        ])
        ->where(function ($q) use ($serialId) {
            $q->where('mmic', $serialId);
            if (is_numeric($serialId)) {
                $q->orWhere('id', (int) $serialId);
            }
        })
        ->where('is_approved', true)
        ->first();

        if (!$cert) {
            return response()->json([
                'message' => 'Perusahaan atau sertifikat dengan nomor registrasi tersebut tidak ditemukan atau belum diverifikasi.',
            ], 404);
        }

        $isActive = $cert->valid_until ? $cert->valid_until->gte(now()->startOfDay()) : false;

        return response()->json([
            'data' => [
                'id'           => $cert->id,
                'serial_id'    => $cert->mmic,
                'is_active'    => $isActive,
                'published_at' => $cert->published_at?->format('Y-m-d'),
                'valid_until'  => $cert->valid_until?->format('Y-m-d'),
                'director'     => $cert->direktur,
                'category'     => [
                    'name'  => $cert->certificate?->category,
                    'label' => $cert->certificate?->description,
                ],
                'company' => [
                    'name'        => $cert->user?->name ?? 'Company',
                    'image'       => $cert->user?->image,
                    'country'     => $cert->user?->companyDetail?->company_country,
                    'sector'      => $cert->user?->companyDetail?->companyField?->name,
                    'sector_id'   => $cert->user?->companyDetail?->companyField?->name_id,
                    'description' => $cert->user?->companyDetail?->description,
                    'website'     => $cert->user?->companyDetail?->website,
                    'address'     => $cert->user?->companyDetail?->address,
                ],
                'score'      => (float) ($cert->submission?->valid_score ?? 0),
                'radar_data' => $cert->submission ? $cert->submission->getRadarChartData() : [],
            ],
        ]);
    }
}

