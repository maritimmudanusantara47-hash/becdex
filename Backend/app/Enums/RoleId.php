<?php

namespace App\Enums;

/**
 * Konstanta untuk semua Role ID di sistem BECdex.
 * Gunakan enum ini di seluruh codebase — JANGAN hardcode angka.
 *
 * Sumber kebenaran: tabel `roles` (seeded via RoleSeeder / DatabaseSeeder)
 *
 * Pemetaan Role ke Jabatan:
 *  SuperAdmin  (1)  → Director, IT Manager
 *  Company     (2)  → Company PIC (user biasa)
 *  Reviewer    (6)  → Auditor / Assessment Admin
 *  Supervisor  (7)  → Certification Manager / Certificate Admin
 *  Manager     (10) → HR & Finance Manager / Finance Admin
 *  QcAdmin     (11) → Quality Control & Standardization Manager
 */
enum RoleId: int
{
    case SuperAdmin = 1;
    case Company    = 2;
    case Reviewer   = 6;   // Assessment Admin (Auditor)
    case Supervisor = 7;   // Certificate Admin (Certification Manager)
    case Manager    = 10;  // Finance Admin (HR & Finance Manager)
    case QcAdmin    = 11;  // Admin QC (Quality Control & Standardization Manager)
    case ItManager  = 12;  // IT Manager

    /**
     * Semua role yang memiliki hak akses ke admin panel (bukan company).
     */
    public static function adminRoleIds(): array
    {
        return [
            self::SuperAdmin->value,
            self::ItManager->value,
            self::Reviewer->value,
            self::Supervisor->value,
            self::Manager->value,
            self::QcAdmin->value,
        ];
    }

    /**
     * Super Admin saja (Director & IT Manager).
     * Akses: semua fitur termasuk kelola user, settings, dan approve sertifikat.
     */
    public static function superAdminRoleIds(): array
    {
        return [
            self::SuperAdmin->value,
            self::ItManager->value,
        ];
    }

    /**
     * Role yang bisa memverifikasi submission & menerima/approve pengajuan.
     * Assessment Admin (Auditor) + QC Admin + Super Admin.
     */
    public static function assessmentRoleIds(): array
    {
        return [
            self::SuperAdmin->value,
            self::ItManager->value,
            self::QcAdmin->value,
            self::Reviewer->value,
        ];
    }

    /**
     * Role yang bisa READ detail submission (list + show).
     * Sama seperti assessment, tapi ditambah Certificate Admin —
     * karena dia perlu baca submission untuk menerbitkan sertifikat.
     */
    public static function submissionReadRoleIds(): array
    {
        return [
            self::SuperAdmin->value,
            self::ItManager->value,
            self::QcAdmin->value,
            self::Reviewer->value,
            self::Supervisor->value, // Certificate Admin — read only, untuk terbitkan sertifikat
        ];
    }

    /**
     * Role yang berfungsi sebagai asesor (penilai indikator per submission).
     * Dipakai untuk daftar available assessors.
     */
    public static function assessorRoleIds(): array
    {
        return [
            self::Reviewer->value,
            self::Supervisor->value,
        ];
    }

    /**
     * Role yang boleh menerbitkan sertifikat.
     * Certificate Admin (Certification Manager) + Super Admin.
     */
    public static function certAdminRoleIds(): array
    {
        return [
            self::SuperAdmin->value,
            self::ItManager->value,
            self::Supervisor->value,
        ];
    }

    /**
     * Role yang boleh mengakses fitur pembayaran/finance.
     * Finance Admin + QC Admin + Super Admin.
     */
    public static function financeRoleIds(): array
    {
        return [
            self::SuperAdmin->value,
            self::ItManager->value,
            self::QcAdmin->value,
            self::Manager->value,
        ];
    }

    /**
     * Role yang boleh mengakses kelola pengguna & settings sistem.
     * Hanya Super Admin.
     */
    public static function userManagementRoleIds(): array
    {
        return [
            self::SuperAdmin->value,
            self::ItManager->value,
        ];
    }
}
