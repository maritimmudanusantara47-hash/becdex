"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { AppLayout } from "@/components/layouts/AppLayout";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { StatCard } from "@/components/ui/StatCard";
import { LoadingSpinner, EmptyState } from "@/components/ui/index";
import api from "@/lib/api";
import { formatDate, cn } from "@/lib/utils";
import { Submission, PaginatedResponse } from "@/types";
import { useTranslation } from "@/store/lang";
import {
  FileText,
  PlusCircle,
  Award,
  Clock,
  TrendingUp,
  Loader2,
  Anchor,
  CheckCircle2,
  AlertCircle,
  ChevronRight,
  ShieldCheck,
  AlertTriangle,
} from "lucide-react";

type ApiError = { response?: { data?: { message?: string } } };

function useSubmissions() {
  return useQuery<PaginatedResponse<Submission>>({
    queryKey: ["submissions"],
    queryFn: async () => {
      const res = await api.get("/submissions");
      return res.data;
    },
  });
}

export default function DashboardPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { data, isLoading, error } = useSubmissions();
  const { t } = useTranslation();

  const createMutation = useMutation({
    mutationFn: async () => {
      const res = await api.post("/submissions");
      return res.data.data as Submission;
    },
    onSuccess: (newSubmission) => {
      queryClient.invalidateQueries({ queryKey: ["submissions"] });
      toast.success(t.dash_create_success || "Submission baru berhasil dibuat! Silakan isi penilaian assessment.");
      router.push(`/dashboard/submissions/${newSubmission.id}`);
    },
    onError: (error: ApiError) => {
      toast.error(error.response?.data?.message || t.dash_create_error || "Gagal membuat submission.");
    },
  });

  const submissions = data?.data ?? [];

  const stats = {
    total: submissions.length,
    inProgress: submissions.filter((s) => [2, 3, 4, 7].includes(s.status.id)).length,
    certified: submissions.filter((s) => s.status.id === 5).length,
    maxScore: submissions.reduce((max, s) => Math.max(max, s.initial_score), 0),
  };

  const expiringSubmissions = submissions.filter((s) => {
    if (s.status.id !== 5 || !s.certificate?.valid_until) return false;
    const validUntil = new Date(s.certificate.valid_until);
    const now = new Date();
    const diffTime = validUntil.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays > 0 && diffDays <= 30;
  });

  if (error) {
    return (
      <AppLayout title={t.dash_panel_title || "Panel Perusahaan"}>
        <div className="rounded-2xl border border-amber-200 bg-amber-50/80 p-8 text-center text-amber-900 dark:border-amber-800/60 dark:bg-amber-950/40 dark:text-amber-200 max-w-xl mx-auto my-8 shadow-sm">
          <Clock className="mx-auto h-10 w-10 text-amber-600 dark:text-amber-400 mb-3 animate-pulse" />
          <h3 className="font-extrabold text-lg text-slate-800 dark:text-white tracking-tight">{t.dash_sub_err_load}</h3>
          <p className="text-xs md:text-sm mt-2 text-slate-600 dark:text-slate-300 leading-relaxed">{t.dash_sub_err_desc}</p>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout title={t.dash_panel_title || "Panel Perusahaan"}>
      {/* Welcome Hero Banner Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-linear-to-r from-blue-600 via-blue-700 to-indigo-800 dark:from-[#0c2340] dark:via-blue-900 dark:to-[#1d4ed8] p-6 md:p-8 text-white shadow-md shadow-blue-600/15 dark:shadow-[#0c2340]/15 border border-blue-500/30 dark:border-blue-700/40 transition-colors">
        <div className="absolute -right-10 -top-10 w-64 h-64 rounded-full bg-blue-500/10 blur-3xl pointer-events-none" />
        <div className="absolute right-8 top-1/2 -translate-y-1/2 opacity-10 pointer-events-none hidden md:block">
          <Anchor size={160} strokeWidth={1} />
        </div>

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="max-w-xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-blue-200 text-xs font-bold tracking-wide uppercase mb-3">
              <ShieldCheck size={14} className="text-blue-300" />
              <span>Blue Economy Company Index 2026</span>
            </div>
            <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight">
              {t.dash_welcome || "Selamat Datang di Portal BECdex"}
            </h2>
            <p className="text-blue-100/90 text-sm mt-2 leading-relaxed">
              {t.dash_welcome_desc || "Ukur, tingkatkan, dan dapatkan sertifikasi standar ekonomi biru maritim internasional untuk operasional perusahaan Anda."}
            </p>
          </div>

          <button
            onClick={() => createMutation.mutate()}
            disabled={createMutation.isPending}
            className="flex items-center justify-center gap-2.5 bg-white text-blue-700 hover:bg-blue-50 dark:text-[#0c2340] dark:hover:bg-slate-100 font-bold px-6 py-3.5 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 cursor-pointer shrink-0 disabled:opacity-60 text-sm"
          >
            {createMutation.isPending ? (
              <Loader2 size={18} className="animate-spin text-blue-600" />
            ) : (
              <PlusCircle size={18} className="text-blue-600" />
            )}
            <span>{t.dash_create_btn || "Ajukan Sertifikasi Baru"}</span>
          </button>
        </div>
      </div>

      {expiringSubmissions.length > 0 && (
        <div className="bg-amber-50 border-l-4 border-amber-500 p-4 rounded-r-xl shadow-sm dark:bg-amber-950/30 dark:border-amber-600 flex items-start gap-3">
          <AlertTriangle className="text-amber-500 mt-0.5 shrink-0" size={20} />
          <div>
            <h4 className="font-bold text-amber-800 dark:text-amber-400 text-sm">Peringatan Perpanjangan Sertifikat</h4>
            <p className="text-amber-700 dark:text-amber-500/90 text-xs mt-1">
              Anda memiliki sertifikat yang akan kedaluwarsa dalam kurang dari 30 hari. Harap segera ajukan sertifikasi baru untuk mempertahankan status Verified Company Anda.
            </p>
          </div>
        </div>
      )}

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        <StatCard
          title={t.dash_stat_total || "Total Submission"}
          value={stats.total}
          icon={FileText}
          color="navy"
          subtitle={t.dash_stat_total_desc || "Riwayat pengajuan"}
        />
        <StatCard
          title={t.dash_stat_progress || "Sedang Proses"}
          value={stats.inProgress}
          icon={Clock}
          color="yellow"
          subtitle={t.dash_stat_progress_desc || "Dalam tahap verifikasi"}
        />
        <StatCard
          title={t.dash_stat_certified || "Tersertifikasi"}
          value={stats.certified}
          icon={Award}
          color="green"
          subtitle={t.dash_stat_certified_desc || "Sertifikat BECdex aktif"}
        />
        <StatCard
          title={t.dash_stat_score || "Skor Tertinggi"}
          value={`${stats.maxScore.toFixed(0)}%`}
          icon={TrendingUp}
          color="blue"
          subtitle={t.dash_stat_score_desc || "Indeks terbaik Anda"}
        />
      </div>

      {/* TailAdmin Table Card */}
      <div className="rounded-2xl border border-slate-200/80 bg-white shadow-2xs dark:border-slate-800 dark:bg-slate-900 overflow-hidden transition-colors">
        {/* Table Card Header */}
        <div className="px-6 py-5 border-b border-slate-100 dark:border-slate-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-50/40 dark:bg-slate-800/20">
          <div>
            <h3 className="font-extrabold text-slate-800 dark:text-white text-base tracking-tight">
              {t.dash_list_title || "Daftar Submission Sertifikasi"}
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              {t.dash_list_desc || "Pantau status asesmen, unggahan dokumen, dan verifikasi admin secara real-time"}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-lg bg-blue-50 text-blue-700 border border-blue-200/60 dark:bg-blue-950/60 dark:text-blue-300 dark:border-blue-800">
              <CheckCircle2 size={13} className="text-blue-600" />
              {t.dash_badge_standard || "Standar 50 Indikator"}
            </span>
          </div>
        </div>

        {/* Table Body / Content */}
        {isLoading ? (
          <div className="py-16">
            <LoadingSpinner />
          </div>
        ) : submissions.length === 0 ? (
          <div className="p-8">
            <EmptyState
              icon={FileText}
              title={t.dash_empty_title || "Belum Ada Pengajuan Sertifikasi"}
              description={t.dash_empty_desc || "Perusahaan Anda belum memulai pengisian indeks BECdex. Klik tombol di bawah untuk membuat submission perdana."}
              action={
                <button
                  onClick={() => createMutation.mutate()}
                  disabled={createMutation.isPending}
                  className="mt-4 inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 dark:bg-[#0c2340] dark:hover:bg-blue-800 text-white font-bold px-5 py-2.5 rounded-xl shadow-sm transition-all text-xs cursor-pointer"
                >
                  <PlusCircle size={15} />
                  {t.dash_empty_btn || "Mulai Asesmen BECdex Sekarang"}
                </button>
              }
            />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/90 dark:bg-slate-800/60 border-b border-slate-100 dark:border-slate-800 text-[11px] font-extrabold text-slate-500 uppercase tracking-wider">
                  <th className="px-6 py-4">{t.dash_table_id || "ID Submission"}</th>
                  <th className="px-6 py-4">{t.dash_table_status || "Status Alur"}</th>
                  <th className="px-6 py-4">{t.dash_table_initial || "Skor Mandiri (Initial)"}</th>
                  <th className="px-6 py-4">{t.dash_table_verified || "Skor Terverifikasi"}</th>
                  <th className="px-6 py-4">{t.dash_table_date || "Tanggal Dibuat"}</th>
                  <th className="px-6 py-4 text-right">{t.dash_table_action || "Aksi & Detail"}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-sm font-medium text-slate-700 dark:text-slate-200">
                {submissions.map((submission) => {
                  const initialScore = submission.initial_score ?? 0;
                  const validScore = submission.valid_score ?? 0;

                  return (
                    <tr
                      key={submission.id}
                      className="hover:bg-blue-50/40 dark:hover:bg-slate-800/50 transition-colors duration-150"
                    >
                      <td className="px-6 py-4">
                        <span className="font-mono text-xs font-bold text-slate-600 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-2.5 py-1 rounded-md border border-slate-200/60 dark:border-slate-700">
                          #{submission.id.slice(0, 8).toUpperCase()}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <StatusBadge status={submission.status} />
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <span
                            className={cn(
                              "font-extrabold text-sm",
                              initialScore >= 70 ? "text-emerald-600 dark:text-emerald-400" : "text-slate-800 dark:text-slate-200"
                            )}
                          >
                            {initialScore.toFixed(1)}%
                          </span>
                          <div className="w-16 h-1.5 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden hidden sm:block">
                            <div
                              className={cn(
                                "h-full rounded-full transition-all",
                                initialScore >= 70 ? "bg-emerald-500" : "bg-blue-600"
                              )}
                              style={{ width: `${Math.min(initialScore, 100)}%` }}
                            />
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={cn(
                            "font-extrabold text-sm",
                            validScore >= 70
                              ? "text-emerald-600 dark:text-emerald-400"
                              : validScore > 0
                              ? "text-blue-600 dark:text-blue-400"
                              : "text-slate-400"
                          )}
                        >
                          {validScore > 0 ? `${validScore.toFixed(1)}%` : "—"}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-xs text-slate-500 font-normal">
                        {formatDate(submission.created_at)}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <Link
                          href={`/dashboard/submissions/${submission.id}`}
                          className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-blue-50 hover:bg-blue-600 text-blue-700 hover:text-white dark:bg-blue-500/10 dark:hover:bg-blue-600 dark:text-blue-300 dark:hover:text-white font-bold text-xs transition-all duration-200 border border-blue-200/80 dark:border-blue-500/20 shadow-2xs"
                        >
                          <span>{t.dash_table_btn || "Buka Asesmen"}</span>
                          <ChevronRight size={14} />
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </AppLayout>
  );
}
