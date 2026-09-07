<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class HelpMessage extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'email',
        'whatsapp',
        'issue_type',
        'detail',
        'is_read',
    ];

    protected $casts = [
        'is_read' => 'boolean',
    ];
}
