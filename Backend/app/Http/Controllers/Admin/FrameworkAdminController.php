<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Aspect;
use App\Models\Outcome;
use App\Models\Principle;
use App\Models\Indicator;
use App\Models\Question;
use App\Models\CompanyField;
use App\Models\Country;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;

class FrameworkAdminController extends Controller
{
    // ─── ASPECTS ──────────────────────────────────────────────────────────
    public function indexAspects(): JsonResponse
    {
        return response()->json(['data' => Aspect::withCount('outcomes')->get()]);
    }
    public function storeAspect(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'name'    => 'required|string|max:255|unique:aspects,name',
            'name_id' => 'nullable|string|max:255',
        ]);
        Cache::forget('catalog_indicators');
        return response()->json(['data' => Aspect::create($validated)], 201);
    }
    public function updateAspect(Request $request, int $id): JsonResponse
    {
        $aspect = Aspect::findOrFail($id);
        $validated = $request->validate([
            'name'    => "required|string|max:255|unique:aspects,name,{$id}",
            'name_id' => 'nullable|string|max:255',
        ]);
        $aspect->update($validated);
        Cache::forget('catalog_indicators');
        return response()->json(['data' => $aspect]);
    }
    public function destroyAspect(int $id): JsonResponse
    {
        Aspect::findOrFail($id)->delete();
        Cache::forget('catalog_indicators');
        return response()->json(['message' => 'Aspek berhasil dihapus.']);
    }

    // ─── OUTCOMES ─────────────────────────────────────────────────────────
    public function indexOutcomes(): JsonResponse
    {
        return response()->json(['data' => Outcome::with('aspect:id,name')->withCount('principles')->get()]);
    }
    public function storeOutcome(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'aspect_id' => 'required|exists:aspects,id',
            'name'      => 'required|string|max:255',
            'name_id'   => 'nullable|string|max:255',
        ]);
        return response()->json(['data' => Outcome::create($validated)], 201);
    }
    public function updateOutcome(Request $request, int $id): JsonResponse
    {
        $outcome = Outcome::findOrFail($id);
        $validated = $request->validate([
            'aspect_id' => 'required|exists:aspects,id',
            'name'      => 'required|string|max:255',
            'name_id'   => 'nullable|string|max:255',
        ]);
        $outcome->update($validated);
        return response()->json(['data' => $outcome->fresh('aspect')]);
    }
    public function destroyOutcome(int $id): JsonResponse
    {
        Outcome::findOrFail($id)->delete();
        return response()->json(['message' => 'Outcome berhasil dihapus.']);
    }

    // ─── PRINCIPLES ───────────────────────────────────────────────────────
    public function indexPrinciples(): JsonResponse
    {
        return response()->json(['data' => Principle::with('outcome.aspect:id,name')->withCount('indicators')->get()]);
    }
    public function storePrinciple(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'outcome_id' => 'required|exists:outcomes,id',
            'name'       => 'required|string|max:255',
            'name_id'    => 'nullable|string|max:255',
        ]);
        return response()->json(['data' => Principle::create($validated)], 201);
    }
    public function updatePrinciple(Request $request, int $id): JsonResponse
    {
        $principle = Principle::findOrFail($id);
        $validated = $request->validate([
            'outcome_id' => 'required|exists:outcomes,id',
            'name'       => 'required|string|max:255',
            'name_id'    => 'nullable|string|max:255',
        ]);
        $principle->update($validated);
        return response()->json(['data' => $principle->fresh('outcome')]);
    }
    public function destroyPrinciple(int $id): JsonResponse
    {
        Principle::findOrFail($id)->delete();
        return response()->json(['message' => 'Prinsip berhasil dihapus.']);
    }

    // ─── INDICATORS ───────────────────────────────────────────────────────
    public function indexIndicators(): JsonResponse
    {
        return response()->json(['data' => Indicator::with('principle.outcome.aspect:id,name')->withCount('questions')->get()]);
    }
    public function storeIndicator(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'principle_id'           => 'required|exists:principles,id',
            'name'                   => 'required|string|max:255',
            'name_id'                => 'nullable|string|max:255',
            'description'            => 'nullable|string',
            'description_en'         => 'nullable|string',
            'evidence'               => 'nullable|string',
            'evidence_en'            => 'nullable|string',
            'verification_method'    => 'nullable|string',
            'verification_method_en' => 'nullable|string',
            'regulation'             => 'nullable|string',
            'regulation_en'          => 'nullable|string',
            'is_mandatory'           => 'nullable',
        ]);
        $validated['is_mandatory'] = $request->boolean('is_mandatory');
        Cache::forget('catalog_indicators');
        return response()->json(['data' => Indicator::create($validated)], 201);
    }
    public function updateIndicator(Request $request, int $id): JsonResponse
    {
        $indicator = Indicator::findOrFail($id);
        $validated = $request->validate([
            'principle_id'           => 'required|exists:principles,id',
            'name'                   => 'required|string|max:255',
            'name_id'                => 'nullable|string|max:255',
            'description'            => 'nullable|string',
            'description_en'         => 'nullable|string',
            'evidence'               => 'nullable|string',
            'evidence_en'            => 'nullable|string',
            'verification_method'    => 'nullable|string',
            'verification_method_en' => 'nullable|string',
            'regulation'             => 'nullable|string',
            'regulation_en'          => 'nullable|string',
            'is_mandatory'           => 'nullable',
        ]);
        $validated['is_mandatory'] = $request->boolean('is_mandatory');
        $indicator->update($validated);
        Cache::forget('catalog_indicators');
        return response()->json(['data' => $indicator->fresh()]);
    }
    public function destroyIndicator(int $id): JsonResponse
    {
        Indicator::findOrFail($id)->delete();
        Cache::forget('catalog_indicators');
        return response()->json(['message' => 'Indikator berhasil dihapus.']);
    }

    // ─── QUESTIONS ────────────────────────────────────────────────────────
    public function indexQuestions(): JsonResponse
    {
        return response()->json(['data' => Question::with('indicator:id,name')->get()]);
    }
    public function storeQuestion(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'indicator_id' => 'required|exists:indicators,id',
            'text'         => 'required|string',
            'text_en'      => 'nullable|string',
            'weight'       => 'nullable|numeric|min:0|max:1',
            'is_mandatory' => 'nullable|boolean',
        ]);
        Cache::forget('catalog_indicators');
        return response()->json(['data' => Question::create($validated)], 201);
    }
    public function updateQuestion(Request $request, int $id): JsonResponse
    {
        $question = Question::findOrFail($id);
        $validated = $request->validate([
            'indicator_id' => 'required|exists:indicators,id',
            'text'         => 'required|string',
            'text_en'      => 'nullable|string',
            'weight'       => 'nullable|numeric|min:0|max:1',
            'is_mandatory' => 'nullable|boolean',
        ]);
        $question->update($validated);
        Cache::forget('catalog_indicators');
        return response()->json(['data' => $question->fresh()]);
    }
    public function destroyQuestion(int $id): JsonResponse
    {
        Question::findOrFail($id)->delete();
        Cache::forget('catalog_indicators');
        return response()->json(['message' => 'Pertanyaan berhasil dihapus.']);
    }

    // ─── COMPANY FIELDS ───────────────────────────────────────────────────
    public function indexCompanyFields(): JsonResponse
    {
        return response()->json(['data' => CompanyField::orderBy('name')->get()]);
    }
    public function storeCompanyField(Request $request): JsonResponse
    {
        $validated = $request->validate(['name' => 'required|string|max:255|unique:company_fields,name']);
        $cf = CompanyField::create($validated);
        Cache::forget('public_lookups');
        return response()->json(['data' => $cf], 201);
    }
    public function updateCompanyField(Request $request, int $id): JsonResponse
    {
        $cf = CompanyField::findOrFail($id);
        $validated = $request->validate(['name' => "required|string|max:255|unique:company_fields,name,{$id}"]);
        $cf->update($validated);
        Cache::forget('public_lookups');
        return response()->json(['data' => $cf]);
    }
    public function destroyCompanyField(int $id): JsonResponse
    {
        CompanyField::findOrFail($id)->delete();
        Cache::forget('public_lookups');
        return response()->json(['message' => 'Bidang perusahaan berhasil dihapus.']);
    }

    // ─── COUNTRIES ────────────────────────────────────────────────────────
    public function indexCountries(): JsonResponse
    {
        return response()->json(['data' => Country::orderBy('name')->get()]);
    }
    public function storeCountry(Request $request): JsonResponse
    {
        $validated = $request->validate(['name' => 'required|string|max:255|unique:countries,name']);
        $country = Country::create($validated);
        Cache::forget('public_lookups');
        return response()->json(['data' => $country], 201);
    }
    public function updateCountry(Request $request, int $id): JsonResponse
    {
        $country = Country::findOrFail($id);
        $validated = $request->validate(['name' => "required|string|max:255|unique:countries,name,{$id}"]);
        $country->update($validated);
        Cache::forget('public_lookups');
        return response()->json(['data' => $country]);
    }
    public function destroyCountry(int $id): JsonResponse
    {
        Country::findOrFail($id)->delete();
        Cache::forget('public_lookups');
        return response()->json(['message' => 'Negara berhasil dihapus.']);
    }
}
