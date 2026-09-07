<?php

namespace App\Http\Controllers\Submission;

use App\Http\Controllers\Controller;
use App\Http\Requests\Submission\UploadDocumentRequest;
use App\Http\Resources\DocumentResource;
use App\Models\Document;
use App\Models\Submission;
use App\Models\SubmissionPerIndicator;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class DocumentController extends Controller
{
    /**
     * POST /api/submissions/{id}/documents
     * Upload dokumen per indikator
     */
    public function upload(UploadDocumentRequest $request, string $id): JsonResponse
    {
        $submission = $request->user()
            ->submissions()
            ->whereIn('submission_status_id', [2, 4])
            ->findOrFail($id);

        // Hitung dokumen hanya untuk fase upload yang sedang berjalan (max 10 per fase)
        $currentPhase = $submission->current_upload_phase ?? 1;
        $existingDocsCount = Document::where('submission_id', $submission->id)
            ->where('indicator_id', $request->indicator_id)
            ->where('upload_phase', $currentPhase)
            ->count();

        if ($existingDocsCount >= 10) {
            return response()->json([
                'message' => 'Anda telah mencapai batas maksimal 10 dokumen untuk indikator ini pada tahap ini.'
            ], 422);
        }

        $file = $request->file('file');
        $path = $file->store("documents/{$submission->id}", 'public');

        $document = Document::create([
            'submission_id' => $submission->id,
            'indicator_id'  => $request->indicator_id,
            'file_path'     => $path,
            'original_name' => $file->getClientOriginalName(),
            'mime_type'     => $file->getMimeType(),
            'file_size'     => $file->getSize(),
            'upload_phase'  => $currentPhase,
        ]);

        // Update per-indicator status ke Uploaded (2), KECUALI yang sudah Verified (4)
        // Jika sudah Verified, upload dokumen tambahan tidak boleh mengganggu status verifikasi
        SubmissionPerIndicator::where('submission_id', $submission->id)
            ->where('indicator_id', $request->indicator_id)
            ->where('per_indicator_status_id', '!=', 4) // Jangan timpa yang sudah Verified
            ->update(['per_indicator_status_id' => 2]); // Uploaded

        return response()->json([
            'message' => 'Document uploaded successfully.',
            'data'    => new DocumentResource($document->load('indicator')),
        ], 201);
    }

    /**
     * GET /api/submissions/{id}/documents
     * Daftar dokumen dalam satu submission
     */
    public function index(Request $request, string $id): JsonResponse
    {
        $submission = $request->user()
            ->submissions()
            ->findOrFail($id);

        $documents = $submission->documents()
            ->with('indicator')
            ->get();

        return response()->json([
            'data'  => DocumentResource::collection($documents),
            'total' => $documents->count(),
        ]);
    }

    /**
     * DELETE /api/submissions/{id}/documents/{docId}
     * Hapus dokumen:
     * - Status 2 (Draft)   → bebas hapus semua dokumen
     * - Status 4 (Revisi)  → hanya boleh hapus dokumen yang upload_phase-nya sama dengan fase saat ini
     */
    public function destroy(Request $request, string $id, int $docId): JsonResponse
    {
        $submission = $request->user()
            ->submissions()
            ->whereIn('submission_status_id', [2, 4]) // Izinkan draft DAN revisi
            ->findOrFail($id);

        $document = $submission->documents()->findOrFail($docId);

        // Saat revisi (Status 4), hanya boleh hapus dokumen dari fase saat ini
        if ($submission->submission_status_id === 4) {
            $currentPhase = $submission->current_upload_phase ?? 1;
            if (($document->upload_phase ?? 1) !== $currentPhase) {
                return response()->json([
                    'message' => 'Dokumen dari fase sebelumnya tidak dapat dihapus.',
                ], 403);
            }
        }

        Storage::disk('public')->delete($document->file_path);
        $document->delete();

        // Jika tidak ada dokumen lain untuk indikator ini, reset status ke Not Uploaded
        $remaining = $submission->documents()
            ->where('indicator_id', $document->indicator_id)
            ->count();

        if ($remaining === 0) {
            SubmissionPerIndicator::where('submission_id', $submission->id)
                ->where('indicator_id', $document->indicator_id)
                ->update(['per_indicator_status_id' => 1]); // Not Uploaded
        }

        return response()->json(['message' => 'Document deleted successfully.']);
    }
}
