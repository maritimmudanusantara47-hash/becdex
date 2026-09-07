"use client";

import dynamic from "next/dynamic";
import { useQuery } from "@tanstack/react-query";
import { AppLayout } from "@/components/layouts/AppLayout";
import { StatCard } from "@/components/ui/StatCard";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { LoadingSpinner, EmptyState } from "@/components/ui/index";
import Link from "next/link";
import api from "@/lib/api";
import { formatDate, cn } from "@/lib/utils";
import {
  FileText,
  Users,
  Award,
  Clock,
  ShieldAlert,
  ChevronRight,
  Building2,
  Anchor,
} from "lucide-react";
import { useTranslation } from "@/store/lang";

// Lazy-load recharts agar tidak masuk initial bundle (code splitting)
const AdminTrendChart  = dynamic(() => import("@/components/charts/AdminCharts").then(m => ({ default: m.SubmissionTrendChart })), { ssr: false, loading: () => <div className="h-full flex items-center justify-center text-slate-400 text-xs">Loading chart...</div> });
const AdminSectorChart = dynamic(() => import("@/components/charts/AdminCharts").then(m => ({ default: m.SectorPieChart })),      { ssr: false, loading: () => <div className="h-full flex items-center justify-center text-slate-400 text-xs">Loading chart...</div> });


interface SubmissionRow {
  id: string;
  initial_score: number;
  valid_score?: number;
  created_at: string;
  status: { id?: number; name: string; color: string };
  user?: { name?: string; email?: string };
}


export default function AdminPage() {
  const { t } = useTranslation();

  const { data: submissionsData, isLoading, error } = useQuery({
    queryKey: ["admin-submissions"],
    queryFn: async () => {
      const res = await api.get("/admin/submissions?per_page=8");
      return res.data;
    },
  });

  const { data: statsData } = useQuery({
    queryKey: ["admin-dashboard-stats"],
    queryFn: async () => {
      const res = await api.get("/admin/dashboard/stats");
      return res.data;
    },
  });

  const submissions = submissionsData?.data ?? [];
  const stats = statsData?.data ?? {
    total_submissions: 0,
    pending_review: 0,
    certified: 0,
    total_users: 0,
    certifications_by_sector: [],
    submissions_trend: [],
    assessor_workload: [],
  };


  if (error) {
    return (
      <AppLayout title={t.dash_admin_title_fail || "Portal Admin BECdex"}>
        <div className="rounded-2xl border border-rose-200 bg-rose-50 p-6 text-center text-rose-700 dark:border-rose-900/50 dark:bg-rose-950/30">
          <ShieldAlert className="mx-auto h-8 w-8 text-rose-500 mb-2" />
          <h3 className="font-bold text-base">{t.dash_admin_fail_title || "Gagal Memuat Panel Admin"}</h3>
          <p className="text-xs mt-1 text-rose-600">{t.dash_admin_fail_desc || "Pastikan akun Anda memiliki hak akses Administrator atau coba refresh halaman."}</p>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout title={t.dash_admin_title || "Portal Administrator"}>
      {/* Admin Hero Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-linear-to-r from-[#0c2340] via-blue-900 to-[#1e3a8a] p-6 md:p-8 text-white shadow-md shadow-[#0c2340]/15 border border-blue-700/40">
        <div className="absolute -left-10 -bottom-10 w-64 h-64 rounded-full bg-blue-500/10 blur-3xl pointer-events-none" />
        <div className="absolute right-8 top-1/2 -translate-y-1/2 opacity-20 pointer-events-none hidden lg:block">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/logo.webp" alt="Logo Watermark" className="w-40 h-40 object-contain grayscale brightness-200 mix-blend-soft-light" />
        </div>

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="max-w-xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-400/20 backdrop-blur-md border border-blue-300/30 text-blue-200 text-xs font-bold tracking-wide uppercase mb-3">
              <Anchor size={14} className="text-blue-300" />
            </div>
            <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight">
              {t.dash_admin_hero_title || "Pusat Kendali & Verifikasi Indeks"}
            </h2>
            <p className="text-blue-100/90 text-sm mt-2 leading-relaxed">
              {t.dash_admin_hero_desc || "Tinjau dokumen bukti pengajuan perusahaan, lakukan verifikasi lapangan, dan terbitkan sertifikat resmi BECdex Indonesia."}
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <Link
              href="/admin/submissions"
              className="flex items-center justify-center gap-2 bg-white text-[#0c2340] hover:bg-blue-50 font-bold px-5 py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 text-xs"
            >
              <span>{t.dash_admin_queue || "Antrian Verifikasi"}</span>
              <span className="bg-blue-600 text-white px-2 py-0.5 rounded-full font-mono text-[10px]">
                {stats.pending_review}
              </span>
            </Link>
          </div>
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        <StatCard
          title={t.dash_admin_stat_total || "Total Submission"}
          value={stats.total_submissions}
          icon={FileText}
          color="navy"
          subtitle={t.dash_admin_stat_total_desc || "Semua pengajuan masuk"}
        />
        <StatCard
          title={t.dash_admin_stat_pending || "Menunggu Review"}
          value={stats.pending_review}
          icon={Clock}
          color="yellow"
          subtitle={t.dash_admin_stat_pending_desc || "Perlu tindakan verifikator"}
        />
        <StatCard
          title={t.dash_admin_stat_cert || "Tersertifikasi"}
          value={stats.certified}
          icon={Award}
          color="green"
          subtitle={t.dash_admin_stat_cert_desc || "Lulus verifikasi admin"}
        />
        <StatCard
          title={t.dash_admin_stat_users || "Pengguna Terdaftar"}
          value={stats.total_users}
          icon={Users}
          color="blue"
          subtitle={t.dash_admin_stat_users_desc || "Akun perusahaan aktif"}
        />
      </div>

      {/* Analytics Charts & Assessor Workload */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8 mt-2">
        {/* Trend Submissions */}
        <div className="lg:col-span-2 rounded-2xl border border-slate-200/80 bg-white shadow-2xs dark:border-slate-800 dark:bg-slate-900 p-5 flex flex-col">
          <h3 className="font-extrabold text-slate-800 dark:text-white text-base tracking-tight mb-4">
            Tren Pengajuan Sertifikasi (6 Bulan Terakhir)
          </h3>
          <div className="flex-1 min-h-62.5">
            <AdminTrendChart data={stats.submissions_trend ?? []} />
          </div>
        </div>

        {/* Sectors Distribution */}
        <div className="rounded-2xl border border-slate-200/80 bg-white shadow-2xs dark:border-slate-800 dark:bg-slate-900 p-5 flex flex-col">
          <h3 className="font-extrabold text-slate-800 dark:text-white text-base tracking-tight mb-4">
            Sertifikasi Berdasarkan Sektor
          </h3>
          <div className="flex-1 min-h-75">
            <AdminSectorChart data={stats.certifications_by_sector ?? []} />
          </div>
        </div>
      </div>

      {/* Assessor Workload */}
      <div className="rounded-2xl border border-slate-200/80 bg-white shadow-2xs dark:border-slate-800 dark:bg-slate-900 p-5 mb-8">
        <h3 className="font-extrabold text-slate-800 dark:text-white text-base tracking-tight mb-4">
          Beban Kerja Tim Asesor
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {stats.assessor_workload?.length > 0 ? stats.assessor_workload.map((assessor: { id: number; name: string; pending_count: number }) => (
            <div key={assessor.id} className="flex items-center gap-3 p-3 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30">
              <div className="w-10 h-10 rounded-full bg-indigo-100 dark:bg-indigo-900/50 flex items-center justify-center text-indigo-700 dark:text-indigo-300 font-bold text-sm shrink-0 uppercase">
                {assessor.name.substring(0, 2)}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-bold text-sm text-slate-800 dark:text-white truncate">{assessor.name}</p>
                <p className="text-[11px] text-slate-500 truncate">Pending: <span className="font-bold text-amber-600 dark:text-amber-400">{assessor.pending_count} tugas</span></p>
              </div>
            </div>
          )) : (
            <div className="col-span-full text-slate-400 text-sm">Belum ada asesor aktif</div>
          )}
        </div>
      </div>

      {/* TailAdmin Table Card for Admin Submissions */}
      <div className="rounded-2xl border border-slate-200/80 bg-white shadow-2xs dark:border-slate-800 dark:bg-slate-900 overflow-hidden transition-colors">
        {/* Table Header Bar */}
        <div className="px-6 py-5 border-b border-slate-100 dark:border-slate-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-50/40 dark:bg-slate-800/20">
          <div>
            <h3 className="font-extrabold text-slate-800 dark:text-white text-base tracking-tight">
              {t.dash_admin_table_title || "Submission Perusahaan Terbaru"}
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              {t.dash_admin_table_desc || "Daftar pengajuan terkini yang memerlukan pemantauan dan persetujuan nilai"}
            </p>
          </div>

          <Link
            href="/admin/submissions"
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-50 text-blue-700 hover:bg-blue-600 hover:text-white dark:bg-blue-950/60 dark:text-blue-300 dark:hover:bg-blue-600 dark:hover:text-white font-bold text-xs transition-all border border-blue-200/60 dark:border-blue-800"
          >
            <span>{t.dash_admin_table_view_all || "Lihat Seluruh Submission"} ({stats.total_submissions})</span>
            <ChevronRight size={14} />
          </Link>
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
              title={t.dash_admin_empty_title || "Belum Ada Submission Masuk"}
              description={t.dash_admin_empty_desc || "Saat ini belum ada perusahaan yang mendaftar atau mengirimkan pengajuan kuesioner BECdex."}
            />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/90 dark:bg-slate-800/60 border-b border-slate-100 dark:border-slate-800 text-[11px] font-extrabold text-slate-500 uppercase tracking-wider">
                  <th className="px-6 py-4">ID Submission</th>
                  <th className="px-6 py-4">{t.dash_admin_col_company || "Perusahaan / Pengaju"}</th>
                  <th className="px-6 py-4">{t.dash_admin_col_status || "Status Pengajuan"}</th>
                  <th className="px-6 py-4">{t.dash_admin_col_initial || "Skor Mandiri"}</th>
                  <th className="px-6 py-4">{t.dash_admin_col_date || "Tanggal Masuk"}</th>
                  <th className="px-6 py-4 text-right">{t.dash_admin_col_action || "Tindakan Admin"}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-sm font-medium text-slate-700 dark:text-slate-200">
                {submissions.map((s: SubmissionRow) => {
                  const isPendingReview = s.status?.id === 3 || s.status?.color === "warning";

                  return (
                    <tr
                      key={s.id}
                      className="hover:bg-blue-50/40 dark:hover:bg-slate-800/50 transition-colors duration-150"
                    >
                      <td className="px-6 py-4">
                        <span className="font-mono text-xs font-bold text-slate-600 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-2.5 py-1 rounded-md border border-slate-200/60 dark:border-slate-700">
                          #{s.id.slice(0, 8).toUpperCase()}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-blue-100 dark:bg-blue-900/50 text-[#0c2340] dark:text-blue-300 flex items-center justify-center font-bold text-xs shrink-0">
                            <Building2 size={16} />
                          </div>
                          <div className="min-w-0">
                            <p className="font-bold text-slate-800 dark:text-white truncate text-sm">
                              {s.user?.name || (t.dash_admin_anon_company || "Perusahaan Anonim")}
                            </p>
                            <p className="text-[11px] font-mono text-slate-400 truncate">
                              {s.user?.email || "—"}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <StatusBadge status={s.status} />
                      </td>
                      <td className="px-6 py-4">
                        <span className="font-extrabold text-sm text-[#0c2340] dark:text-white">
                          {(s.initial_score ?? 0).toFixed(1)}%
                        </span>
                      </td>
                      <td className="px-6 py-4 text-xs text-slate-500 font-normal">
                        {formatDate(s.created_at)}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <Link
                          href={`/admin/submissions/${s.id}`}
                          className={cn(
                            "inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl font-bold text-xs transition-all duration-200 shadow-2xs",
                            isPendingReview
                              ? "bg-amber-500 hover:bg-amber-600 text-white shadow-amber-500/20"
                              : "bg-[#0c2340]/5 hover:bg-[#0c2340] text-[#0c2340] hover:text-white dark:bg-blue-500/10 dark:hover:bg-blue-600 dark:text-blue-300 dark:hover:text-white border border-[#0c2340]/10 dark:border-blue-500/20"
                          )}
                        >
                          <span>{isPendingReview ? (t.dash_admin_btn_verify || "Verifikasi Sekarang") : (t.dash_admin_btn_review || "Review Detail")}</span>
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
