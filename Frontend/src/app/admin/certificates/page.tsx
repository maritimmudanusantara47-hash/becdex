"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { AppLayout } from "@/components/layouts/AppLayout";
import { LoadingSpinner, EmptyState } from "@/components/ui/index";
import api from "@/lib/api";
import { formatDate, cn } from "@/lib/utils";
import { Award, Search, ChevronLeft, ChevronRight, ShieldCheck, Building2, CheckCircle2, Eye } from "lucide-react";
import { useTranslation } from "@/store/lang";
import Link from "next/link";
import { useAuthStore } from "@/store/auth";
import { canApproveCertificate } from "@/lib/roles";

interface CertRow {
  id: number;
  mmic: string;
  direktur: string;
  published_at: string;
  valid_until: string;
  is_approved: boolean;
  user?: { name?: string; email?: string };
  certificate?: { name?: string };
  submission?: { initial_score?: number; valid_score?: number };
}

export default function AdminCertificatesPage() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [valid, setValid] = useState("");
  const { t } = useTranslation();
  const { user } = useAuthStore();
  const queryClient = useQueryClient();
  const canApprove = canApproveCertificate(user);

  const approveMutation = useMutation({
    mutationFn: (certId: number) => api.post(`/admin/certificates/${certId}/approve`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-certificates"] });
    },
  });

  const { data, isLoading } = useQuery({
    queryKey: ["admin-certificates", page, search, valid],
    queryFn: async () => {
      const params = new URLSearchParams({
        page: String(page),
        ...(search && { search }),
        ...(valid  && { valid }),
      });
      const res = await api.get(`/admin/certificates?${params}`);
      return res.data;
    },
  });

  const certs: CertRow[] = data?.data ?? [];
  const meta = data?.meta;

  return (
    <AppLayout title={t.dash_admin_cert_title || "Sertifikat Diterbitkan"}>
      {/* Top Header & Filter Card */}
      <div className="mb-6 rounded-2xl border border-slate-200/80 bg-white p-6 shadow-2xs dark:border-slate-800 dark:bg-slate-900 transition-colors">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-blue-50 dark:bg-blue-950/60 border border-blue-200/80 dark:border-blue-800 text-blue-700 dark:text-blue-300 text-xs font-bold tracking-wide uppercase mb-2">
              <ShieldCheck size={14} className="text-blue-600 dark:text-blue-400" />
              <span>{t.dash_admin_cert_registry || "Verified BECdex Registry"}</span>
            </div>
            <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              {t.dash_admin_cert_heading || "Sertifikat Ekonomi Biru Diterbitkan"}
            </h2>
            <p className="text-slate-500 dark:text-slate-400 text-xs sm:text-sm mt-1">
              {t.dash_admin_cert_desc || "Daftar seluruh sertifikat resmi BECdex Indonesia yang telah terbit beserta masa berlakunya."}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Link
              href="/admin/certificates/designer"
              className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md shadow-blue-600/20 transition-all cursor-pointer whitespace-nowrap"
            >
              <Award size={14} />
              <span className="hidden sm:inline">{t.dash_admin_cert_design_btn || "Desain Sertifikat"}</span>
            </Link>
            <div className="relative flex-1 sm:w-72">
              <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                value={search}
                onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                placeholder={t.dash_admin_cert_search || "Cari nama perusahaan atau email..."}
                className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-slate-200/80 bg-slate-50/50 text-xs font-medium text-slate-800 focus:bg-white focus:border-blue-500 focus:outline-hidden dark:border-slate-700 dark:bg-slate-800/80 dark:text-white dark:focus:bg-slate-800 transition-all shadow-2xs"
              />
            </div>

            <select
              value={valid}
              onChange={(e) => { setValid(e.target.value); setPage(1); }}
              className="py-2.5 px-3.5 rounded-xl border border-slate-200/80 bg-slate-50/50 text-xs font-medium text-slate-800 focus:bg-white focus:border-blue-500 focus:outline-hidden dark:border-slate-700 dark:bg-slate-800/80 dark:text-white transition-all shadow-2xs cursor-pointer"
            >
              <option value="">{t.dash_admin_cert_filter_all || "Semua Status Sertifikat"}</option>
              <option value="active">{t.dash_admin_cert_filter_active || "Masih Berlaku / Aktif"}</option>
              <option value="expired">{t.dash_admin_cert_filter_expired || "Sudah Expired / Habis"}</option>
            </select>
          </div>
        </div>
      </div>

      {/* TailAdmin Table Card */}
      <div className="rounded-2xl border border-slate-200/80 bg-white shadow-2xs dark:border-slate-800 dark:bg-slate-900 overflow-hidden transition-colors">
        <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800/80 flex items-center justify-between bg-slate-50/40 dark:bg-slate-800/20">
          <span className="font-extrabold text-slate-800 dark:text-white text-sm">
            {t.dash_admin_cert_list_title || "Daftar Sertifikat Terdaftar"}
          </span>
          {meta && (
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
              {t.dash_admin_cert_found?.replace("{total}", String(meta.total)) || `${meta.total} sertifikat ditemukan`}
            </span>
          )}
        </div>

        {isLoading ? (
          <div className="py-16">
            <LoadingSpinner />
          </div>
        ) : certs.length === 0 ? (
          <div className="p-12">
            <EmptyState
              icon={Award}
              title={t.dash_admin_cert_empty_title || "Sertifikat Belum Tersedia"}
              description={t.dash_admin_cert_empty_desc || "Sertifikat BECdex yang telah diterbitkan setelah lulus verifikasi lapangan akan muncul di halaman ini."}
            />
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50/90 dark:bg-slate-800/60 border-b border-slate-100 dark:border-slate-800 text-[11px] font-extrabold text-slate-500 uppercase tracking-wider">
                    <th className="px-6 py-4">{t.dash_admin_cert_col_company || "Perusahaan & Email"}</th>
                    <th className="px-6 py-4">{t.dash_admin_cert_col_category || "Kategori Indeks"}</th>
                    <th className="px-6 py-4">{t.dash_admin_cert_col_mmic || "Nomor MMIC"}</th>
                    <th className="px-6 py-4">{t.dash_admin_cert_col_score || "Skor Valid"}</th>
                    <th className="px-6 py-4">{t.dash_admin_cert_col_published || "Tanggal Diterbitkan"}</th>
                    <th className="px-6 py-4">{t.dash_admin_cert_col_valid_until || "Berlaku Hingga"}</th>
                    <th className="px-6 py-4">{t.dash_admin_cert_col_approval_status || "Status Approval"}</th>
                    <th className="px-6 py-4 text-right">{t.dash_admin_cert_col_status || "Status Masa Berlaku"}</th>
                    <th className="px-6 py-4 text-right">{t.dash_admin_cert_col_action || "Aksi"}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-sm font-medium text-slate-700 dark:text-slate-200">
                  {certs.map((c) => {
                    const isActive = new Date(c.valid_until) >= new Date();
                    return (
                      <tr
                        key={c.id}
                        className="hover:bg-blue-50/40 dark:hover:bg-slate-800/50 transition-colors duration-150"
                      >
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-lg bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300 flex items-center justify-center font-bold text-xs shrink-0">
                              <Building2 size={16} />
                            </div>
                            <div className="min-w-0">
                              <p className="font-bold text-slate-800 dark:text-white truncate text-sm">
                                {c.user?.name ?? (t.dash_admin_anon_company || "Perusahaan Anonim")}
                              </p>
                              <p className="text-[11px] font-mono text-slate-400 truncate">
                                {c.user?.email ?? "—"}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className="inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-extrabold bg-blue-50 text-blue-700 border border-blue-200/80 dark:bg-blue-950/60 dark:text-blue-300 dark:border-blue-800">
                            {c.certificate?.name ?? (t.dash_admin_cert_standard || "Standard BECdex")}
                          </span>
                        </td>
                        <td className="px-6 py-4 font-mono text-xs font-bold text-slate-600 dark:text-slate-400">
                          {c.mmic || "—"}
                        </td>
                        <td className="px-6 py-4">
                          <span className="font-extrabold text-sm text-slate-900 dark:text-white">
                            {c.submission?.valid_score?.toFixed(1) ?? "—"}%
                          </span>
                        </td>
                        <td className="px-6 py-4 text-xs text-slate-500 font-normal">
                          {formatDate(c.published_at)}
                        </td>
                        <td className="px-6 py-4 text-xs font-semibold text-slate-700 dark:text-slate-300">
                          {formatDate(c.valid_until)}
                        </td>
                        <td className="px-6 py-4">
                          {/* Status Approval */}
                          {c.is_approved ? (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200/80 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-800">
                              <span className="w-1.5 h-1.5 rounded-full shrink-0 bg-emerald-500" />
                              {t.dash_admin_cert_approved || "Disetujui"}
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-700 border border-amber-200/80 dark:bg-amber-950/60 dark:text-amber-300 dark:border-amber-800">
                              <span className="w-1.5 h-1.5 rounded-full shrink-0 bg-amber-500 animate-pulse" />
                              {t.dash_admin_cert_pending_approval || "Menunggu Persetujuan"}
                            </span>
                          )}
                        </td>
                        <td className="px-6 py-4 text-right">
                          {/* Status Masa Berlaku (Validity Status) */}
                          <span className={cn(
                            "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold border",
                            isActive
                              ? "bg-teal-50 text-teal-700 border-teal-200/80 dark:bg-teal-950/60 dark:text-teal-300 dark:border-teal-800"
                              : "bg-red-50 text-red-700 border-red-200/80 dark:bg-red-950/60 dark:text-red-300 dark:border-red-800"
                          )}>
                            <span className={cn("w-1.5 h-1.5 rounded-full shrink-0", isActive ? "bg-teal-500" : "bg-red-500")} />
                            {isActive ? (t.dash_admin_cert_status_active || "Aktif & Valid") : (t.dash_admin_cert_status_expired || "Expired")}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <Link
                            href={`/admin/certificates/${c.id}`}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200/80 dark:bg-blue-950/50 dark:hover:bg-blue-950 dark:text-blue-300 dark:border-blue-800 transition-colors shadow-2xs cursor-pointer"
                          >
                            <Eye size={13} />
                            {t.dash_admin_cert_btn_view || "Lihat"}
                          </Link>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {meta && meta.last_page > 1 && (
              <div className="px-6 py-4 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-xs bg-slate-50/30 dark:bg-slate-800/10">
                <p className="text-slate-500 dark:text-slate-400 font-medium">
                  {t.dash_admin_user_page || "Halaman"} <span className="font-bold text-slate-800 dark:text-white">{meta.current_page}</span> {t.dash_admin_user_of || "dari"}{" "}
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
    </AppLayout>
  );
}
