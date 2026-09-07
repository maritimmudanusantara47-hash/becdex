<?php
namespace App\Models;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Support\Facades\Storage;

class Certificate extends Model
{
    use HasFactory;
    protected $fillable = ['category', 'file_path', 'description'];
    protected $appends = ['file_url'];
    public function certificateUsers(): HasMany { return $this->hasMany(CertificateUser::class); }
    public function getFileUrlAttribute(): string { return asset('storage/' . $this->file_path); }
}
