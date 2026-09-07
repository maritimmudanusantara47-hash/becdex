"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { AppLayout } from "@/components/layouts/AppLayout";
import { LoadingSpinner, EmptyState } from "@/components/ui/index";
import api from "@/lib/api";
import { formatDate, cn } from "@/lib/utils";
import {
  Mail, MailOpen, Trash2, Eye, Calendar, User, Phone, ChevronLeft, ChevronRight, X, ShieldCheck, Inbox
} from "lucide-react";
import { useTranslation } from "@/store/lang";

interface HelpMessage {
  id: number;
  name: string;
  email: string;
  whatsapp: string | null;
  issue_type: string | null;
  detail: string;
  is_read: boolean;
  created_at: string;
}

export default function AdminHelpPage() {
  const { t } = useTranslation();
  const [page, setPage] = useState(1);
  const [activeMessage, setActiveMessage] = useState<HelpMessage | null>(null);
  const qc = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ["admin-help-messages", page],
    queryFn: async () => {
      const res = await api.get(`/admin/help?page=${page}`);
      return res.data;
    },
  });

  const readMutation = useMutation({
    mutationFn: async (id: number) => {
      await api.put(`/admin/help/${id}/read`);
    },
    onSuccess: (_, id) => {
      qc.invalidateQueries({ queryKey: ["admin-help-messages"] });
      if (activeMessage && activeMessage.id === id) {
        setActiveMessage((prev) => (prev ? { ...prev, is_read: true } : null));
      }
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      await api.delete(`/admin/help/${id}`);
    },
    onSuccess: () => {
      toast.success(t.dash_admin_help_toast_delete_success || "Pesan bantuan berhasil dihapus dari kotak masuk!");
      qc.invalidateQueries({ queryKey: ["admin-help-messages"] });
      setActiveMessage(null);
    },
    onError: () => toast.error(t.dash_admin_help_toast_delete_error || "Gagal menghapus pesan bantuan."),
  });

  const messages: HelpMessage[] = data?.data ?? [];
  const meta = data?.meta;

  const handleOpenMessage = (msg: HelpMessage) => {
    setActiveMessage(msg);
    if (!msg.is_read) {
      readMutation.mutate(msg.id);
    }
  };

  return (
    <AppLayout title={t.dash_admin_help_title || "Inbox Bantuan & Kendala"}>
      {/* Top Header Card */}
      <div className="mb-6 rounded-2xl border border-slate-200/80 bg-white p-6 shadow-2xs dark:border-slate-800 dark:bg-slate-900 transition-colors">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-blue-50 dark:bg-blue-950/60 border border-blue-200/80 dark:border-blue-800 text-blue-700 dark:text-blue-300 text-xs font-bold tracking-wide uppercase mb-2">
              <ShieldCheck size={14} className="text-blue-600 dark:text-blue-400" />
              <span>{t.dash_admin_help_subtitle || "Blue Economy Support Desk"}</span>
            </div>
            <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              {t.dash_admin_help_heading || "Inbox Bantuan & Kendala Pengguna"}
            </h2>
            <p className="text-slate-500 dark:text-slate-400 text-xs sm:text-sm mt-1">
              {t.dash_admin_help_desc || "Daftar pesan masuk dari pengunjung portal, calon pengaju, atau perusahaan yang mengalami kendala teknis."}
            </p>
          </div>

          <div className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700 text-xs font-bold text-slate-700 dark:text-slate-200 shrink-0 shadow-2xs">
            <Inbox size={15} className="text-blue-600 dark:text-blue-400" />
            <span>{t.dash_admin_help_total?.replace("{count}", String(meta?.total ?? messages.length)) || `Total Pesan: ${meta?.total ?? messages.length}`}</span>
          </div>
        </div>
      </div>

      {/* TailAdmin Table Card */}
      <div className="rounded-2xl border border-slate-200/80 bg-white shadow-2xs dark:border-slate-800 dark:bg-slate-900 overflow-hidden transition-colors">
        <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800/80 flex items-center justify-between bg-slate-50/40 dark:bg-slate-800/20">
          <span className="font-extrabold text-slate-800 dark:text-white text-sm">
            {t.dash_admin_help_list_title || "Daftar Tiket & Pesan Masuk"}
          </span>
          {meta && (
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
              {t.dash_admin_help_showing?.replace("{count}", String(messages.length)) || `Menampilkan ${messages.length} pesan di halaman ini`}
            </span>
          )}
        </div>

        {isLoading ? (
          <div className="py-16">
            <LoadingSpinner />
          </div>
        ) : messages.length === 0 ? (
          <div className="p-12">
            <EmptyState
              icon={Mail}
              title={t.dash_admin_help_empty_title || "Kotak Masuk Kosong"}
              description={t.dash_admin_help_empty_desc || "Belum ada pesan atau pertanyaan yang diajukan oleh pengguna publik saat ini."}
            />
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50/90 dark:bg-slate-800/60 border-b border-slate-100 dark:border-slate-800 text-[11px] font-extrabold text-slate-500 uppercase tracking-wider">
                    <th className="px-6 py-4 w-16">{t.dash_admin_help_col_status || "Status"}</th>
                    <th className="px-6 py-4">{t.dash_admin_help_col_sender || "Pengirim & Email"}</th>
                    <th className="px-6 py-4">{t.dash_admin_help_col_category || "Kategori Masalah"}</th>
                    <th className="px-6 py-4">{t.dash_admin_help_col_preview || "Cuplikan Pesan"}</th>
                    <th className="px-6 py-4">{t.dash_admin_help_col_time || "Waktu Diterima"}</th>
                    <th className="px-6 py-4 text-right">{t.dash_admin_help_col_action || "Tindakan"}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-sm font-medium text-slate-700 dark:text-slate-200">
                  {messages.map((m) => (
                    <tr
                      key={m.id}
                      onClick={() => handleOpenMessage(m)}
                      className={cn(
                        "hover:bg-blue-50/40 dark:hover:bg-slate-800/50 transition-colors duration-150 cursor-pointer",
                        !m.is_read ? "bg-blue-50/25 dark:bg-blue-950/20 font-bold" : ""
                      )}
                    >
                      <td className="px-6 py-4">
                        {m.is_read ? (
                          <div className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-400 flex items-center justify-center">
                            <MailOpen size={16} />
                          </div>
                        ) : (
                          <div className="w-8 h-8 rounded-lg bg-blue-600 text-white flex items-center justify-center shadow-md shadow-blue-600/20">
                            <Mail size={16} />
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <p className={cn("text-slate-900 dark:text-white text-sm truncate", !m.is_read && "font-extrabold text-blue-700 dark:text-blue-300")}>
                          {m.name}
                        </p>
                        <p className="text-[11px] font-mono text-slate-400 truncate mt-0.5">
                          {m.email}
                        </p>
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={cn(
                            "inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-bold border shadow-2xs",
                            m.issue_type === "Feedback"
                              ? "bg-purple-50 text-purple-700 border-purple-200/80 dark:bg-purple-950/60 dark:text-purple-300 dark:border-purple-800"
                              : m.issue_type === "Platform"
                              ? "bg-blue-50 text-blue-700 border-blue-200/80 dark:bg-blue-950/60 dark:text-blue-300 dark:border-blue-800"
                              : "bg-slate-100 text-slate-700 border-slate-200/80 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700"
                          )}
                        >
                          {m.issue_type ?? (t.dash_admin_help_cat_general || "Feedback / Umum")}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-xs text-slate-600 dark:text-slate-300 max-w-xs truncate font-normal">
                        {m.detail}
                      </td>
                      <td className="px-6 py-4 text-xs text-slate-500 font-normal">
                        {formatDate(m.created_at)}
                      </td>
                      <td className="px-6 py-4 text-right" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => handleOpenMessage(m)}
                            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-blue-50 hover:bg-blue-600 text-blue-700 hover:text-white dark:bg-blue-500/10 dark:hover:bg-blue-600 dark:text-blue-300 dark:hover:text-white font-bold text-xs transition-all border border-blue-200/80 dark:border-blue-500/20 shadow-2xs cursor-pointer"
                          >
                            <Eye size={13} />
                            <span>{t.dash_admin_help_btn_open || "Buka"}</span>
                          </button>
                          <button
                            onClick={() => {
                              if (confirm(t.dash_admin_help_confirm_delete || "Hapus pesan bantuan ini?"))
                                deleteMutation.mutate(m.id);
                            }}
                            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-rose-50 hover:bg-rose-600 text-rose-700 hover:text-white dark:bg-rose-950/60 dark:hover:bg-rose-600 dark:text-rose-300 dark:hover:text-white font-bold text-xs transition-all border border-rose-200/80 dark:border-rose-800 shadow-2xs cursor-pointer"
                          >
                            <Trash2 size={13} />
                          </button>
                        </div>
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
                  {t.dash_admin_help_pagination?.replace("{current}", String(meta.current_page)).replace("{last}", String(meta.last_page)) || (
                    <>Halaman <span className="font-bold text-slate-800 dark:text-white">{meta.current_page}</span> dari{" "}<span className="font-bold text-slate-800 dark:text-white">{meta.last_page}</span></>
                  )}
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

      {/* Message View Modal */}
      {activeMessage && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl w-full max-w-lg shadow-2xl border border-slate-200/80 dark:border-slate-800 overflow-hidden flex flex-col max-h-[90vh] animate-in fade-in zoom-in-95 duration-200">
            <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-800/40">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-blue-100 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold">
                  <Mail size={18} />
                </div>
                <h3 className="font-extrabold text-slate-900 dark:text-white text-base">{t.dash_admin_help_modal_title || "Detail Pesan Bantuan"}</h3>
              </div>
              <button
                onClick={() => setActiveMessage(null)}
                className="p-1.5 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            <div className="p-6 overflow-y-auto space-y-4 text-sm flex-1">
              <div className="grid grid-cols-2 gap-4 bg-slate-50 dark:bg-slate-800/60 p-4 rounded-xl border border-slate-200/60 dark:border-slate-700">
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">{t.dash_admin_help_modal_lbl_sender || "Pengirim"}</span>
                  <div className="flex items-center gap-1.5 mt-1 font-bold text-slate-800 dark:text-white text-xs">
                    <User size={13} className="text-slate-400" />
                    {activeMessage.name}
                  </div>
                </div>
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">{t.dash_admin_help_modal_lbl_email || "Email"}</span>
                  <div className="flex items-center gap-1.5 mt-1 text-slate-700 dark:text-slate-200 text-xs truncate font-mono">
                    <MailOpen size={13} className="text-slate-400" />
                    {activeMessage.email}
                  </div>
                </div>
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">{t.dash_admin_help_modal_lbl_wa || "WhatsApp"}</span>
                  <div className="flex items-center gap-1.5 mt-1 text-slate-700 dark:text-slate-200 text-xs font-mono">
                    <Phone size={13} className="text-slate-400" />
                    {activeMessage.whatsapp || "—"}
                  </div>
                </div>
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">{t.dash_admin_help_modal_lbl_time || "Waktu Kirim"}</span>
                  <div className="flex items-center gap-1.5 mt-1 text-slate-700 dark:text-slate-200 text-xs">
                    <Calendar size={13} className="text-slate-400" />
                    {formatDate(activeMessage.created_at)}
                  </div>
                </div>
              </div>

              <div>
                <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block mb-1.5">{t.dash_admin_help_modal_lbl_type || "Tipe Masalah"}</span>
                <span className="inline-block px-3 py-1 rounded-lg text-xs font-bold bg-blue-50 text-blue-700 border border-blue-200/80 dark:bg-blue-950/60 dark:text-blue-300 dark:border-blue-800">
                  {activeMessage.issue_type ?? (t.dash_admin_help_modal_type_fb || "Feedback / Kendala")}
                </span>
              </div>

              <div className="pt-2">
                <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block mb-1.5">{t.dash_admin_help_modal_lbl_msg || "Isi Pesan / Kendala"}</span>
                <div className="bg-slate-50/80 dark:bg-slate-800/60 p-4 rounded-xl border border-slate-200/80 dark:border-slate-700 text-slate-700 dark:text-slate-200 whitespace-pre-wrap leading-relaxed text-xs">
                  {activeMessage.detail}
                </div>
              </div>
            </div>

            <div className="p-4 border-t border-slate-100 dark:border-slate-800 flex justify-between bg-slate-50/50 dark:bg-slate-800/40">
              <button
                onClick={() => {
                  if (confirm(t.dash_admin_help_modal_confirm_delete || "Hapus pesan bantuan ini secara permanen?"))
                    deleteMutation.mutate(activeMessage.id);
                }}
                className="inline-flex items-center gap-1.5 text-xs font-bold text-rose-600 hover:text-white px-3.5 py-2 rounded-xl border border-rose-200 hover:bg-rose-600 dark:border-rose-800 transition-all cursor-pointer"
              >
                <Trash2 size={14} />
                <span>{t.dash_admin_help_modal_btn_delete || "Hapus Pesan"}</span>
              </button>
              <button
                onClick={() => setActiveMessage(null)}
                className="px-5 py-2 bg-slate-200 hover:bg-slate-300 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-xl text-xs font-bold transition-all cursor-pointer"
              >
                {t.help_close || "Tutup"}
              </button>
            </div>
          </div>
        </div>
      )}
    </AppLayout>
  );
}
