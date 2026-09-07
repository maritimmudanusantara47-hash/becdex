<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Storage;

class Download extends Model
{
    use HasFactory;

    protected $fillable = ['title', 'file_path'];

    protected $appends = ['file_url'];

    public function getFileUrlAttribute(): string
    {
        return asset('storage/' . $this->file_path);
    }
}
