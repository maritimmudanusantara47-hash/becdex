<?php
namespace App\Models;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Indicator extends Model
{
    use HasFactory;
    protected $fillable = [
        'principle_id', 'name', 'name_id', 'description', 'description_en',
        'evidence', 'evidence_en', 'verification_method', 'verification_method_en',
        'regulation', 'regulation_en', 'sort_order', 'is_mandatory'
    ];
    protected $casts = [
        'sort_order' => 'integer',
        'is_mandatory' => 'boolean'
    ];
    public function principle(): BelongsTo { return $this->belongsTo(Principle::class); }
    public function questions(): HasMany { return $this->hasMany(Question::class)->orderBy('sort_order'); }
    public function documents(): HasMany { return $this->hasMany(Document::class); }
    public function submissionPerIndicators(): HasMany { return $this->hasMany(SubmissionPerIndicator::class); }
}
