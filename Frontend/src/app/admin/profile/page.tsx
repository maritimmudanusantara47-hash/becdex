"use client";

import { useAuthStore } from "@/store/auth";
import { AppLayout } from "@/components/layouts/AppLayout";
import { useForm } from "react-hook-form";
import { useMutation } from "@tanstack/react-query";
import api from "@/lib/api";
import { toast } from "sonner";
import { Loader2, Save, UserCircle, KeyRound, Camera } from "lucide-react";
import { useState, useRef } from "react";
import { ActiveSessions } from "@/components/profile/ActiveSessions";

import { useTranslation } from "@/store/lang";

export default function AdminProfilePage() {
  const { t } = useTranslation();
  const { user, setUser } = useAuthStore();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  const getImageUrl = (imagePath: string | null | undefined) => {
    if (!imagePath) return "";
    if (imagePath.startsWith("http")) return imagePath;
    const baseUrl = (process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000").replace(/\/api\/?$/, '');
    return `${baseUrl}/storage/${imagePath}`;
  };

  const { register, handleSubmit } = useForm({
    defaultValues: {
      name: user?.name || "",
      password: "",
      password_confirmation: "",
    },
  });

  const photoMutation = useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append("image", file);
      const res = await api.post("/auth/profile/photo", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      return res.data;
    },
    onSuccess: (res) => {
      setUser(res.data);
      toast.success(t.dash_admin_profile_toast_photo_success || "Foto profil berhasil diperbarui!");
    },
    onError: (err: unknown) => {
      const error = err as { response?: { data?: { message?: string } } };
      toast.error(error.response?.data?.message || t.dash_admin_profile_toast_photo_error || "Gagal mengunggah foto profil.");
      setPreviewImage(null);
    },
  });

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setPreviewImage(URL.createObjectURL(file));
      photoMutation.mutate(file);
    }
  };

  const profileMutation = useMutation({
    mutationFn: async (data: Record<string, string>) => {
      if (data.password && data.password !== data.password_confirmation) {
        throw new Error(t.dash_admin_profile_err_pass_match || "Password konfirmasi tidak cocok.");
      }
      const payload: Record<string, string> = { name: data.name };
      if (data.password) {
        payload.password = data.password;
      }
      const res = await api.put("/auth/profile", payload);
      return res.data;
    },
    onSuccess: (res) => {
      setUser(res.data);
      toast.success(t.dash_admin_profile_toast_success || "Profil berhasil diperbarui!");
    },
    onError: (err: unknown) => {
      const error = err as { message?: string; response?: { data?: { message?: string } } };
      toast.error(error.message || error.response?.data?.message || t.dash_admin_profile_toast_error || "Gagal memperbarui profil.");
    },
  });

  return (
    <AppLayout title={t.dash_admin_profile_title || "Profil Admin"}>
      {/* Top Header Card */}
      <div className="mb-6 rounded-2xl border border-slate-200/80 bg-white p-6 shadow-2xs dark:border-slate-800 dark:bg-slate-900 transition-colors max-w-3xl">
        <div className="flex flex-col md:flex-row md:items-center gap-6">
          <div className="relative group shrink-0">
            <div className="w-24 h-24 rounded-2xl overflow-hidden bg-slate-100 dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 relative">
              {previewImage || user?.image ? (
                /* eslint-disable-next-line @next/next/no-img-element */
                <img
                  src={previewImage || getImageUrl(user?.image)}
                  alt="Profile"
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-slate-400">
                  <UserCircle size={48} />
                </div>
              )}
              {photoMutation.isPending && (
                <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                  <Loader2 className="animate-spin text-white" />
                </div>
              )}
            </div>
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={photoMutation.isPending}
              className="absolute -bottom-2 -right-2 w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center border-2 border-white dark:border-slate-900 shadow-lg hover:bg-blue-700 transition-colors cursor-pointer"
            >
              <Camera size={14} />
            </button>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handlePhotoChange}
              accept="image/*"
              className="hidden"
            />
          </div>
          <div>
            <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-blue-50 dark:bg-blue-950/60 border border-blue-200/80 dark:border-blue-800 text-blue-700 dark:text-blue-300 text-xs font-bold tracking-wide uppercase mb-2">
              <span>{user?.role?.name || (t.dash_admin_profile_lbl_admin || "Admin")} Profile</span>
            </div>
            <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              {user?.name || (t.dash_admin_profile_lbl_administrator || "Administrator")}
            </h2>
            <p className="text-slate-500 dark:text-slate-400 text-xs sm:text-sm mt-1">
              {user?.email}
            </p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit((d) => profileMutation.mutate(d))} className="space-y-6 max-w-3xl">
        <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-2xs dark:border-slate-800 dark:bg-slate-900 transition-colors">
          <div className="flex items-center gap-3 mb-5 pb-4 border-b border-slate-100 dark:border-slate-800">
            <div className="w-10 h-10 rounded-xl bg-blue-100 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold">
              <UserCircle size={20} />
            </div>
            <div>
              <h3 className="font-extrabold text-slate-900 dark:text-white text-base">
                {t.dash_admin_profile_info_title || "Informasi Pribadi"}
              </h3>
              <p className="text-xs text-slate-400">
                {t.dash_admin_profile_info_desc || "Perbarui nama lengkap dan kata sandi akun Anda."}
              </p>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">
                {t.dash_admin_profile_lbl_name || "Nama Lengkap"}
              </label>
              <input
                {...register("name", { required: true })}
                type="text"
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200/80 bg-slate-50/50 text-sm text-slate-800 focus:bg-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none dark:border-slate-700 dark:bg-slate-800/80 dark:text-white transition-all shadow-2xs"
                placeholder={t.dash_admin_profile_placeholder_name || "Masukkan nama lengkap"}
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">
                {t.dash_admin_profile_lbl_email || "Email"}
              </label>
              <input
                type="text"
                value={user?.email || ""}
                disabled
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200/80 bg-slate-100 text-sm text-slate-500 cursor-not-allowed dark:border-slate-700 dark:bg-slate-800/50 transition-all shadow-2xs"
              />
              <p className="text-[11px] text-slate-400 mt-1">{t.dash_admin_profile_email_hint || "Email tidak dapat diubah karena merupakan identitas utama login."}</p>
            </div>
          </div>

          <div className="mt-8 mb-5 pb-4 border-b border-slate-100 dark:border-slate-800 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-rose-100 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 flex items-center justify-center font-bold">
              <KeyRound size={20} />
            </div>
            <div>
              <h3 className="font-extrabold text-slate-900 dark:text-white text-base">
                {t.dash_admin_profile_sec_title || "Keamanan & Password"}
              </h3>
              <p className="text-xs text-slate-400">
                {t.dash_admin_profile_sec_desc || "Biarkan kosong jika Anda tidak ingin mengubah password."}
              </p>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">
                {t.dash_admin_profile_lbl_new_pass || "Password Baru"}
              </label>
              <input
                {...register("password")}
                type="password"
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200/80 bg-slate-50/50 text-sm text-slate-800 focus:bg-white focus:border-rose-500 focus:ring-1 focus:ring-rose-500 focus:outline-none dark:border-slate-700 dark:bg-slate-800/80 dark:text-white transition-all shadow-2xs"
                placeholder={t.dash_admin_profile_placeholder_pass || "Minimal 8 karakter"}
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">
                {t.dash_admin_profile_lbl_conf_pass || "Konfirmasi Password Baru"}
              </label>
              <input
                {...register("password_confirmation")}
                type="password"
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200/80 bg-slate-50/50 text-sm text-slate-800 focus:bg-white focus:border-rose-500 focus:ring-1 focus:ring-rose-500 focus:outline-none dark:border-slate-700 dark:bg-slate-800/80 dark:text-white transition-all shadow-2xs"
                placeholder={t.dash_admin_profile_placeholder_conf || "Ulangi password baru"}
              />
            </div>
          </div>

          <div className="mt-8 flex justify-end">
            <button
              type="submit"
              disabled={profileMutation.isPending}
              className="inline-flex items-center gap-2 px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm rounded-xl shadow-md shadow-blue-600/20 transition-all cursor-pointer disabled:opacity-50"
            >
              {profileMutation.isPending ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
              {t.dash_admin_content_btn_save || "Simpan Perubahan"}
            </button>
          </div>
        </div>
      </form>
      
      {/* Active Sessions Component */}
      <ActiveSessions />
    </AppLayout>
  );
}
