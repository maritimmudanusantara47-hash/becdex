<?php
namespace App\Models;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class SubmissionPerIndicator extends Model
{
    use HasFactory;
    protected $fillable = ['submission_id', 'indicator_id', 'per_indicator_status_id', 'comment'];
    public function submission(): BelongsTo { return $this->belongsTo(Submission::class); }
    public function indicator(): BelongsTo { return $this->belongsTo(Indicator::class); }
    public function status(): BelongsTo { return $this->belongsTo(PerIndicatorStatus::class, 'per_indicator_status_id'); }
    public function comments() { return $this->hasMany(IndicatorComment::class); }
}
