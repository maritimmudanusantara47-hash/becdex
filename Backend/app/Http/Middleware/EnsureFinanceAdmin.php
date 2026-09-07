<?php

namespace App\Http\Middleware;

use App\Enums\RoleId;
use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class EnsureFinanceAdmin
{
    public function handle(Request $request, Closure $next): Response
    {
        $user = $request->user();
        if (!$user || !in_array($user->role_id, RoleId::financeRoleIds())) {
            return response()->json([
                'message' => 'Forbidden. Finance Admin access required.',
            ], 403);
        }
        return $next($request);
    }
}
