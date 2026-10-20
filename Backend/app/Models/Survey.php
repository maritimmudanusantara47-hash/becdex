<?php
namespace App\Models;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Survey extends Model
{
    use HasFactory;
    protected $fillable = ['submission_id', 'scheduled_at', 'scheduled_end_at', 'location_link', 'notes'];
    protected $casts = [
        'scheduled_at'     => 'datetime',
        'scheduled_end_at' => 'datetime',
    ];
    public function submission(): BelongsTo { return $this->belongsTo(Submission::class); }
}
