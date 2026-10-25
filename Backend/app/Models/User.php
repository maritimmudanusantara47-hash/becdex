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

    // ─── Profile Completion Helpers ───────────────────────────

    /**
     * Label representasi ramah pengguna untuk masing-masing field profil.
     *
     * @return array<string, string>
     */
    public static function profileFieldLabels(): array
    {
        return [
            'name'                 => 'Nama Resmi Perusahaan',
            'email_verified'       => 'Verifikasi Email Akun',
            'legal_documents'      => 'Dokumen Legalitas (NIB / Akta)',
            'organizational_chart' => 'Bagan Struktur Organisasi',
            'image'                => 'Logo Perusahaan / Foto Profil',
            'company_phone'        => 'Nomor Telepon Perusahaan',
            'company_country'      => 'Negara Domisili Perusahaan',
            'company_field_id'     => 'Bidang Usaha Perusahaan',
            'address'              => 'Alamat Lengkap Perusahaan',
            'description'          => 'Deskripsi Singkat Perusahaan',
            'brand_name'           => 'Nama Brand / Komersial',
            'pic_name'             => 'Nama Lengkap PIC',
            'pic_position'         => 'Jabatan / Posisi PIC',
            'pic_email'            => 'Email PIC',
            'pic_phone'            => 'Nomor Telepon / WhatsApp PIC',
        ];
    }

    /**
     * Mengembalikan daftar field wajib yang masih kosong/belum diisi.
     *
     * @return array<string>
     */
    public function getMissingProfileFields(): array
    {
        $missing = [];

        // 1. Validasi Data User / Akun
        if (empty(trim((string) $this->name))) {
            $missing[] = 'name';
        }

        if (empty($this->email) || !$this->hasVerifiedEmail()) {
            $missing[] = 'email_verified';
        }

        if (empty($this->legal_documents)) {
            $missing[] = 'legal_documents';
        }

        if (empty($this->organizational_chart)) {
            $missing[] = 'organizational_chart';
        }

        if (empty($this->image)) {
            $missing[] = 'image';
        }

        // 2. Validasi Relasi & Detail Perusahaan (company_details)
        $detail = $this->companyDetail;

        if (!$detail) {
            // Jika companyDetail sama sekali belum ada, masukkan semua field detail
            return array_merge($missing, [
                'company_phone',
                'company_country',
                'company_field_id',
                'address',
                'description',
                'brand_name',
                'pic_name',
                'pic_position',
                'pic_email',
                'pic_phone',
            ]);
        }

        // Detail Perusahaan
        if (empty(trim((string) $detail->company_phone))) {
            $missing[] = 'company_phone';
        }

        if (empty(trim((string) $detail->company_country))) {
            $missing[] = 'company_country';
        }

        if (empty($detail->company_field_id)) {
            $missing[] = 'company_field_id';
        }

        if (empty(trim((string) $detail->address))) {
            $missing[] = 'address';
        }

        if (empty(trim((string) $detail->description))) {
            $missing[] = 'description';
        }

        // Brand name: valid jika terisi, atau jika kosong otomatis fallback ke nama perusahaan (name)
        $brandName = trim((string) ($detail->brand_name ?: $this->name));
        if (empty($brandName)) {
            $missing[] = 'brand_name';
        }

        // Detail PIC (Penanggung Jawab)
        if (empty(trim((string) $detail->pic_name))) {
            $missing[] = 'pic_name';
        }

        if (empty(trim((string) $detail->pic_position))) {
            $missing[] = 'pic_position';
        }

        if (empty(trim((string) $detail->pic_email))) {
            $missing[] = 'pic_email';
        }

        if (empty(trim((string) $detail->pic_phone))) {
            $missing[] = 'pic_phone';
        }

        return $missing;
    }

    /**
     * Mengembalikan daftar field yang belum diisi beserta label yang ramah pengguna.
     *
     * @return array<string, string>
     */
    public function getMissingProfileFieldLabels(): array
    {
        $allLabels = static::profileFieldLabels();
        $missing = $this->getMissingProfileFields();

        $result = [];
        foreach ($missing as $field) {
            $result[$field] = $allLabels[$field] ?? ucwords(str_replace('_', ' ', $field));
        }

        return $result;
    }

    /**
     * Cek apakah seluruh profil sudah lengkap 100%.
     */
    public function isProfileComplete(): bool
    {
        return empty($this->getMissingProfileFields());
    }

    /**
     * Hitung persentase kelengkapan profil (0 - 100%).
     */
    public function getProfileCompletionPercentage(): int
    {
        $totalRequiredFields = 15;
        $missingCount = count($this->getMissingProfileFields());

        $completed = max(0, $totalRequiredFields - $missingCount);

        return (int) round(($completed / $totalRequiredFields) * 100);
    }
}
