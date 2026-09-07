<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Resources\UserResource;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Auth;
use Illuminate\Database\QueryException;

class UserAdminController extends Controller
{
    /**
     * GET /api/admin/users
     * List users with pagination. Supports filtering by role.
     */
    public function index(Request $request): JsonResponse
    {
        $query = User::with(['companyDetail.companyField', 'role'])->latest();
        
        if ($request->has('role') && $request->role !== 'all') {
            $query->whereRelation('role', 'name', $request->role);
        }

        $users = $query->paginate(20);

        return response()->json([
            'data' => UserResource::collection($users),
            'meta' => [
                'current_page' => $users->currentPage(),
                'last_page'    => $users->lastPage(),
                'per_page'     => $users->perPage(),
                'total'        => $users->total(),
            ],
        ]);
    }

    /**
     * POST /api/admin/users
     * Create a new user (Admin, Company, etc)
     */
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users',
            'password' => 'required|string|min:8',
            'role_id' => 'required|integer|exists:roles,id',
            'is_active' => 'required|integer|in:0,1,2',
        ]);

        $dataToCreate = [
            'name' => $validated['name'],
            'email' => $validated['email'],
            'password' => Hash::make($validated['password']),
            'role_id' => $validated['role_id'],
            'is_active' => $validated['is_active'],
        ];

        if ($validated['is_active'] == 1) {
            $dataToCreate['email_verified_at'] = now();
        }

        $user = User::create($dataToCreate);

        return response()->json([
            'message' => 'Pengguna berhasil dibuat.',
            'data' => new UserResource($user->load('role')),
        ], 201);
    }

    /**
     * PUT /api/admin/users/{id}
     * Update existing user
     */
    public function update(Request $request, int $id): JsonResponse
    {
        $user = User::findOrFail($id);

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users,email,' . $id,
            'password' => 'nullable|string|min:8',
            'role_id' => 'required|integer|exists:roles,id',
            'is_active' => 'required|integer|in:0,1,2',
        ]);

        $dataToUpdate = [
            'name' => $validated['name'],
            'email' => $validated['email'],
            'role_id' => $validated['role_id'],
            'is_active' => $validated['is_active'],
        ];

        if ($validated['is_active'] == 1 && !$user->hasVerifiedEmail()) {
            $dataToUpdate['email_verified_at'] = now();
        }

        if (!empty($validated['password'])) {
            $dataToUpdate['password'] = Hash::make($validated['password']);
        }

        $user->update($dataToUpdate);

        return response()->json([
            'message' => 'Data pengguna berhasil diperbarui.',
            'data' => new UserResource($user->fresh()->load('role')),
        ]);
    }

    /**
     * POST /api/admin/users/{id}/verify
     * Manually verify user's email
     */
    public function verifyManual(int $id): JsonResponse
    {
        $user = User::findOrFail($id);
        
        if ($user->hasVerifiedEmail()) {
            return response()->json(['message' => 'Email pengguna ini sudah terverifikasi.'], 400);
        }

        $user->markEmailAsVerified();

        return response()->json([
            'message' => 'Email pengguna berhasil diverifikasi secara manual.',
            'data' => new UserResource($user->fresh()->load('role')),
        ]);
    }

    /**
     * DELETE /api/admin/users/{id}
     * Delete user permanently
     */
    public function destroy(int $id): JsonResponse
    {
        $user = User::findOrFail($id);
        
        // Prevent deleting oneself
        if ($user->id === Auth::id()) {
            return response()->json(['message' => 'Anda tidak bisa menghapus akun Anda sendiri.'], 403);
        }

        /* 
        // Cek apakah user memiliki data penting terkait (sebagai Company atau Assessor)
        // DInonaktifkan sementara agar tombol Force Delete dapat berfungsi menghapus semua data (Cascade Delete)
        if ($user->submissions()->exists() || $user->assignedSubmissions()->exists()) {
            return response()->json([
                'message' => 'Pengguna ini tidak dapat dihapus karena sudah memiliki data transaksi atau penugasan di dalam sistem. Disarankan untuk menonaktifkannya (Ubah Status menjadi Ditolak/Nonaktif).'
            ], 422);
        }
        */


        try {
            $user->delete();
            return response()->json(['message' => 'Pengguna berhasil dihapus permanen.']);
        } catch (QueryException $e) {
            if ($e->getCode() === '23000' || $e->errorInfo[1] === 1451) {
                return response()->json([
                    'message' => 'Pengguna ini tidak dapat dihapus karena masalah integritas data terkait di database.'
                ], 422);
            }
            throw $e;
        }
    }

    /**
     * PUT /api/admin/users/{id}/status
     * Activate or reject a user account
     */
    public function updateStatus(Request $request, int $id): JsonResponse
    {
        $validated = $request->validate([
            'is_active' => 'required|integer|in:0,1,2',
        ]);

        $user = User::findOrFail($id);
        
        $dataToUpdate = ['is_active' => $validated['is_active']];
        
        // Auto-verify email if admin activates the account
        if ($validated['is_active'] == 1 && !$user->hasVerifiedEmail()) {
            $dataToUpdate['email_verified_at'] = now();
        }

        $user->update($dataToUpdate);

        return response()->json([
            'message' => 'Status user berhasil diperbarui.',
            'data'    => $user->fresh(),
        ]);
    }
}
