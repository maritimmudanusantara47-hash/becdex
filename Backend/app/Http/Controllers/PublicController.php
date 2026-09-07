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
        $search  = $request->query('search', '');
        $perPage = 20;

        // Fetch langsung dari database agar selalu real-time
        $data = $this->fetchVerifiedCompanies($search, $perPage);

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
                'company_fields' => CompanyField::select('id', 'name')->orderBy('name')->get(),
            ];
        });

        return response()->json(['data' => $data]);
    }
}
