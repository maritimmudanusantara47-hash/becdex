"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { AppLayout } from "@/components/layouts/AppLayout";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { LoadingSpinner, EmptyState } from "@/components/ui/index";
import api from "@/lib/api";
import { formatDate, cn } from "@/lib/utils";
import { Submission, PaginatedResponse } from "@/types";
import {
  FileText,
  PlusCircle,
  Loader2,
  ChevronRight,
  CheckCircle2,
  AlertCircle,
  Search,
  Filter,
  Trash2,
  Clock,
} from "lucide-react";
import { useState, useMemo } from "react";
import { useTranslation } from "@/store/lang";

type ApiError = { response?: { data?: { message?: string } } };

export default function SubmissionsListPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const { t } = useTranslation();

  const { data, isLoading, error } = useQuery<PaginatedResponse<Submission>>({
    queryKey: ["submissions"],
    queryFn: async () => {
      const res = await api.get("/submissions");
      return res.data;
    },
  });

  const createMutation = useMutation({
    mutationFn: async () => {
      const res = await api.post("/submissions");
      return res.data.data as Submission;
    },
    onSuccess: (newSubmission) => {
      queryClient.invalidateQueries({ queryKey: ["submissions"] });
      toast.success("Submission baru berhasil dibuat! Silakan isi penilaian assessment.");
      router.push(`/dashboard/submissions/${newSubmission.id}`);
    },
    onError: (error: ApiError) => {
      toast.error(error.response?.data?.message || "Gagal membuat submission.");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await api.delete(`/submissions/${id}`);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["submissions"] });
      toast.success("Draf pengajuan berhasil dihapus.");
    },
    onError: (error: ApiError) => {
      toast.error(error.response?.data?.message || "Gagal menghapus draf pengajuan.");
    },
  });

  const handleDelete = (id: string) => {
    if (window.confirm("Apakah Anda yakin ingin menghapus draf pengajuan ini?")) {
      deleteMutation.mutate(id);
    }
  };

  // Filtered submissions based on search query and status filter
  const filteredSubmissions = useMemo(() => {
    const submissionsList = data?.data ?? [];
    return submissionsList.filter((s) => {
      const matchesSearch = s.id.toLowerCase().includes(searchQuery.toLowerCase()) || 
        (s.status.name ?? "").toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesStatus = statusFilter === "all" || 
        (statusFilter === "in_progress" && [2, 3, 4, 7].includes(s.status.id)) ||
        (statusFilter === "certified" && s.status.id === 5) ||
        (statusFilter === "pending_payment" && s.status.id === 6);

      return matchesSearch && matchesStatus;
    });
  }, [data?.data, searchQuery, statusFilter]);

  if (error) {
    return (
      <AppLayout title={t.dash_sub_title || "Daftar Submission"}>
        <div className="rounded-2xl border border-amber-200 bg-amber-50/80 p-8 text-center text-amber-900 dark:border-amber-800/60 dark:bg-amber-950/40 dark:text-amber-200 max-w-xl mx-auto my-12 shadow-sm">
          <Clock className="mx-auto h-10 w-10 text-amber-600 dark:text-amber-400 mb-3 animate-pulse" />
          <h3 className="font-extrabold text-lg text-slate-800 dark:text-white tracking-tight">{t.dash_sub_err_load}</h3>
          <p className="text-xs md:text-sm mt-2 text-slate-600 dark:text-slate-300 leading-relaxed">{t.dash_sub_err_desc}</p>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout title={t.dash_sub_title || "Daftar Submission"}>
      <div className="space-y-6">
        {/* Header Section */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl md:text-2xl font-extrabold text-slate-800 dark:text-white tracking-tight">
              {t.dash_sub_heading || "Daftar Pengajuan Sertifikasi"}
            </h2>
            <p className="text-slate-500 dark:text-slate-400 text-xs md:text-sm mt-1">
              {t.dash_sub_desc || "Kelola dan pantau seluruh pengajuan kuesioner assessment sertifikasi Blue Economy Anda"}
            </p>
          </div>

          <button
            onClick={() => createMutation.mutate()}
            disabled={createMutation.isPending}
            className="inline-flex items-center justify-center gap-2 bg-[#0c2340] hover:bg-blue-700 dark:bg-blue-600 dark:hover:bg-blue-500 text-white font-extrabold px-5 py-3 rounded-xl shadow-md transition-all text-xs cursor-pointer disabled:opacity-60"
          >
            {createMutation.isPending ? (
              <Loader2 size={16} className="animate-spin" />
            ) : (
              <PlusCircle size={16} />
            )}
            <span>{t.dash_sub_btn_new || "Buat Pengajuan Baru"}</span>
          </button>
        </div>

        {/* Filter and Search Bar */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-2xs">
          {/* Search Input */}
          <div className="sm:col-span-2 relative">
            <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500" />
            <input
              type="text"
              placeholder={t.dash_sub_search || "Cari berdasarkan ID atau Status..."}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/80 text-slate-800 dark:text-white text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 transition-all"
            />
          </div>

          {/* Status Dropdown */}
          <div className="relative">
            <Filter size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full pl-10 pr-8 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/80 text-slate-800 dark:text-white text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 transition-all appearance-none cursor-pointer"
            >
              <option value="all">{t.dash_sub_filter_all || "Semua Status"}</option>
              <option value="in_progress">{t.dash_sub_filter_progress || "Sedang Diproses"}</option>
              <option value="pending_payment">{t.dash_sub_filter_payment || "Menunggu Pembayaran"}</option>
              <option value="certified">{t.dash_sub_filter_certified || "Tersertifikasi Resmi"}</option>
            </select>
          </div>
        </div>

        {/* Table/List Container */}
        <div className="rounded-2xl border border-slate-200/80 bg-white shadow-2xs dark:border-slate-800 dark:bg-slate-900 overflow-hidden transition-colors">
          <div className="px-6 py-5 border-b border-slate-100 dark:border-slate-800/80 flex items-center justify-between bg-slate-50/40 dark:bg-slate-800/20">
            <h3 className="font-extrabold text-slate-800 dark:text-white text-sm tracking-tight">
              {t.dash_sub_table_title || "Tabel Riwayat Pengajuan"} ({filteredSubmissions.length})
            </h3>
            <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2.5 py-1 rounded-lg bg-blue-50 text-blue-700 border border-blue-200/60 dark:bg-blue-950/60 dark:text-blue-300 dark:border-blue-800">
              <CheckCircle2 size={12} className="text-blue-600" />
              Blue Economy Index
            </span>
          </div>

          {isLoading ? (
            <div className="py-16">
              <LoadingSpinner />
            </div>
          ) : filteredSubmissions.length === 0 ? (
            <div className="p-8">
              <EmptyState
                icon={FileText}
                title={t.dash_sub_empty_title || "Tidak Ada Pengajuan Ditemukan"}
                description={
                  searchQuery || statusFilter !== "all"
                    ? (t.dash_sub_empty_search || "Tidak ada pengajuan yang cocok dengan filter pencarian Anda. Silakan ubah filter pencarian.")
                    : (t.dash_sub_empty_desc || "Perusahaan Anda belum memulai pengisian indeks BECdex. Klik tombol di atas untuk membuat submission perdana.")
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
                  {filteredSubmissions.map((submission) => {
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
                          <div className="flex items-center justify-end gap-2">
                            {submission.status.id === 2 && (
                              <button
                                onClick={() => handleDelete(submission.id)}
                                disabled={deleteMutation.isPending}
                                className="inline-flex items-center justify-center w-8 h-8 rounded-xl bg-rose-50 text-rose-600 hover:bg-rose-600 hover:text-white dark:bg-rose-500/10 dark:hover:bg-rose-600 dark:text-rose-400 dark:hover:text-white transition-all shadow-2xs disabled:opacity-50"
                                title="Hapus Draf"
                              >
                                <Trash2 size={14} />
                              </button>
                            )}
                            <Link
                              href={`/dashboard/submissions/${submission.id}`}
                              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-blue-50 hover:bg-blue-600 text-blue-700 hover:text-white dark:bg-blue-500/10 dark:hover:bg-blue-600 dark:text-blue-300 dark:hover:text-white font-bold text-xs transition-all duration-200 border border-blue-200/80 dark:border-blue-500/20 shadow-2xs"
                            >
                              <span>{t.dash_table_btn_open || "Buka Asesmen"}</span>
                              <ChevronRight size={14} />
                            </Link>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </AppLayout>
  );
}
