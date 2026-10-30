"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { MdCheckCircle } from "react-icons/md";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { AppLayout } from "@/components/layouts/AppLayout";
import { LoadingSpinner, restartOnboardingTour, UserAvatar } from "@/components/ui/index";
import { AddressAutocompleteInput } from "@/components/ui/AddressAutocompleteInput";
import { formatSmartAddress } from "@/lib/formatAddress";
import { ActiveSessions } from "@/components/profile/ActiveSessions";
import { useAuthStore } from "@/store/auth";
import api from "@/lib/api";
import { User } from "@/types";

import { Save, Loader2, Building, User as UserIcon, Mail, Phone, Briefcase, Camera, Globe, MapPin, AlignLeft, FileText, Download, Info, Key, Eye, EyeOff, Compass } from "lucide-react";
import { useRef, useState, useMemo } from "react";
import { useTranslation } from "@/store/lang";
import { getSectorLabel, SectorLookupItem, DEFAULT_COUNTRIES, DEFAULT_SECTORS } from "@/constants/sectors";

interface ProfileFormData {
  name: string;
  brand_name: string;
  company_phone: string;
  company_country: string;
  company_field_id: string;
  description: string;
  description_en?: string;
  address: string;
  street_address: string;
  province: string;
  city: string;
  district: string;
  postal_code: string;
  latitude: number | null;
  longitude: number | null;
  website: string;
  pic_name: string;
  pic_position: string;
  pic_email: string;
  pic_phone: string;
  [key: string]: unknown;
}

export default function ProfilePage() {
  const router = useRouter();
  const { setUser } = useAuthStore();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const legalDocRef = useRef<HTMLInputElement>(null);
  const orgChartRef = useRef<HTMLInputElement>(null);
  const queryClient = useQueryClient();

  const [showLegalInfo, setShowLegalInfo] = useState(false);
  const [showOrgInfo, setShowOrgInfo] = useState(false);
  const { t, locale } = useTranslation();

  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [previewPhoto, setPreviewPhoto] = useState<string | null>(null);

  const [passwordForm, setPasswordForm] = useState({ current_password: "", password: "", password_confirmation: "" });
  
  const updatePasswordMutation = useMutation({
    mutationFn: async (data: typeof passwordForm) => {
      const res = await api.put("/auth/password", data);
      return res.data;
    },
    onSuccess: () => {
      toast.success(t.dash_profile_pwd_success || "Kata sandi berhasil diperbarui!");
      setPasswordForm({ current_password: "", password: "", password_confirmation: "" });
    },
    onError: (err: { response?: { data?: { message?: string } } }) => {
      toast.error(err.response?.data?.message || t.dash_profile_pwd_error || "Gagal memperbarui kata sandi.");
    }
  });

  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (passwordForm.password !== passwordForm.password_confirmation) {
      toast.error(t.dash_profile_pwd_mismatch || "Konfirmasi kata sandi tidak cocok!");
      return;
    }
    if (passwordForm.password.length < 8) {
      toast.error(t.dash_profile_pwd_length || "Kata sandi minimal 8 karakter!");
      return;
    }
    updatePasswordMutation.mutate(passwordForm);
  };

  const { data: lookupsData } = useQuery({
    queryKey: ["public-lookups"],
    queryFn: async () => {
      try {
        const res = await api.get("/public/lookups");
        return res.data?.data || res.data;
      } catch {
        return { countries: DEFAULT_COUNTRIES, company_fields: DEFAULT_SECTORS };
      }
    },
    placeholderData: { countries: DEFAULT_COUNTRIES, company_fields: DEFAULT_SECTORS },
    staleTime: 1000 * 60 * 5,
    gcTime: 1000 * 60 * 60 * 24,
  });
  const countries =
    (lookupsData?.countries?.length
      ? lookupsData.countries
      : lookupsData?.data?.countries?.length
      ? lookupsData.data.countries
      : null) || DEFAULT_COUNTRIES;

  const companyFields =
    (lookupsData?.company_fields?.length
      ? lookupsData.company_fields
      : lookupsData?.data?.company_fields?.length
      ? lookupsData.data.company_fields
      : null) || DEFAULT_SECTORS;

  const countryOptions = useMemo(() => {
    return countries.map((c: { id?: number; iso: string; name: string }) => (
      <option key={c.iso} value={c.iso}>{c.name}</option>
    ));
  }, [countries]);

  const sectorOptions = useMemo(() => {
    return companyFields.map((f: SectorLookupItem) => {
      const label = getSectorLabel(f, locale);
      return (
        <option key={f.id} value={f.id}>{label}</option>
      );
    });
  }, [companyFields, locale]);

  const { data, isLoading } = useQuery<{ data: User }>({
    queryKey: ["me"],
    queryFn: async () => {
      const res = await api.get("/auth/me");
      return res.data;
    },
  });

  const profile = data?.data;

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { isSubmitting },
  } = useForm<ProfileFormData>({
    values: {
      name: profile?.name ?? "",
      brand_name: profile?.company?.brand_name ?? "",
      company_phone: profile?.company?.phone || profile?.company?.pic_phone || "",
      company_country: profile?.company?.country ?? "",
      company_field_id: profile?.company?.company_field_id ? String(profile.company.company_field_id) : "",
      description: profile?.company?.description ?? "",
      description_en: profile?.company?.description_en ?? "",
      address: profile?.company?.address ?? "",
      street_address: profile?.company?.street_address || profile?.company?.address || "",
      province: profile?.company?.province ?? "",
      city: profile?.company?.city ?? "",
      district: profile?.company?.district ?? "",
      postal_code: profile?.company?.postal_code ?? "",
      latitude: profile?.company?.latitude ?? null,
      longitude: profile?.company?.longitude ?? null,
      website: profile?.company?.website ?? "",
      pic_name: profile?.company?.pic_name ?? "",
      pic_position: profile?.company?.pic_position ?? "",
      pic_email: profile?.company?.pic_email ?? "",
      pic_phone: profile?.company?.pic_phone ?? "",
    },
  });

  const watchedStreet = watch("street_address");
  const watchedDistrict = watch("district");
  const watchedCity = watch("city");
  const watchedProvince = watch("province");
  const watchedPostalCode = watch("postal_code");

  const mutation = useMutation({
    mutationFn: async (formData: ProfileFormData) => {
      if (formData.street_address) formData.street_address = formatSmartAddress(String(formData.street_address));
      if (formData.city) formData.city = formatSmartAddress(String(formData.city));
      if (formData.province) formData.province = formatSmartAddress(String(formData.province));
      if (formData.district) formData.district = formatSmartAddress(String(formData.district));
      if (formData.address) formData.address = formatSmartAddress(String(formData.address));
      const res = await api.put("/auth/profile", formData);
      return res.data;
    },
    onSuccess: (resData) => {
      setUser(resData.data);
      queryClient.invalidateQueries({ queryKey: ["me"] });
      queryClient.invalidateQueries({ queryKey: ["auth-me"] });
      toast.success(t.dash_profile_success || "Profil berhasil diperbarui!");
    },
    onError: () => {
      toast.error(t.dash_profile_error || "Gagal memperbarui profil.");
    },
  });

  const uploadPhotoMutation = useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append("image", file);
      const res = await api.post("/auth/profile/photo", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      return res.data;
    },
    onSuccess: (resData) => {
      setUser(resData.data);
      queryClient.invalidateQueries({ queryKey: ["me"] });
      queryClient.invalidateQueries({ queryKey: ["auth-me"] });
      toast.success(t.dash_profile_photo_success || "Foto profil/logo berhasil diperbarui!");
    },
    onError: () => {
      toast.error(t.dash_profile_photo_error || "Gagal mengunggah foto profil.");
    },
  });

  const uploadDocsMutation = useMutation({
    mutationFn: async ({ file, type }: { file: File; type: "legal_documents" | "organizational_chart" }) => {
      const formData = new FormData();
      formData.append(type, file);
      const res = await api.post("/auth/profile/documents", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      return res.data;
    },
    onSuccess: (resData) => {
      setUser(resData.data);
      queryClient.invalidateQueries({ queryKey: ["me"] });
      queryClient.invalidateQueries({ queryKey: ["auth-me"] });
      toast.success(t.dash_profile_doc_success || "Dokumen berhasil diunggah!");
    },
    onError: () => {
      toast.error(t.dash_profile_doc_error || "Gagal mengunggah dokumen.");
    },
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        toast.error("Ukuran file terlalu besar (maksimal 2MB)");
        return;
      }
      setPreviewPhoto(URL.createObjectURL(file));
      uploadPhotoMutation.mutate(file);
    }
  };

  const handleDocChange = (e: React.ChangeEvent<HTMLInputElement>, type: "legal_documents" | "organizational_chart") => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        toast.error(t.dash_profile_file_too_large || "Ukuran file terlalu besar (maksimal 2MB)");
        return;
      }
      uploadDocsMutation.mutate({ file, type });
    }
  };

  if (isLoading) {
    return (
      <AppLayout title={t.dash_profile_title || "Profil Perusahaan"}>
        <LoadingSpinner />
      </AppLayout>
    );
  }

  const fields = [
    profile?.name,
    profile?.company?.brand_name,
    profile?.company?.country,
    profile?.company?.company_field_id,
    profile?.company?.pic_name,
    profile?.company?.pic_position,
    profile?.company?.pic_email,
    profile?.company?.pic_phone,
    profile?.company?.phone,
    profile?.company?.address,
    profile?.company?.description,
    profile?.company?.website,
    profile?.legal_documents,
    profile?.organizational_chart,
  ];
  const completedCount = fields.filter((f) => f && String(f).trim() !== "").length;
  // Prioritaskan persentase dan status resmi dari backend API
  const completeness = profile?.profile_completion_percentage ?? (Math.round((completedCount / fields.length) * 100) || 0);
  const missingFields = profile?.missing_fields ?? [];

  return (
    <AppLayout title={t.dash_profile_title || "Profil Perusahaan"}>
      <div className="max-w-4xl mx-auto pb-10">
        <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h2 className="text-xl md:text-2xl font-extrabold text-slate-800 dark:text-white tracking-tight">
              {t.dash_profile_title || "Profil & Identitas Perusahaan"}
            </h2>
            <p className="text-slate-500 dark:text-slate-400 text-xs md:text-sm mt-1">
              {t.dash_profile_desc || "Kelola informasi resmi perusahaan, dokumen legal, dan kontak penanggung jawab (Person In Charge) untuk sertifikasi BECdex"}
            </p>
          </div>
          <button
            type="button"
            onClick={() => restartOnboardingTour(router)}
            className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white dark:bg-slate-800 hover:bg-blue-50 dark:hover:bg-slate-700/80 hover:text-blue-600 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 font-bold text-xs shadow-2xs transition-all shrink-0 self-start sm:self-auto cursor-pointer"
            title={t.tour_restart_desc || "Mulai ulang tutorial onboarding"}
          >
            <Compass size={15} className="text-blue-600 dark:text-blue-400" />
            <span>{t.tour_restart_btn || "Mulai Ulang Tutorial"}</span>
          </button>
        </div>

        {/* Completeness Tracker Card */}
        <div className="mb-6 bg-linear-to-r from-blue-50/80 via-indigo-50/50 to-white dark:from-blue-950/40 dark:via-indigo-950/20 dark:to-slate-900 border border-blue-200/80 dark:border-blue-800/80 rounded-2xl p-5 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-blue-600 dark:bg-blue-400 animate-pulse" />
              <span className="text-xs font-extrabold uppercase tracking-wider text-slate-800 dark:text-white">
                {t.dash_profile_status || "Status Kelengkapan Profil"}
              </span>
            </div>
            <span className="text-xs font-mono font-extrabold text-blue-700 dark:text-blue-300 bg-blue-100/80 dark:bg-blue-900/60 px-2.5 py-0.5 rounded-full border border-blue-200 dark:border-blue-800">
              {completeness}% {t.dash_profile_done || "Selesai"}
            </span>
          </div>
          <div className="w-full bg-slate-200/80 dark:bg-slate-800 h-2.5 rounded-full overflow-hidden mb-2">
            <div
              className="bg-blue-600 dark:bg-blue-500 h-full rounded-full transition-all duration-500"
              style={{ width: `${completeness}%` }}
            />
          </div>
          <div className="text-[11px] text-slate-500 dark:text-slate-400 font-medium flex items-center gap-1.5">
            {completeness === 100 ? (
              <>
                <MdCheckCircle className="text-emerald-500 w-3.5 h-3.5 shrink-0" />
                <span>{t.dash_profile_complete_msg || "Seluruh informasi perusahaan, kontak PIC, dan dokumen legal sudah lengkap."}</span>
              </>
            ) : (
              <span>{(t.dash_profile_incomplete_msg || "Lengkapi {count} data yang masih kosong agar proses verifikasi berjalan lancar.").replace('{count}', String(missingFields.length || (fields.length - completedCount)))}</span>
            )}
          </div>

          {/* Daftar Field yang Masih Belum Diisi */}
          {missingFields.length > 0 && (
            <div className="mt-3.5 pt-3.5 border-t border-blue-200/60 dark:border-blue-900/40 space-y-2">
              <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-700 dark:text-slate-300 block">
                {t.dash_profile_modal_required_note || "Kolom / Dokumen yang wajib dilengkapi:"}
              </span>
              <div className="flex flex-wrap gap-1.5">
                {missingFields.map((field) => {
                  const label =
                    profile?.missing_field_labels?.[field] ||
                    field.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());

                  return (
                    <span
                      key={field}
                      className="inline-flex items-center gap-1.5 text-[11px] font-semibold px-2.5 py-1 rounded-lg bg-amber-100/90 text-amber-900 dark:bg-amber-900/50 dark:text-amber-200 border border-amber-200/80 dark:border-amber-800/60 shadow-2xs"
                    >
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-500 dark:bg-amber-400 shrink-0" />
                      <span>{label}</span>
                    </span>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Profile Photo / Logo Uploader Card */}
        <div className="mb-6 rounded-2xl border border-slate-200/80 bg-white dark:border-slate-800 dark:bg-slate-900 p-6 md:p-8 shadow-sm flex flex-col sm:flex-row items-center gap-6 transition-colors">
          <div className="relative group shrink-0">
            <UserAvatar
              image={previewPhoto || profile?.image}
              name={profile?.name}
              size="xl"
              className="border-2 border-slate-200 dark:border-slate-700 shadow-sm"
              fallbackIcon={<Building className="w-10 h-10 text-white/90" />}
            />
            {uploadPhotoMutation.isPending && (
              <div className="absolute inset-0 bg-black/50 rounded-2xl flex items-center justify-center text-white">
                <Loader2 size={20} className="animate-spin" />
              </div>
            )}
          </div>

          <div className="flex-1 text-center sm:text-left space-y-2">
            <h3 className="font-extrabold text-slate-800 dark:text-white text-base tracking-tight">
              {t.dash_profile_logo_title || "Logo Perusahaan / Foto Profil"}
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed max-w-md">
              {t.dash_profile_logo_desc || "Unggah logo resmi perusahaan Anda. Logo ini akan ditampilkan di dashboard, profil publik, dan sertifikat resmi BECdex. Format: JPG, PNG (Maks. 2MB)."}
            </p>
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 pt-1">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploadPhotoMutation.isPending}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-xs shadow-sm transition-all disabled:opacity-50 cursor-pointer"
              >
                {uploadPhotoMutation.isPending ? (
                  <Loader2 size={13} className="animate-spin" />
                ) : (
                  <Camera size={13} />
                )}
                <span>{t.dash_profile_logo_btn || "Pilih & Unggah Foto"}</span>
              </button>
              <input type="file" ref={fileInputRef} onChange={handleFileChange} accept="image/jpeg,image/png,image/jpg" className="hidden" />
            </div>
          </div>
        </div>

        <form
          onSubmit={handleSubmit(
            (data) => mutation.mutate(data),
            (errors) => {
              const firstErr = Object.values(errors)[0];
              toast.error(firstErr?.message ? String(firstErr.message) : "Mohon lengkapi semua bidang wajib yang ditandai (*)");
            }
          )}
          className="space-y-6"
        >
          
          {/* Company Info Card */}
          <div className="rounded-2xl border border-slate-200/80 bg-white dark:border-slate-800 dark:bg-slate-900 p-6 md:p-8 shadow-sm space-y-5">
            <div className="flex items-center gap-2.5 pb-4 border-b border-slate-100 dark:border-slate-800">
              <div className="w-8 h-8 rounded-xl bg-blue-50 dark:bg-blue-950/60 flex items-center justify-center text-blue-600 dark:text-blue-400 shrink-0">
                <Building size={16} />
              </div>
              <div>
                <h3 className="font-extrabold text-slate-800 dark:text-white text-base tracking-tight">
                  {t.dash_profile_basic_title || "Informasi Dasar Perusahaan"}
                </h3>
                <p className="text-[11px] text-slate-400 dark:text-slate-500">{t.dash_profile_basic_desc || "Identitas resmi perusahaan yang terdaftar"}</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="md:col-span-2">
                <label className="block text-xs font-extrabold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                  {t.dash_profile_name || "Nama Resmi Perusahaan"} <span className="text-red-500">*</span>
                </label>
                <input required {...register("name")} type="text" placeholder="Contoh: PT Maritim Blue Nusantara" className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/80 text-slate-800 dark:text-white text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all" />
              </div>

              <div>
                <label className="flex items-center gap-1.5 text-xs font-extrabold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                  <span>{t.dash_profile_brand || "Company Brand"} <span className="text-red-500">*</span></span>
                </label>
                <input required {...register("brand_name")} type="text" placeholder="Company Brand" className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/80 text-slate-800 dark:text-white text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all" />
              </div>

              <div>
                <label className="flex items-center gap-1.5 text-xs font-extrabold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                  <Mail size={13} className="text-blue-500" />
                  <span>{t.dash_profile_email || "Email Akun"}</span>
                </label>
                <input type="email" value={profile?.email ?? ""} disabled className="w-full px-4 py-3 rounded-xl border border-slate-200/60 dark:border-slate-800 bg-slate-100/80 dark:bg-slate-800/40 text-slate-400 text-sm font-medium cursor-not-allowed" />
              </div>



              <div>
                <label className="flex items-center gap-1.5 text-xs font-extrabold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                  <Globe size={13} className="text-blue-500" />
                  <span>{t.dash_profile_country || "Asal Negara"} <span className="text-red-500">*</span></span>
                </label>
                <select required {...register("company_country")} className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/80 text-slate-800 dark:text-white text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all">
                  <option value="">{t.dash_profile_sel_country || "Pilih Negara"}</option>
                  {countryOptions}
                </select>
              </div>

              <div>
                <label className="flex items-center gap-1.5 text-xs font-extrabold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                  <Phone size={13} className="text-blue-500" />
                  <span>{t.dash_profile_phone || "Phone Number"} <span className="text-rose-500">*</span></span>
                </label>
                <input required {...register("company_phone")} type="text" placeholder="Phone Number" className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/80 text-slate-800 dark:text-white text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all" />
              </div>

              <div className="md:col-span-2">
                <label className="flex items-center gap-1.5 text-xs font-extrabold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                  <Briefcase size={13} className="text-blue-500" />
                  <span>{t.dash_profile_field || "Bidang Perusahaan"} <span className="text-red-500">*</span></span>
                </label>
                <select required {...register("company_field_id")} className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/80 text-slate-800 dark:text-white text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all">
                  <option value="">{t.dash_profile_sel_sector || "Pilih Sektor Usaha"}</option>
                  {sectorOptions}
                </select>
              </div>

              <div className="md:col-span-2 space-y-4">
                <div>
                  <label className="flex items-center gap-1.5 text-xs font-extrabold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                    <AlignLeft size={13} className="text-blue-500" />
                    <span>{t.dash_profile_desc_label || "Deskripsi Perusahaan (Bahasa Indonesia)"} <span className="text-red-500">*</span></span>
                  </label>
                  <textarea
                    required
                    {...register("description")}
                    rows={4}
                    placeholder={t.dash_profile_desc_placeholder || "Jelaskan profil singkat, kegiatan operasional, dan visi keberlanjutan perusahaan Anda dalam Bahasa Indonesia..."}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/80 text-slate-800 dark:text-white text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all placeholder:text-slate-400 dark:placeholder:text-slate-500"
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="flex items-center gap-1.5 text-xs font-extrabold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                      <AlignLeft size={13} className="text-indigo-500" />
                      <span>{t.dash_profile_desc_en_label || "Deskripsi Perusahaan (English)"}</span>
                      <span className="text-slate-400 font-normal lowercase">(optional)</span>
                    </label>
                    <span className="text-[11px] font-medium text-slate-400 dark:text-slate-500 hidden sm:inline">
                      {t.dash_profile_desc_en_hint || "Disarankan untuk profil publik dwibahasa dan sertifikat internasional"}
                    </span>
                  </div>
                  <textarea
                    {...register("description_en")}
                    rows={4}
                    placeholder={t.dash_profile_desc_en_placeholder || "Describe your company profile, business activities, and sustainability vision in English..."}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/80 text-slate-800 dark:text-white text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all placeholder:text-slate-400 dark:placeholder:text-slate-500"
                  />
                  <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-1 sm:hidden">
                    {t.dash_profile_desc_en_hint || "Disarankan untuk profil publik dwibahasa dan sertifikat internasional"}
                  </p>
                </div>
              </div>

              {/* Structured Address Section */}
              <div className="md:col-span-2 space-y-4">
                {/* Notice upgrade alamat untuk akun lama */}
                {profile?.company?.address && !profile?.company?.street_address && (
                  <div className="p-3.5 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/50 flex items-start gap-2.5 text-amber-800 dark:text-amber-300 text-xs leading-relaxed">
                    <Info size={16} className="shrink-0 mt-0.5 text-amber-600 dark:text-amber-400" />
                    <div>
                      <span className="font-bold">Format Alamat Resmi Telah Diperbarui: </span>
                      Alamat lama Anda telah dimuat ke input jalan di bawah. Silakan gunakan pencarian pencarian otomatis untuk mengisi kota, provinsi, dan kode pos secara otomatis agar format sertifikat resmi Anda semakin rapi.
                    </div>
                  </div>
                )}

                <div>
                  <label className="flex items-center gap-1.5 text-xs font-extrabold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                    <MapPin size={13} className="text-blue-500" />
                    <span>{t.dash_profile_address || "Alamat Lengkap"} <span className="text-red-500">*</span></span>
                  </label>
                  <AddressAutocompleteInput
                    value={watchedStreet || ""}
                    onChange={(val) => {
                      setValue("street_address", val, { shouldValidate: true, shouldDirty: true });
                      const full = [val, watch("district"), watch("city"), watch("province"), watch("postal_code") ? "Kode Pos: " + watch("postal_code") : null].filter(Boolean).join(", ");
                      setValue("address", full);
                    }}
                    onPlaceSelect={(data) => {
                      setValue("street_address", data.street_address, { shouldValidate: true, shouldDirty: true });
                      setValue("province", data.province, { shouldValidate: true, shouldDirty: true });
                      setValue("city", data.city, { shouldValidate: true, shouldDirty: true });
                      if (data.district) {
                        setValue("district", data.district, { shouldValidate: true, shouldDirty: true });
                      }
                      if (data.postal_code) {
                        setValue("postal_code", data.postal_code, { shouldValidate: true, shouldDirty: true });
                      }
                      if (data.latitude) setValue("latitude", data.latitude);
                      if (data.longitude) setValue("longitude", data.longitude);

                      const full = [data.street_address, data.district, data.city, data.province, data.postal_code ? "Kode Pos: " + data.postal_code : null]
                        .filter(Boolean)
                        .join(", ");
                      setValue("address", full);
                    }}
                    placeholder="Ketik nama jalan/gedung, lalu lengkapi Blok/No (misal: Kawasan Marunda Center Blok B No. 21)..."
                    required
                  />
                </div>

                {/* Grid Rincian Wilayah */}
                {/*
<div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 pt-1">
                  <div>
                    <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-1">
                      Provinsi <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Contoh: Jawa Barat"
                      {...register("province", { required: true })}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/80 text-slate-800 dark:text-white text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-1">
                      Kota / Kabupaten <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Contoh: Kab. Bekasi"
                      {...register("city", { required: true })}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/80 text-slate-800 dark:text-white text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-1">
                      Kecamatan <span className="text-slate-400 font-normal">(Opsional)</span>
                    </label>
                    <input
                      type="text"
                      placeholder="Contoh: Tarumajaya"
                      {...register("district")}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/80 text-slate-800 dark:text-white text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-1">
                      Kode Pos <span className="text-slate-400 font-normal">(5 Digit)</span>
                    </label>
                    <input
                      type="text"
                      maxLength={10}
                      placeholder="Contoh: 17211"
                      {...register("postal_code")}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/80 text-slate-800 dark:text-white text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                    />
                  </div>
                </div>
                */}

                {/* Live Preview Alamat Sertifikat */}
                <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-700/80 space-y-1">
                  <div className="flex items-center gap-1.5 text-[11px] font-extrabold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                    <Eye size={13} className="text-blue-500" />
                    <span>Pratinjau Alamat di Sertifikat Resmi</span>
                  </div>
                  <p className="text-xs md:text-sm font-semibold text-slate-800 dark:text-slate-200 italic break-words">
                    {formatSmartAddress(
                      [
                        watchedStreet?.trim(),
                        watchedDistrict?.trim(),
                        watchedCity?.trim(),
                        watchedProvince?.trim(),
                        watchedPostalCode?.trim() ? "Kode Pos: " + watchedPostalCode.trim() : null,
                      ]
                        .filter(Boolean)
                        .join(", ")
                    ) || (
                      <span className="text-slate-400 font-normal not-italic">
                        Alamat belum lengkap. Ketik nama jalan di atas atau gunakan saran pencarian untuk melihat pratinjau sertifikat.
                      </span>
                    )}
                  </p>
                </div>
              </div>

              <div className="md:col-span-2">
                <label className="flex items-center gap-1.5 text-xs font-extrabold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                  <Globe size={13} className="text-blue-500" />
                  <span>{t.dash_profile_website || "Website"} <span className="text-slate-400 font-normal">(Opsional)</span></span>
                </label>
                <input {...register("website")} type="text" placeholder="https://example.com" className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/80 text-slate-800 dark:text-white text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all" />
              </div>
            </div>
          </div>

          {/* PIC Info Card */}
          <div className="rounded-2xl border border-slate-200/80 bg-white dark:border-slate-800 dark:bg-slate-900 p-6 md:p-8 shadow-sm space-y-5">
            <div className="flex items-center gap-2.5 pb-4 border-b border-slate-100 dark:border-slate-800">
              <div className="w-8 h-8 rounded-xl bg-blue-50 dark:bg-blue-950/60 flex items-center justify-center text-blue-600 dark:text-blue-400 shrink-0">
                <UserIcon size={16} />
              </div>
              <div>
                <h3 className="font-extrabold text-slate-800 dark:text-white text-base tracking-tight">{t.dash_profile_pic_title || "PIC & Kontak Koordinasi"}</h3>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="block text-xs font-extrabold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                  {t.dash_profile_pic_name || "PIC Name"} <span className="text-red-500">*</span>
                </label>
                <input required {...register("pic_name")} type="text" className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/80 text-slate-800 dark:text-white text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all" />
              </div>
              <div>
                <label className="block text-xs font-extrabold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                  {t.dash_profile_pic_position || "PIC Position"} <span className="text-red-500">*</span>
                </label>
                <input required {...register("pic_position")} type="text" className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/80 text-slate-800 dark:text-white text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all" />
              </div>
              <div>
                <label className="block text-xs font-extrabold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                  {t.dash_profile_pic_email || "PIC Email"} <span className="text-red-500">*</span>
                </label>
                <input required {...register("pic_email")} type="email" className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/80 text-slate-800 dark:text-white text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all" />
              </div>
              <div>
                <label className="block text-xs font-extrabold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                  {t.dash_profile_pic_phone || "PIC Phone"} <span className="text-red-500">*</span>
                </label>
                <input required {...register("pic_phone")} type="tel" className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/80 text-slate-800 dark:text-white text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all" />
              </div>
            </div>
          </div>

          {/* Legal Documents & Organizational Chart */}
          <div className="rounded-2xl border border-slate-200/80 bg-white dark:border-slate-800 dark:bg-slate-900 p-6 md:p-8 shadow-sm space-y-5">
            <div className="flex items-center gap-2.5 pb-4 border-b border-slate-100 dark:border-slate-800">
              <div className="w-8 h-8 rounded-xl bg-blue-50 dark:bg-blue-950/60 flex items-center justify-center text-blue-600 dark:text-blue-400 shrink-0">
                <FileText size={16} />
              </div>
              <div>
                <h3 className="font-extrabold text-slate-800 dark:text-white text-base tracking-tight">{t.dash_profile_doc_title || "Dokumen Pendukung"}</h3>
              </div>
            </div>

            <div className="space-y-6">
              {/* Legal Documents */}
              <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 p-4 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/20">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="text-sm font-extrabold text-slate-800 dark:text-white">{t.dash_profile_legal_doc || "Legal Documents"} <span className="text-red-500">*</span></h4>
                    <button type="button" onClick={() => setShowLegalInfo(!showLegalInfo)} className="text-blue-500 hover:text-blue-700">
                      <Info size={16} />
                    </button>
                  </div>
                  {showLegalInfo && (
                    <div className="mb-3 text-xs text-slate-600 dark:text-slate-400 bg-blue-50 dark:bg-blue-900/30 p-3 rounded-lg border border-blue-100 dark:border-blue-800/50">
                      <p className="font-bold mb-1">Required Documents:</p>
                      <ul className="list-disc pl-4 space-y-1 mb-2">
                        <li>SK Pendirian Perusahaan</li>
                        <li>Akta Badan Usaha</li>
                        <li>NPWP</li>
                        <li>Nomor Induk Berusaha (NIB)</li>
                        <li>SK Kemenkumham</li>
                      </ul>
                      <p className="font-bold text-blue-700 dark:text-blue-300">Format File: ZIP, RAR, PDF</p>
                    </div>
                  )}
                  <input type="file" ref={legalDocRef} onChange={(e) => handleDocChange(e, "legal_documents")} accept=".zip,.rar,.pdf" className="hidden" />
                  <div className="flex items-center gap-3">
                    <button type="button" onClick={() => legalDocRef.current?.click()} className="text-xs font-bold px-4 py-2 bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 text-slate-700 dark:text-white rounded-lg transition-colors">
                      {t.dash_profile_btn_file || "Pilih File"}
                    </button>
                    {uploadDocsMutation.isPending && uploadDocsMutation.variables?.type === "legal_documents" && <Loader2 size={16} className="animate-spin text-blue-500" />}
                  </div>
                </div>
                <div className="flex items-center justify-end min-w-30">
                  {profile?.legal_documents ? (
                    <a href={`${(process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000").replace(/\/api\/?$/, '')}/storage/${profile.legal_documents}`} target="_blank" rel="noreferrer" className="flex items-center gap-1.5 text-xs font-bold text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300">
                      <Download size={14} /> {t.dash_profile_legal_view || "Lihat File"}
                    </a>
                  ) : (
                    <span className="text-xs font-semibold text-slate-400 bg-slate-100 dark:bg-slate-800 px-3 py-1.5 rounded-full">{t.dash_profile_legal_empty || "Belum Upload"}</span>
                  )}
                </div>
              </div>

              {/* Organizational Chart */}
              <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 p-4 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/20">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="text-sm font-extrabold text-slate-800 dark:text-white">{t.dash_profile_org_chart || "Organizational Chart"} <span className="text-red-500">*</span></h4>
                    <button type="button" onClick={() => setShowOrgInfo(!showOrgInfo)} className="text-blue-500 hover:text-blue-700">
                      <Info size={16} />
                    </button>
                  </div>
                  {showOrgInfo && (
                    <div className="mb-3 text-xs text-slate-600 dark:text-slate-400 bg-blue-50 dark:bg-blue-900/30 p-3 rounded-lg border border-blue-100 dark:border-blue-800/50">
                      <p className="font-bold text-blue-700 dark:text-blue-300">Format File: JPG, PNG, PDF</p>
                    </div>
                  )}
                  <input type="file" ref={orgChartRef} onChange={(e) => handleDocChange(e, "organizational_chart")} accept=".jpg,.jpeg,.png,.pdf" className="hidden" />
                  <div className="flex items-center gap-3">
                    <button type="button" onClick={() => orgChartRef.current?.click()} className="text-xs font-bold px-4 py-2 bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 text-slate-700 dark:text-white rounded-lg transition-colors">
                      {t.dash_profile_btn_file || "Pilih File"}
                    </button>
                    {uploadDocsMutation.isPending && uploadDocsMutation.variables?.type === "organizational_chart" && <Loader2 size={16} className="animate-spin text-blue-500" />}
                  </div>
                </div>
                <div className="flex items-center justify-end min-w-30">
                  {profile?.organizational_chart ? (
                    <a href={`${(process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000").replace(/\/api\/?$/, '')}/storage/${profile.organizational_chart}`} target="_blank" rel="noreferrer" className="flex items-center gap-1.5 text-xs font-bold text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300">
                      <Download size={14} /> {t.dash_profile_legal_view || "Lihat File"}
                    </a>
                  ) : (
                    <span className="text-xs font-semibold text-slate-400 bg-slate-100 dark:bg-slate-800 px-3 py-1.5 rounded-full">{t.dash_profile_legal_empty || "Belum Upload"}</span>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Action Button */}
          <div className="flex justify-end pt-2 mb-8">
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex items-center justify-center gap-2 bg-[#0c2340] hover:bg-blue-700 dark:bg-blue-600 dark:hover:bg-blue-500 text-white px-8 py-3.5 rounded-xl font-extrabold text-sm transition-all shadow-md shadow-[#0c2340]/20 disabled:opacity-50 cursor-pointer"
            >
              {isSubmitting ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  <span>{t.dash_profile_btn_saving || "Menyimpan Perubahan..."}</span>
                </>
              ) : (
                <>
                  <Save size={16} />
                  <span>{t.dash_profile_btn_save || "Simpan Perubahan Profil"}</span>
                </>
              )}
            </button>
          </div>
        </form>
        
        {/* Change Password Component */}
        <div className="mb-6 rounded-2xl border border-slate-200/80 bg-white dark:border-slate-800 dark:bg-slate-900 p-6 md:p-8 shadow-sm">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-rose-100 dark:bg-rose-900/30 flex items-center justify-center text-rose-600 dark:text-rose-400">
              <Key size={20} strokeWidth={2.5} />
            </div>
            <div>
              <h3 className="font-extrabold text-slate-800 dark:text-white text-base tracking-tight">
                {t.dash_profile_security_title || "Keamanan & Kata Sandi"}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {t.dash_profile_security_desc || "Perbarui kata sandi Anda secara berkala untuk menjaga keamanan akun."}
              </p>
            </div>
          </div>
          
          <form onSubmit={handlePasswordSubmit} className="space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              <div>
                <label className="block text-xs font-extrabold text-slate-700 dark:text-slate-300 mb-1.5 uppercase tracking-wide">
                  {t.dash_profile_pwd_current || "Kata Sandi Saat Ini"} <span className="text-red-500">*</span>
                </label>
                <div className="relative">
  <input
    type={showCurrentPassword ? "text" : "password"}
    required
    value={passwordForm.current_password}
    onChange={(e) => setPasswordForm({ ...passwordForm, current_password: e.target.value })}
    placeholder="••••••••"
    className="w-full text-sm border border-slate-200/80 dark:border-slate-700 rounded-xl px-4 py-2.5 pr-11 bg-slate-50 dark:bg-slate-900 focus:bg-white dark:focus:bg-slate-800 outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all dark:text-white"
  />

  <button
    type="button"
    onClick={() => setShowCurrentPassword(!showCurrentPassword)}
    aria-label={showCurrentPassword ? "Sembunyikan password saat ini" : "Tampilkan password saat ini"}
    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
  >
    {showCurrentPassword ? <EyeOff size={18} /> : <Eye size={18} />}
  </button>
</div>
              </div>
              <div>
                <label className="block text-xs font-extrabold text-slate-700 dark:text-slate-300 mb-1.5 uppercase tracking-wide">
                  {t.dash_profile_pwd_new || "Kata Sandi Baru"} <span className="text-red-500">*</span>
                </label>
                <div className="relative">
  <input
    type={showNewPassword ? "text" : "password"}
    required
    value={passwordForm.password}
    onChange={(e) => setPasswordForm({ ...passwordForm, password: e.target.value })}
    placeholder="••••••••"
    className="w-full text-sm border border-slate-200/80 dark:border-slate-700 rounded-xl px-4 py-2.5 pr-11 bg-slate-50 dark:bg-slate-900 focus:bg-white dark:focus:bg-slate-800 outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all dark:text-white"
  />

  <button
    type="button"
    onClick={() => setShowNewPassword(!showNewPassword)}
    aria-label={showNewPassword ? "Sembunyikan password baru" : "Tampilkan password baru"}
    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
  >
    {showNewPassword ? <EyeOff size={18} /> : <Eye size={18} />}
  </button>
</div>
              </div>
              <div>
                <label className="block text-xs font-extrabold text-slate-700 dark:text-slate-300 mb-1.5 uppercase tracking-wide">
                  {t.dash_profile_pwd_confirm || "Konfirmasi Sandi Baru"} <span className="text-red-500">*</span>
                </label>
                <div className="relative">
  <input
    type={showConfirmPassword ? "text" : "password"}
    required
    value={passwordForm.password_confirmation}
    onChange={(e) => setPasswordForm({ ...passwordForm, password_confirmation: e.target.value })}
    placeholder="••••••••"
    className="w-full text-sm border border-slate-200/80 dark:border-slate-700 rounded-xl px-4 py-2.5 pr-11 bg-slate-50 dark:bg-slate-900 focus:bg-white dark:focus:bg-slate-800 outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all dark:text-white"
  />

  <button
    type="button"
    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
    aria-label={showConfirmPassword ? "Sembunyikan konfirmasi password" : "Tampilkan konfirmasi password"}
    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
  >
    {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
  </button>
</div>
              </div>
            </div>
            <div className="flex justify-end pt-2">
              <button
                type="submit"
                disabled={updatePasswordMutation.isPending}
                className="flex items-center justify-center gap-2 bg-rose-600 hover:bg-rose-700 text-white px-6 py-2.5 rounded-xl font-bold text-xs transition-all shadow-sm disabled:opacity-50 cursor-pointer"
              >
                {updatePasswordMutation.isPending ? (
                  <>
                    <Loader2 size={14} className="animate-spin" />
                    <span>{t.dash_profile_btn_saving || "Menyimpan..."}</span>
                  </>
                ) : (
                  <>
                    <Key size={14} />
                    <span>{t.dash_profile_pwd_update || "Perbarui Kata Sandi"}</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>

        {/* Active Sessions Component */}
        <ActiveSessions />
      </div>
    </AppLayout>
  );
}
