<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;
use App\Enums\RoleId;

use Illuminate\Contracts\Auth\MustVerifyEmail;

class User extends Authenticatable implements MustVerifyEmail
{
    use HasApiTokens, HasFactory, Notifiable;

    protected $fillable = [
        'name',
        'email',
        'password',
        'image',
        'role_id',
        'is_active',
        'legal_documents',
        'organizational_chart',
    ];

    protected $hidden = [
        'password',
        'remember_token',
    ];

    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password'          => 'hashed',
            'is_active'         => 'integer',
        ];
    }

    // ─── Relations ────────────────────────────────────────────

    public function role(): \Illuminate\Database\Eloquent\Relations\BelongsTo
    {
        return $this->belongsTo(Role::class);
    }

    public function companyDetail(): HasOne
    {
        return $this->hasOne(CompanyDetail::class);
    }

    public function submissions(): HasMany
    {
        return $this->hasMany(Submission::class);
    }

    /**
     * Send the email verification notification via queue.
     */
    public function sendEmailVerificationNotification(): void
    {
        $this->notify(new \App\Notifications\QueuedVerifyEmail);
    }

    /**
     * Send the password reset notification via queue.
     */
    public function sendPasswordResetNotification($token): void
    {
        $this->notify(new \App\Notifications\QueuedResetPassword($token));
    }

    public function certificateUsers(): HasMany
    {
        return $this->hasMany(CertificateUser::class);
    }

    public function assignedSubmissions(): BelongsToMany
    {
        return $this->belongsToMany(Submission::class, 'submission_assessors', 'user_id', 'submission_id')->withTimestamps();
    }

    public function activityLogs(): HasMany
    {
        return $this->hasMany(ActivityLog::class);
    }

    // ─── Helpers ──────────────────────────────────────────────

    public function isAdmin(): bool
    {
        return in_array($this->role_id, RoleId::adminRoleIds());
    }

    public function isSuperAdmin(): bool
    {
        return in_array($this->role_id, RoleId::superAdminRoleIds());
    }

    public function isQcAdmin(): bool
    {
        return $this->role_id === RoleId::QcAdmin->value;
    }

    public function isAssessmentAdmin(): bool
    {
        return in_array($this->role_id, RoleId::assessmentRoleIds());
    }

    public function isCertAdmin(): bool
    {
        return in_array($this->role_id, RoleId::certAdminRoleIds());
    }

    public function isFinanceAdmin(): bool
    {
        return in_array($this->role_id, RoleId::financeRoleIds());
    }

    public function isCompany(): bool
    {
        return $this->role_id === RoleId::Company->value;
    }
}
