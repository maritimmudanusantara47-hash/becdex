<?php
namespace App\Models;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Principle extends Model
{
    use HasFactory;
    protected $fillable = ['outcome_id', 'name', 'name_id'];
    public function outcome(): BelongsTo { return $this->belongsTo(Outcome::class); }
    public function indicators(): HasMany { return $this->hasMany(Indicator::class); }
}
