"use client";

import { Award, Clock, Download, Printer } from "lucide-react";
import { SubmissionDetail } from "@/types";
import { useTranslation } from "@/store/lang";

interface Props {
  submission: SubmissionDetail;
}

export function CertificateTab({ submission }: Props) {
  const { t } = useTranslation();
  const cert = submission.certificate;
  const isCertified = Number(submission.status.id) === 5;

  if (!isCertified || !cert) {
    return (
      <div className="max-w-xl mx-auto rounded-2xl border border-dashed border-slate-200/80 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 p-8 md:p-12 text-center shadow-2xs transition-all">
        <div className="inline-flex items-center justify-center w-20 h-20 bg-blue-50 dark:bg-blue-950/60 rounded-2xl mb-5 text-blue-600 dark:text-blue-400 shadow-sm border border-blue-100 dark:border-blue-900/50">
          <Award className="w-10 h-10 animate-pulse" />
        </div>
        <h3 className="text-lg md:text-xl font-extrabold text-slate-800 dark:text-white mb-2 tracking-tight">
          Sertifikat Belum Tersedia
        </h3>
        <p className="text-slate-500 dark:text-slate-400 text-xs md:text-sm max-w-sm mx-auto leading-relaxed font-medium">
          Sertifikat resmi Indeks Blue Economy akan diterbitkan setelah proses verifikasi berkas, penilaian lapangan, dan verifikasi pembayaran selesai disetujui oleh tim verifikator BECdex.
        </p>
        <div className="mt-6 inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 text-xs font-bold text-slate-600 dark:text-slate-300 shadow-2xs">
          <Clock size={14} className="text-blue-500" />
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-widest">{t.tab_cert_status || "Status Pengajuan:"} <span className="text-slate-800 dark:text-slate-200">{submission.status.name}</span></p>
        </div>
      </div>
    );
  }

  // Jika sertifikat sudah terbit tetapi BELUM disetujui oleh Super Admin
  if (cert.is_approved === false) {
    return (
      <div className="max-w-xl mx-auto space-y-6">
        <div className="rounded-2xl border border-amber-200/80 bg-amber-50/70 dark:border-amber-900/60 dark:bg-amber-950/40 p-8 md:p-10 text-center shadow-md transition-all">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-amber-100 dark:bg-amber-900/60 rounded-2xl mb-5 text-amber-600 dark:text-amber-400 shadow-xs border border-amber-200 dark:border-amber-800">
            <Clock className="w-10 h-10 animate-pulse" />
          </div>
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-amber-100 dark:bg-amber-900/80 text-amber-800 dark:text-amber-200 text-xs font-extrabold uppercase tracking-wide mb-3">
            <span>⏳ Menunggu Otorisasi Super Admin</span>
          </div>
          <h3 className="text-lg md:text-xl font-extrabold text-slate-900 dark:text-white mb-2 tracking-tight">
            Sertifikat Diterbitkan & Menunggu Persetujuan Direktur
          </h3>
          <p className="text-slate-600 dark:text-slate-300 text-xs md:text-sm max-w-md mx-auto leading-relaxed font-medium">
            Sertifikat resmi BECdex Perusahaan Anda telah diterbitkan oleh Tim Assessor dan saat ini sedang dalam proses verifikasi & tanda tangan akhir oleh Manajemen / Super Admin.
          </p>

          <div className="mt-6 p-4 rounded-xl bg-white/90 dark:bg-slate-900/90 border border-amber-200/60 dark:border-amber-800/60 text-left space-y-2 text-xs">
            <div className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-800">
              <span className="text-slate-500 font-semibold">Nomor Registrasi MMIC:</span>
              <span className="font-mono font-bold text-slate-800 dark:text-slate-200">{cert.mmic || "-"}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-800">
              <span className="text-slate-500 font-semibold">Penandatangan Direktur:</span>
              <span className="font-bold text-slate-800 dark:text-slate-200">{cert.direktur || "Direktur BECdex"}</span>
            </div>
            <div className="flex justify-between py-1">
              <span className="text-slate-500 font-semibold">Status Dokumen:</span>
              <span className="font-extrabold text-amber-600 dark:text-amber-400">Menunggu Approval Super Admin</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const isValid = cert.is_valid;

  const handlePrintCertificate = () => {
    window.print();
  };

  return (
    <div className="max-w-xl mx-auto space-y-6">
      {/* Render Actual PDF Certificate via Iframe */}
      <div className="w-full h-150 md:h-200 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-md overflow-hidden bg-white">
        <iframe
          src={`${process.env.NEXT_PUBLIC_API_URL ?? ""}/public/submissions/${submission.id}/certificate/download`}
          className="w-full h-full border-none"
          title="Sertifikat BECdex"
        />
      </div>

      {/* Download & Print Actions */}
      {isValid && (
        <div className="flex flex-col sm:flex-row gap-3 print:hidden">
          <a
            href={`${process.env.NEXT_PUBLIC_API_URL ?? ""}/public/submissions/${submission.id}/certificate/download`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 inline-flex items-center justify-center gap-2.5 bg-[#0c2340] hover:bg-blue-700 dark:bg-blue-600 dark:hover:bg-blue-500 text-white py-3.5 rounded-xl font-extrabold text-xs transition-all shadow-md shadow-[#0c2340]/20"
          >
            <Download size={16} />
              <span>{t.tab_cert_download || "Unduh PDF Sertifikat Resmi"}</span>
          </a>
          <button
            onClick={handlePrintCertificate}
            className="inline-flex items-center justify-center gap-2 px-5 py-3.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 font-bold text-xs transition-all shadow-2xs cursor-pointer shrink-0"
          >
            <Printer size={16} />
              <span>{t.tab_cert_print || "Cetak Sertifikat"}</span>
          </button>
        </div>
      )}
    </div>
  );
}
