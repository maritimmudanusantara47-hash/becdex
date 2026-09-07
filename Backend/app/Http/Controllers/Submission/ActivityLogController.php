<?php

namespace App\Http\Controllers\Submission;

use App\Http\Controllers\Controller;
use App\Models\ActivityLog;
use Illuminate\Http\JsonResponse;

class ActivityLogController extends Controller
{
    /**
     * Get all activity logs for a submission
     */
    public function index(string $submissionId): JsonResponse
    {
        $logs = ActivityLog::with('user:id,name,email')
            ->where('submission_id', $submissionId)
            ->orderBy('created_at', 'desc')
            ->get();
            
        return response()->json($logs);
    }
}
