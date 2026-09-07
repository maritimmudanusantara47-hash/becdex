<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Http\Requests\Auth\LoginRequest;
use App\Http\Requests\Auth\RegisterRequest;
use App\Http\Resources\UserResource;
use App\Enums\RoleId;
use App\Models\CompanyDetail;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;

class AuthController extends Controller
{
    /**
     * POST /api/auth/register
     * Registrasi perusahaan baru
     */
    public function register(RegisterRequest $request): JsonResponse
    {
        $user = User::create([
            'name'     => $request->name,
            'email'    => $request->email,
            'password' => Hash::make($request->password),
            'role_id'  => RoleId::Company->value,
            'is_active'=> 0,
        ]);

        CompanyDetail::create([
            'user_id'          => $user->id,
            'company_phone'    => $request->company_phone,
            'company_country'  => $request->company_country,
            'company_field_id' => $request->company_field_id,
            'pic_name'         => $request->pic_name,
            'pic_position'     => $request->pic_position,
            'pic_email'        => $request->pic_email,
            'pic_phone'        => $request->pic_phone,
        ]);

        event(new \Illuminate\Auth\Events\Registered($user));

        return response()->json([
            'message' => 'Registration successful. Please check your email for the verification link.',
        ], 201);
    }

    /**
     * POST /api/auth/login
     */
    public function login(LoginRequest $request): JsonResponse
    {
        $credentials = $request->only('email', 'password');
        $remember    = $request->boolean('remember');

        if (! \Illuminate\Support\Facades\Auth::attempt($credentials, $remember)) {
            return response()->json([
                'message' => 'The provided credentials are incorrect.',
            ], 401);
        }

        /** @var \App\Models\User $user */
        $user = \Illuminate\Support\Facades\Auth::user();

        if ($user->is_active !== 1) {
            \Illuminate\Support\Facades\Auth::logout();

            return response()->json([
                'message' => 'Your account has not been activated or has been rejected.',
            ], 403);
        }

        // Create a new token for this device/session
        $deviceInfo = $request->header('User-Agent', 'Unknown Device');
        $token = $user->createToken($deviceInfo)->plainTextToken;

        return response()->json([
            'message' => 'Login successful.',
            'data'    => [
                'token' => $token,
                'user'  => new UserResource($user->load('companyDetail.companyField', 'role')),
            ],
        ]);
    }

    /**
     * DELETE /api/auth/logout
     */
    public function logout(Request $request): JsonResponse
    {
        // Revoke current access token
        $request->user()->currentAccessToken()->delete();

        if ($request->hasSession()) {
            \Illuminate\Support\Facades\Auth::guard('web')->logout();
            $request->session()->invalidate();
            $request->session()->regenerateToken();
        }

        return response()->json(['message' => 'Logged out successfully.']);
    }

    /**
     * GET /api/auth/sessions
     */
    public function getSessions(Request $request): JsonResponse
    {
        $user = $request->user();
        $currentTokenId = $user->currentAccessToken()->id ?? null;

        $sessions = $user->tokens()
            ->orderBy('last_used_at', 'desc')
            ->orderBy('created_at', 'desc')
            ->get()
            ->map(function ($token) use ($currentTokenId) {
                $lastActivityTime = $token->last_used_at ?? $token->created_at;
                return [
                    'id' => (string) $token->id,
                    'ip_address' => 'Device / Token',
                    'user_agent' => $token->name ?? 'Unknown Device',
                    'last_activity' => $lastActivityTime ? $lastActivityTime->diffForHumans() : 'Recently',
                    'is_current_device' => $token->id === $currentTokenId,
                ];
            });

        return response()->json(['data' => $sessions]);
    }

    /**
     * DELETE /api/auth/sessions/{id}
     */
    public function revokeSession(Request $request, string $id): JsonResponse
    {
        $user = $request->user();

        $user->tokens()
            ->where('id', $id)
            ->delete();

        return response()->json(['message' => 'Session revoked successfully.']);
    }

    /**
     * GET /api/auth/me
     */
    public function me(Request $request): JsonResponse
    {
        return response()->json([
            'data' => new UserResource(
                $request->user()->load('companyDetail.companyField', 'companyDetail.becdexCategory', 'role')
            ),
        ]);
    }

    /**
     * PUT /api/auth/profile
     */
    public function updateProfile(Request $request): JsonResponse
    {
        $user = $request->user();
        $isCompany = $user->role && $user->role->name === 'company';

        $rules = [
            'name'     => 'required|string|max:255',
            'password' => 'nullable|string|min:8',
        ];

        if ($isCompany) {
            $rules = array_merge($rules, [
                'company_phone' => 'nullable|string|max:50',
                'pic_name'      => 'required|string|max:255',
                'pic_position'  => 'required|string|max:255',
                'pic_email'     => 'required|email|max:255',
                'pic_phone'     => 'required|string|max:50',
                'company_country'  => 'nullable|string|max:3',
                'company_field_id' => 'nullable|integer|exists:company_fields,id',
                'description'      => 'nullable|string',
                'address'          => 'nullable|string',
                'website'          => 'nullable|string|max:255',
                'brand_name'       => 'nullable|string|max:255',
            ]);
        }

        $request->validate($rules);

        $updateData = ['name' => $request->name];
        if ($request->filled('password')) {
            $updateData['password'] = \Illuminate\Support\Facades\Hash::make($request->password);
        }
        $user->update($updateData);

        if ($isCompany) {
            $user->companyDetail()->updateOrCreate(
                ['user_id' => $user->id],
                [
                    'company_phone'    => $request->company_phone,
                    'company_country'  => $request->company_country,
                    'company_field_id' => $request->company_field_id,
                    'pic_name'         => $request->pic_name,
                    'pic_position'     => $request->pic_position,
                    'pic_email'        => $request->pic_email,
                    'pic_phone'        => $request->pic_phone,
                    'description'      => $request->description,
                    'address'          => $request->address,
                    'website'          => $request->website,
                    'brand_name'       => $request->brand_name,
                ]
            );
        }

        return response()->json([
            'message' => 'Profile updated successfully.',
            'data'    => new UserResource($user->load('companyDetail.companyField', 'companyDetail.becdexCategory', 'role')),
        ]);
    }

    /**
     * PUT /api/auth/password
     */
    public function updatePassword(Request $request): JsonResponse
    {
        $request->validate([
            'current_password' => 'required|string',
            'password'         => 'required|string|min:8|confirmed',
        ]);

        $user = $request->user();

        if (!\Illuminate\Support\Facades\Hash::check($request->current_password, $user->password)) {
            return response()->json([
                'message' => 'The provided current password does not match our records.',
                'errors' => ['current_password' => ['Incorrect password.']]
            ], 422);
        }

        $user->update([
            'password' => \Illuminate\Support\Facades\Hash::make($request->password),
        ]);

        return response()->json([
            'message' => 'Password updated successfully.',
        ]);
    }

    /**
     * POST /api/auth/profile/photo
     */
    public function uploadPhoto(Request $request): JsonResponse
    {
        $user = $request->user();

        $request->validate([
            'image' => 'required|image|mimes:jpeg,png,jpg,webp|max:2048',
        ]);

        if ($request->hasFile('image')) {
            if ($user->image) {
                \Illuminate\Support\Facades\Storage::disk('public')->delete($user->image);
            }

            $path = $request->file('image')->store('profiles', 'public');

            $user->update([
                'image' => $path,
            ]);

            return response()->json([
                'message' => 'Profile picture updated successfully.',
                'data'    => new UserResource($user->load('companyDetail.companyField', 'companyDetail.becdexCategory', 'role')),
            ]);
        }

        return response()->json([
            'message' => 'No image file uploaded.',
        ], 400);
    }

    /**
     * POST /api/auth/profile/documents
     */
    public function uploadDocuments(Request $request): JsonResponse
    {
        $user = $request->user();

        $request->validate([
            'legal_documents'      => 'nullable|file|mimes:zip,rar,pdf|max:2048',
            'organizational_chart' => 'nullable|file|mimes:jpeg,png,jpg,pdf|max:2048',
        ]);

        $updates = [];

        if ($request->hasFile('legal_documents')) {
            if ($user->legal_documents) {
                \Illuminate\Support\Facades\Storage::disk('public')->delete($user->legal_documents);
            }
            $updates['legal_documents'] = $request->file('legal_documents')->store('documents/legal', 'public');
        }

        if ($request->hasFile('organizational_chart')) {
            if ($user->organizational_chart) {
                \Illuminate\Support\Facades\Storage::disk('public')->delete($user->organizational_chart);
            }
            $updates['organizational_chart'] = $request->file('organizational_chart')->store('documents/chart', 'public');
        }

        if (!empty($updates)) {
            $user->update($updates);
            return response()->json([
                'message' => 'Documents uploaded successfully.',
                'data'    => new UserResource($user->load('companyDetail.companyField', 'companyDetail.becdexCategory', 'role')),
            ]);
        }

        return response()->json([
            'message' => 'No files uploaded.',
        ], 400);
    }
}
