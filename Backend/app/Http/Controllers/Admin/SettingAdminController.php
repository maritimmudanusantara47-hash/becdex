<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Setting;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class SettingAdminController extends Controller
{
    /**
     * GET /api/admin/settings
     * Get all settings as key-value object
     */
    public function index(): JsonResponse
    {
        $settings = Setting::all()->keyBy('key')->map(fn ($s) => [
            'value' => $s->value,
            'label' => $s->description,
        ]);

        return response()->json(['data' => $settings]);
    }

    /**
     * PUT /api/admin/settings
     * Update one or more settings at once
     */
    public function update(Request $request): JsonResponse
    {
        $data = $request->only([
            'payment_amount',
            'xendit_secret_key',
            'xendit_webhook_token',
        ]);

        foreach ($data as $key => $value) {
            Setting::updateOrCreate(
                ['key' => $key],
                ['value' => $value]
            );
        }

        return response()->json(['message' => 'Pengaturan berhasil disimpan.']);
    }
}
