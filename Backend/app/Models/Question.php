<?php
namespace App\Models;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Question extends Model
{
    use HasFactory;
    protected $fillable = ['indicator_id', 'text', 'text_en', 'sort_order', 'is_mandatory'];
    protected $casts = ['sort_order' => 'integer', 'is_mandatory' => 'boolean'];
    public function indicator(): BelongsTo { return $this->belongsTo(Indicator::class); }
    public function answers(): HasMany { return $this->hasMany(Answer::class); }
}
