<?php
namespace App\Models;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Outcome extends Model
{
    use HasFactory;
    protected $fillable = ['aspect_id', 'name', 'name_id'];
    public function aspect(): BelongsTo { return $this->belongsTo(Aspect::class); }
    public function principles(): HasMany { return $this->hasMany(Principle::class); }
}
