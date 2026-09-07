<?php

namespace App\Http\Middleware;

use App\Enums\RoleId;
use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class EnsureSuperAdmin
{
    public function handle(Request $request, Closure $next): Response
    {
        $user = $request->user();
        if (!$user || !in_array($user->role_id, RoleId::superAdminRoleIds())) {
            return response()->json([
                'message' => 'Forbidden. Super Admin access required.',
            ], 403);
        }
        return $next($request);
    }
}
