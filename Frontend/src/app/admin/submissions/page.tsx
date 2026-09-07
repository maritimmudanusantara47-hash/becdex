"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { AppLayout } from "@/components/layouts/AppLayout";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { LoadingSpinner, EmptyState } from "@/components/ui/index";
import api from "@/lib/api";
import { formatDate, cn } from "@/lib/utils";
import {
  FileText,
  ChevronLeft,
  ChevronRight,
  Search,
  Filter,
  Building2,
  ShieldCheck,
  Download
} from "lucide-react";
import { MdWarning } from "react-icons/md";
import { useTranslation } from "@/store/lang";
import { useAdminRouteGuard } from "@/hooks/useAdminRouteGuard";

interface SubmissionRow {
  id: string;
  initial_score: number;
  valid_score: number;
  documents_uploaded: number;
  created_at: string;
  status: { id: number; name: string; color: string };
  user?: { name?: string; email?: string };
}

export default function AdminSubmissionsPage() {
  const [statusFilter, setStatusFilter] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [page, setPage] = useState(1);
  const [reviewConfirmId, setReviewConfirmId] = useState<string | null>(null);

  const [showExportModal, setShowExportModal] = useState(false);
  const [exportStartDate, setExportStartDate] = useState("");
  const [exportEndDate, setExportEndDate] = useState("");
  const [exportStatus, setExportStatus] = useState("all");

  const router = useRouter();
  const { t } = useTranslation();
  const { authorized } = useAdminRouteGuard({ guard: "submission_reader" });

  const STATUS_FILTERS = [
    { label: t.dash_admin_sub_filter_all || "Semua Submission", value: "" },
    { label: t.dash_admin_sub_filter_doc || "Pengajuan Dokumen", value: "2" },
    { label: t.dash_admin_sub_filter_ver || "Dalam Verifikasi", value: "3" },
    { label: t.dash_admin_sub_filter_app || "Lolos Verifikasi", value: "8" },
    { label: t.dash_admin_sub_filter_paid || "Menunggu Survei", value: "6" },
    { label: t.dash_admin_sub_filter_surv || "Survei Lokasi", value: "7" },
    { label: t.dash_admin_sub_filter_cert || "Tersertifikasi", value: "5" },
    { label: t.dash_admin_sub_filter_rej || "Ditolak", value: "9" },
  ];

  const { data, isLoading } = useQuery({
    queryKey: ["admin-submissions-list", statusFilter, page],
    queryFn: async () => {
      const params = new URLSearchParams({ page: String(page) });
      if (statusFilter) params.set("status", statusFilter);
      const res = await api.get(`/admin/submissions?${params}`);
      return res.data;
    },
    enabled: authorized,
  });

  const submissions = data?.data ?? [];
  const meta = data?.meta;

  // Client-side quick filter if search is active
  const filteredSubmissions = submissions.filter((s: SubmissionRow) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    const companyName = s.user?.name?.toLowerCase() ?? "";
    const companyEmail = s.user?.email?.toLowerCase() ?? "";
    const subId = s.id.toLowerCase();
    return companyName.includes(q) || companyEmail.includes(q) || subId.includes(q);
  });

  // Early return setelah semua hooks — React Rules of Hooks
  if (!authorized) return null;

  return (
    <AppLayout title={t.dash_admin_sub_title || "Verifikasi Submission"}>
      {/* Top Header Card */}
      <div className="mb-6 rounded-2xl border border-slate-200/80 bg-white p-6 shadow-2xs dark:border-slate-800 dark:bg-slate-900 transition-colors">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-blue-50 dark:bg-blue-950/60 border border-blue-200/80 dark:border-blue-800 text-blue-700 dark:text-blue-300 text-xs font-bold tracking-wide uppercase mb-2">
              <ShieldCheck size={14} className="text-blue-600 dark:text-blue-400" />
              <span>Blue Economy Verification Queue</span>
            </div>
            <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              {t.dash_admin_sub_heading || "Daftar Submission & Asesmen"}
            </h2>
            <p className="text-slate-500 dark:text-slate-400 text-xs sm:text-sm mt-1">
              {t.dash_admin_sub_desc || "Pantau seluruh pengajuan kuesioner dari perusahaan terdaftar, verifikasi dokumen, dan konfirmasi skor akhir."}
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="relative flex-1 sm:w-72">
              <Search
                size={16}
                className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
              />
              <input
                type="text"
                placeholder={t.dash_admin_sub_search || "Cari perusahaan atau ID..."}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-slate-200/80 bg-slate-50/50 text-xs font-medium text-slate-800 focus:bg-white focus:border-blue-500 focus:outline-hidden dark:border-slate-700 dark:bg-slate-800/80 dark:text-white dark:focus:bg-slate-800 transition-all shadow-2xs"
              />
            </div>
            <button 
              onClick={() => setShowExportModal(true)}
              className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md shadow-emerald-600/20 transition-all cursor-pointer whitespace-nowrap"
            >
              <Download size={14} />
              <span className="hidden sm:inline">{t.dash_admin_sub_export || "Export CSV"}</span>
            </button>
          </div>
        </div>

        {/* Filter Pills */}
        <div className="mt-5 pt-5 border-t border-slate-100 dark:border-slate-800/80 flex flex-wrap items-center gap-2">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5 mr-1">
            <Filter size={13} />
            Status:
          </span>
          {STATUS_FILTERS.map((f) => {
            const isActive = statusFilter === f.value;
            return (
              <button
                key={f.value}
                onClick={() => {
                  setStatusFilter(f.value);
                  setPage(1);
                }}
                className={cn(
                  "px-3.5 py-2 rounded-xl text-xs font-bold transition-all duration-200 cursor-pointer shadow-2xs",
                  isActive
                    ? "bg-blue-600 text-white shadow-blue-600/20 shadow-md scale-102"
                    : "bg-slate-100/80 text-slate-600 hover:bg-slate-200 hover:text-slate-900 dark:bg-slate-800/80 dark:text-slate-300 dark:hover:bg-slate-700 dark:hover:text-white border border-slate-200/60 dark:border-slate-700"
                )}
              >
                {f.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* TailAdmin Table Card */}
      <div className="rounded-2xl border border-slate-200/80 bg-white shadow-2xs dark:border-slate-800 dark:bg-slate-900 overflow-hidden transition-colors">
        <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800/80 flex items-center justify-between bg-slate-50/40 dark:bg-slate-800/20">
          <span className="font-extrabold text-slate-800 dark:text-white text-sm">
            {t.dash_admin_sub_list_title || "Daftar Pengajuan"} ({meta?.total ?? filteredSubmissions.length})
          </span>
          {statusFilter && (
            <span className="text-xs font-semibold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/60 px-2.5 py-1 rounded-lg border border-blue-200/80 dark:border-blue-800">
              {t.dash_admin_sub_filter_active || "Filter Aktif:"} {STATUS_FILTERS.find((x) => x.value === statusFilter)?.label}
            </span>
          )}
        </div>

        {isLoading ? (
          <div className="py-16">
            <LoadingSpinner />
          </div>
        ) : filteredSubmissions.length === 0 ? (
          <div className="p-12">
            <EmptyState
              icon={FileText}
              title={t.dash_admin_sub_empty_title || "Submission Tidak Ditemukan"}
              description={t.dash_admin_sub_empty_desc || "Belum ada data pengajuan yang sesuai dengan filter atau kata kunci pencarian Anda."}
            />
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50/90 dark:bg-slate-800/60 border-b border-slate-100 dark:border-slate-800 text-[11px] font-extrabold text-slate-500 uppercase tracking-wider">
                    <th className="px-6 py-4">ID Submission</th>
                    <th className="px-6 py-4">{t.dash_admin_col_company || "Perusahaan / Pengaju"}</th>
                    <th className="px-6 py-4">{t.dash_admin_col_status || "Status Pengajuan"}</th>
                    <th className="px-6 py-4">{t.dash_admin_sub_col_initial || "Skor Awal"}</th>
                    <th className="px-6 py-4">{t.dash_admin_sub_col_valid || "Skor Valid"}</th>
                    <th className="px-6 py-4">{t.dash_admin_sub_col_doc || "Dokumen"}</th>
                    <th className="px-6 py-4">{t.dash_admin_col_date || "Tanggal Masuk"}</th>
                    <th className="px-6 py-4 text-right">{t.dash_admin_sub_col_action || "Aksi & Verifikasi"}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-sm font-medium text-slate-700 dark:text-slate-200">
                  {filteredSubmissions.map((s: SubmissionRow) => (
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
                          <div className="w-8 h-8 rounded-lg bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300 flex items-center justify-center font-bold text-xs shrink-0">
                            <Building2 size={16} />
                          </div>
                          <div className="min-w-0">
                            <p className="font-bold text-slate-800 dark:text-white truncate text-sm">
                              {s.user?.name ?? (t.dash_admin_anon_company || "Perusahaan Anonim")}
                            </p>
                            <p className="text-[11px] font-mono text-slate-400 truncate">
                              {s.user?.email ?? "—"}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <StatusBadge status={s.status} />
                      </td>
                      <td className="px-6 py-4">
                        <span className="font-extrabold text-xs text-slate-800 dark:text-white bg-slate-100 dark:bg-slate-800 px-2.5 py-1 rounded-lg border border-slate-200/60 dark:border-slate-700">
                          {(s.initial_score ?? 0).toFixed(1)}%
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="font-extrabold text-xs text-blue-700 dark:text-blue-300 bg-blue-50 dark:bg-blue-950/60 px-2.5 py-1 rounded-lg border border-blue-200/60 dark:border-blue-800">
                          {(s.valid_score ?? 0).toFixed(1)}%
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-600 dark:text-slate-300">
                          <span className="w-2 h-2 rounded-full bg-blue-500" />
                          {s.documents_uploaded ?? 0} {t.dash_admin_sub_doc_count || "Berkas"}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-xs text-slate-500 font-normal">
                        {formatDate(s.created_at)}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button
                          onClick={() => {
                            if (s.status?.id === 6) {
                              setReviewConfirmId(s.id);
                            } else {
                              router.push(`/admin/submissions/${s.id}`);
                            }
                          }}
                          className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-blue-50 hover:bg-blue-600 text-blue-700 hover:text-white dark:bg-blue-500/10 dark:hover:bg-blue-600 dark:text-blue-300 dark:hover:text-white font-bold text-xs transition-all duration-200 border border-blue-200/80 dark:border-blue-500/20 shadow-2xs cursor-pointer"
                        >
                          <span>{t.dash_admin_sub_btn_review || "Review & Nilai"}</span>
                          <ChevronRight size={14} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* TailAdmin Pagination Bar */}
            {meta && meta.last_page > 1 && (
              <div className="px-6 py-4 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-xs bg-slate-50/30 dark:bg-slate-800/10">
                <p className="text-slate-500 dark:text-slate-400 font-medium">
                  {t.dash_admin_sub_page || "Menampilkan Halaman"} <span className="font-bold text-slate-800 dark:text-white">{meta.current_page}</span> {t.dash_admin_user_of || "dari"}{" "}
                  <span className="font-bold text-slate-800 dark:text-white">{meta.last_page}</span>
                </p>
                <div className="flex gap-2">
                  <button
                    onClick={() => setPage((p) => Math.max(p - 1, 1))}
                    disabled={page === 1}
                    className="p-2 rounded-xl border border-slate-200/80 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 disabled:opacity-40 transition-colors shadow-2xs cursor-pointer"
                  >
                    <ChevronLeft size={16} />
                  </button>
                  <button
                    onClick={() => setPage((p) => Math.min(p + 1, meta.last_page))}
                    disabled={page === meta.last_page}
                    className="p-2 rounded-xl border border-slate-200/80 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 disabled:opacity-40 transition-colors shadow-2xs cursor-pointer"
                  >
                    <ChevronRight size={16} />
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Confirmation Modal */}
      {reviewConfirmId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-7 w-full max-w-md shadow-2xl border border-slate-200 dark:border-slate-800 transform transition-all animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-start gap-4 mb-5">
              <div className="w-12 h-12 rounded-full bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0 mt-1">
                <ShieldCheck size={24} />
              </div>
              <div>
                <h3 className="text-xl font-extrabold text-slate-900 dark:text-white mb-1">{t.dash_admin_sub_modal_title || "Mulai Penilaian?"}</h3>
                <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                  {t.dash_admin_sub_modal_desc || "Apakah Anda yakin ingin mulai melakukan penilaian terhadap perusahaan ini?"}
                </p>
              </div>
            </div>
            
            <div className="bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/50 rounded-xl p-4 mb-7">
              <p className="text-xs font-semibold text-amber-800 dark:text-amber-400 leading-relaxed">
                <span className="font-extrabold flex items-center gap-1 mb-1">
                  <MdWarning className="w-4 h-4" /> {t.dash_admin_sub_modal_warn || "Perhatian:"}
                </span>
                {t.dash_admin_sub_modal_warn_desc || "Jika Anda mulai menilai (berpindah status), maka perusahaan tersebut tidak akan bisa melakukan perubahan data pengajuan lagi karena statusnya sudah dikunci."}
              </p>
            </div>

            <div className="flex items-center justify-end gap-3">
              <button
                onClick={() => setReviewConfirmId(null)}
                className="px-5 py-2.5 rounded-xl text-sm font-bold text-slate-600 dark:text-slate-300 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 transition-colors cursor-pointer"
              >
                {t.dash_admin_sub_modal_cancel || "Batal"}
              </button>
              <button
                onClick={async () => {
                  if (reviewConfirmId) {
                    try {
                      await api.post(`/admin/submissions/${reviewConfirmId}/start`);
                      router.push(`/admin/submissions/${reviewConfirmId}`);
                    } catch (error) {
                      console.error("Failed to start verification", error);
                      // Fallback redirect if something went wrong
                      router.push(`/admin/submissions/${reviewConfirmId}`);
                    }
                  }
                }}
                className="px-5 py-2.5 rounded-xl text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 shadow-md shadow-blue-600/20 transition-all cursor-pointer"
              >
                {t.dash_admin_sub_modal_confirm || "Ya, Mulai Penilaian"}
              </button>
            </div>
          </div>
        </div>
      )}
      {/* Export Modal */}
      {showExportModal && (
        <div className="fixed inset-0 z-100 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 md:p-8 w-full max-w-md shadow-2xl relative">
            <h3 className="text-xl font-extrabold text-slate-800 dark:text-white mb-2">Export Data CSV</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-6">Filter data pengajuan sebelum diunduh.</p>
            
            <div className="space-y-4 mb-6">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">Mulai Tanggal</label>
                <input 
                  type="date" 
                  value={exportStartDate}
                  onChange={(e) => setExportStartDate(e.target.value)}
                  className="w-full text-sm border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2 bg-slate-50 dark:bg-slate-800 dark:text-white focus:outline-hidden focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">Sampai Tanggal</label>
                <input 
                  type="date" 
                  value={exportEndDate}
                  onChange={(e) => setExportEndDate(e.target.value)}
                  className="w-full text-sm border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2 bg-slate-50 dark:bg-slate-800 dark:text-white focus:outline-hidden focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">Filter Status</label>
                <select 
                  value={exportStatus}
                  onChange={(e) => setExportStatus(e.target.value)}
                  className="w-full text-sm border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2 bg-slate-50 dark:bg-slate-800 dark:text-white focus:outline-hidden focus:border-blue-500 appearance-none"
                >
                  <option value="all">Semua Status</option>
                  {STATUS_FILTERS.filter(f => f.value !== "").map(f => (
                    <option key={f.value} value={f.value}>{f.label}</option>
                  ))}
                </select>
              </div>
            </div>
            
            <div className="flex items-center justify-end gap-3">
              <button
                onClick={() => setShowExportModal(false)}
                className="px-5 py-2.5 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                Batal
              </button>
              <a
                href={`${process.env.NEXT_PUBLIC_API_URL?.replace(/\/api\/?$/, '')}/api/admin/submissions/export/csv?start_date=${exportStartDate}&end_date=${exportEndDate}&status_id=${exportStatus}`}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => setShowExportModal(false)}
                className="px-6 py-2.5 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white shadow-md transition-all cursor-pointer"
              >
                Unduh CSV
              </a>
            </div>
          </div>
        </div>
      )}
    </AppLayout>
  );
}
