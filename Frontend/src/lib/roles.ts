/**
 * RBAC Role ID constants untuk Frontend BECdex
 * Harus sinkron dengan Backend/app/Enums/RoleId.php
 */

export const ROLE_IDS = {
  SUPER_ADMIN: 1,       // Director
  COMPANY: 2,           // Company PIC
  ASSESSMENT_ADMIN: 6,  // Auditor
  CERT_ADMIN: 7,        // Certification Manager
  FINANCE_ADMIN: 10,    // HR and Finance Manager
  QC_ADMIN: 11,         // Quality Control and Standardization Manager
  IT_MANAGER: 12,       // IT Manager (sama dengan Super Admin)
} as const;

export type RoleId = (typeof ROLE_IDS)[keyof typeof ROLE_IDS];

interface UserWithRole {
  role: { id: number; name: string };
}

/** Director & IT Manager — akses penuh semua fitur */
export const isSuperAdmin = (user: UserWithRole | null | undefined): boolean =>
  user?.role?.id === ROLE_IDS.SUPER_ADMIN || user?.role?.id === ROLE_IDS.IT_MANAGER;

/** Quality Control Manager — akses selain Users & Settings */
export const isQcAdmin = (user: UserWithRole | null | undefined): boolean =>
  user?.role?.id === ROLE_IDS.QC_ADMIN;

/** Auditor — verifikasi submission & approve pengajuan, tidak bisa terbitkan sertifikat */
export const isAssessmentAdmin = (user: UserWithRole | null | undefined): boolean =>
  user?.role?.id === ROLE_IDS.ASSESSMENT_ADMIN;

/** Certification Manager — hanya bisa terbitkan sertifikat (perlu approval Super Admin) */
export const isCertAdmin = (user: UserWithRole | null | undefined): boolean =>
  user?.role?.id === ROLE_IDS.CERT_ADMIN;

/** HR & Finance Manager — hanya akses halaman payment/finance */
export const isFinanceAdmin = (user: UserWithRole | null | undefined): boolean =>
  user?.role?.id === ROLE_IDS.FINANCE_ADMIN;

/** Company PIC — user biasa */
export const isCompany = (user: UserWithRole | null | undefined): boolean =>
  user?.role?.id === ROLE_IDS.COMPANY;

// ── Grouped Checks ────────────────────────────────────────────────────────

/** Apakah user bisa akses admin panel sama sekali */
export const isAnyAdmin = (user: UserWithRole | null | undefined): boolean =>
  !isCompany(user) && !!user;

/** Apakah user bisa membaca halaman Submissions (list & detail) */
export const canReadSubmissions = (user: UserWithRole | null | undefined): boolean =>
  isSuperAdmin(user) || isQcAdmin(user) || isAssessmentAdmin(user) || isCertAdmin(user);

/** Apakah user bisa melakukan verifikasi dan meluluskan submission */
export const canVerifySubmissions = (user: UserWithRole | null | undefined): boolean =>
  isSuperAdmin(user) || isQcAdmin(user) || isAssessmentAdmin(user);

/** Apakah user bisa menerbitkan sertifikat */
export const canIssueCertificate = (user: UserWithRole | null | undefined): boolean =>
  isSuperAdmin(user) || isCertAdmin(user);

/** Apakah user bisa approve sertifikat (final) */
export const canApproveCertificate = (user: UserWithRole | null | undefined): boolean =>
  isSuperAdmin(user);

/** Apakah user bisa akses fitur pembayaran */
export const canAccessPayments = (user: UserWithRole | null | undefined): boolean =>
  isSuperAdmin(user) || isQcAdmin(user) || isFinanceAdmin(user);

/** Apakah user bisa kelola Users & Settings (hanya Super Admin) */
export const canManageUsers = (user: UserWithRole | null | undefined): boolean =>
  isSuperAdmin(user);
