import { describe, it, expect } from 'vitest';

// ─── F-I4: Button Visibility per Status (Company Submission Detail) ────────────
//
// Mendokumentasikan aturan visibilitas tombol aksi pada halaman detail submission
// dari sudut pandang perusahaan. Ini adalah unit test logika (pure function),
// bukan rendering test, karena halaman menggunakan Next.js RSC patterns.
//
// Aturan dari src/app/dashboard/submissions/[id]/page.tsx:
//   status.id === 4 → banner "Revisi Diperlukan"
//   status.id === 7 → banner "Jadwal Survei Aktif"
//   status.id === 1 → banner/link "Pending Payment"
//   status.id === 8 → tombol "Buat Invoice Xendit" / payment
//   status.id === 6 → banner "Menunggu Jadwal Survei"
//   status.id === 9 → banner "Ditolak"

// Replika logika button visibility dari halaman company
function getCompanyButtonVisibility(statusId: number) {
  return {
    showRevisionBanner:    statusId === 4,
    showSurveyBanner:      statusId === 7,
    showPendingPayment:    statusId === 1,
    showPaymentButton:     statusId === 8,
    showWaitingSurvey:     statusId === 6,
    showRejectedBanner:    statusId === 9,
  };
}

// Replika logika button visibility dari halaman admin
function getAdminButtonVisibility(statusId: number) {
  return {
    showApproveReject:     statusId === 3,  // Approve (→ 8) + Reject button
    showScheduleSurvey:    statusId === 6,  // "Jadwal Survei" button
    showIssueCertificate:  statusId === 7,  // "Terbitkan Sertifikat" button
    showRejectOnSurvey:    statusId === 7,  // "Tolak" button (saat survey)
    isCertified:           statusId === 5,  // Semua tombol aksi hilang
    showSurveySection:     statusId >= 6,   // Panel survei mulai muncul
  };
}

// ─── F-I4: Company Detail Tests ────────────────────────────────────────────────

describe('F-I4: Company Submission Detail — Button Visibility', () => {
  it('Status 2 (Document Submission) — tidak ada banner/tombol aksi khusus', () => {
    const v = getCompanyButtonVisibility(2);
    expect(v.showRevisionBanner).toBe(false);
    expect(v.showPaymentButton).toBe(false);
    expect(v.showRejectedBanner).toBe(false);
  });

  it('Status 4 (Revision Needed) — hanya banner revisi yang tampil', () => {
    const v = getCompanyButtonVisibility(4);
    expect(v.showRevisionBanner).toBe(true);
    expect(v.showPaymentButton).toBe(false);
    expect(v.showPendingPayment).toBe(false);
  });

  it('Status 8 (Approved) — hanya tombol payment yang tampil', () => {
    const v = getCompanyButtonVisibility(8);
    expect(v.showPaymentButton).toBe(true);
    expect(v.showRevisionBanner).toBe(false);
    expect(v.showWaitingSurvey).toBe(false);
  });

  it('Status 1 (Pending Payment) — hanya banner pending payment yang tampil', () => {
    const v = getCompanyButtonVisibility(1);
    expect(v.showPendingPayment).toBe(true);
    expect(v.showPaymentButton).toBe(false);
    expect(v.showRevisionBanner).toBe(false);
  });

  it('Status 6 (Payment Successful) — hanya banner menunggu jadwal survei', () => {
    const v = getCompanyButtonVisibility(6);
    expect(v.showWaitingSurvey).toBe(true);
    expect(v.showPaymentButton).toBe(false);
  });

  it('Status 7 (Location Survey) — hanya banner jadwal survei aktif', () => {
    const v = getCompanyButtonVisibility(7);
    expect(v.showSurveyBanner).toBe(true);
    expect(v.showPaymentButton).toBe(false);
    expect(v.showRevisionBanner).toBe(false);
  });

  it('Status 9 (Rejected) — hanya banner ditolak yang tampil', () => {
    const v = getCompanyButtonVisibility(9);
    expect(v.showRejectedBanner).toBe(true);
    expect(v.showPaymentButton).toBe(false);
  });

  it('Status 5 (Certified) — tidak ada tombol aksi (sudah selesai)', () => {
    const v = getCompanyButtonVisibility(5);
    expect(Object.values(v).every(val => val === false)).toBe(true);
  });
});

// ─── F-I6: Admin Detail Tests ──────────────────────────────────────────────────

describe('F-I6: Admin Submission Detail — Button Visibility', () => {
  it('Status 3 (On Verification) — Approve + Reject tampil, tidak ada yang lain', () => {
    const v = getAdminButtonVisibility(3);
    expect(v.showApproveReject).toBe(true);
    expect(v.showScheduleSurvey).toBe(false);
    expect(v.showIssueCertificate).toBe(false);
    expect(v.isCertified).toBe(false);
  });

  it('Status 6 (Payment Successful) — hanya "Jadwal Survei" yang tampil', () => {
    const v = getAdminButtonVisibility(6);
    expect(v.showScheduleSurvey).toBe(true);
    expect(v.showApproveReject).toBe(false);
    expect(v.showIssueCertificate).toBe(false);
  });

  it('Status 7 (Location Survey) — "Terbitkan Sertifikat" + "Tolak" tampil', () => {
    const v = getAdminButtonVisibility(7);
    expect(v.showIssueCertificate).toBe(true);
    expect(v.showRejectOnSurvey).toBe(true);
    expect(v.showApproveReject).toBe(false);
    expect(v.showScheduleSurvey).toBe(false);
  });

  it('Status 5 (Certified) — tidak ada tombol aksi, isCertified = true', () => {
    const v = getAdminButtonVisibility(5);
    expect(v.isCertified).toBe(true);
    expect(v.showApproveReject).toBe(false);
    expect(v.showScheduleSurvey).toBe(false);
    expect(v.showIssueCertificate).toBe(false);
  });

  it('Panel survei hanya muncul mulai status 6', () => {
    expect(getAdminButtonVisibility(3).showSurveySection).toBe(false);
    expect(getAdminButtonVisibility(5).showSurveySection).toBe(false);
    expect(getAdminButtonVisibility(6).showSurveySection).toBe(true);
    expect(getAdminButtonVisibility(7).showSurveySection).toBe(true);
  });

  it('Tidak ada status yang menampilkan SEMUA tombol sekaligus (bypass guard)', () => {
    const allStatuses = [1, 2, 3, 4, 5, 6, 7, 8, 9];
    allStatuses.forEach(statusId => {
      const v = getAdminButtonVisibility(statusId);
      const activeButtons = [
        v.showApproveReject,
        v.showScheduleSurvey,
        v.showIssueCertificate,
      ].filter(Boolean).length;

      // Tidak boleh ada lebih dari 1 tipe aksi utama yang aktif sekaligus
      expect(activeButtons).toBeLessThanOrEqual(1);
    });
  });
});
