<?php

namespace App\Http\Controllers\Submission;

use App\Http\Controllers\Controller;
use App\Http\Resources\PaymentResource;
use App\Http\Resources\ScoreResource;
use App\Models\PaymentTransaction;
use App\Models\Setting;
use App\Models\Submission;
use App\Services\XenditService;
use Carbon\Carbon;
use App\Mail\PaymentReceiptMail;
use Illuminate\Support\Facades\Mail;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;

class PaymentController extends Controller
{
    public function __construct(private XenditService $xendit) {}

    /**
     * GET /api/submissions/{id}/score
     * Hitung skor dan cek eligibilitas pembayaran
     */
    public function score(Request $request, string $id): JsonResponse
    {
        $submission = $request->user()
            ->submissions()
            ->findOrFail($id);

        // Recalculate dan simpan
        $initial = $submission->calculateInitialScore();
        $submission->update(['initial_score' => $initial]);

        return response()->json([
            'data' => new ScoreResource($submission->fresh(['documents'])),
        ]);
    }

    /**
     * POST /api/submissions/{id}/payment
     * Inisiasi pembayaran Xendit → kembalikan invoice_url
     */
    public function initiate(Request $request, string $id): JsonResponse
    {
        $submission = $request->user()
            ->submissions()
            ->findOrFail($id);

        if (! $submission->canProceedToPayment()) {
            return response()->json([
                'message' => 'Payment requirements not met. Score must be ≥70 and documents ≥35.',
                'data'    => new ScoreResource($submission->load('documents')),
            ], 422);
        }

        // Cek apakah sudah ada invoice pending yang belum kadaluarsa
        $existingTx = PaymentTransaction::where('submission_id', $submission->id)
            ->where('transaction_status', 'pending')
            ->where('expired_at', '>', now())
            ->latest()
            ->first();

        if ($existingTx && $existingTx->invoice_url) {
            return response()->json([
                'message' => 'Invoice already exists.',
                'data'    => new PaymentResource($existingTx),
            ]);
        }

        // Ambil nominal dari settings
        $nominal = (float) Setting::getValue('payment_amount', 100000);

        // Setup Xendit via service (injectable/mockable)
        $externalId  = 'BECDEX-' . $submission->id . '-' . time();
        $expiredDate = Carbon::now()->addDay();

        $invoiceResult = $this->xendit->createInvoice([
            'external_id'      => $externalId,
            'amount'           => (float) $nominal,
            'payer_email'      => $request->user()->email,
            'description'      => 'BECdex Certification Payment – ' . ($submission->mmic_code ?? $submission->id),
            'customer'         => [
                'given_names'    => $request->user()->name,
                'email'          => $request->user()->email,
            ],
            'invoice_duration'        => 86400, // 1 hari dalam detik
            'currency'                => 'IDR',
            'payment_methods'         => [
                'CREDIT_CARD',
                'BCA', 'BNI', 'BRI', 'MANDIRI', 'PERMATA',
                'BNC', 'BSI', 'BJB', 'SAHABAT_SAMPOERNA',
                'OVO', 'DANA', 'LINKAJA', 'SHOPEEPAY', 'GCASH', 'GRABPAY',
            ],
            'success_redirect_url' => env('FRONTEND_URL', 'http://localhost:3000') . '/dashboard/submissions/' . $submission->id,
            'failure_redirect_url' => env('FRONTEND_URL', 'http://localhost:3000') . '/dashboard/submissions/' . $submission->id,
        ]);

        // Simpan transaksi
        $transaction = PaymentTransaction::create([
            'submission_id'      => $submission->id,
            'user_id'            => $request->user()->id,
            'order_id'           => $externalId,
            'amount'             => $nominal,
            'transaction_status' => 'pending',
            'xendit_invoice_id'  => $invoiceResult->getId(),
            'invoice_url'        => $invoiceResult->getInvoiceUrl(),
            'expired_at'         => $expiredDate->toDateTimeString(),
        ]);

        // Lock submission by changing status to Pending Payment (1)
        $submission->update(['submission_status_id' => 1]);

        return response()->json([
            'message' => 'Payment initiated successfully.',
            'data'    => new PaymentResource($transaction),
        ]);
    }

    /**
     * POST /api/payment/webhook
     * Xendit invoice callback (public endpoint)
     * Xendit mengirim header: x-callback-token
     */
    public function webhook(Request $request): JsonResponse
    {
        // Verifikasi webhook token dari Xendit
        $callbackToken = $request->header('x-callback-token');
        $expectedToken = Setting::getValue('xendit_webhook_token') ?: config('services.xendit.webhook_token');

        if ($expectedToken && $callbackToken !== $expectedToken) {
            Log::warning('Xendit webhook: invalid callback token', [
                'received' => $callbackToken,
            ]);
            return response()->json(['status' => 'unauthorized'], 401);
        }

        $payload = $request->all();

        Log::info('Xendit webhook received', $payload);

        // Xendit invoice callback fields
        $externalId = $payload['external_id'] ?? null;
        $status     = $payload['status'] ?? null;      // PAID, EXPIRED, PENDING
        $paymentMethod = $payload['payment_method'] ?? null;
        $paidAmount    = $payload['paid_amount'] ?? null;

        if (! $externalId || ! $status) {
            return response()->json(['status' => 'ignored'], 200);
        }

        $transaction = PaymentTransaction::where('order_id', $externalId)->first();

        if (! $transaction) {
            Log::warning('Xendit webhook: transaction not found', ['external_id' => $externalId]);
            return response()->json(['status' => 'not_found'], 404);
        }

        // Map Xendit status → internal status
        $finalStatus = match (strtoupper($status)) {
            'PAID'     => 'settlement',
            'EXPIRED'  => 'expire',
            'SETTLED'  => 'settlement',
            default    => strtolower($status),
        };

        DB::transaction(function () use ($transaction, $finalStatus, $paymentMethod, $externalId) {
            $transaction->update([
                'transaction_status' => $finalStatus,
                'payment_type'       => $paymentMethod,
                'paid_at'            => $finalStatus === 'settlement' ? Carbon::now() : null,
            ]);

            // Jika pembayaran sukses → tandai Payment Successful (6).
            // Nanti admin akan memverifikasi lewat tombol Buka Halaman Verifikasi.
            if ($finalStatus === 'settlement') {
                $submission = $transaction->submission;
                $submission->update(['submission_status_id' => 6]);

                // Tandai semua per-indicator sebagai Submitted agar Admin bisa mereviewnya
                $submission->perIndicators()
                    ->where('per_indicator_status_id', '!=', 4) // Jangan timpa yang sudah Verified
                    ->update(['per_indicator_status_id' => 2]);

                // Kirim email kwitansi (Payment Receipt) ke user
                try {
                    Mail::to($transaction->user->email)->queue(new PaymentReceiptMail($transaction));
                    Log::info('Xendit webhook: payment receipt email sent', ['email' => $transaction->user->email]);
                } catch (\Exception $e) {
                    Log::error('Xendit webhook: failed to send payment receipt', ['error' => $e->getMessage()]);
                }

                Log::info('Xendit webhook: payment settled, submission moved to Payment Successful (6)', ['order_id' => $externalId]);
            } else if ($finalStatus === 'expire') {
                // Kembalikan ke status 1 (Pending Payment) agar user bisa membuat invoice baru
                $transaction->submission->update(['submission_status_id' => 1]);
                Log::info('Xendit webhook: invoice expired, reverted submission to Pending Payment (1)', ['order_id' => $externalId]);
            }
        });

        return response()->json(['status' => 'ok']);
    }

    /**
     * GET /api/submissions/{id}/payment/check
     * Poll Xendit API for real invoice status and update DB accordingly
     */
    public function checkPayment(Request $request, string $id): JsonResponse
    {
        $submission = $request->user()
            ->submissions()
            ->findOrFail($id);

        $transaction = PaymentTransaction::where('submission_id', $submission->id)
            ->where('transaction_status', 'pending')
            ->latest()
            ->first();

        if (! $transaction || ! $transaction->xendit_invoice_id) {
            return response()->json([
                'message' => 'No pending invoice found.',
                'data'    => new ScoreResource($submission->fresh(['documents'])),
            ]);
        }

        try {
            $invoice      = $this->xendit->getInvoice($transaction->xendit_invoice_id);
            $xenditStatus = $invoice->getStatus(); // PENDING, PAID, EXPIRED, SETTLED

            $finalStatus = match (strtoupper((string) $xenditStatus)) {
                'PAID', 'SETTLED' => 'settlement',
                'EXPIRED'         => 'expire',
                default           => strtolower((string) $xenditStatus),
            };

            if ($finalStatus !== $transaction->transaction_status) {
                $transaction->update([
                    'transaction_status' => $finalStatus,
                    'paid_at'            => $finalStatus === 'settlement' ? Carbon::now() : null,
                ]);

                if ($finalStatus === 'settlement') {
                    // Update ke Payment Successful (6)
                    $submission->update(['submission_status_id' => 6]);
                    $submission->perIndicators()
                        ->where('per_indicator_status_id', '!=', 4)
                        ->update(['per_indicator_status_id' => 2]);
                    Log::info('checkPayment: payment confirmed, submission moved to Payment Successful (6)', ['order_id' => $transaction->order_id]);
                } else if ($finalStatus === 'expire') {
                    $submission->update(['submission_status_id' => 1]); // Kembali ke Pending Payment
                    Log::info('checkPayment: payment expired, reverted to Pending Payment (1)', ['order_id' => $transaction->order_id]);
                }
            }

            return response()->json([
                'message' => 'Payment status checked.',
                'paid'    => $finalStatus === 'settlement',
                'data'    => new ScoreResource($submission->fresh(['documents'])),
            ]);
        } catch (\Exception $e) {
            Log::error('checkPayment: Xendit API error', ['error' => $e->getMessage()]);
            return response()->json([
                'message' => 'Failed to check payment status from Xendit.',
                'data'    => new ScoreResource($submission->fresh(['documents'])),
            ], 200); // Tetap 200 agar frontend bisa handle gracefully
        }
    }

    /**
     * GET /api/payments
     * List payment history for authenticated company user
     */
    public function userIndex(Request $request): JsonResponse
    {
        $transactions = PaymentTransaction::with(['submission:id,submission_status_id'])
            ->where('user_id', $request->user()->id)
            ->latest()
            ->paginate(20);

        return response()->json([
            'data' => $transactions->items(),
            'meta' => [
                'current_page' => $transactions->currentPage(),
                'last_page'    => $transactions->lastPage(),
                'per_page'     => $transactions->perPage(),
                'total'        => $transactions->total(),
            ],
        ]);
    }

    /**
     * GET /api/payments/{id}
     * Detail of one payment transaction for authenticated user
     */
    public function userShow(Request $request, int $id): JsonResponse
    {
        $tx = PaymentTransaction::with(['submission.status'])
            ->where('user_id', $request->user()->id)
            ->findOrFail($id);

        return response()->json(['data' => $tx]);
    }
}
