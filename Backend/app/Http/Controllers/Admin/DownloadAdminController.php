<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Download;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Storage;

class DownloadAdminController extends Controller
{
    /**
     * GET /api/admin/downloads
     * List all downloads
     */
    public function index(): JsonResponse
    {
        $downloads = Download::latest()->get();

        return response()->json([
            'data' => $downloads
        ]);
    }

    /**
     * POST /api/admin/downloads
     * Upload a new download file
     */
    public function store(Request $request): JsonResponse
    {
        $request->validate([
            'title' => 'required|string|max:255',
            'file'  => 'required|file|mimes:pdf,jpg,jpeg,png|max:10240', // max 10MB
        ]);

        $file = $request->file('file');
        $path = $file->store('downloads', 'public');

        $download = Download::create([
            'title'     => $request->title,
            'file_path' => $path,
        ]);

        Cache::forget('public_downloads');

        return response()->json([
            'message' => 'File uploaded successfully.',
            'data'    => $download
        ], 201);
    }

    /**
     * DELETE /api/admin/downloads/{id}
     * Delete a download file
     */
    public function destroy(int $id): JsonResponse
    {
        $download = Download::findOrFail($id);

        // Delete from storage
        Storage::disk('public')->delete($download->file_path);

        $download->delete();
        Cache::forget('public_downloads');

        return response()->json([
            'message' => 'File deleted successfully.'
        ]);
    }
}
