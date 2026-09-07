"use client";

import { useState, useEffect } from "react";
import api from "@/lib/api";
import { toast } from "sonner";
import { Save, Loader2, Image as ImageIcon, AlertTriangle, RefreshCcw } from "lucide-react";
import { AppLayout } from "@/components/layouts/AppLayout";
import dynamic from "next/dynamic";
import "react-quill-new/dist/quill.snow.css";
import { useTranslation } from "@/store/lang";

const ReactQuill = dynamic(() => import("react-quill-new"), { ssr: false });

type ContentItem = {
  id: number;
  key: string;
  group: string;
  label?: string | null;
  type: string;
  value_en: string | string[] | null;
  value_id: string | string[] | null;
  default_value_en?: string | string[] | null;
  default_value_id?: string | string[] | null;
};

export default function ContentManagementPage() {
  const { t } = useTranslation();
  const [contents, setContents] = useState<ContentItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<string>("home");
  const [isDirty, setIsDirty] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [pendingTab, setPendingTab] = useState<string | null>(null);
  const [showResetModal, setShowResetModal] = useState(false);
  const [pendingResetId, setPendingResetId] = useState<number | null>(null);

  const groups = [
    { id: "home", label: t.dash_admin_content_tab_home || "Beranda" },
    { id: "about", label: t.dash_admin_content_tab_about || "About" },
    { id: "explore", label: t.dash_admin_content_tab_explore || "Explore & States" },
    { id: "global", label: t.dash_admin_content_tab_global || "Global & Footer" },
  ];

  useEffect(() => {
    const fetchContents = async () => {
      try {
        const response = await api.get("/admin/cms");
        setContents(response.data);
      } catch {
        toast.error(t.dash_admin_content_toast_fetch_error || "Gagal mengambil data konten CMS");
      } finally {
        setLoading(false);
      }
    };
    fetchContents();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (isDirty) {
        e.preventDefault();
        e.returnValue = '';
      }
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [isDirty]);

  const handleTabChange = (groupId: string) => {
    if (isDirty) {
      setPendingTab(groupId);
      setShowConfirmModal(true);
    } else {
      setActiveTab(groupId);
    }
  };

  const handleTextChange = (id: number, lang: "en" | "id", value: string, isArray: boolean = false, skipDirty: boolean = false) => {
    if (!skipDirty) {
      setIsDirty(true);
    }
    setContents(prev => prev.map(item => {
      if (item.id === id) {
        if (isArray) {
          const arr = value.split('\n').filter(line => line.trim() !== '');
          return { ...item, [`value_${lang}`]: arr };
        }
        return { ...item, [`value_${lang}`]: value };
      }
      return item;
    }));
  };

  const handleImageUpload = async (id: number, file: File) => {
    const formData = new FormData();
    formData.append('image', file);

    const toastId = toast.loading(t.dash_admin_content_toast_uploading || "Mengunggah gambar...");
    try {
      const res = await api.post(`/admin/cms/${id}/image`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      toast.success(t.dash_admin_content_toast_upload_success || "Gambar berhasil diunggah", { id: toastId });
      
      setContents(prev => prev.map(item => {
        if (item.id === id) {
          return { ...item, value_en: res.data.path, value_id: res.data.path };
        }
        return item;
      }));
    } catch {
      toast.error(t.dash_admin_content_toast_upload_error || "Gagal mengunggah gambar", { id: toastId });
    }
  };

  const saveChanges = async () => {
    setSaving(true);
    try {
      const currentTabContents = contents.filter(c => c.group === activeTab);
      await api.put("/admin/cms", { contents: currentTabContents });
      toast.success(t.dash_admin_content_toast_save_success || "Konten berhasil diperbarui");
      setIsDirty(false);
    } catch {
      toast.error(t.dash_admin_content_toast_save_error || "Gagal menyimpan perubahan");
    } finally {
      setSaving(false);
    }
  };

  const handleResetItem = (id: number) => {
    setPendingResetId(id);
    setShowResetModal(true);
  };

  const confirmResetItem = () => {
    if (pendingResetId) {
      setIsDirty(true);
      setContents(prev => prev.map(item => {
        if (item.id === pendingResetId) {
          return {
            ...item,
            value_en: item.default_value_en !== undefined ? item.default_value_en : item.value_en,
            value_id: item.default_value_id !== undefined ? item.default_value_id : item.value_id
          };
        }
        return item;
      }));
    }
    setShowResetModal(false);
    setPendingResetId(null);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="animate-spin text-blue-600" size={32} />
      </div>
    );
  }

  const currentContents = contents.filter(c => c.group === activeTab);

  return (
    <AppLayout title={t.dash_admin_content_title || "Kelola Konten Web"}>
      <div className="p-6 max-w-7xl mx-auto space-y-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 dark:text-white">{t.dash_admin_content_title || "Kelola Konten Web"}</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">{t.dash_admin_content_desc || "Ubah teks dan gambar halaman publik langsung dari sini."}</p>
        </div>
        <button
          onClick={saveChanges}
          disabled={saving}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl text-sm font-medium transition-colors disabled:opacity-70 shadow-sm shadow-blue-500/30"
        >
          {saving ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
          {t.dash_admin_content_btn_save || "Simpan Perubahan"}
        </button>
      </div>

      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm">
        <div className="flex overflow-x-auto border-b border-slate-200 dark:border-slate-800">
          {groups.map(group => (
            <button
              key={group.id}
              onClick={() => handleTabChange(group.id)}
              className={`px-6 py-4 text-sm font-semibold whitespace-nowrap border-b-2 transition-colors ${
                activeTab === group.id
                  ? "border-blue-600 text-blue-600 dark:text-blue-400"
                  : "border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-300"
              }`}
            >
              {group.label}
            </button>
          ))}
        </div>

        <div className="p-6 space-y-10">
          {currentContents.map((item) => (
            <div key={item.id} className="border border-slate-100 dark:border-slate-800 rounded-xl p-5 bg-slate-50/50 dark:bg-slate-900/50">
              <div className="flex justify-between items-center mb-4 border-b pb-2">
                <div>
                  <h3 className="font-bold text-slate-800 dark:text-slate-200 text-base">{item.label || item.key}</h3>
                  <p className="font-mono text-[10px] text-slate-400 mt-1">{t.dash_admin_content_lbl_key || "Kunci:"} {item.key}</p>
                </div>
                <button
                  onClick={() => handleResetItem(item.id)}
                  className="text-xs font-medium text-slate-500 hover:text-red-600 transition-colors bg-white dark:bg-slate-800 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 shadow-sm"
                >
                  {t.dash_admin_content_btn_reset || "Reset ke Bawaan"}
                </button>
              </div>
              
              {item.type === 'image' ? (
                <div className="flex flex-col gap-3">
                  {item.value_en && (
                    <div className="relative w-64 h-32 rounded-lg overflow-hidden border border-slate-200">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={`${process.env.NEXT_PUBLIC_API_URL?.replace(/\/api\/?$/, '')}/storage/${item.value_en}`} alt={item.key} className="object-cover w-full h-full" />
                    </div>
                  )}
                  <label className="cursor-pointer flex items-center justify-center gap-2 border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-xl py-6 px-4 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors w-full md:w-1/2">
                    <ImageIcon size={24} className="text-slate-400" />
                    <span className="text-sm text-slate-600 font-medium">{t.dash_admin_content_btn_upload || "Upload Gambar Baru"}</span>
                    <input 
                      type="file" 
                      accept="image/*" 
                      className="hidden" 
                      onChange={(e) => {
                        if (e.target.files && e.target.files[0]) {
                          handleImageUpload(item.id, e.target.files[0]);
                        }
                      }}
                    />
                  </label>
                </div>
              ) : (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-2">
                      <span className="w-5 h-5 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-[10px]">EN</span>
                      {t.dash_admin_content_lbl_en || "English"}
                    </label>
                    {item.type === 'html' ? (
                      <div className="bg-white dark:bg-slate-800 rounded-xl overflow-hidden border border-slate-200 dark:border-slate-700">
                        <ReactQuill 
                          theme="snow"
                          value={(item.value_en as string) || ''}
                          onChange={(val, delta, source) => handleTextChange(item.id, 'en', val, false, source !== 'user')}
                          className="h-48 mb-12"
                        />
                      </div>
                    ) : item.type === 'text' ? (
                      <input
                        type="text"
                        value={item.value_en || ''}
                        onChange={(e) => handleTextChange(item.id, 'en', e.target.value)}
                        className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                      />
                    ) : item.type === 'json_array' ? (
                      <textarea
                        value={Array.isArray(item.value_en) ? item.value_en.join('\n') : (item.value_en || '')}
                        onChange={(e) => handleTextChange(item.id, 'en', e.target.value, true)}
                        rows={6}
                        placeholder={t.dash_admin_content_placeholder_array || "Pisahkan setiap baris dengan Enter (baris baru)"}
                        className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                      />
                    ) : (
                      <textarea
                        value={(item.value_en as string) || ''}
                        onChange={(e) => handleTextChange(item.id, 'en', e.target.value)}
                        rows={4}
                        className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                      />
                    )}
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-2">
                      <span className="w-5 h-5 rounded-full bg-red-100 text-red-700 flex items-center justify-center text-[10px]">ID</span>
                      {t.dash_admin_content_lbl_id || "Bahasa Indonesia"}
                    </label>
                    {item.type === 'html' ? (
                      <div className="bg-white dark:bg-slate-800 rounded-xl overflow-hidden border border-slate-200 dark:border-slate-700">
                        <ReactQuill 
                          theme="snow"
                          value={(item.value_id as string) || ''}
                          onChange={(val, delta, source) => handleTextChange(item.id, 'id', val, false, source !== 'user')}
                          className="h-48 mb-12"
                        />
                      </div>
                    ) : item.type === 'text' ? (
                      <input
                        type="text"
                        value={item.value_id || ''}
                        onChange={(e) => handleTextChange(item.id, 'id', e.target.value)}
                        className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                      />
                    ) : item.type === 'json_array' ? (
                      <textarea
                        value={Array.isArray(item.value_id) ? item.value_id.join('\n') : (item.value_id || '')}
                        onChange={(e) => handleTextChange(item.id, 'id', e.target.value, true)}
                        rows={6}
                        placeholder={t.dash_admin_content_placeholder_array || "Pisahkan setiap baris dengan Enter (baris baru)"}
                        className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                      />
                    ) : (
                      <textarea
                        value={(item.value_id as string) || ''}
                        onChange={(e) => handleTextChange(item.id, 'id', e.target.value)}
                        rows={4}
                        className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                      />
                    )}
                  </div>
                </div>
              )}
            </div>
          ))}

          {currentContents.length === 0 && (
            <div className="text-center py-12 text-slate-500">
              {t.dash_admin_content_empty || "Tidak ada konten yang dapat diedit di bagian ini."}
            </div>
          )}
        </div>
      </div>
      </div>

      {/* Unsaved Changes Modal */}
      {showConfirmModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-xl w-full max-w-md overflow-hidden transform transition-all border border-slate-200 dark:border-slate-800">
            <div className="p-6">
              <div className="flex items-start gap-4 mb-4">
                <div className="w-12 h-12 rounded-full bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center shrink-0">
                  <AlertTriangle className="text-amber-600 dark:text-amber-500" size={24} />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white">{t.dash_admin_content_modal_unsaved_title || "Perubahan Belum Disimpan"}</h3>
                  <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                    {t.dash_admin_content_modal_unsaved_desc || "Anda memiliki perubahan teks yang belum disimpan. Yakin ingin berpindah tab sekarang?"}
                  </p>
                </div>
              </div>
              <div className="flex items-center justify-end gap-3 mt-8">
                <button
                  onClick={() => {
                    setShowConfirmModal(false);
                    setPendingTab(null);
                  }}
                  className="px-4 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800 rounded-xl transition-colors"
                >
                  {t.dash_admin_master_modal_cancel || "Batal"}
                </button>
                <button
                  onClick={() => {
                    setShowConfirmModal(false);
                    if (pendingTab) {
                      setActiveTab(pendingTab);
                    }
                  }}
                  className="px-5 py-2.5 text-sm font-semibold bg-amber-500 hover:bg-amber-600 text-white rounded-xl shadow-sm shadow-amber-500/30 transition-colors"
                >
                  {t.dash_admin_content_modal_unsaved_btn || "Tetap Pindah Tab"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Reset Confirmation Modal */}
      {showResetModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-xl w-full max-w-sm overflow-hidden transform transition-all border border-slate-200 dark:border-slate-800">
            <div className="p-6 text-center">
              <div className="mx-auto w-12 h-12 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center mb-4">
                <RefreshCcw className="text-red-600 dark:text-red-500" size={24} />
              </div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">{t.dash_admin_content_modal_reset_title || "Reset ke Bawaan?"}</h3>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-2">
                {t.dash_admin_content_modal_reset_desc || "Tindakan ini akan mengembalikan konten ini ke pengaturan awal sistem. Data ini tidak dapat dipulihkan jika belum disimpan."}
              </p>
              <div className="flex items-center justify-center gap-3 mt-8">
                <button
                  onClick={() => setShowResetModal(false)}
                  className="px-4 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800 rounded-xl transition-colors"
                >
                  {t.dash_admin_master_modal_cancel || "Batal"}
                </button>
                <button
                  onClick={confirmResetItem}
                  className="px-5 py-2.5 text-sm font-semibold bg-red-600 hover:bg-red-700 text-white rounded-xl shadow-sm shadow-red-600/30 transition-colors"
                >
                  {t.dash_admin_content_modal_reset_btn || "Ya, Reset"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </AppLayout>
  );
}
