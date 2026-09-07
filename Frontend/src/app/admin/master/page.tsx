"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { AppLayout } from "@/components/layouts/AppLayout";
import { LoadingSpinner, EmptyState } from "@/components/ui/index";
import api from "@/lib/api";
import { cn } from "@/lib/utils";
import { Plus, Pencil, Trash2, Loader2, Building2, Globe, ShieldCheck, Database } from "lucide-react";
import { useTranslation } from "@/store/lang";

interface MasterRow { id: number; name: string }

function CrudModal({
  title, initial, isPending, onClose, onSave
}: {
  title: string; initial?: string; isPending: boolean;
  onClose: () => void; onSave: (name: string) => void;
}) {
  const { t } = useTranslation();
  const [name, setName] = useState(initial ?? "");
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 w-full max-w-sm shadow-2xl border border-slate-200/80 dark:border-slate-800 transition-all animate-in fade-in zoom-in-95 duration-200">
        <div className="flex items-center gap-2.5 mb-4 pb-3 border-b border-slate-100 dark:border-slate-800">
          <div className="w-9 h-9 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold">
            <Database size={18} />
          </div>
          <h3 className="font-extrabold text-slate-900 dark:text-white text-base">{title}</h3>
        </div>

        <div className="mb-4">
          <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
            {t.dash_admin_master_modal_label || "Nama Referensi"}
          </label>
          <input
            autoFocus
            value={name}
            onChange={(e) => setName(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && name.trim() && onSave(name)}
            placeholder={t.dash_admin_master_modal_placeholder || "Masukkan nama data referensi..."}
            className="w-full border border-slate-200/80 dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-xs font-medium text-slate-800 dark:text-white bg-slate-50/50 dark:bg-slate-800/80 focus:bg-white focus:border-blue-500 focus:outline-hidden transition-all shadow-2xs"
          />
        </div>

        <div className="flex justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
          <button
            onClick={onClose}
            type="button"
            className="px-4 py-2 border border-slate-200/80 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all cursor-pointer"
          >
            {t.dash_admin_master_modal_cancel || "Batal"}
          </button>
          <button
            onClick={() => onSave(name)}
            disabled={isPending || !name.trim()}
            type="button"
            className="flex items-center gap-2 px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-md shadow-blue-600/15 disabled:opacity-60 transition-all cursor-pointer"
          >
            {isPending && <Loader2 size={13} className="animate-spin" />}
            {t.dash_admin_master_modal_save || "Simpan Referensi"}
          </button>
        </div>
      </div>
    </div>
  );
}

type MasterTab = "company-fields" | "countries";

export default function AdminMasterPage() {
  const [tab, setTab]     = useState<MasterTab>("company-fields");
  const [modal, setModal] = useState<{ mode: "add" | "edit"; item?: MasterRow } | null>(null);
  const qc = useQueryClient();
  const { t } = useTranslation();

  const { data: companyFields, isLoading: cfLoading } = useQuery({
    queryKey: ["master-cf"],
    queryFn: () => api.get("/admin/master/company-fields").then(r => r.data.data as MasterRow[]),
  });
  const { data: countries, isLoading: ctLoading } = useQuery({
    queryKey: ["master-countries"],
    queryFn: () => api.get("/admin/master/countries").then(r => r.data.data as MasterRow[]),
  });

  const endpoint = `/admin/master/${tab}`;
  const queryKey = tab === "company-fields" ? "master-cf" : "master-countries";

  const saveMutation = useMutation({
    mutationFn: ({ id, name }: { id?: number; name: string }) =>
      id ? api.put(`${endpoint}/${id}`, { name }) : api.post(endpoint, { name }),
    onSuccess: () => {
      toast.success(modal?.mode === "add" ? (t.dash_admin_master_toast_add_success || "Data master berhasil ditambahkan!") : (t.dash_admin_master_toast_edit_success || "Data master berhasil diperbarui!"));
      qc.invalidateQueries({ queryKey: [queryKey] });
      setModal(null);
    },
    onError: () => toast.error(t.dash_admin_master_toast_save_error || "Gagal menyimpan data master referensi."),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => api.delete(`${endpoint}/${id}`),
    onSuccess: () => {
      toast.success(t.dash_admin_master_toast_delete_success || "Data master berhasil dihapus!");
      qc.invalidateQueries({ queryKey: [queryKey] });
    },
    onError: () => toast.error(t.dash_admin_master_toast_delete_error || "Gagal menghapus data. Mungkin sedang digunakan oleh akun/perusahaan lain."),
  });

  const rows = tab === "company-fields" ? (companyFields ?? []) : (countries ?? []);
  const isLoading = tab === "company-fields" ? cfLoading : ctLoading;

  return (
    <AppLayout title={t.dash_admin_master_title || "Master Data Referensi"}>
      {/* Top Header Card */}
      <div className="mb-6 rounded-2xl border border-slate-200/80 bg-white p-6 shadow-2xs dark:border-slate-800 dark:bg-slate-900 transition-colors">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-blue-50 dark:bg-blue-950/60 border border-blue-200/80 dark:border-blue-800 text-blue-700 dark:text-blue-300 text-xs font-bold tracking-wide uppercase mb-2">
              <ShieldCheck size={14} className="text-blue-600 dark:text-blue-400" />
              <span>{t.dash_admin_master_subtitle || "Blue Economy Reference Dictionary"}</span>
            </div>
            <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              {t.dash_admin_master_heading || "Master Data & Referensi Sistem"}
            </h2>
            <p className="text-slate-500 dark:text-slate-400 text-xs sm:text-sm mt-1">
              {t.dash_admin_master_desc || "Kelola kamus data referensi pendaftaran: Bidang Sektor Perusahaan Laut dan Daftar Wilayah Negara."}
            </p>
          </div>

          <button
            onClick={() => setModal({ mode: "add" })}
            className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs transition-all shadow-lg shadow-blue-600/20 cursor-pointer shrink-0"
          >
            <Plus size={16} strokeWidth={2.5} />
            <span>{tab === "company-fields" ? (t.dash_admin_master_add_sector || "Tambah Sektor Bidang Baru") : (t.dash_admin_master_add_country || "Tambah Negara Baru")}</span>
          </button>
        </div>

        {/* Tab Buttons */}
        <div className="mt-6 pt-5 border-t border-slate-100 dark:border-slate-800/80 flex flex-wrap gap-2">
          {([
            { key: "company-fields" as MasterTab, label: t.dash_admin_master_tab_sector || "Bidang & Sektor Perusahaan", icon: Building2 },
            { key: "countries"      as MasterTab, label: t.dash_admin_master_tab_country || "Wilayah & Negara Asal",       icon: Globe },
          ]).map((t) => {
            const isActive = tab === t.key;
            return (
              <button
                key={t.key}
                onClick={() => setTab(t.key)}
                className={cn(
                  "flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all duration-200 cursor-pointer shadow-2xs",
                  isActive
                    ? "bg-blue-600 text-white shadow-blue-600/20 shadow-md scale-102"
                    : "bg-slate-100/80 text-slate-600 hover:bg-slate-200 hover:text-slate-900 dark:bg-slate-800/80 dark:text-slate-300 dark:hover:bg-slate-700 dark:hover:text-white border border-slate-200/60 dark:border-slate-700"
                )}
              >
                <t.icon size={15} className={isActive ? "text-white" : "text-slate-400"} />
                <span>{t.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* TailAdmin List/Table Card */}
      <div className="rounded-2xl border border-slate-200/80 bg-white shadow-2xs dark:border-slate-800 dark:bg-slate-900 overflow-hidden transition-colors max-w-4xl">
        <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800/80 flex items-center justify-between bg-slate-50/40 dark:bg-slate-800/20">
          <span className="font-extrabold text-slate-800 dark:text-white text-sm">
            {t.dash_admin_master_list_title?.replace("{count}", String(rows.length)) || `Daftar Referensi (${rows.length})`}
          </span>
          <span className="text-xs font-semibold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/60 px-2.5 py-1 rounded-lg border border-blue-200/80 dark:border-blue-800">
            {tab === "company-fields" ? (t.dash_admin_master_cat_sector || "Kategori: Sektor Industri") : (t.dash_admin_master_cat_country || "Kategori: Daftar Negara")}
          </span>
        </div>

        {isLoading ? (
          <div className="py-16">
            <LoadingSpinner />
          </div>
        ) : rows.length === 0 ? (
          <div className="p-12">
            <EmptyState
              icon={Database}
              title={t.dash_admin_master_empty_title || "Data Master Kosong"}
              description={t.dash_admin_master_empty_desc || "Belum ada entri referensi untuk kategori ini. Klik tombol tambah di atas untuk membuat entri baru."}
            />
          </div>
        ) : (
          <div className="divide-y divide-slate-100 dark:divide-slate-800 text-sm font-medium">
            {rows.map((row, idx) => (
              <div
                key={row.id}
                className="flex items-center justify-between px-6 py-4 hover:bg-blue-50/40 dark:hover:bg-slate-800/50 transition-colors duration-150"
              >
                <div className="flex items-center gap-3">
                  <span className="w-6 h-6 rounded-md bg-slate-100 dark:bg-slate-800 font-mono text-xs text-slate-500 dark:text-slate-400 flex items-center justify-center font-bold">
                    {idx + 1}
                  </span>
                  <div>
                    <span className="font-bold text-slate-800 dark:text-white block text-sm">
                      {row.name}
                    </span>
                    <span className="text-[11px] font-mono text-slate-400">
                      System ID: #{row.id}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setModal({ mode: "edit", item: row })}
                    className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-blue-50 hover:bg-blue-600 text-blue-700 hover:text-white dark:bg-blue-500/10 dark:hover:bg-blue-600 dark:text-blue-300 dark:hover:text-white font-bold text-xs transition-all border border-blue-200/80 dark:border-blue-500/20 shadow-2xs cursor-pointer"
                  >
                    <Pencil size={13} />
                    <span>{t.dash_admin_master_btn_edit || "Edit"}</span>
                  </button>
                  <button
                    onClick={() => {
                      if (confirm(t.dash_admin_master_confirm_delete?.replace("{name}", row.name) || `Yakin ingin menghapus referensi "${row.name}"?`))
                        deleteMutation.mutate(row.id);
                    }}
                    className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-rose-50 hover:bg-rose-600 text-rose-700 hover:text-white dark:bg-rose-950/60 dark:hover:bg-rose-600 dark:text-rose-300 dark:hover:text-white font-bold text-xs transition-all border border-rose-200/80 dark:border-rose-800 shadow-2xs cursor-pointer"
                  >
                    <Trash2 size={13} />
                    <span>{t.dash_admin_master_btn_delete || "Hapus"}</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {modal && (
        <CrudModal
          title={
            modal.mode === "add"
              ? (tab === "company-fields" ? (t.dash_admin_master_modal_add_sector || "Tambah Referensi (Bidang Perusahaan)") : (t.dash_admin_master_modal_add_country || "Tambah Referensi (Negara)"))
              : (tab === "company-fields" ? (t.dash_admin_master_modal_edit_sector || "Edit Referensi (Bidang Perusahaan)") : (t.dash_admin_master_modal_edit_country || "Edit Referensi (Negara)"))
          }
          initial={modal.item?.name}
          isPending={saveMutation.isPending}
          onClose={() => setModal(null)}
          onSave={(name) => saveMutation.mutate({ id: modal.item?.id, name })}
        />
      )}
    </AppLayout>
  );
}
