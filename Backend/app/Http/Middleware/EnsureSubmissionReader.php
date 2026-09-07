<?php

namespace App\Http\Middleware;

use App\Enums\RoleId;
use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class EnsureSubmissionReader
{
    /**
     * Izinkan role yang bisa membaca detail submission:
     * Super Admin, QC Admin, Assessment Admin, Certificate Admin.
     * Certificate Admin butuh akses READ submission untuk bisa menerbitkan sertifikat.
     */
    public function handle(Request $request, Closure $next): Response
    {
        $user = $request->user();
        if (!$user || !in_array($user->role_id, RoleId::submissionReadRoleIds())) {
            return response()->json([
                'message' => 'Forbidden. Submission read access required.',
            ], 403);
        }
        return $next($request);
    }
}
