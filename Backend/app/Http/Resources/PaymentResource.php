<?php
namespace App\Http\Resources;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class PaymentResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id'                 => $this->id,
            'order_id'           => $this->order_id,
            'amount'             => (float) $this->amount,
            'payment_type'       => $this->payment_type,
            'transaction_status' => $this->transaction_status,
            'va_number'          => $this->va_number,
            'bank'               => $this->bank ? strtoupper($this->bank) : null,
            'invoice_url'        => $this->when($this->isPending(), $this->invoice_url),
            'xendit_invoice_id'  => $this->xendit_invoice_id,
            'paid_at'            => $this->paid_at?->toISOString(),
            'expired_at'         => $this->expired_at?->toISOString(),
            'is_expired'         => $this->isExpired(),
            'created_at'         => $this->created_at->toISOString(),
        ];
    }
}
