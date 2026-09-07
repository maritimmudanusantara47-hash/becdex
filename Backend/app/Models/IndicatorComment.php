<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class IndicatorComment extends Model
{
    protected $fillable = [
        'submission_per_indicator_id',
        'user_id',
        'message',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function submissionPerIndicator()
    {
        return $this->belongsTo(SubmissionPerIndicator::class);
    }
}
