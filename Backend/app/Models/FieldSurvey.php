<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class FieldSurvey extends Model
{
    protected $fillable = [
        'submission_id',
        'assessor_id',
        'scheduled_at',
        'notes',
        'file_path',
        'status',
    ];

    protected $casts = [
        'scheduled_at' => 'datetime',
    ];

    public function submission(): BelongsTo
    {
        return $this->belongsTo(Submission::class);
    }

    public function assessor(): BelongsTo
    {
        return $this->belongsTo(User::class, 'assessor_id');
    }
}
