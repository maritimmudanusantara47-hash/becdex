"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { AppLayout } from "@/components/layouts/AppLayout";
import { LoadingSpinner, EmptyState } from "@/components/ui/index";
import api from "@/lib/api";
import { formatDate } from "@/lib/utils";
import {
  Download as DownloadIcon, Plus, Trash2, Loader2, FileText, ExternalLink, X, ShieldCheck, Upload
} from "lucide-react";
import { useTranslation } from "@/store/lang";

interface DownloadItem {
  id: number;
  title: string;
  file_path: string;
  file_url: string;
  created_at: string;
}

interface UploadFormData {
  title: string;
  file: FileList;
}

export default function AdminDownloadsPage() {
  const { t } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const qc = useQueryClient();
  const { register, handleSubmit, reset, formState: { errors } } = useForm<UploadFormData>();

  const { data: downloadsData, isLoading } = useQuery({
    queryKey: ["admin-downloads"],
    queryFn: async () => {
      const res = await api.get("/admin/downloads");
      return res.data.data as DownloadItem[];
    },
  });

  const uploadMutation = useMutation({
    mutationFn: async (formData: FormData) => {
      await api.post("/admin/downloads", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
    },
    onSuccess: () => {
      toast.success(t.dash_admin_dl_toast_upload_success || "Berkas dokumen berhasil diunggah ke portal publik!");
      qc.invalidateQueries({ queryKey: ["admin-downloads"] });
      setIsOpen(false);
      reset();
    },
    onError: () => toast.error(t.dash_admin_dl_toast_upload_error || "Gagal mengunggah berkas dokumen."),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      await api.delete(`/admin/downloads/${id}`);
    },
    onSuccess: () => {
      toast.success(t.dash_admin_dl_toast_delete_success || "Berkas berhasil dihapus dari sistem!");
      qc.invalidateQueries({ queryKey: ["admin-downloads"] });
    },
    onError: () => toast.error(t.dash_admin_dl_toast_delete_error || "Gagal menghapus berkas dokumen."),
  });

  const handleUploadSubmit = (data: UploadFormData) => {
    const file = data.file[0];
    if (!file) {
      toast.error(t.dash_admin_dl_toast_no_file || "Mohon pilih berkas terlebih dahulu.");
      return;
    }
    const formData = new FormData();
    formData.append("title", data.title);
    formData.append("file", file);
    uploadMutation.mutate(formData);
  };

  const downloads = downloadsData ?? [];

  return (
    <AppLayout title={t.dash_admin_dl_title || "Kelola Unduhan Publik"}>
      {/* Top Header Card */}
      <div className="mb-6 rounded-2xl border border-slate-200/80 bg-white p-6 shadow-2xs dark:border-slate-800 dark:bg-slate-900 transition-colors">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-blue-50 dark:bg-blue-950/60 border border-blue-200/80 dark:border-blue-800 text-blue-700 dark:text-blue-300 text-xs font-bold tracking-wide uppercase mb-2">
              <ShieldCheck size={14} className="text-blue-600 dark:text-blue-400" />
              <span>{t.dash_admin_dl_subtitle || "Public Document Repository"}</span>
            </div>
            <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              {t.dash_admin_dl_heading || "Pusat Unduhan & Berkas Publik"}
            </h2>
            <p className="text-slate-500 dark:text-slate-400 text-xs sm:text-sm mt-1">
              {t.dash_admin_dl_desc || "Kelola berkas proposal, panduan teknis, dan formulir kuesioner yang dapat diunduh bebas oleh perusahaan di beranda."}
            </p>
          </div>

          <button
            onClick={() => setIsOpen(true)}
            className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs transition-all shadow-lg shadow-blue-600/20 cursor-pointer shrink-0"
          >
            <Plus size={16} strokeWidth={2.5} />
            <span>{t.dash_admin_dl_btn_upload || "Unggah Berkas Baru"}</span>
          </button>
        </div>
      </div>

      {/* TailAdmin Table Card */}
      <div className="rounded-2xl border border-slate-200/80 bg-white shadow-2xs dark:border-slate-800 dark:bg-slate-900 overflow-hidden transition-colors max-w-5xl">
        <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800/80 flex items-center justify-between bg-slate-50/40 dark:bg-slate-800/20">
          <span className="font-extrabold text-slate-800 dark:text-white text-sm">
            {t.dash_admin_dl_list_title?.replace("{count}", String(downloads.length)) || `Daftar Berkas Tersedia (${downloads.length})`}
          </span>
          <span className="text-xs font-semibold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/60 px-2.5 py-1 rounded-lg border border-blue-200/80 dark:border-blue-800">
            {t.dash_admin_dl_access_type || "Akses: Publik & Mitra"}
          </span>
        </div>

        {isLoading ? (
          <div className="py-16">
            <LoadingSpinner />
          </div>
        ) : downloads.length === 0 ? (
          <div className="p-12">
            <EmptyState
              icon={DownloadIcon}
              title={t.dash_admin_dl_empty_title || "Berkas Unduhan Belum Ada"}
              description={t.dash_admin_dl_empty_desc || "Saat ini belum ada dokumen atau panduan yang dibagikan. Klik tombol 'Unggah Berkas Baru' di atas."}
            />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/90 dark:bg-slate-800/60 border-b border-slate-100 dark:border-slate-800 text-[11px] font-extrabold text-slate-500 uppercase tracking-wider">
                  <th className="px-6 py-4">{t.dash_admin_dl_col_name || "Nama Dokumen & Judul"}</th>
                  <th className="px-6 py-4">{t.dash_admin_dl_col_path || "Penyimpanan / Path Berkas"}</th>
                  <th className="px-6 py-4">{t.dash_admin_dl_col_date || "Tanggal Unggah"}</th>
                  <th className="px-6 py-4 text-right">{t.dash_admin_dl_col_action || "Tindakan"}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-sm font-medium text-slate-700 dark:text-slate-200">
                {downloads.map((d) => (
                  <tr
                    key={d.id}
                    className="hover:bg-blue-50/40 dark:hover:bg-slate-800/50 transition-colors duration-150"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300 flex items-center justify-center font-bold text-xs shrink-0 shadow-2xs">
                          <FileText size={17} />
                        </div>
                        <div>
                          <p className="font-bold text-slate-800 dark:text-white text-sm">
                            {d.title}
                          </p>
                          <span className="text-[11px] text-slate-400 font-mono block mt-0.5">
                            Doc ID: #{d.id}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-xs font-mono text-slate-500 dark:text-slate-400 max-w-xs truncate font-normal">
                      {d.file_path}
                    </td>
                    <td className="px-6 py-4 text-xs text-slate-500 font-normal">
                      {formatDate(d.created_at)}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <a
                          href={d.file_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-blue-50 hover:bg-blue-600 text-blue-700 hover:text-white dark:bg-blue-500/10 dark:hover:bg-blue-600 dark:text-blue-300 dark:hover:text-white font-bold text-xs transition-all border border-blue-200/80 dark:border-blue-500/20 shadow-2xs"
                        >
                          <ExternalLink size={13} />
                          <span>{t.dash_admin_dl_btn_download || "Unduh / Buka"}</span>
                        </a>
                        <button
                          onClick={() => {
                            if (confirm(t.dash_admin_dl_confirm_delete?.replace("{title}", d.title) || `Yakin ingin menghapus berkas "${d.title}"?`))
                              deleteMutation.mutate(d.id);
                          }}
                          className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-rose-50 hover:bg-rose-600 text-rose-700 hover:text-white dark:bg-rose-950/60 dark:hover:bg-rose-600 dark:text-rose-300 dark:hover:text-white font-bold text-xs transition-all border border-rose-200/80 dark:border-rose-800 shadow-2xs cursor-pointer"
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

      {/* Upload Modal */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl w-full max-w-md shadow-2xl border border-slate-200/80 dark:border-slate-800 overflow-hidden flex flex-col animate-in fade-in zoom-in-95 duration-200">
            <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-800/40">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-blue-100 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold">
                  <Upload size={18} />
                </div>
                <h3 className="font-extrabold text-slate-900 dark:text-white text-base">{t.dash_admin_dl_modal_title || "Unggah Dokumen Publik"}</h3>
              </div>
              <button
                onClick={() => { setIsOpen(false); reset(); }}
                className="p-1.5 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSubmit(handleUploadSubmit)} className="p-6 space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                  {t.dash_admin_dl_modal_fld_title || "Judul Berkas Dokumen"}
                </label>
                <input
                  {...register("title", { required: t.dash_admin_dl_err_title_req || "Judul dokumen wajib diisi" })}
                  type="text"
                  placeholder={t.dash_admin_dl_placeholder_title || "Contoh: Proposal Kemitraan BECdex Indonesia 2026"}
                  className="w-full border border-slate-200/80 dark:border-slate-700 rounded-xl px-3.5 py-2.5 font-medium text-slate-800 dark:text-white bg-slate-50/50 dark:bg-slate-800/80 focus:bg-white focus:border-blue-500 focus:outline-hidden transition-all shadow-2xs"
                />
                {errors.title && (
                  <p className="text-rose-500 font-bold text-[11px] mt-1">{errors.title.message}</p>
                )}
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                  {t.dash_admin_dl_modal_fld_file || "Pilih Berkas (.PDF / .JPG / .PNG, Max 15MB)"}
                </label>
                <input
                  {...register("file", { required: t.dash_admin_dl_err_file_req || "Berkas wajib diunggah" })}
                  type="file"
                  accept=".pdf,.jpg,.jpeg,.png"
                  className="w-full font-medium text-slate-500 file:mr-4 file:py-2.5 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-blue-50 file:text-blue-700 dark:file:bg-blue-950/60 dark:file:text-blue-300 hover:file:bg-blue-100 dark:hover:file:bg-blue-900 transition-all cursor-pointer"
                />
                {errors.file && (
                  <p className="text-rose-500 font-bold text-[11px] mt-1">{errors.file.message}</p>
                )}
              </div>

              <div className="flex justify-end gap-2.5 pt-4 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => { setIsOpen(false); reset(); }}
                  className="px-4 py-2.5 border border-slate-200/80 dark:border-slate-700 rounded-xl font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all cursor-pointer"
                >
                  {t.dash_admin_master_modal_cancel || "Batal"}
                </button>
                <button
                  type="submit"
                  disabled={uploadMutation.isPending}
                  className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold shadow-md shadow-blue-600/15 disabled:opacity-60 transition-all cursor-pointer"
                >
                  {uploadMutation.isPending && <Loader2 size={14} className="animate-spin" />}
                  <span>{t.dash_admin_dl_btn_submit || "Mulai Unggah"}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AppLayout>
  );
}
