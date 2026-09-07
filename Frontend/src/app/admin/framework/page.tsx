"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { AppLayout } from "@/components/layouts/AppLayout";
import { LoadingSpinner } from "@/components/ui/index";
import api from "@/lib/api";
import { cn } from "@/lib/utils";
import { Plus, Pencil, Trash2, Loader2, GitBranch, ShieldCheck, Layers } from "lucide-react";
import { useTranslation } from "@/store/lang";

interface Aspect { id: number; name: string; name_id?: string | null; outcomes_count?: number }
interface Outcome { id: number; aspect_id: number; name: string; name_id?: string | null; aspect?: Aspect; principles_count?: number }
interface Principle { id: number; outcome_id: number; name: string; name_id?: string | null; outcome?: Outcome; indicators_count?: number }
interface Indicator { id: number; principle_id: number; name: string; name_id?: string | null; description?: string | null; description_en?: string | null; evidence?: string | null; evidence_en?: string | null; verification_method?: string | null; verification_method_en?: string | null; regulation?: string | null; regulation_en?: string | null; is_mandatory?: boolean; principle?: Principle; questions_count?: number }
interface Question { id: number; indicator_id: number; text: string; text_en?: string | null; weight?: number; is_mandatory?: boolean; indicator?: Indicator }

type FrameworkTab = "aspects" | "outcomes" | "principles" | "indicators" | "questions";

interface CrudModalProps {
  title: string;
  onClose: () => void;
  onSave: (data: Record<string, string>) => void;
  isPending: boolean;
  fields: { key: string; label: string; type?: string; options?: { id: number; name: string }[] }[];
  initial?: Record<string, string>;
}

function CrudModal({ title, onClose, onSave, isPending, fields, initial = {} }: CrudModalProps) {
  const { t } = useTranslation();
  const [form, setForm] = useState<Record<string, string>>(
    fields.reduce((acc, f) => ({ ...acc, [f.key]: initial[f.key] ?? "" }), {})
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
      <div className="bg-white dark:bg-slate-900 rounded-2xl w-full max-w-2xl shadow-2xl border border-slate-200/80 dark:border-slate-800 transition-all animate-in fade-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center gap-2.5 px-6 py-4 border-b border-slate-100 dark:border-slate-800 shrink-0">
          <div className="w-9 h-9 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold">
            <Layers size={18} />
          </div>
          <h3 className="font-extrabold text-slate-900 dark:text-white text-base">{title}</h3>
        </div>

        {/* Scrollable body */}
        <div className="overflow-y-auto flex-1 min-h-0 px-6 py-5 space-y-4">
          {fields.map((f) => (
            <div key={f.key}>
              {f.type === "checkbox" ? (
                <label className="flex items-center gap-3 cursor-pointer group">
                  <div className="relative">
                    <input
                      type="checkbox"
                      checked={form[f.key] === "true"}
                      onChange={(e) => setForm((prev) => ({ ...prev, [f.key]: e.target.checked ? "true" : "false" }))}
                      className="sr-only"
                    />
                    <div className={cn(
                      "w-10 h-6 rounded-full transition-all duration-200",
                      form[f.key] === "true" ? "bg-red-500" : "bg-slate-200 dark:bg-slate-700"
                    )}>
                      <div className={cn(
                        "absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow-sm transition-all duration-200",
                        form[f.key] === "true" ? "translate-x-4" : "translate-x-0"
                      )} />
                    </div>
                  </div>
                  <div>
                    <span className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider block">{f.label}</span>
                    <span className="text-[11px] text-slate-400">
                      {form[f.key] === "true" ? "✓ Pertanyaan ini wajib dijawab user" : "Pertanyaan opsional (tidak wajib)"}
                    </span>
                  </div>
                </label>
              ) : (
                <>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                    {f.label}
                  </label>
                  {f.options ? (
                    <select
                      value={form[f.key]}
                      onChange={(e) => setForm((prev) => ({ ...prev, [f.key]: e.target.value }))}
                      className="w-full border border-slate-200/80 dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-xs font-medium text-slate-800 dark:text-white bg-slate-50/50 dark:bg-slate-800/80 focus:bg-white focus:border-blue-500 focus:outline-hidden transition-all shadow-2xs cursor-pointer"
                    >
                      <option value="">{t.dash_admin_fw_modal_select?.replace("{label}", f.label) || `Pilih ${f.label}...`}</option>
                      {f.options.map((opt) => (
                        <option key={opt.id} value={String(opt.id)}>
                          {opt.name}
                        </option>
                      ))}
                    </select>
                  ) : f.type === "textarea" ? (
                    <textarea
                      value={form[f.key]}
                      onChange={(e) => setForm((prev) => ({ ...prev, [f.key]: e.target.value }))}
                      placeholder={t.dash_admin_fw_modal_placeholder?.replace("{label}", f.label.toLowerCase()) || `Masukkan ${f.label.toLowerCase()}...`}
                      rows={3}
                      className="w-full border border-slate-200/80 dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-xs font-medium text-slate-800 dark:text-white bg-slate-50/50 dark:bg-slate-800/80 focus:bg-white focus:border-blue-500 focus:outline-hidden transition-all shadow-2xs resize-y"
                    />
                  ) : (
                    <input
                      type={f.type ?? "text"}
                      value={form[f.key]}
                      onChange={(e) => setForm((prev) => ({ ...prev, [f.key]: e.target.value }))}
                      placeholder={t.dash_admin_fw_modal_placeholder?.replace("{label}", f.label.toLowerCase()) || `Masukkan ${f.label.toLowerCase()}...`}
                      className="w-full border border-slate-200/80 dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-xs font-medium text-slate-800 dark:text-white bg-slate-50/50 dark:bg-slate-800/80 focus:bg-white focus:border-blue-500 focus:outline-hidden transition-all shadow-2xs"
                    />
                  )}
                </>
              )}
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-2.5 px-6 py-4 border-t border-slate-100 dark:border-slate-800 shrink-0">
          <button
            onClick={onClose}
            type="button"
            className="px-4 py-2.5 border border-slate-200/80 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all cursor-pointer"
          >
            {t.dash_admin_master_modal_cancel || "Batal"}
          </button>
          <button
            onClick={() => onSave(form)}
            disabled={isPending}
            type="button"
            className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-md shadow-blue-600/15 disabled:opacity-60 transition-all cursor-pointer"
          >
            {isPending && <Loader2 size={14} className="animate-spin" />}
            {t.dash_admin_fw_modal_save || "Simpan Perubahan"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function AdminFrameworkPage() {
  const { t, locale } = useTranslation();
  
  const TABS: { key: FrameworkTab; label: string; countLabel: string }[] = [
    { key: "aspects",    label: t.dash_admin_fw_tab_aspect || "Aspek BECdex",        countLabel: t.dash_admin_fw_lbl_aspect || "Aspek" },
    { key: "outcomes",   label: t.dash_admin_fw_tab_outcome || "Outcome / Tujuan",    countLabel: t.dash_admin_fw_lbl_outcome || "Outcome" },
    { key: "principles", label: t.dash_admin_fw_tab_principle || "Prinsip Utama",       countLabel: t.dash_admin_fw_lbl_principle || "Prinsip" },
    { key: "indicators", label: t.dash_admin_fw_tab_indicator || "Indikator Kunci",     countLabel: t.dash_admin_fw_lbl_indicator || "Indikator" },
    { key: "questions",  label: t.dash_admin_fw_tab_question || "Pertanyaan Asesmen", countLabel: t.dash_admin_fw_lbl_question || "Pertanyaan" },
  ];

  const [tab, setTab] = useState<FrameworkTab>("aspects");
  const [modal, setModal] = useState<{ mode: "add" | "edit"; item?: Record<string, string> } | null>(null);
  const qc = useQueryClient();

  const { data: aspects }    = useQuery({ queryKey: ["fw-aspects"],    queryFn: () => api.get("/admin/framework/aspects").then(r => r.data.data as Aspect[]) });
  const { data: outcomes }   = useQuery({ queryKey: ["fw-outcomes"],   queryFn: () => api.get("/admin/framework/outcomes").then(r => r.data.data as Outcome[]) });
  const { data: principles } = useQuery({ queryKey: ["fw-principles"], queryFn: () => api.get("/admin/framework/principles").then(r => r.data.data as Principle[]) });
  const { data: indicators } = useQuery({ queryKey: ["fw-indicators"], queryFn: () => api.get("/admin/framework/indicators").then(r => r.data.data as Indicator[]) });
  const { data: questions }  = useQuery({ queryKey: ["fw-questions"],  queryFn: () => api.get("/admin/framework/questions").then(r => r.data.data as Question[]) });

  const currentData = { aspects, outcomes, principles, indicators, questions }[tab + ""] as unknown[];
  const isLoading   = !currentData;

  const endpoint = `/admin/framework/${tab}`;

  const saveMutation = useMutation({
    mutationFn: async ({ id, data }: { id?: number; data: Record<string, string> }) => {
      const payload: Record<string, unknown> = { ...data };
      if ("is_mandatory" in payload) {
        payload.is_mandatory = payload.is_mandatory === "true" || payload.is_mandatory === true;
      }
      if (id) return api.put(`${endpoint}/${id}`, payload);
      return api.post(endpoint, payload);
    },
    onSuccess: () => {
      toast.success(modal?.mode === "add" ? (t.dash_admin_fw_toast_add_success || "Data berhasil ditambahkan!") : (t.dash_admin_fw_toast_edit_success || "Data berhasil diperbarui!"));
      qc.invalidateQueries({ queryKey: [`fw-${tab}`] });
      setModal(null);
    },
    onError: () => toast.error(t.dash_admin_fw_toast_save_error || "Gagal menyimpan data framework."),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => api.delete(`${endpoint}/${id}`),
    onSuccess: () => {
      toast.success(t.dash_admin_fw_toast_delete_success || "Item framework berhasil dihapus!");
      qc.invalidateQueries({ queryKey: [`fw-${tab}`] });
    },
    onError: () => toast.error(t.dash_admin_fw_toast_delete_error || "Gagal menghapus. Pastikan item tidak memiliki data turunan/anak."),
  });

  const fieldConfig: Record<FrameworkTab, CrudModalProps["fields"]> = {
    aspects: [
      { key: "name", label: "Nama Aspek (English)" },
      { key: "name_id", label: "Nama Aspek (Bahasa Indonesia)" },
    ],
    outcomes: [
      { key: "aspect_id", label: t.dash_admin_fw_fld_parent_aspect || "Aspek Induk", options: aspects?.map(a => ({ id: a.id, name: a.name })) ?? [] },
      { key: "name", label: "Nama Outcome (English)" },
      { key: "name_id", label: "Nama Outcome (Bahasa Indonesia)" },
    ],
    principles: [
      { key: "outcome_id", label: t.dash_admin_fw_fld_parent_outcome || "Outcome Induk", options: outcomes?.map(o => ({ id: o.id, name: o.name })) ?? [] },
      { key: "name", label: "Nama Prinsip (English)" },
      { key: "name_id", label: "Nama Prinsip (Bahasa Indonesia)" },
    ],
    indicators: [
      { key: "principle_id",        label: t.dash_admin_fw_fld_parent_principle || "Prinsip Induk", options: principles?.map(p => ({ id: p.id, name: p.name })) ?? [] },
      { key: "name",                label: "Nama Indikator (English)" },
      { key: "name_id",             label: "Nama Indikator (Bahasa Indonesia)" },
      { key: "is_mandatory",        label: "Indikator Wajib (Mandatory Indicator)", type: "checkbox" },
      { key: "description",         label: "Deskripsi Indikator (Bahasa Indonesia)", type: "textarea" },
      { key: "description_en",      label: "Deskripsi Indikator (English)",          type: "textarea" },
      { key: "evidence",            label: "Bukti yang Diperlukan (Bahasa Indonesia)", type: "textarea" },
      { key: "evidence_en",         label: "Bukti yang Diperlukan (English)",          type: "textarea" },
      { key: "verification_method", label: "Metode Verifikasi (Bahasa Indonesia)",    type: "textarea" },
      { key: "verification_method_en", label: "Metode Verifikasi (English)",          type: "textarea" },
      { key: "regulation",          label: "Dasar Hukum & Regulasi (Bahasa Indonesia)", type: "textarea" },
      { key: "regulation_en",       label: "Dasar Hukum & Regulasi (English)",          type: "textarea" },
    ],
    questions: [
      { key: "indicator_id", label: t.dash_admin_fw_fld_parent_indicator || "Indikator Induk", options: indicators?.map(i => ({ id: i.id, name: i.name })) ?? [] },
      { key: "text",         label: "Teks Pertanyaan (Bahasa Indonesia)", type: "textarea" },
      { key: "text_en",      label: "Teks Pertanyaan (English)",          type: "textarea" },
      { key: "weight",       label: t.dash_admin_fw_fld_weight || "Bobot Nilai (0–1)", type: "number" },
    ],
  };

  const getRows = (): { id: number; main: string; sub?: string; count?: string }[] => {
    if (tab === "aspects")    return (aspects    ?? []).map(i => ({ id: i.id, main: (locale === 'id' ? (i.name_id || i.name) : i.name) ?? "", count: `${i.outcomes_count ?? 0} ${t.dash_admin_fw_lbl_outcome || "Outcome"}` }));
    if (tab === "outcomes")   return (outcomes   ?? []).map(i => ({ id: i.id, main: (locale === 'id' ? (i.name_id || i.name) : i.name) ?? "", sub: `${t.dash_admin_fw_lbl_aspect || "Aspek"}: ${locale === 'id' ? (i.aspect?.name_id || i.aspect?.name) : i.aspect?.name ?? "—"}`, count: `${i.principles_count ?? 0} ${t.dash_admin_fw_lbl_principle || "Prinsip"}` }));
    if (tab === "principles") return (principles ?? []).map(i => ({ id: i.id, main: (locale === 'id' ? (i.name_id || i.name) : i.name) ?? "", sub: `${t.dash_admin_fw_lbl_outcome || "Outcome"}: ${locale === 'id' ? (i.outcome?.name_id || i.outcome?.name) : i.outcome?.name ?? "—"}`, count: `${i.indicators_count ?? 0} ${t.dash_admin_fw_lbl_indicator || "Indikator"}` }));
    if (tab === "indicators") return (indicators ?? []).map(i => ({ id: i.id, main: (locale === 'id' ? (i.name_id || i.name) : i.name) ?? "", sub: `${t.dash_admin_fw_lbl_principle || "Prinsip"}: ${locale === 'id' ? (i.principle?.name_id || i.principle?.name) : i.principle?.name ?? "—"}`, count: `${i.questions_count ?? 0} ${t.dash_admin_fw_lbl_question || "Pertanyaan"}`, hasAuditData: !!(i.evidence && i.verification_method && i.regulation), isMandatory: !!i.is_mandatory }));
    if (tab === "questions")  return (questions  ?? []).map(i => ({ id: i.id, main: (locale === 'en' ? (i.text_en || i.text) : (i.text || i.text_en)) ?? "", sub: `${t.dash_admin_fw_lbl_indicator || "Indikator"}: ${locale === 'id' ? (i.indicator?.name_id || i.indicator?.name) : i.indicator?.name ?? "—"}`, count: t.dash_admin_fw_weight?.replace("{weight}", String(i.weight ?? 1)) || `Bobot: ${i.weight ?? 1}` }));
    return [];
  };

  const getInitial = (item: { id: number; main: string; sub?: string }): Record<string, string> => {
    const raw = { aspects, outcomes, principles, indicators, questions }[tab];
    const found = (raw as unknown as Record<string, unknown>[])?.find((r) => String(r.id) === String(item.id));
    if (!found) return {};
    return Object.fromEntries(Object.entries(found).map(([k, v]) => [k, String(v ?? "")]));
  };

  return (
    <AppLayout title={t.dash_admin_fw_title || "Indikator & Framework BECdex"}>
      {/* Top Header Card */}
      <div className="mb-6 rounded-2xl border border-slate-200/80 bg-white p-6 shadow-2xs dark:border-slate-800 dark:bg-slate-900 transition-colors">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-blue-50 dark:bg-blue-950/60 border border-blue-200/80 dark:border-blue-800 text-blue-700 dark:text-blue-300 text-xs font-bold tracking-wide uppercase mb-2">
              <ShieldCheck size={14} className="text-blue-600 dark:text-blue-400" />
              <span>{t.dash_admin_fw_subtitle || "Blue Economy Standard Architecture"}</span>
            </div>
            <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              {t.dash_admin_fw_heading || "Indikator & Framework Assessment"}
            </h2>
            <p className="text-slate-500 dark:text-slate-400 text-xs sm:text-sm mt-1">
              {t.dash_admin_fw_desc || "Kelola struktur hierarki standar kelautan nasional: Aspek → Outcome → Prinsip → Indikator → Pertanyaan Kuesioner."}
            </p>
          </div>

          <button
            onClick={() => setModal({ mode: "add" })}
            className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs transition-all shadow-lg shadow-blue-600/20 cursor-pointer shrink-0"
          >
            <Plus size={16} strokeWidth={2.5} />
            <span>{t.dash_admin_fw_add_new?.replace("{label}", TABS.find((tb) => tb.key === tab)?.countLabel ?? "") || `Tambah ${TABS.find((tb) => tb.key === tab)?.countLabel} Baru`}</span>
          </button>
        </div>

        {/* Tab Buttons */}
        <div className="mt-6 pt-5 border-t border-slate-100 dark:border-slate-800/80 flex flex-wrap gap-2">
          {TABS.map((t) => {
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
                <GitBranch size={14} className={isActive ? "text-white" : "text-slate-400"} />
                <span>{t.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* TailAdmin Table Card */}
      <div className="rounded-2xl border border-slate-200/80 bg-white shadow-2xs dark:border-slate-800 dark:bg-slate-900 overflow-hidden transition-colors">
        <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800/80 flex items-center justify-between bg-slate-50/40 dark:bg-slate-800/20">
          <span className="font-extrabold text-slate-800 dark:text-white text-sm">
            {t.dash_admin_fw_list_title?.replace("{label}", TABS.find((tb) => tb.key === tab)?.label ?? "").replace("{count}", String(getRows().length)) || `Daftar ${TABS.find((tb) => tb.key === tab)?.label} (${getRows().length})`}
          </span>
          <span className="text-xs font-semibold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/60 px-2.5 py-1 rounded-lg border border-blue-200/80 dark:border-blue-800">
            {t.dash_admin_fw_active_hierarchy?.replace("{label}", tab.toUpperCase()) || `Hierarki Aktif: ${tab.toUpperCase()}`}
          </span>
        </div>

        {isLoading ? (
          <div className="py-16">
            <LoadingSpinner />
          </div>
        ) : getRows().length === 0 ? (
          <div className="p-12 text-center">
            <p className="text-slate-500 dark:text-slate-400 font-medium text-sm">
              {t.dash_admin_fw_empty_desc?.replace("{label}", TABS.find((tb) => tb.key === tab)?.label ?? "") || `Belum ada data untuk kategori ${TABS.find((tb) => tb.key === tab)?.label}. Klik tombol tambah di atas.`}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/90 dark:bg-slate-800/60 border-b border-slate-100 dark:border-slate-800 text-[11px] font-extrabold text-slate-500 uppercase tracking-wider">
                  <th className="px-6 py-4">{t.dash_admin_fw_col_name || "Nama / Konten Item"}</th>
                  <th className="px-6 py-4">{t.dash_admin_fw_col_parent || "Keterangan / Induk Hierarki"}</th>
                  <th className="px-6 py-4">{t.dash_admin_fw_col_stats || "Statistik Sub-Item"}</th>
                  <th className="px-6 py-4 text-right">{t.dash_admin_fw_col_action || "Aksi Kelola"}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-sm font-medium text-slate-700 dark:text-slate-200">
                {getRows().map((row) => (
                  <tr
                    key={row.id}
                    className="hover:bg-blue-50/40 dark:hover:bg-slate-800/50 transition-colors duration-150"
                  >
                    <td className="px-6 py-4 max-w-md">
                      <p className="font-bold text-slate-800 dark:text-white text-sm leading-snug">
                        {row.main}
                      </p>
                      <span className="font-mono text-[11px] text-slate-400 block mt-0.5">
                        ID: #{row.id}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      {row.sub ? (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200/60 dark:border-slate-700">
                          {row.sub}
                        </span>
                      ) : (
                        <span className="text-xs text-slate-400 italic">{t.dash_admin_fw_root_level || "Level Root (Aspek)"}</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col gap-1.5">
                        {row.count !== undefined && (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-extrabold bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border border-blue-200/60 dark:border-blue-800 w-fit">
                            {row.count}
                          </span>
                        )}
                        {tab === "indicators" && (
                          <div className="flex flex-wrap gap-1 items-center">
                            <span className={cn(
                              "inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold w-fit",
                              (row as { hasAuditData?: boolean }).hasAuditData
                                ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/50 dark:text-emerald-300"
                                : "bg-amber-100 text-amber-700 dark:bg-amber-900/50 dark:text-amber-300"
                            )}>
                              {(row as { hasAuditData?: boolean }).hasAuditData ? ((t as unknown as Record<string, string>).admin_fw_badge_complete || "✓ Data Audit Lengkap") : ((t as unknown as Record<string, string>).admin_fw_badge_incomplete || "⚠ Audit Belum Lengkap")}
                            </span>
                            {(row as { isMandatory?: boolean }).isMandatory && (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold w-fit bg-red-100 text-red-700 dark:bg-red-900/50 dark:text-red-300 border border-red-200 dark:border-red-800">
                                ★ Mandatory Indicator
                              </span>
                            )}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => setModal({ mode: "edit", item: getInitial(row) })}
                          className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-blue-50 hover:bg-blue-600 text-blue-700 hover:text-white dark:bg-blue-500/10 dark:hover:bg-blue-600 dark:text-blue-300 dark:hover:text-white font-bold text-xs transition-all border border-blue-200/80 dark:border-blue-500/20 shadow-2xs cursor-pointer"
                        >
                          <Pencil size={13} />
                          <span>{t.dash_admin_master_btn_edit || "Edit"}</span>
                        </button>
                        <button
                          onClick={() => {
                            if (confirm(t.dash_admin_fw_confirm_delete || "Yakin ingin menghapus item framework ini?"))
                              deleteMutation.mutate(row.id);
                          }}
                          className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-rose-50 hover:bg-rose-600 text-rose-700 hover:text-white dark:bg-rose-950/60 dark:hover:bg-rose-600 dark:text-rose-300 dark:hover:text-white font-bold text-xs transition-all border border-rose-200/80 dark:border-rose-800 shadow-2xs cursor-pointer"
                        >
                          <Trash2 size={13} />
                          <span>{t.dash_admin_master_btn_delete || "Hapus"}</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal */}
      {modal && (
        <CrudModal
          title={
            modal.mode === "add"
              ? (t.dash_admin_fw_modal_add?.replace("{label}", TABS.find((tb) => tb.key === tab)?.countLabel ?? "") || `Tambah ${TABS.find((tb) => tb.key === tab)?.countLabel}`)
              : (t.dash_admin_fw_modal_edit?.replace("{label}", TABS.find((tb) => tb.key === tab)?.countLabel ?? "") || `Edit ${TABS.find((tb) => tb.key === tab)?.countLabel}`)
          }
          fields={fieldConfig[tab]}
          initial={modal.item}
          isPending={saveMutation.isPending}
          onClose={() => setModal(null)}
          onSave={(data) =>
            saveMutation.mutate({
              id: modal.item?.id ? parseInt(modal.item.id) : undefined,
              data,
            })
          }
        />
      )}
    </AppLayout>
  );
}
