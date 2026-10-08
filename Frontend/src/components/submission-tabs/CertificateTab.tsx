"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { Award, Clock, Download, Printer, Loader2 } from "lucide-react";
import { SubmissionDetail } from "@/types";
import { useTranslation } from "@/store/lang";

interface Props {
  submission: SubmissionDetail;
}

export function CertificateTab({ submission }: Props) {
  const { t } = useTranslation();
  const [isPrinting, setIsPrinting] = useState(false);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  const cert = submission.certificate;
  const isCertified = Number(submission.status.id) === 5;
  const certPdfUrl = `${process.env.NEXT_PUBLIC_API_URL ?? ""}/public/submissions/${submission.id}/certificate/download`;
  const [blobUrl, setBlobUrl] = useState<string>("");

  // Pre-fetch binary PDF sebagai same-origin Blob agar iframeRef.current.contentWindow?.print() dapat dipanggil langsung tanpa cross-origin restriction
  useEffect(() => {
    let active = true;
    let objectUrl = "";

    fetch(certPdfUrl)
      .then((res) => {
        if (!res.ok) throw new Error("Gagal mengunduh dokumen sertifikat");
        return res.blob();
      })
      .then((blob) => {
        if (active) {
          objectUrl = URL.createObjectURL(blob);
          setBlobUrl(objectUrl);
        }
      })
      .catch((err) => {
        console.warn("Gagal memuat blob PDF, menggunakan direct URL sebagai fallback:", err);
      });

    return () => {
      active = false;
      if (objectUrl) {
        URL.revokeObjectURL(objectUrl);
      }
    };
  }, [certPdfUrl]);

  const focusTrapRef = useRef<HTMLButtonElement>(null);

  const handlePrintCertificate = useCallback(() => {
    if (isPrinting) return;
    setIsPrinting(true);

    try {
      // 1. Buat iframe khusus print (tersembunyi) agar tidak pernah mencetak shell/toolbar PDF viewer
      const existingFrame = document.getElementById("becdex-cert-print-frame");
      if (existingFrame) existingFrame.remove();

      const printFrame = document.createElement("iframe");
      printFrame.id = "becdex-cert-print-frame";
      printFrame.setAttribute(
        "style",
        "position:fixed;top:-9999px;left:-9999px;width:100vw;height:100vh;opacity:0;border:none;pointer-events:none;z-index:-9999;"
      );
      printFrame.src = `${blobUrl || certPdfUrl}#toolbar=0&navpanes=0&scrollbar=0`;
      document.body.appendChild(printFrame);

      let hasTriggered = false;
      const triggerPrint = () => {
        if (hasTriggered) return;
        hasTriggered = true;

        try {
          printFrame.contentWindow?.focus();
          printFrame.contentWindow?.print();
        } catch (printErr) {
          console.warn("Hidden iframe print failed, falling back to clean window:", printErr);
          const w = window.open(blobUrl || certPdfUrl, "_blank");
          w?.focus();
        } finally {
          setIsPrinting(false);
          setTimeout(() => {
            if (document.body.contains(printFrame)) {
              printFrame.remove();
            }
          }, 60000);
        }
      };

      printFrame.onload = () => {
        setTimeout(triggerPrint, 500);
      };
      // Fallback timeout jika browser tidak memicu onload pada iframe PDF
      setTimeout(triggerPrint, 1800);
    } catch (error) {
      console.warn("Direct print setup failed, opening clean window fallback:", error);
      const printWindow = window.open(blobUrl || certPdfUrl, "_blank");
      printWindow?.focus();
      printWindow?.print();
      setIsPrinting(false);
    }
  }, [blobUrl, certPdfUrl, isPrinting]);

  // Shortcut Ctrl + P / Cmd + P otomatis mencetak dokumen sertifikat resmi
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const isCtrlOrCmd = e.ctrlKey || e.metaKey;
      const isKeyP = e.key === "p" || e.key === "P" || e.code === "KeyP";

      if (isCtrlOrCmd && isKeyP) {
        e.preventDefault();
        e.stopPropagation();
        handlePrintCertificate();
      }
    };

    window.addEventListener("keydown", handleKeyDown, true);
    document.addEventListener("keydown", handleKeyDown, true);

    // Kembalikan fokus keyboard ke parent window jika pengguna mengklik ke dalam iframe PDF,
    // agar shortcut Ctrl + P tidak tertahan di dalam PDF viewer internal Chrome
    const returnFocus = () => {
      if (document.activeElement === iframeRef.current) {
        focusTrapRef.current?.focus({ preventScroll: true });
      }
    };

    const handleBlur = () => {
      setTimeout(returnFocus, 10);
    };

    window.addEventListener("blur", handleBlur);
    window.addEventListener("mousemove", returnFocus);
    const interval = setInterval(returnFocus, 200);

    return () => {
      window.removeEventListener("keydown", handleKeyDown, true);
      document.removeEventListener("keydown", handleKeyDown, true);
      window.removeEventListener("blur", handleBlur);
      window.removeEventListener("mousemove", returnFocus);
      clearInterval(interval);
    };
  }, [handlePrintCertificate]);

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

  return (
    <div className="max-w-xl mx-auto space-y-6 print:max-w-none print:m-0 print:p-0 print:w-full print:space-y-0">
      {/* Render Actual PDF Certificate via Iframe (100% Full Width & Height on Print, No Border/Shadow) */}
      <div className="w-full h-150 md:h-200 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-md overflow-hidden bg-white print:border-none print:shadow-none print:rounded-none print:h-screen print:w-full print:m-0 print:p-0 print:overflow-visible">
        <iframe
          ref={iframeRef}
          src={blobUrl || certPdfUrl}
          className="w-full h-full border-none print:w-full print:h-full print:border-none"
          title="Sertifikat BECdex"
        />
      </div>

      {/* Download & Print Actions */}
      {isValid && (
        <div className="flex flex-col sm:flex-row gap-3 print:hidden">
          <a
            href={certPdfUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 inline-flex items-center justify-center gap-2.5 bg-[#0c2340] hover:bg-blue-700 dark:bg-blue-600 dark:hover:bg-blue-500 text-white py-3.5 rounded-xl font-extrabold text-xs transition-all shadow-md shadow-[#0c2340]/20"
          >
            <Download size={16} />
            <span>{t.tab_cert_download || "Unduh PDF Sertifikat Resmi"}</span>
          </a>
          <button
            type="button"
            onClick={handlePrintCertificate}
            disabled={isPrinting}
            className="inline-flex items-center justify-center gap-2 px-5 py-3.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 font-bold text-xs transition-all shadow-2xs cursor-pointer shrink-0 disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {isPrinting ? (
              <Loader2 size={16} className="animate-spin text-blue-600 dark:text-blue-400" />
            ) : (
              <Printer size={16} />
            )}
            <span>{isPrinting ? "Menyiapkan Dokumen..." : (t.tab_cert_print || "Cetak Sertifikat")}</span>
          </button>
        </div>
      )}
    </div>
  );
}
