"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { AppLayout } from "@/components/layouts/AppLayout";
import { LoadingSpinner, EmptyState } from "@/components/ui/index";
import api from "@/lib/api";
import { PaymentTransaction, PaginatedResponse } from "@/types";
import { formatDate, formatCurrency, cn } from "@/lib/utils";
import { CreditCard, CheckCircle2, Clock, XCircle, Receipt, Printer, ShieldCheck, X } from "lucide-react";
import { useTranslation } from "@/store/lang";

const statusConfig: Record<
  string,
  { label: string; icon: React.ElementType; color: string }
> = {
  settlement: {
    label: "Berhasil (Paid)",
    icon: CheckCircle2,
    color: "text-emerald-700 bg-emerald-50 border-emerald-200 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-800",
  },
  pending: {
    label: "Menunggu Pembayaran",
    icon: Clock,
    color: "text-amber-700 bg-amber-50 border-amber-200 dark:bg-amber-950/60 dark:text-amber-300 dark:border-amber-800",
  },
  expire: {
    label: "Kadaluarsa",
    icon: XCircle,
    color: "text-slate-600 bg-slate-100 border-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:border-slate-700",
  },
  cancel: {
    label: "Dibatalkan",
    icon: XCircle,
    color: "text-rose-700 bg-rose-50 border-rose-200 dark:bg-rose-950/60 dark:text-rose-300 dark:border-rose-800",
  },
  deny: {
    label: "Ditolak Sistem",
    icon: XCircle,
    color: "text-rose-700 bg-rose-50 border-rose-200 dark:bg-rose-950/60 dark:text-rose-300 dark:border-rose-800",
  },
};

export default function PaymentsPage() {
  const [selectedReceipt, setSelectedReceipt] = useState<PaymentTransaction | null>(null);
  const { t } = useTranslation();

  const { data, isLoading } = useQuery<PaginatedResponse<PaymentTransaction>>({
    queryKey: ["payments"],
    queryFn: async () => {
      const res = await api.get("/payments");
      return res.data;
    },
  });

  const payments = data?.data ?? [];

  const handlePrintReceipt = () => {
    window.print();
  };

  return (
    <AppLayout title={t.dash_pay_title || "Riwayat & Tagihan Pembayaran"}>
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h2 className="text-xl md:text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            {t.dash_pay_heading || "Riwayat Transaksi & Bukti Pembayaran"}
          </h2>
          <p className="text-slate-500 dark:text-slate-400 text-xs md:text-sm mt-1">
            {t.dash_pay_desc || "Daftar invoice resmi dan riwayat transaksi pembayaran sertifikasi BECdex perusahaan Anda"}
          </p>
        </div>
        <div className="flex items-center gap-2 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 px-4 py-2.5 rounded-xl shadow-2xs text-xs font-extrabold text-slate-700 dark:text-slate-200 shrink-0">
          <Receipt size={16} className="text-blue-600 dark:text-blue-400" />
          <span>{t.dash_pay_total || "Total Transaksi"}: {payments.length}</span>
        </div>
      </div>

      {/* TailAdmin Table Card Wrapper */}
      <div className="rounded-2xl border border-slate-200/80 bg-white dark:border-slate-800 dark:bg-slate-900 shadow-2xs overflow-hidden transition-colors">
        {isLoading ? (
          <div className="py-16">
            <LoadingSpinner />
          </div>
        ) : payments.length === 0 ? (
          <div className="p-12">
            <EmptyState
              icon={CreditCard}
              title={t.dash_pay_empty_title || "Belum Ada Riwayat Pembayaran"}
              description={t.dash_pay_empty_desc || "Daftar tagihan invoice dan riwayat transaksi pembayaran akan otomatis muncul di halaman ini setelah Anda melakukan inisiasi pembayaran sertifikasi pada halaman Submission."}
            />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/80 dark:bg-slate-800/60 border-b border-slate-200/80 dark:border-slate-800 text-[11px] font-extrabold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  <th className="py-4 px-6">{t.dash_pay_table_id || "ID Pesanan (Order ID)"}</th>
                  <th className="py-4 px-6">{t.dash_pay_table_amount || "Nominal Tagihan"}</th>
                  <th className="py-4 px-6">{t.dash_pay_table_method || "Metode Saluran"}</th>
                  <th className="py-4 px-6">{t.dash_pay_table_status || "Status Transaksi"}</th>
                  <th className="py-4 px-6">{t.dash_pay_table_date || "Tanggal & Waktu"}</th>
                  <th className="py-4 px-6 text-right">{t.dash_pay_table_receipt || "Tanda Terima"}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-xs md:text-sm">
                {payments.map((payment) => {
                  const cfg = statusConfig[payment.transaction_status] ?? {
                    label: payment.transaction_status,
                    icon: Clock,
                    color: "text-slate-600 bg-slate-100 border-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:border-slate-700",
                  };
                  const Icon = cfg.icon;
                  const isSuccess = payment.transaction_status === "settlement";

                  return (
                    <tr
                      key={payment.id}
                      className="hover:bg-blue-50/40 dark:hover:bg-slate-800/50 transition-colors"
                    >
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-extrabold text-slate-800 dark:text-white tracking-tight">
                            {payment.order_id}
                          </span>
                        </div>
                        {payment.va_number && (
                          <p className="text-[11px] font-mono font-bold text-blue-600 dark:text-blue-400 mt-1">
                            VA: {payment.bank?.toUpperCase()} &bull; {payment.va_number}
                          </p>
                        )}
                      </td>

                      <td className="py-4 px-6 font-extrabold text-slate-900 dark:text-blue-300 text-sm">
                        {formatCurrency(payment.amount)}
                      </td>

                      <td className="py-4 px-6 text-slate-600 dark:text-slate-300 capitalize font-medium text-xs">
                        {payment.payment_type?.replace(/_/g, " ") ?? "Virtual Account / E-Wallet"}
                      </td>

                      <td className="py-4 px-6">
                        <span
                          className={cn(
                            "inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-extrabold border shadow-2xs",
                            cfg.color
                          )}
                        >
                          <Icon size={13} strokeWidth={2.5} />
                          <span>{cfg.label}</span>
                        </span>
                      </td>

                      <td className="py-4 px-6 text-slate-500 dark:text-slate-400 text-xs font-semibold">
                        {formatDate(payment.paid_at ?? payment.created_at)}
                      </td>

                      <td className="py-4 px-6 text-right">
                        {isSuccess ? (
                          <button
                            onClick={() => setSelectedReceipt(payment)}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-50 hover:bg-blue-600 text-blue-700 hover:text-white dark:bg-blue-500/10 dark:hover:bg-blue-600 dark:text-blue-300 dark:hover:text-white font-bold text-xs transition-all border border-blue-200/80 dark:border-blue-500/20 shadow-2xs cursor-pointer"
                          >
                            <Printer size={13} />
                            <span>{t.dash_pay_btn_receipt || "Bukti Bayar"}</span>
                          </button>
                        ) : (
                          <span className="text-xs text-slate-400 font-medium italic">—</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Official Payment Receipt Modal */}
      {selectedReceipt && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 print:p-0 print:bg-white">
          <div className="bg-white dark:bg-slate-900 rounded-2xl w-full max-w-lg shadow-2xl border border-slate-200/80 dark:border-slate-800 overflow-hidden print:shadow-none print:border-none animate-in fade-in zoom-in-95 duration-200">
            {/* Modal Top Bar */}
            <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-800/40 print:hidden">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold">
                  <Receipt size={18} />
                </div>
                <h3 className="font-extrabold text-slate-900 dark:text-white text-base">{t.dash_pay_receipt_title || "Tanda Terima Resmi (Official Receipt)"}</h3>
              </div>
              <button
                onClick={() => setSelectedReceipt(null)}
                className="p-1.5 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            {/* Receipt Content (Printable) */}
            <div className="p-8 space-y-6 text-slate-800 dark:text-slate-100 print:text-black">
              {/* Receipt Header Logo */}
              <div className="flex items-center justify-between border-b border-slate-200/80 dark:border-slate-800 pb-5">
                <div>
                  <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-300 text-[10px] font-bold tracking-wide uppercase mb-1">
                    <ShieldCheck size={12} />
                    <span>Official Verified Receipt</span>
                  </div>
                  <h3 className="text-xl font-extrabold tracking-tight text-slate-900 dark:text-white">
                    BECdex Certification Payment
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">Maritim Muda Nusantara & Blue Economy Center</p>
                </div>
                <div className="text-right">
                  <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-3 py-1 rounded-lg border border-emerald-200 dark:border-emerald-800 inline-block">
                    PAID / LUNAS
                  </span>
                </div>
              </div>

              {/* Receipt Info Table */}
              <div className="space-y-3 text-xs bg-slate-50 dark:bg-slate-800/50 p-5 rounded-2xl border border-slate-200/60 dark:border-slate-800">
                <div className="flex justify-between">
                  <span className="text-slate-400 font-medium">Order ID / Invoice #</span>
                  <span className="font-mono font-bold text-slate-800 dark:text-white">{selectedReceipt.order_id}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400 font-medium">{t.dash_pay_receipt_date || "Tanggal Pembayaran"}</span>
                  <span className="font-bold text-slate-800 dark:text-white">
                    {formatDate(selectedReceipt.paid_at ?? selectedReceipt.created_at)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400 font-medium">{t.dash_pay_receipt_method || "Saluran Pembayaran"}</span>
                  <span className="font-bold text-slate-800 dark:text-white capitalize">
                    {selectedReceipt.payment_type?.replace(/_/g, " ") ?? "Virtual Account / E-Wallet"}
                  </span>
                </div>
                {selectedReceipt.va_number && (
                  <div className="flex justify-between">
                    <span className="text-slate-400 font-medium">Nomor VA</span>
                    <span className="font-mono font-bold text-blue-600 dark:text-blue-400">
                      {selectedReceipt.bank?.toUpperCase()} &bull; {selectedReceipt.va_number}
                    </span>
                  </div>
                )}
              </div>

              {/* Amount Breakdown */}
              <div className="border-t border-slate-200/80 dark:border-slate-800 pt-4">
                <div className="flex justify-between items-center text-sm">
                  <span className="font-bold text-slate-700 dark:text-slate-300">{t.dash_pay_receipt_total || "Total Dibayarkan"}</span>
                  <span className="text-xl font-extrabold text-blue-600 dark:text-blue-400">
                    {formatCurrency(selectedReceipt.amount)}
                  </span>
                </div>
              </div>

              <div className="text-[11px] text-slate-400 text-center pt-2 border-t border-dashed border-slate-200 dark:border-slate-800">
                {t.dash_pay_receipt_note || "Bukti pembayaran ini sah dan diterbitkan secara otomatis oleh sistem gateway pembayaran resmi BECdex."}
              </div>
            </div>

            {/* Modal Bottom Print Actions */}
            <div className="p-4 border-t border-slate-100 dark:border-slate-800 flex justify-end gap-2.5 bg-slate-50/50 dark:bg-slate-800/40 print:hidden">
              <button
                onClick={() => setSelectedReceipt(null)}
                className="px-4 py-2 border border-slate-200/80 dark:border-slate-700 rounded-xl font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all cursor-pointer text-xs"
              >
                {t.dash_pay_btn_close || "Tutup"}
              </button>
              <button
                onClick={handlePrintReceipt}
                className="flex items-center gap-2 px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold shadow-md shadow-blue-600/15 transition-all cursor-pointer text-xs"
              >
                <Printer size={14} />
                <span>{t.dash_pay_btn_print || "Cetak / Simpan PDF"}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </AppLayout>
  );
}
