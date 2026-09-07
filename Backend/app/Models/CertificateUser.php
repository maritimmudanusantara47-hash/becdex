<?php
namespace App\Models;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * @property \Carbon\Carbon|null $published_at
 * @property \Carbon\Carbon|null $valid_until
 * @property bool $is_approved
 */
class CertificateUser extends Model
{
    use HasFactory;
    protected $fillable = ['submission_id', 'certificate_id', 'user_id', 'mmic', 'direktur', 'published_at', 'valid_until', 'is_approved'];
    protected $casts = ['published_at' => 'date', 'valid_until' => 'date', 'is_approved' => 'boolean'];
    public function submission(): BelongsTo { return $this->belongsTo(Submission::class); }
    public function certificate(): BelongsTo { return $this->belongsTo(Certificate::class); }
    public function user(): BelongsTo { return $this->belongsTo(User::class); }
    public function isValid(): bool { return $this->valid_until instanceof \Carbon\Carbon && $this->valid_until->gte(now()); }
}
