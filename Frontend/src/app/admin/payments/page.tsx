"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { AppLayout } from "@/components/layouts/AppLayout";
import { LoadingSpinner, EmptyState } from "@/components/ui/index";
import { StatCard } from "@/components/ui/StatCard";
import api from "@/lib/api";
import { formatDate, formatCurrency, cn } from "@/lib/utils";
import {
  CreditCard, CheckCircle2, Clock, XCircle, TrendingUp,
  Search, Download, ChevronLeft, ChevronRight, RefreshCw,
  ShieldCheck, Building2,
} from "lucide-react";
import { useTranslation } from "@/store/lang";
import { useAdminRouteGuard } from "@/hooks/useAdminRouteGuard";

interface PaymentRow {
  id: number;
  order_id: string;
  amount: string;
  transaction_status: string;
  payment_type: string | null;
  bank: string | null;
  va_number: string | null;
  paid_at: string | null;
  expired_at: string | null;
  created_at: string;
  user?: { id: number; name: string; email: string };
  submission?: { id: string };
}

interface Stats {
  total: number;
  settlement: number;
  pending: number;
  expired: number;
  revenue: number;
}

const STATUS_STYLES: Record<string, string> = {
  settlement: "bg-emerald-50 text-emerald-700 border-emerald-200/80 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-800",
  pending:    "bg-amber-50 text-amber-700 border-amber-200/80 dark:bg-amber-950/60 dark:text-amber-300 dark:border-amber-800",
  expire:     "bg-slate-100 text-slate-600 border-slate-200/80 dark:bg-slate-800 dark:text-slate-400 dark:border-slate-700",
  cancel:     "bg-rose-50 text-rose-700 border-rose-200/80 dark:bg-rose-950/60 dark:text-rose-300 dark:border-rose-800",
  deny:       "bg-rose-50 text-rose-700 border-rose-200/80 dark:bg-rose-950/60 dark:text-rose-300 dark:border-rose-800",
};

export default function AdminPaymentsPage() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const { t } = useTranslation();
  const { authorized } = useAdminRouteGuard({ guard: "finance_admin" });

  const { data, isLoading, refetch, isFetching } = useQuery({
    queryKey: ["admin-payments", page, search, status, dateFrom, dateTo],
    queryFn: async () => {
      const params = new URLSearchParams({
        page: String(page),
        ...(search   && { search }),
        ...(status   && { status }),
        ...(dateFrom && { date_from: dateFrom }),
        ...(dateTo   && { date_to: dateTo }),
      });
      const res = await api.get(`/admin/payments?${params}`);
      return res.data;
    },
    enabled: authorized, // jangan fetch jika tidak authorized
  });

  // Early return setelah semua hooks — React Rules of Hooks
  if (!authorized) return null;

  const payments: PaymentRow[] = data?.data ?? [];
  const meta = data?.meta;
  const stats: Stats = data?.stats ?? { total: 0, settlement: 0, pending: 0, expired: 0, revenue: 0 };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    refetch();
  };

  const handleClear = () => {
    setSearch(""); setStatus(""); setDateFrom(""); setDateTo(""); setPage(1);
  };

  const exportCSV = () => {
    const rows = [["Order ID", "Nama", "Email", "Status", "Jumlah", "Metode", "Bank", "VA", "Tanggal Bayar", "Dibuat"]];
    payments.forEach(p => {
      rows.push([
        p.order_id,
        p.user?.name ?? "-",
        p.user?.email ?? "-",
        p.transaction_status,
        formatCurrency(parseFloat(p.amount)),
        p.payment_type ?? "-",
        p.bank ?? "-",
        p.va_number ?? "-",
        p.paid_at ? formatDate(p.paid_at) : "-",
        formatDate(p.created_at),
      ]);
    });
    const csv = rows.map(r => r.map(v => `"${v}"`).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a"); a.href = url; a.download = "payments.csv"; a.click();
  };

  return (
    <AppLayout title={t.dash_admin_pay_title || "Riwayat Transaksi & Pembayaran"}>
      {/* Top Header Card */}
      <div className="mb-6 rounded-2xl border border-slate-200/80 bg-white p-6 shadow-2xs dark:border-slate-800 dark:bg-slate-900 transition-colors">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-blue-50 dark:bg-blue-950/60 border border-blue-200/80 dark:border-blue-800 text-blue-700 dark:text-blue-300 text-xs font-bold tracking-wide uppercase mb-2">
              <ShieldCheck size={14} className="text-blue-600 dark:text-blue-400" />
              <span>{t.dash_admin_pay_gateway || "Payment Gateway & Billing"}</span>
            </div>
            <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              {t.dash_admin_pay_heading || "Monitoring Pembayaran Asesmen"}
            </h2>
            <p className="text-slate-500 dark:text-slate-400 text-xs sm:text-sm mt-1">
              {t.dash_admin_pay_desc || "Pantau seluruh riwayat transaksi Midtrans, cek status pembayaran settlement, dan ekspor laporan keuangan."}
            </p>
          </div>

          <div className="flex items-center gap-2.5 shrink-0">
            <button
              onClick={() => refetch()}
              disabled={isFetching}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-slate-200/80 dark:border-slate-700 bg-slate-50/80 dark:bg-slate-800/80 text-slate-700 dark:text-slate-200 font-bold text-xs hover:bg-slate-100 dark:hover:bg-slate-700 transition-all shadow-2xs cursor-pointer"
            >
              <RefreshCw size={14} className={isFetching ? "animate-spin text-blue-600" : "text-slate-500"} />
              <span>{t.dash_admin_pay_refresh || "Segarkan"}</span>
            </button>
            <button
              onClick={exportCSV}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs transition-all shadow-md shadow-emerald-600/15 cursor-pointer"
            >
              <Download size={14} />
              <span>{t.dash_admin_pay_export || "Export CSV"}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Metrics Grid Top */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 mb-4 md:mb-6">
        <StatCard title={t.dash_admin_pay_stat_total || "Total Transaksi"} value={stats.total}      icon={CreditCard}    color="blue" subtitle={t.dash_admin_pay_stat_total_sub || "Semua order"} />
        <StatCard title={t.dash_admin_pay_stat_revenue || "Pendapatan"}       value={formatCurrency(stats.revenue)} icon={TrendingUp} color="indigo" subtitle={t.dash_admin_pay_stat_revenue_sub || "Total dana masuk"} />
      </div>

      {/* Metrics Grid Bottom (Status) */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 md:gap-6 mb-6">
        <StatCard title={t.dash_admin_pay_stat_success || "Berhasil"}         value={stats.settlement} icon={CheckCircle2}  color="green" subtitle={t.dash_admin_pay_stat_success_sub || "Settlement"} />
        <StatCard title={t.dash_admin_pay_stat_pending || "Pending"}          value={stats.pending}    icon={Clock}         color="yellow" subtitle={t.dash_admin_pay_stat_pending_sub || "Menunggu bayar"} />
        <StatCard title={t.dash_admin_pay_stat_expired || "Expired"}          value={stats.expired}    icon={XCircle}       color="red" subtitle={t.dash_admin_pay_stat_expired_sub || "Kadaluarsa"} />
      </div>

      {/* Filter Card */}
      <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-2xs dark:border-slate-800 dark:bg-slate-900 transition-colors mb-6">
        <form onSubmit={handleSearch} className="flex flex-col md:flex-row flex-wrap items-center gap-3">
          <div className="relative flex-1 w-full md:w-auto">
            <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={t.dash_admin_pay_search || "Cari Order ID, nama perusahaan, atau email PIC..."}
              className="w-full pl-9 pr-4 py-2 rounded-xl border border-slate-200/80 bg-slate-50/50 text-xs font-medium text-slate-800 focus:bg-white focus:border-blue-500 focus:outline-hidden dark:border-slate-700 dark:bg-slate-800/80 dark:text-white dark:focus:bg-slate-800 transition-all shadow-2xs"
            />
          </div>

          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="w-full md:w-44 py-2 px-3 rounded-xl border border-slate-200/80 bg-slate-50/50 text-xs font-medium text-slate-800 focus:bg-white focus:border-blue-500 focus:outline-hidden dark:border-slate-700 dark:bg-slate-800/80 dark:text-white transition-all shadow-2xs cursor-pointer"
          >
            <option value="">{t.dash_admin_pay_filter_all || "Semua Status"}</option>
            <option value="pending">{t.dash_admin_pay_filter_pending || "Pending / Menunggu"}</option>
            <option value="settlement">{t.dash_admin_pay_filter_settlement || "Settlement / Berhasil"}</option>
            <option value="expire">{t.dash_admin_pay_filter_expired || "Expired / Kadaluarsa"}</option>
            <option value="cancel">{t.dash_admin_pay_filter_cancel || "Cancel / Dibatalkan"}</option>
          </select>

          <div className="flex items-center gap-2 w-full md:w-auto">
            <div className="relative flex-1 md:w-36">
              <input
                type="date"
                value={dateFrom}
                onChange={(e) => setDateFrom(e.target.value)}
                className="w-full py-2 px-3 rounded-xl border border-slate-200/80 bg-slate-50/50 text-xs font-medium text-slate-800 focus:bg-white focus:border-blue-500 focus:outline-hidden dark:border-slate-700 dark:bg-slate-800/80 dark:text-white transition-all shadow-2xs cursor-pointer"
              />
            </div>
            <span className="text-slate-400 text-xs font-bold">-</span>
            <div className="relative flex-1 md:w-36">
              <input
                type="date"
                value={dateTo}
                onChange={(e) => setDateTo(e.target.value)}
                className="w-full py-2 px-3 rounded-xl border border-slate-200/80 bg-slate-50/50 text-xs font-medium text-slate-800 focus:bg-white focus:border-blue-500 focus:outline-hidden dark:border-slate-700 dark:bg-slate-800/80 dark:text-white transition-all shadow-2xs cursor-pointer"
              />
            </div>
          </div>

          <div className="flex items-center gap-2 w-full md:w-auto ml-auto">
            <button
              type="submit"
              className="flex-1 md:flex-initial px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs transition-all shadow-md shadow-blue-600/15 cursor-pointer"
            >
              {t.dash_admin_pay_btn_apply || "Terapkan Filter"}
            </button>
            <button
              type="button"
              onClick={handleClear}
              className="flex-1 md:flex-initial px-4 py-2 rounded-xl border border-slate-200/80 dark:border-slate-700 bg-slate-100/80 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-bold text-xs hover:bg-slate-200 dark:hover:bg-slate-700 transition-all cursor-pointer"
            >
              {t.dash_admin_pay_btn_reset || "Reset"}
            </button>
          </div>
        </form>
      </div>

      {/* TailAdmin Table Card */}
      <div className="rounded-2xl border border-slate-200/80 bg-white shadow-2xs dark:border-slate-800 dark:bg-slate-900 overflow-hidden transition-colors">
        <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800/80 flex items-center justify-between bg-slate-50/40 dark:bg-slate-800/20">
          <span className="font-extrabold text-slate-800 dark:text-white text-sm">
            {t.dash_admin_pay_list_title || "Daftar Transaksi Masuk"}
          </span>
          {meta && (
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
              {t.dash_admin_pay_list_count?.replace("{count}", String(payments.length)).replace("{total}", String(meta.total)) || `Menampilkan ${payments.length} dari ${meta.total} transaksi`}
            </span>
          )}
        </div>

        {isLoading ? (
          <div className="py-16">
            <LoadingSpinner />
          </div>
        ) : payments.length === 0 ? (
          <div className="p-12">
            <EmptyState
              icon={CreditCard}
              title={t.dash_admin_pay_empty_title || "Transaksi Tidak Ditemukan"}
              description={t.dash_admin_pay_empty_desc || "Belum ada transaksi pembayaran sertifikasi yang sesuai dengan kriteria pencarian atau filter tanggal Anda."}
            />
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50/90 dark:bg-slate-800/60 border-b border-slate-100 dark:border-slate-800 text-[11px] font-extrabold text-slate-500 uppercase tracking-wider">
                    <th className="px-6 py-4">{t.dash_admin_pay_col_order || "Order ID & Waktu"}</th>
                    <th className="px-6 py-4">{t.dash_admin_pay_col_company || "Perusahaan"}</th>
                    <th className="px-6 py-4">{t.dash_admin_pay_col_status || "Status Pembayaran"}</th>
                    <th className="px-6 py-4">{t.dash_admin_pay_col_amount || "Nominal Transaksi"}</th>
                    <th className="px-6 py-4">{t.dash_admin_pay_col_method || "Metode Bayar"}</th>
                    <th className="px-6 py-4">{t.dash_admin_pay_col_date || "Tanggal Bayar"}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-sm font-medium text-slate-700 dark:text-slate-200">
                  {payments.map((p) => (
                    <tr
                      key={p.id}
                      className="hover:bg-blue-50/40 dark:hover:bg-slate-800/50 transition-colors duration-150"
                    >
                      <td className="px-6 py-4">
                        <span className="font-mono text-xs font-bold text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 px-2.5 py-1 rounded-md border border-slate-200/60 dark:border-slate-700 block w-fit">
                          #{p.order_id.slice(-14)}
                        </span>
                        <span className="text-[11px] text-slate-400 mt-1 block">
                          {t.dash_admin_pay_created_at?.replace("{date}", formatDate(p.created_at)) || `Dibuat: ${formatDate(p.created_at)}`}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300 flex items-center justify-center font-bold text-xs shrink-0">
                            <Building2 size={16} />
                          </div>
                          <div className="min-w-0">
                            <p className="font-bold text-slate-800 dark:text-white truncate text-sm">
                              {p.user?.name ?? (t.dash_admin_anon_company || "Perusahaan Anonim")}
                            </p>
                            <p className="text-[11px] font-mono text-slate-400 truncate">
                              {p.user?.email ?? "—"}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={cn(
                            "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold border shadow-2xs capitalize",
                            STATUS_STYLES[p.transaction_status] ??
                              "bg-slate-100 text-slate-600 border-slate-200 dark:bg-slate-800 dark:text-slate-400"
                          )}
                        >
                          <span
                            className={cn(
                              "w-1.5 h-1.5 rounded-full",
                              p.transaction_status === "settlement"
                                ? "bg-emerald-500"
                                : p.transaction_status === "pending"
                                ? "bg-amber-500"
                                : "bg-slate-400"
                            )}
                          />
                          {p.transaction_status}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="font-extrabold text-sm text-slate-900 dark:text-white">
                          {formatCurrency(parseFloat(p.amount))}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-xs font-semibold text-slate-600 dark:text-slate-300 capitalize">
                          {p.payment_type ? p.payment_type.replace(/_/g, " ") : "—"}
                        </span>
                        {p.bank && (
                          <span className="ml-1 text-[11px] font-bold text-blue-600 dark:text-blue-400 uppercase">
                            ({p.bank})
                          </span>
                        )}
                        {p.va_number && (
                          <span className="block text-[11px] font-mono text-slate-400 mt-0.5">
                            {t.dash_admin_pay_va?.replace("{number}", p.va_number) || `VA: ${p.va_number}`}
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-xs text-slate-500 font-normal">
                        {p.paid_at ? formatDate(p.paid_at) : "—"}
                      </td>
                    </tr>
                  ))}
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
