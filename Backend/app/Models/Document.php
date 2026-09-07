<?php
namespace App\Models;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Facades\Storage;

class Document extends Model
{
    use HasFactory;
    protected $fillable = ['submission_id', 'indicator_id', 'file_path', 'original_name', 'mime_type', 'file_size', 'upload_phase'];
    protected $appends = ['file_url'];

    public function submission(): BelongsTo { return $this->belongsTo(Submission::class); }
    public function indicator(): BelongsTo { return $this->belongsTo(Indicator::class); }

    public function getFileUrlAttribute(): string
    {
        return asset('storage/' . $this->file_path);
    }
}
