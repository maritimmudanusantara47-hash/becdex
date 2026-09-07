<?php

namespace App\Http\Controllers\Submission;

use App\Http\Controllers\Controller;
use App\Enums\RoleId;
use App\Models\Submission;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use App\Models\ActivityLog;
use Illuminate\Support\Facades\Auth;

class AssessorController extends Controller
{
    /**
     * Get list of all available assessors (admin role)
     */
    public function availableAssessors(): JsonResponse
    {
        // Ambil semua user dengan role assessor (Reviewer & Supervisor)
        $assessors = User::whereIn('role_id', RoleId::assessorRoleIds())->select('id', 'name', 'email')->get();
        return response()->json($assessors);
    }

    /**
     * Get list of assigned assessors for a submission
     */
    public function getAssigned(string $submissionId): JsonResponse
    {
        $submission = Submission::with('assessors:id,name,email')->findOrFail($submissionId);
        return response()->json($submission->assessors);
    }

    /**
     * Assign assessors to a submission
     */
    public function assign(Request $request, string $submissionId): JsonResponse
    {
        $request->validate([
            'assessor_ids' => 'required|array',
            'assessor_ids.*' => 'exists:users,id',
        ]);

        $submission = Submission::findOrFail($submissionId);
        
        $submission->assessors()->sync($request->assessor_ids);

        $assessorNames = User::whereIn('id', $request->assessor_ids)->pluck('name')->toArray();
        $namesString = count($assessorNames) > 0 ? ' (' . implode(', ', $assessorNames) . ')' : '';

        // Log the activity
        ActivityLog::create([
            'user_id' => Auth::id(),
            'submission_id' => $submission->id,
            'action' => 'assigned_assessors',
            'description' => 'Telah menugaskan ' . count($request->assessor_ids) . ' asesor' . $namesString . ' ke perusahaan ini.',
            'ip_address' => request()->ip(),
        ]);

        return response()->json([
            'message' => 'Assessors assigned successfully',
            'assessors' => $submission->assessors()->get(['users.id', 'users.name', 'users.email'])
        ]);
    }
}
