<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

class Submission extends Model
{
    use HasFactory, HasUuids; // HasUuids otomatis generate UUID untuk PK

    protected $fillable = [
        'user_id',
        'submission_status_id',
        'initial_score',
        'valid_score',
        'survey_score',
        'reason',
        'qr_code_path',
        'revision_count',
        'current_upload_phase',
    ];

    protected function casts(): array
    {
        return [
            'initial_score' => 'decimal:2',
            'valid_score'   => 'decimal:2',
            'survey_score'  => 'decimal:2',
        ];
    }

    // ─── Relations ────────────────────────────────────────────

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function status(): BelongsTo
    {
        return $this->belongsTo(SubmissionStatus::class, 'submission_status_id');
    }

    public function answers(): HasMany
    {
        return $this->hasMany(Answer::class);
    }

    public function perIndicators(): HasMany
    {
        return $this->hasMany(SubmissionPerIndicator::class)->orderBy('indicator_id');
    }

    public function documents(): HasMany
    {
        return $this->hasMany(Document::class);
    }

    public function paymentTransactions(): HasMany
    {
        return $this->hasMany(PaymentTransaction::class);
    }

    public function latestPayment(): HasOne
    {
        return $this->hasOne(PaymentTransaction::class)->latestOfMany();
    }

    public function certificateUser(): HasOne
    {
        return $this->hasOne(CertificateUser::class);
    }

    public function survey(): HasOne
    {
        return $this->hasOne(Survey::class);
    }

    public function assessors(): BelongsToMany
    {
        return $this->belongsToMany(User::class, 'submission_assessors', 'submission_id', 'user_id')->withTimestamps();
    }

    public function activityLogs(): HasMany
    {
        return $this->hasMany(ActivityLog::class)->orderBy('created_at', 'desc');
    }

    public function fieldSurveys(): HasMany
    {
        return $this->hasMany(FieldSurvey::class)->orderBy('scheduled_at', 'asc');
    }

    // ─── Business Logic Helpers ───────────────────────────────

    /**
     * initial_score = SUM(value) / COUNT(answers) * 100
     */
    public function calculateInitialScore(): float
    {
        $answers = $this->answers();
        $total   = $answers->count();

        if ($total === 0) return 0;

        $sum = $answers->sum('value');
        $maxPossible = \App\Models\Question::count() * 2;
        return round(($sum / $maxPossible) * 100, 2);
    }

    /**
     * valid_score = SUM(valid_value) / COUNT(answers) * 100
     */
    public function calculateValidScore(): float
    {
        $answers = $this->answers();
        $total   = $answers->count();

        if ($total === 0) return 0;

        $sum = $answers->sum('valid_value');
        $maxPossible = \App\Models\Question::count() * 2;
        return round(($sum / $maxPossible) * 100, 2);
    }

    /**
     * Syarat lanjut ke pembayaran:
     * - Status 1 (Pending Payment — setelah user klik submit)
     * - initial_score >= 70 DAN documents >= 35
     * (Pembayaran dilakukan SEBELUM verifikasi admin di alur baru)
     */
    public function canProceedToPayment(): bool
    {
        return $this->submission_status_id === 1
            && $this->initial_score >= 70
            && $this->getUploadedIndicatorsCount() >= 35;
    }

    /**
     * Hitung jumlah indikator unik (distinct) yang sudah memiliki dokumen bukti
     */
    public function getUploadedIndicatorsCount(): int
    {
        return $this->documents()->distinct('indicator_id')->count('indicator_id');
    }

    /**
     * Apakah revisi ini merupakan revisi pasca survei lokasi?
     */
    public function isPostSurveyRevision(): bool
    {
        return $this->activityLogs()
            ->where('action', 'admin_return_from_survey')
            ->exists();
    }

    /**
     * Apakah pengajuan membutuhkan pembayaran baru?
     * - Belum pernah bayar sama sekali, ATAU
     * - Dikembalikan dari survei lokasi (Post-survey revision) dan belum ada pembayaran settlement setelah log pengembalian tersebut.
     */
    public function requiresPayment(): bool
    {
        if (!$this->hasSuccessfulPayment()) {
            return true;
        }

        if ($this->isPostSurveyRevision()) {
            $lastReturnLog = $this->activityLogs()
                ->where('action', 'admin_return_from_survey')
                ->latest()
                ->first();

            if ($lastReturnLog) {
                $hasPostSurveyPayment = $this->paymentTransactions()
                    ->where('transaction_status', 'settlement')
                    ->where('created_at', '>', $lastReturnLog->created_at)
                    ->exists();

                return !$hasPostSurveyPayment;
            }
        }

        return false;
    }

    /**
     * Apakah ada pembayaran yang sudah sukses (settlement)?
     */
    public function hasSuccessfulPayment(): bool
    {
        return $this->paymentTransactions()
            ->where('transaction_status', 'settlement')
            ->exists();
    }

    /**
     * Get Radar Chart Data (Scores grouped by Aspect)
     */
    public function getRadarChartData(): array
    {
        $sql = "
            SELECT 
                a.name as aspect,
                SUM(ans.value) as score,
                SUM(ans.valid_value) as valid_score,
                COUNT(ans.id) * 2 as max_score
            FROM answers ans
            JOIN questions q ON ans.question_id = q.id
            JOIN indicators i ON q.indicator_id = i.id
            JOIN principles p ON i.principle_id = p.id
            JOIN outcomes o ON p.outcome_id = o.id
            JOIN aspects a ON o.aspect_id = a.id
            WHERE ans.submission_id = ?
            GROUP BY a.id, a.name
            ORDER BY a.id ASC
        ";

        $results = \Illuminate\Support\Facades\DB::select($sql, [$this->id]);
        
        return array_map(function($row) {
            $maxScore = $row->max_score > 0 ? $row->max_score : 1;
            return [
                'subject' => $row->aspect,
                'A' => round((($row->score ?? 0) / $maxScore) * 100, 2),
                'B' => round((($row->valid_score ?? 0) / $maxScore) * 100, 2),
                'fullMark' => 100
            ];
        }, $results);
    }
}
