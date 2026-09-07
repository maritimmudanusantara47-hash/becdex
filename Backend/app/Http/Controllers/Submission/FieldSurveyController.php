<?php

namespace App\Http\Controllers\Submission;

use App\Http\Controllers\Controller;
use App\Models\FieldSurvey;
use App\Models\Submission;
use App\Models\ActivityLog;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Auth;

class FieldSurveyController extends Controller
{
    /**
     * Get all surveys for a submission
     */
    public function index(string $submissionId): JsonResponse
    {
        $surveys = FieldSurvey::with('assessor:id,name')->where('submission_id', $submissionId)->get();
        return response()->json($surveys);
    }

    /**
     * Create a new survey schedule/report
     */
    public function store(Request $request, string $submissionId): JsonResponse
    {
        $request->validate([
            'scheduled_at' => 'nullable|date',
            'notes' => 'nullable|string',
            'status' => 'required|string|in:scheduled,completed,cancelled',
        ]);

        $survey = FieldSurvey::create([
            'submission_id' => $submissionId,
            'assessor_id' => Auth::id(),
            'scheduled_at' => $request->scheduled_at,
            'notes' => $request->notes,
            'status' => $request->status,
        ]);

        ActivityLog::create([
            'user_id' => Auth::id(),
            'submission_id' => $submissionId,
            'action' => 'created_field_survey',
            'description' => 'Membuat jadwal survei lapangan baru dengan status: ' . $request->status,
            'ip_address' => request()->ip(),
        ]);

        return response()->json($survey->load('assessor:id,name'), 201);
    }

    /**
     * Upload survey report file
     */
    public function uploadFile(Request $request, string $id): JsonResponse
    {
        $request->validate([
            'file' => 'required|file|max:10240', // Max 10MB
        ]);

        $survey = FieldSurvey::findOrFail($id);

        if ($request->hasFile('file')) {
            // Delete old file if exists
            if ($survey->file_path && Storage::disk('public')->exists($survey->file_path)) {
                Storage::disk('public')->delete($survey->file_path);
            }

            $path = $request->file('file')->store('surveys', 'public');
            $survey->update(['file_path' => $path]);

            ActivityLog::create([
                'user_id' => Auth::id(),
                'submission_id' => $survey->submission_id,
                'action' => 'uploaded_survey_file',
                'description' => 'Mengunggah file laporan/foto survei lapangan.',
                'ip_address' => request()->ip(),
            ]);
        }

        return response()->json($survey->load('assessor:id,name'));
    }

    /**
     * Update survey
     */
    public function update(Request $request, string $id): JsonResponse
    {
        $survey = FieldSurvey::findOrFail($id);

        $request->validate([
            'scheduled_at' => 'nullable|date',
            'notes' => 'nullable|string',
            'status' => 'required|string|in:scheduled,completed,cancelled',
        ]);

        $survey->update($request->only('scheduled_at', 'notes', 'status'));

        ActivityLog::create([
            'user_id' => Auth::id(),
            'submission_id' => $survey->submission_id,
            'action' => 'updated_field_survey',
            'description' => 'Memperbarui data survei lapangan menjadi status: ' . $request->status,
            'ip_address' => request()->ip(),
        ]);

        return response()->json($survey->load('assessor:id,name'));
    }
}
