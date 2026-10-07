<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\CertificateTemplate;
use Illuminate\Support\Facades\Storage;
use Barryvdh\DomPDF\Facade\Pdf;
use Illuminate\Support\Carbon;

class CertificateTemplateController extends Controller
{
    public function index()
    {
        $templates = CertificateTemplate::orderBy('created_at', 'desc')->get();
        return response()->json(['data' => $templates]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'background_image' => 'nullable|image|mimes:jpeg,png,jpg|max:5120', // 5MB max
            'config' => 'nullable',
            'is_active' => 'nullable',
        ]);

        $data = $request->only(['name']);
        if ($request->filled('config')) {
            $data['config'] = is_array($request->config) ? $request->config : json_decode($request->config, true);
        }

        if ($request->hasFile('background_image')) {
            $path = $request->file('background_image')->store('certificates', 'public');
            $data['background_path'] = $path;
        }

        $isActive = $request->has('is_active')
            ? filter_var($request->is_active, FILTER_VALIDATE_BOOLEAN)
            : (CertificateTemplate::count() === 0);

        if ($isActive) {
            CertificateTemplate::query()->update(['is_active' => false]);
            $data['is_active'] = true;
        } else {
            $data['is_active'] = false;
        }

        $template = CertificateTemplate::create($data);

        return response()->json(['message' => 'Template created successfully', 'data' => $template], 201);
    }

    public function show(string $id)
    {
        $template = CertificateTemplate::findOrFail($id);
        return response()->json(['data' => $template]);
    }

    public function update(Request $request, string $id)
    {
        $template = CertificateTemplate::findOrFail($id);

        $request->validate([
            'name' => 'sometimes|required|string|max:255',
            'background_image' => 'nullable|image|mimes:jpeg,png,jpg|max:5120',
            'config' => 'nullable',
            'is_active' => 'nullable',
        ]);

        $data = $request->only(['name']);
        if ($request->filled('config')) {
            $data['config'] = is_array($request->config) ? $request->config : json_decode($request->config, true);
        }

        if ($request->hasFile('background_image')) {
            // Delete old background if exists
            if ($template->background_path) {
                Storage::disk('public')->delete($template->background_path);
            }
            $path = $request->file('background_image')->store('certificates', 'public');
            $data['background_path'] = $path;
        }

        if ($request->has('is_active')) {
            $isActive = filter_var($request->is_active, FILTER_VALIDATE_BOOLEAN);
            if ($isActive) {
                CertificateTemplate::where('id', '!=', $id)->update(['is_active' => false]);
                $data['is_active'] = true;
            } else {
                $data['is_active'] = false;
            }
        } elseif (CertificateTemplate::where('is_active', true)->count() === 0) {
            $data['is_active'] = true;
        }

        $template->update($data);

        return response()->json(['message' => 'Template updated successfully', 'data' => $template]);
    }

    public function destroy(string $id)
    {
        $template = CertificateTemplate::findOrFail($id);

        if ($template->is_active) {
            return response()->json(['message' => 'Cannot delete the active template.'], 400);
        }

        if ($template->background_path) {
            Storage::disk('public')->delete($template->background_path);
        }

        $template->delete();

        return response()->json(['message' => 'Template deleted successfully']);
    }

    public function setActive(string $id)
    {
        $template = CertificateTemplate::findOrFail($id);

        // Deactivate all others
        CertificateTemplate::where('id', '!=', $id)->update(['is_active' => false]);

        // Activate this one
        $template->update(['is_active' => true]);

        return response()->json(['message' => 'Template set as active successfully', 'data' => $template]);
    }

    public function preview(string $id)
    {
        $template = CertificateTemplate::findOrFail($id);
        
        $bgPath = null;
        if ($template->background_path && Storage::disk('public')->exists($template->background_path)) {
            $bgPath = storage_path('app/public/' . $template->background_path);
        } else {
            $bgPath = storage_path('app/public/certificates/excellent.jpg');
        }

        if (!$bgPath || !file_exists($bgPath)) {
            $bgPath = public_path('assets/certificate_default_bg.jpg');
        }

        $bgImageBase64 = '';
        if (file_exists($bgPath)) {
            $mime = mime_content_type($bgPath) ?: 'image/jpeg';
            $bgImageBase64 = 'data:' . $mime . ';base64,' . base64_encode(file_get_contents($bgPath));
        }

        $qrBase64 = '';
        try {
            $qrApiUrl = "https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=" . urlencode("https://becdex.com/verified-companies");
            $arrContextOptions = [
                "ssl" => [
                    "verify_peer" => false,
                    "verify_peer_name" => false,
                ],
            ];
            $qrData = @file_get_contents($qrApiUrl, false, stream_context_create($arrContextOptions));
            if ($qrData) {
                $qrBase64 = 'data:image/png;base64,' . base64_encode($qrData);
            }
        } catch (\Exception $e) {}

        $data = [
            'mmic_code' => 'BICCID002072026',
            'company_name' => 'PT Eco Karya Teknologi (Crustea Indonesia)',
            'company_address' => 'Jl. Griya Lestari No.19 Blok D3, Gondoriyo, Ngaliyan, Semarang',
            'company_sector' => 'Perikanan Tangkap dan Budidaya',
            'company_sector_en' => 'Marine Fisheries and Aquaculture',
            'becdex_score' => 95.5,
            'becdex_category_id' => 11,
            'published_date' => '29 Agustus 2026',
            'valid_until' => '28 Agustus 2029',
            'published_date_en' => '29 August 2026',
            'valid_until_en' => '28 August 2029',
            'director_name' => 'Kaisar Akhir',
            'qr_base64' => $qrBase64,
            'bg_image_base64' => $bgImageBase64,
            'config' => (!empty($template->config) && is_array($template->config)) ? $template->config : CertificateTemplate::getDefaultConfig(),
            'is_preview' => true
        ];

        $pdf = Pdf::loadView('pdf.certificate', $data);
        $pdf->setPaper('a4', 'portrait');

        return $pdf->stream('preview_certificate.pdf');
    }
}
