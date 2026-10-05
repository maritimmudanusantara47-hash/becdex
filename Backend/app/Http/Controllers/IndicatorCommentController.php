<?php

namespace App\Http\Controllers;

use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use App\Enums\RoleId;
use App\Models\SubmissionPerIndicator;
use App\Models\IndicatorComment;
use App\Models\User;
use App\Notifications\SystemNotification;
use Illuminate\Support\Facades\Auth;

class IndicatorCommentController extends Controller
{
    public function index(string $submission_id, string $indicator_id)
    {
        $perIndicator = SubmissionPerIndicator::where('submission_id', $submission_id)
            ->where('indicator_id', $indicator_id)
            ->firstOrFail();

        $currentUser = Auth::user();
        $isCompany = $currentUser && $currentUser->role_id === RoleId::Company->value;

        $comments = $perIndicator->comments()
            ->with(['user' => function ($query) {
                $query->select('id', 'name', 'role_id');
            }])
            ->orderBy('created_at', 'asc')
            ->get();

        $comments->transform(function ($comment) use ($isCompany) {
            $isAssessor = $comment->user && $comment->user->role_id !== RoleId::Company->value;
            $comment->is_assessor = $isAssessor;

            // Jika yang mengakses adalah pihak perusahaan, samarkan nama asli asesor menjadi 'Asesor' untuk perlindungan privasi
            if ($isAssessor && $isCompany) {
                $comment->user->name = 'Asesor';
            }

            return $comment;
        });

        return response()->json(['data' => $comments]);
    }

    public function store(Request $request, string $submission_id, string $indicator_id)
    {
        $request->validate(['message' => 'required|string']);

        $perIndicator = SubmissionPerIndicator::with(['indicator', 'submission.user'])
            ->where('submission_id', $submission_id)
            ->where('indicator_id', $indicator_id)
            ->firstOrFail();

        $user = Auth::user();

        $comment = $perIndicator->comments()->create([
            'user_id' => $user->id,
            'message' => $request->message,
        ]);

        // If Assessor/Admin replies, notify the Company/User
        if (in_array($user->role_id, RoleId::adminRoleIds())) {
            $companyUser = $perIndicator->submission->user;
            $companyUser->notify(new SystemNotification(
                'Pesan Baru dari Asesor',
                'Asesor membalas pesan pada indikator: ' . $perIndicator->indicator->name,
                '/dashboard/submissions/' . $submission_id
            ));
        } else if ($user->role_id === RoleId::Company->value) {
            // If Company replies, notify Admins/Assessors
            $admins = User::whereIn('role_id', RoleId::adminRoleIds())->get();
            foreach ($admins as $admin) {
                $admin->notify(new SystemNotification(
                    'Pesan Baru dari Perusahaan',
                    'Perusahaan membalas pesan pada indikator: ' . $perIndicator->indicator->name,
                    '/admin/submissions/' . $submission_id
                ));
            }
        }

        $comment->load(['user' => function ($query) {
            $query->select('id', 'name', 'role_id');
        }]);

        $isAssessor = $comment->user && $comment->user->role_id !== RoleId::Company->value;
        $comment->is_assessor = $isAssessor;
        if ($isAssessor && $user->role_id === RoleId::Company->value) {
            $comment->user->name = 'Asesor';
        }

        return response()->json(['message' => 'Comment added', 'data' => $comment]);
    }

    /**
     * Update isi pesan komentar indikator.
     *
     * @param Request $request
     * @param string $submission_id
     * @param string $indicator_id
     * @param string $comment_id
     * @return JsonResponse
     */
    public function update(Request $request, string $submission_id, string $indicator_id, string $comment_id): JsonResponse
    {
        // 1. Validasi Input
        $request->validate([
            'message' => 'required|string|max:2000',
        ]);

        // 2. Ambil data relasi SubmissionPerIndicator
        $perIndicator = SubmissionPerIndicator::where('submission_id', $submission_id)
            ->where('indicator_id', $indicator_id)
            ->firstOrFail();

        // 3. Ambil komentar berdasarkan ID
        $comment = IndicatorComment::where('submission_per_indicator_id', $perIndicator->id)
            ->where('id', $comment_id)
            ->firstOrFail();

        $user = Auth::user();

        // 4. Otorisasi: Hanya pemilik pesan atau Super Admin yang boleh edit
        $isOwner = (int) $comment->user_id === (int) $user->id;
        $isSuperAdmin = $user->role_id === RoleId::SuperAdmin->value;

        if (!$isOwner && !$isSuperAdmin) {
            return response()->json([
                'message' => 'Anda tidak memiliki hak akses untuk mengubah pesan ini.'
            ], 403);
        }

        // 5. Update teks pesan
        $comment->update([
            'message' => $request->message,
        ]);

        $comment->load(['user' => function ($query) {
            $query->select('id', 'name', 'role_id');
        }]);

        $isAssessor = $comment->user && $comment->user->role_id !== RoleId::Company->value;
        $comment->is_assessor = $isAssessor;
        if ($isAssessor && $user->role_id === RoleId::Company->value) {
            $comment->user->name = 'Asesor';
        }

        return response()->json([
            'message' => 'Komentar berhasil diperbarui',
            'data' => $comment,
        ]);
    }

    /**
     * Hapus komentar indikator.
     *
     * @param Request $request
     * @param string $submission_id
     * @param string $indicator_id
     * @param string $comment_id
     * @return JsonResponse
     */
    public function destroy(Request $request, string $submission_id, string $indicator_id, string $comment_id): JsonResponse
    {
        // 1. Ambil data relasi SubmissionPerIndicator
        $perIndicator = SubmissionPerIndicator::where('submission_id', $submission_id)
            ->where('indicator_id', $indicator_id)
            ->firstOrFail();

        // 2. Ambil komentar berdasarkan ID
        $comment = IndicatorComment::where('submission_per_indicator_id', $perIndicator->id)
            ->where('id', $comment_id)
            ->firstOrFail();

        $user = Auth::user();

        // 3. Otorisasi: Hanya pemilik pesan atau Super Admin yang boleh hapus
        $isOwner    = (int) $comment->user_id === (int) $user->id;
        $isSuperAdmin = $user->role_id === RoleId::SuperAdmin->value;

        if (!$isOwner && !$isSuperAdmin) {
            return response()->json([
                'message' => 'Anda tidak memiliki hak akses untuk menghapus pesan ini.',
            ], 403);
        }

        // 4. Hapus komentar
        $comment->delete();

        return response()->json([
            'message' => 'Komentar berhasil dihapus.',
        ]);
    }
}
