<?php
namespace App\Models;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class CompanyField extends Model
{
    protected $fillable = ['name'];
    public function companyDetails(): HasMany { return $this->hasMany(CompanyDetail::class); }
}
