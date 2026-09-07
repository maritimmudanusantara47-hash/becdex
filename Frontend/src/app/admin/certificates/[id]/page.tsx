"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { AppLayout } from "@/components/layouts/AppLayout";
import { LoadingSpinner } from "@/components/ui/index";
import api from "@/lib/api";
import { formatDate, cn } from "@/lib/utils";
import {
  Award, ArrowLeft, Download, CheckCircle2, Building2,
  Calendar, Hash, BarChart3, ShieldCheck, ShieldAlert,
  RefreshCw, FileText, ExternalLink,
} from "lucide-react";
import { useAuthStore } from "@/store/auth";
import { canApproveCertificate } from "@/lib/roles";
import { useTranslation } from "@/store/lang";
import Link from "next/link";

interface CertDetail {
  id: number;
  mmic: string;
  direktur: string;
  published_at: string;
  valid_until: string;
  is_approved: boolean;
  user?: { id?: number; name?: string; email?: string };
  certificate?: { id?: number; name?: string; category?: string };
  submission?: { id?: number; initial_score?: number; valid_score?: number };
}

export default function AdminCertificateDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuthStore();
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const certId = params?.id as string;
  const canApprove = canApproveCertificate(user);

  const [pdfBlobUrl, setPdfBlobUrl] = useState<string | null>(null);
  const [pdfLoading, setPdfLoading] = useState(false);
  const [pdfError, setPdfError] = useState<string | null>(null);

  const { data, isLoading, isError } = useQuery({
    queryKey: ["admin-certificate-detail", certId],
    queryFn: async () => {
      const res = await api.get(`/admin/certificates/${certId}`);
      return res.data.data as CertDetail;
    },
    enabled: !!certId,
  });

  const approveMutation = useMutation({
    mutationFn: () => api.post(`/admin/certificates/${certId}/approve`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-certificate-detail", certId] });
      queryClient.invalidateQueries({ queryKey: ["admin-certificates"] });
    },
  });

  const fetchPdfBlob = useCallback(async () => {
    if (!certId) return;
    setPdfLoading(true);
    setPdfError(null);
    try {
      const res = await api.get(`/admin/certificates/${certId}/download`, {
        responseType: "blob",
      });
      const blob = new Blob([res.data], { type: "application/pdf" });
      const url = URL.createObjectURL(blob);
      setPdfBlobUrl((prev) => {
        if (prev) URL.revokeObjectURL(prev);
        return url;
      });
    } catch {
      setPdfError(t.dash_admin_cert_preview_error || "Gagal memuat preview PDF. Coba refresh atau download langsung.");
    } finally {
      setPdfLoading(false);
    }
  }, [certId, t.dash_admin_cert_preview_error]);

  useEffect(() => {
    fetchPdfBlob();
    return () => {
      setPdfBlobUrl((prev) => {
        if (prev) URL.revokeObjectURL(prev);
        return null;
      });
    };
  }, [fetchPdfBlob]);

  const handleDownload = async () => {
    try {
      const res = await api.get(`/admin/certificates/${certId}/download?mode=download`, {
        responseType: "blob",
      });
      const blob = new Blob([res.data], { type: "application/pdf" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `sertifikat_${data?.user?.name?.replace(/\\s+/g, "_") ?? certId}.pdf`;
      a.click();
      URL.revokeObjectURL(url);
    } catch {
      alert(t.dash_admin_cert_preview_error || "Gagal mengunduh PDF. Coba lagi.");
    }
  };

  const cert = data;
  const isActive = cert ? new Date(cert.valid_until) >= new Date() : false;

  const getCategoryStyle = (category?: string) => {
    switch (category?.toLowerCase()) {
      case "excellent": return "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-700";
      case "good": return "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/60 dark:text-blue-300 dark:border-blue-700";
      default: return "bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700";
    }
  };

  return (
    <AppLayout title={cert ? `${t.dash_admin_cert_detail_title || "Detail Sertifikat"} — ${cert.user?.name ?? ""}` : (t.dash_admin_cert_detail_title || "Detail Sertifikat")}>
      <div className="mb-5 flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
        <Link href="/admin/certificates" className="inline-flex items-center gap-1.5 hover:text-blue-600 dark:hover:text-blue-400 transition-colors font-medium">
          <ArrowLeft size={14} />
          {t.dash_admin_cert_back || "Kembali ke Daftar Sertifikat"}
        </Link>
        {cert && (
          <>
            <span className="text-slate-300 dark:text-slate-600">/</span>
            <span className="text-slate-700 dark:text-slate-200 font-semibold truncate max-w-xs">{cert.user?.name}</span>
          </>
        )}
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center min-h-96"><LoadingSpinner /></div>
      ) : isError || !cert ? (
        <div className="rounded-2xl border border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-950/30 p-10 text-center">
          <ShieldAlert size={36} className="mx-auto mb-3 text-red-500" />
          <p className="text-sm font-semibold text-red-700 dark:text-red-400">{t.dash_admin_cert_not_found || "Sertifikat tidak ditemukan atau terjadi kesalahan."}</p>
          <button onClick={() => router.push("/admin/certificates")} className="mt-4 px-4 py-2 rounded-xl bg-red-600 text-white text-xs font-bold hover:bg-red-700 transition-colors cursor-pointer">
            {t.dash_admin_cert_back || "Kembali ke Daftar"}
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 xl:grid-cols-5 gap-6 items-start">
          {/* LEFT PANEL */}
          <div className="xl:col-span-2 flex flex-col gap-4">
            <div className="rounded-2xl border border-slate-200/80 bg-white dark:border-slate-800 dark:bg-slate-900 p-6 shadow-xs transition-colors">
              <div className="flex items-start gap-4 mb-5">
                <div className="w-12 h-12 rounded-xl bg-blue-100 dark:bg-blue-900/50 flex items-center justify-center shrink-0">
                  <Award size={24} className="text-blue-600 dark:text-blue-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">BECdex Certificate</p>
                  <h1 className="text-lg font-extrabold text-slate-900 dark:text-white leading-tight">{cert.user?.name ?? ""}</h1>
                  <p className="text-xs text-slate-400 dark:text-slate-500 font-mono mt-0.5">{cert.user?.email ?? ""}</p>
                </div>
              </div>

              <div className="flex flex-wrap gap-2 mb-5">
                {cert.is_approved ? (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border bg-emerald-50 text-emerald-700 border-emerald-200/80 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-800">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" />
                    {t.dash_admin_cert_approved_badge || "Approved"}
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border bg-amber-50 text-amber-700 border-amber-200/80 dark:bg-amber-950/60 dark:text-amber-300 dark:border-amber-800">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse shrink-0" />
                    {t.dash_admin_cert_pending_badge || "Pending Approval"}
                  </span>
                )}
                <span className={cn("inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border", isActive ? "bg-teal-50 text-teal-700 border-teal-200/80 dark:bg-teal-950/60 dark:text-teal-300 dark:border-teal-800" : "bg-red-50 text-red-700 border-red-200/80 dark:bg-red-950/60 dark:text-red-300 dark:border-red-800")}>
                  <span className={cn("w-1.5 h-1.5 rounded-full shrink-0", isActive ? "bg-teal-500" : "bg-red-500")} />
                  {isActive ? (t.dash_admin_cert_valid_badge || "Active & Valid") : (t.dash_admin_cert_expired_badge || "Expired")}
                </span>
                {cert.certificate?.category && (
                  <span className={cn("inline-flex items-center px-3 py-1 rounded-full text-xs font-extrabold border uppercase tracking-wide", getCategoryStyle(cert.certificate.category))}>
                    {cert.certificate.category}
                  </span>
                )}
              </div>

              <div className="space-y-1">
                <InfoRow icon={<Hash size={14} />} label={t.dash_admin_cert_col_mmic || "Nomor MMIC"} value={<span className="font-mono font-bold text-slate-800 dark:text-white">{cert.mmic || "—"}</span>} />
                <InfoRow icon={<FileText size={14} />} label={t.dash_admin_cert_director || "Direktur"} value={cert.direktur || "—"} />
                <InfoRow icon={<BarChart3 size={14} />} label={t.dash_admin_cert_col_score || "Skor Valid"} value={<span className="font-extrabold text-slate-900 dark:text-white">{Number(cert.submission?.valid_score ?? cert.submission?.initial_score ?? 0).toFixed(1)}%</span>} />
                <InfoRow icon={<Calendar size={14} />} label={t.dash_admin_cert_col_published || "Tanggal Diterbitkan"} value={formatDate(cert.published_at)} />
                <InfoRow icon={<Calendar size={14} />} label={t.dash_admin_cert_col_valid_until || "Berlaku Hingga"} value={<span className={isActive ? "text-teal-700 dark:text-teal-400 font-bold" : "text-red-600 dark:text-red-400 font-bold"}>{formatDate(cert.valid_until)}</span>} />
              </div>
            </div>

            <div className="rounded-2xl border border-slate-200/80 bg-white dark:border-slate-800 dark:bg-slate-900 p-5 shadow-xs flex flex-col gap-3 transition-colors">
              <p className="text-xs font-extrabold text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-1">{t.dash_admin_cert_actions || "Aksi"}</p>

              <button onClick={handleDownload} className="w-full inline-flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 active:scale-[0.98] text-white font-bold text-sm shadow-md shadow-blue-600/20 transition-all cursor-pointer">
                <Download size={16} />
                {t.dash_admin_cert_download_btn || "Download PDF Sertifikat"}
              </button>

              <button onClick={fetchPdfBlob} disabled={pdfLoading} className="w-full inline-flex items-center justify-center gap-2 px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-semibold text-sm transition-all disabled:opacity-60 cursor-pointer">
                <RefreshCw size={15} className={pdfLoading ? "animate-spin" : ""} />
                {pdfLoading ? (t.dash_admin_cert_loading_preview || "Memuat...") : (t.dash_admin_cert_refresh_btn || "Refresh Preview")}
              </button>

              {cert.submission?.id && (
                <Link href={`/admin/submissions/${cert.submission.id}`} className="w-full inline-flex items-center justify-center gap-2 px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-semibold text-sm transition-all cursor-pointer">
                  <ExternalLink size={15} />
                  {t.dash_admin_cert_view_submission || "Lihat Submission Terkait"}
                </Link>
              )}

              {canApprove && !cert.is_approved && (
                <button onClick={() => approveMutation.mutate()} disabled={approveMutation.isPending} className="w-full inline-flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:scale-[0.98] text-white font-bold text-sm shadow-md shadow-emerald-600/20 transition-all disabled:opacity-60 cursor-pointer">
                  <CheckCircle2 size={16} />
                  {approveMutation.isPending ? (t.dash_admin_cert_approving || "Memproses...") : (t.dash_admin_cert_approve_btn || "Setujui Sertifikat Ini")}
                </button>
              )}
              {canApprove && cert.is_approved && (
                <div className="w-full inline-flex items-center justify-center gap-2 px-4 py-3 rounded-xl border border-emerald-200 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 font-semibold text-sm">
                  <ShieldCheck size={15} />
                  {t.dash_admin_cert_already_approved || "Sertifikat Sudah Diapprove"}
                </div>
              )}
            </div>
          </div>

          {/* RIGHT PANEL - PDF Preview */}
          <div className="xl:col-span-3">
            <div className="rounded-2xl border border-slate-200/80 bg-white dark:border-slate-800 dark:bg-slate-900 shadow-xs overflow-hidden transition-colors">
              <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center gap-3 bg-slate-50/50 dark:bg-slate-800/30">
                <FileText size={16} className="text-slate-500 dark:text-slate-400 shrink-0" />
                <span className="font-extrabold text-slate-800 dark:text-white text-sm">{t.dash_admin_cert_preview_heading || "Preview Sertifikat PDF"}</span>
                <span className="ml-auto text-xs text-slate-400 dark:text-slate-500 font-medium">{cert.user?.name}</span>
              </div>
              <div className="relative bg-slate-100 dark:bg-slate-800/50" style={{ minHeight: "750px" }}>
                {pdfLoading && (
                  <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 z-10 bg-white/80 dark:bg-slate-900/80">
                    <div className="w-10 h-10 rounded-full border-2 border-blue-200 border-t-blue-600 animate-spin" />
                    <p className="text-xs font-medium text-slate-500 dark:text-slate-400">{t.dash_admin_cert_loading_pdf || "Sedang memuat preview PDF..."}</p>
                  </div>
                )}
                {pdfError && !pdfLoading && (
                  <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 px-8 text-center">
                    <div className="w-14 h-14 rounded-2xl bg-red-100 dark:bg-red-950/50 flex items-center justify-center">
                      <FileText size={26} className="text-red-500" />
                    </div>
                    <div>
                      <p className="font-bold text-slate-800 dark:text-white text-sm mb-1">{t.dash_admin_cert_preview_unavailable || "Preview Tidak Tersedia"}</p>
                      <p className="text-xs text-slate-500 dark:text-slate-400 max-w-xs">{pdfError}</p>
                    </div>
                    <button onClick={fetchPdfBlob} className="px-4 py-2 rounded-xl bg-blue-600 text-white text-xs font-bold hover:bg-blue-700 transition-colors cursor-pointer">{t.dash_admin_cert_try_again || "Coba Lagi"}</button>
                  </div>
                )}
                {pdfBlobUrl && !pdfLoading && (
                  <iframe src={pdfBlobUrl} title="Preview Sertifikat" className="w-full border-0" style={{ height: "750px" }} />
                )}
                {!pdfBlobUrl && !pdfLoading && !pdfError && (
                  <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 text-center px-8">
                    <Building2 size={36} className="text-slate-300 dark:text-slate-600" />
                    <p className="text-sm text-slate-400 dark:text-slate-500">{t.dash_admin_cert_pdf_not_loaded || "PDF belum dimuat. Klik Refresh Preview."}</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </AppLayout>
  );
}

function InfoRow({ icon, label, value }: { icon: React.ReactNode; label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-start gap-3 py-2.5 border-b border-slate-100 dark:border-slate-800 last:border-0">
      <span className="mt-0.5 text-slate-400 dark:text-slate-500 shrink-0">{icon}</span>
      <div className="flex-1 min-w-0 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-0.5">
        <span className="text-xs text-slate-500 dark:text-slate-400 font-medium shrink-0">{label}</span>
        <span className="text-sm text-slate-700 dark:text-slate-200 font-semibold text-right">{value}</span>
      </div>
    </div>
  );
}
