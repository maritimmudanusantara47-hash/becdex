<?php
namespace App\Models;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasManyThrough;

class Aspect extends Model
{
    use HasFactory;
    protected $fillable = ['name', 'name_id'];
    public function outcomes(): HasMany { return $this->hasMany(Outcome::class); }
    public function principles(): HasManyThrough { return $this->hasManyThrough(Principle::class, Outcome::class); }
}
