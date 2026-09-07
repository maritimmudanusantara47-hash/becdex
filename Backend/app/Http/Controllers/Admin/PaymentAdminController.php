<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\PaymentTransaction;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class PaymentAdminController extends Controller
{
    /**
     * GET /api/admin/payments
     * List all payment transactions with filters
     */
    public function index(Request $request): JsonResponse
    {
        $query = PaymentTransaction::with(['user:id,name,email', 'submission:id,submission_status_id'])
            ->latest('created_at');

        if ($request->filled('status')) {
            $query->where('transaction_status', $request->status);
        }
        if ($request->filled('date_from')) {
            $query->whereDate('created_at', '>=', $request->date_from);
        }
        if ($request->filled('date_to')) {
            $query->whereDate('created_at', '<=', $request->date_to);
        }
        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('order_id', 'like', "%{$search}%")
                  ->orWhereHas('user', fn ($u) => $u->where('email', 'like', "%{$search}%")
                      ->orWhere('name', 'like', "%{$search}%"));
            });
        }

        $transactions = $query->paginate(20);

        // Aggregate stats
        $stats = [
            'total'      => PaymentTransaction::count(),
            'settlement' => PaymentTransaction::where('transaction_status', 'settlement')->count(),
            'pending'    => PaymentTransaction::where('transaction_status', 'pending')->count(),
            'expired'    => PaymentTransaction::where('transaction_status', 'expire')->count(),
            'revenue'    => (float) PaymentTransaction::where('transaction_status', 'settlement')->sum('amount'),
        ];

        return response()->json([
            'data' => $transactions->items(),
            'meta' => [
                'current_page' => $transactions->currentPage(),
                'last_page'    => $transactions->lastPage(),
                'per_page'     => $transactions->perPage(),
                'total'        => $transactions->total(),
            ],
            'stats' => $stats,
        ]);
    }

    /**
     * GET /api/admin/payments/{id}
     * Detail of one payment transaction
     */
    public function show(int $id): JsonResponse
    {
        $tx = PaymentTransaction::with([
            'user.companyDetail',
            'submission.status',
        ])->findOrFail($id);

        return response()->json(['data' => $tx]);
    }
}
