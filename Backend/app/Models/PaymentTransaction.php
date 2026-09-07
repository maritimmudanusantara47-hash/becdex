<?php
namespace App\Models;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class PaymentTransaction extends Model
{
    use HasFactory;
    protected $table = 'payment_transactions';
    protected $fillable = [
        'submission_id', 'user_id', 'order_id', 'amount',
        'payment_type', 'transaction_status', 'va_number', 'bank',
        'xendit_invoice_id', 'invoice_url', 'paid_at', 'expired_at',
    ];
    protected $casts = [
        'amount' => 'decimal:2',
        'paid_at' => 'datetime',
        'expired_at' => 'datetime',
    ];
    public function submission(): BelongsTo { return $this->belongsTo(Submission::class); }
    public function user(): BelongsTo { return $this->belongsTo(User::class); }
    public function isExpired(): bool { return $this->expired_at && now()->gt($this->expired_at); }
    public function isPending(): bool { return $this->transaction_status === 'pending'; }
    public function isSettled(): bool { return $this->transaction_status === 'settlement'; }
}
