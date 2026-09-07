"use client";

import { useQuery, useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { AppLayout } from "@/components/layouts/AppLayout";
import { LoadingSpinner } from "@/components/ui/index";
import api from "@/lib/api";
import { useState } from "react";
import { Loader2, Save, ShieldCheck, CreditCard, KeyRound, Eye, EyeOff } from "lucide-react";
import { MdLightbulb } from "react-icons/md";
import { useTranslation } from "@/store/lang";
import { useAdminRouteGuard } from "@/hooks/useAdminRouteGuard";

interface SettingsData {
  payment_amount: string;
  xendit_secret_key: string;
  xendit_webhook_token: string;
}

export default function AdminSettingsPage() {
  const [showSecretKey, setShowSecretKey] = useState(false);
  const { t } = useTranslation();
  const { authorized } = useAdminRouteGuard({ guard: "super_admin" });

  const { data, isLoading } = useQuery({
    queryKey: ["admin-settings"],
    queryFn: async () => {
      const res = await api.get("/admin/settings");
      return res.data;
    },
    enabled: authorized,
  });

  const { register, handleSubmit, formState: { isSubmitting } } = useForm<SettingsData>({
    values: {
      payment_amount: data?.data?.payment_amount?.value ?? "",
      xendit_secret_key: data?.data?.xendit_secret_key?.value ?? "",
      xendit_webhook_token: data?.data?.xendit_webhook_token?.value ?? "",
    },
  });

  const mutation = useMutation({
    mutationFn: async (formData: SettingsData) => {
      await api.put("/admin/settings", formData);
    },
    onSuccess: () => toast.success(t.dash_admin_settings_toast_success || "Pengaturan sistem & payment gateway berhasil disimpan!"),
    onError: () => toast.error(t.dash_admin_settings_toast_error || "Gagal menyimpan pengaturan sistem."),
  });

  // Early return setelah semua hooks — React Rules of Hooks
  if (!authorized) return null;

  if (isLoading) {
    return (
      <AppLayout title={t.dash_admin_settings_title || "Pengaturan Sistem"}>
        <div className="py-20">
          <LoadingSpinner />
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout title={t.dash_admin_settings_title_main || "Pengaturan & Konfigurasi Sistem"}>
      {/* Top Header Card */}
      <div className="mb-6 rounded-2xl border border-slate-200/80 bg-white p-6 shadow-2xs dark:border-slate-800 dark:bg-slate-900 transition-colors max-w-3xl">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-blue-50 dark:bg-blue-950/60 border border-blue-200/80 dark:border-blue-800 text-blue-700 dark:text-blue-300 text-xs font-bold tracking-wide uppercase mb-2">
              <ShieldCheck size={14} className="text-blue-600 dark:text-blue-400" />
              <span>{t.dash_admin_settings_subtitle || "System & Gateway Configurations"}</span>
            </div>
            <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              {t.dash_admin_settings_heading || "Konfigurasi Payment Gateway & Sistem"}
            </h2>
            <p className="text-slate-500 dark:text-slate-400 text-xs sm:text-sm mt-1">
              {t.dash_admin_settings_desc || "Atur nominal biaya pendaftaran asesmen BECdex dan kelola kunci rahasia integrasi Midtrans / Xendit API."}
            </p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit((d) => mutation.mutate(d))} className="space-y-6 max-w-3xl">
        {/* Payment Configuration Card */}
        <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-2xs dark:border-slate-800 dark:bg-slate-900 transition-colors">
          <div className="flex items-center gap-3 mb-5 pb-4 border-b border-slate-100 dark:border-slate-800">
            <div className="w-10 h-10 rounded-xl bg-blue-100 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold">
              <CreditCard size={20} />
            </div>
            <div>
              <h3 className="font-extrabold text-slate-900 dark:text-white text-base">
                {t.dash_admin_settings_fee_title || "Biaya Asesmen & Sertifikasi"}
              </h3>
              <p className="text-xs text-slate-400">
                {t.dash_admin_settings_fee_desc || "Nominal tagihan invoice otomatis yang dikirim ke pengaju"}
              </p>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">
              {t.dash_admin_settings_fee_label || "Biaya Sertifikasi (Rupiah / IDR)"}
            </label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">
                Rp
              </span>
              <input
                {...register("payment_amount")}
                type="number"
                min="1"
                placeholder="100000"
                className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200/80 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/80 text-sm font-bold text-slate-800 dark:text-white focus:bg-white focus:border-blue-500 focus:outline-hidden transition-all shadow-2xs"
              />
            </div>
            <p className="text-xs text-slate-400 dark:text-slate-500 mt-1.5 flex items-start gap-1">
              <MdLightbulb className="w-4 h-4 text-amber-500 shrink-0" />
              <span>{t.dash_admin_settings_fee_hint || "Nominal ini akan otomatis diterapkan untuk setiap transaksi pengajuan sertifikasi baru."}</span>
            </p>
          </div>
        </div>

        {/* API Gateway Card */}
        <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-2xs dark:border-slate-800 dark:bg-slate-900 transition-colors">
          <div className="flex items-center gap-3 mb-5 pb-4 border-b border-slate-100 dark:border-slate-800">
            <div className="w-10 h-10 rounded-xl bg-blue-100 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold">
              <KeyRound size={20} />
            </div>
            <div>
              <h3 className="font-extrabold text-slate-900 dark:text-white text-base">
                {t.dash_admin_settings_api_title || "Konfigurasi API Xendit"}
              </h3>
              <p className="text-xs text-slate-400">
                {t.dash_admin_settings_api_desc || "Kunci autentikasi server-to-server untuk penerbitan Virtual Account & e-Wallet"}
              </p>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">
                {t.dash_admin_settings_api_secret_label || "Secret API Key (Production / Sandbox)"}
              </label>
              <div className="relative">
                <input
                  {...register("xendit_secret_key")}
                  type={showSecretKey ? "text" : "password"}
                  placeholder="xnd_development_..."
                  className="w-full pl-4 pr-12 py-3 rounded-xl border border-slate-200/80 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/80 font-mono text-xs text-slate-800 dark:text-white focus:bg-white focus:border-blue-500 focus:outline-hidden transition-all shadow-2xs"
                />
                <button
                  type="button"
                  onClick={() => setShowSecretKey(!showSecretKey)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                >
                  {showSecretKey ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-1.5">
                {t.dash_admin_settings_api_secret_hint || "Pastikan Secret Key memiliki izin Write & Read untuk layanan Invoice / Virtual Account."}
              </p>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">
                {t.dash_admin_settings_api_webhook_label || "Webhook Token / Callback Verification Key"}
              </label>
              <input
                {...register("xendit_webhook_token")}
                type="text"
                placeholder={t.dash_admin_settings_api_webhook_placeholder || "Token verifikasi webhook..."}
                className="w-full px-4 py-3 rounded-xl border border-slate-200/80 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/80 font-mono text-xs text-slate-800 dark:text-white focus:bg-white focus:border-blue-500 focus:outline-hidden transition-all shadow-2xs"
              />
              <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-1.5">
                {t.dash_admin_settings_api_webhook_hint || "Digunakan oleh backend untuk memvalidasi tanda tangan kriptografi dari notifikasi pembayaran masuk."}
              </p>
            </div>
          </div>
        </div>

        <button
          type="submit"
          disabled={isSubmitting || mutation.isPending}
          className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-6 py-3.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-xs tracking-wide uppercase transition-all shadow-lg shadow-blue-600/20 disabled:opacity-60 cursor-pointer"
        >
          {isSubmitting || mutation.isPending ? (
            <>
              <Loader2 size={16} className="animate-spin" />
              <span>{t.dash_admin_settings_btn_saving || "Menyimpan Konfigurasi..."}</span>
            </>
          ) : (
            <>
              <Save size={16} />
              <span>{t.dash_admin_settings_btn_save || "Simpan Pengaturan Sistem"}</span>
            </>
          )}
        </button>
      </form>
    </AppLayout>
  );
}
