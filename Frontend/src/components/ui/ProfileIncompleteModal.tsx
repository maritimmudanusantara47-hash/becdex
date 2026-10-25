"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { useRouter } from "next/navigation";
import {
  AlertTriangle,
  X,
  ChevronRight,
  FileText,
  Building2,
  User,
  Phone,
  MapPin,
  Mail,
  ShieldAlert,
  ArrowRight,
  Briefcase,
  Layers,
  Image as ImageIcon,
} from "lucide-react";
import { useTranslation } from "@/store/lang";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  percentage?: number;
  missingFields?: string[];
  missingFieldLabels?: Record<string, string>;
}

const DEFAULT_LABELS: Record<string, { id: string; en: string }> = {
  name: { id: "Nama Resmi Perusahaan", en: "Official Company Name" },
  email_verified: { id: "Verifikasi Email Akun", en: "Account Email Verification" },
  legal_documents: { id: "Dokumen Legalitas (NIB / Akta)", en: "Legal Documents (NIB / Deed)" },
  organizational_chart: { id: "Bagan Struktur Organisasi", en: "Organizational Structure Chart" },
  image: { id: "Logo Perusahaan / Foto Profil", en: "Company Logo / Profile Photo" },
  company_phone: { id: "Nomor Telepon Perusahaan", en: "Company Phone Number" },
  company_country: { id: "Negara Domisili Perusahaan", en: "Country of Domicile" },
  company_field_id: { id: "Bidang Usaha Perusahaan", en: "Company Business Field / Sector" },
  address: { id: "Alamat Lengkap Perusahaan", en: "Complete Company Address" },
  description: { id: "Deskripsi Singkat Perusahaan", en: "Company Profile Description" },
  brand_name: { id: "Nama Brand / Komersial", en: "Brand / Commercial Name" },
  pic_name: { id: "Nama Lengkap PIC", en: "Person In Charge (PIC) Full Name" },
  pic_position: { id: "Jabatan / Posisi PIC", en: "PIC Position / Job Title" },
  pic_email: { id: "Email PIC", en: "PIC Email Address" },
  pic_phone: { id: "Nomor Telepon / WhatsApp PIC", en: "PIC Phone / WhatsApp Number" },
};

function getFieldIcon(field: string) {
  switch (field) {
    case "legal_documents":
    case "organizational_chart":
      return <FileText size={14} className="text-amber-600 dark:text-amber-400 shrink-0" />;
    case "image":
      return <ImageIcon size={14} className="text-amber-600 dark:text-amber-400 shrink-0" />;
    case "company_phone":
    case "pic_phone":
      return <Phone size={14} className="text-amber-600 dark:text-amber-400 shrink-0" />;
    case "address":
    case "company_country":
      return <MapPin size={14} className="text-amber-600 dark:text-amber-400 shrink-0" />;
    case "email_verified":
    case "pic_email":
      return <Mail size={14} className="text-amber-600 dark:text-amber-400 shrink-0" />;
    case "pic_name":
    case "pic_position":
      return <User size={14} className="text-amber-600 dark:text-amber-400 shrink-0" />;
    case "company_field_id":
      return <Briefcase size={14} className="text-amber-600 dark:text-amber-400 shrink-0" />;
    case "brand_name":
    case "name":
    default:
      return <Building2 size={14} className="text-amber-600 dark:text-amber-400 shrink-0" />;
  }
}

export default function ProfileIncompleteModal({
  isOpen,
  onClose,
  percentage = 0,
  missingFields = [],
  missingFieldLabels = {},
}: Props) {
  const router = useRouter();
  const { t, locale } = useTranslation();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  if (!isOpen || !mounted) return null;

  const validPercentage = Math.min(100, Math.max(0, Math.round(percentage)));

  const handleGoToProfile = () => {
    onClose();
    router.push("/dashboard/profile");
  };

  const modalContent = (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl shadow-blue-900/10 dark:shadow-black/50 overflow-hidden transition-all duration-300 animate-in zoom-in-95"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Accent Gradient Bar */}
        <div className="h-2 w-full bg-linear-to-r from-amber-500 via-orange-500 to-rose-500" />

        {/* Modal Close Button */}
        <button
          onClick={onClose}
          aria-label="Tutup"
          className="absolute top-4 right-4 p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800/80 transition-colors"
        >
          <X size={18} />
        </button>

        <div className="p-6 sm:p-7 space-y-6">
          {/* Header Icon & Title */}
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-2xl bg-amber-100 dark:bg-amber-950/70 border border-amber-200 dark:border-amber-800/60 flex items-center justify-center text-amber-600 dark:text-amber-400 shrink-0 shadow-xs">
              <ShieldAlert size={26} strokeWidth={2.2} />
            </div>
            <div className="flex-1 pr-6">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-100 dark:bg-amber-900/40 text-amber-800 dark:text-amber-300 text-[11px] font-extrabold uppercase tracking-wide mb-1.5 border border-amber-200/80 dark:border-amber-800/60">
                <AlertTriangle size={12} />
                <span>{locale === "en" ? "Action Required" : "Aksi Diperlukan"}</span>
              </span>
              <h3
                id="modal-title"
                className="text-lg sm:text-xl font-extrabold text-slate-800 dark:text-white tracking-tight"
              >
                {t.dash_profile_modal_title || (locale === "en" ? "Company Profile Incomplete" : "Profil Perusahaan Belum Lengkap")}
              </h3>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                {t.dash_profile_modal_subtitle || (locale === "en"
                  ? "Please complete your company profile and PIC contact details before starting a new certification assessment submission."
                  : "Lengkapi data perusahaan dan kontak PIC terlebih dahulu untuk dapat memulai pengajuan penilaian (submission) baru.")}
              </p>
            </div>
          </div>

          {/* Progress Tracker Card */}
          <div className="rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-800 p-4 space-y-2">
            <div className="flex items-center justify-between text-xs font-bold text-slate-700 dark:text-slate-300">
              <span className="flex items-center gap-1.5">
                <Layers size={14} className="text-blue-500" />
                <span>{locale === "en" ? "Profile Completeness" : "Kelengkapan Profil"}</span>
              </span>
              <span className="font-mono text-xs px-2.5 py-0.5 rounded-full bg-amber-100 dark:bg-amber-900/60 text-amber-800 dark:text-amber-200 border border-amber-200 dark:border-amber-800 font-extrabold">
                {validPercentage}% {locale === "en" ? "Completed" : "Selesai"}
              </span>
            </div>
            <div className="w-full bg-slate-200 dark:bg-slate-700 h-2.5 rounded-full overflow-hidden">
              <div
                className="bg-linear-to-r from-amber-500 via-orange-500 to-amber-600 h-full rounded-full transition-all duration-500"
                style={{ width: `${validPercentage}%` }}
              />
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              {locale === "en"
                ? "Assessment draft creation is locked until all mandatory items reach 100%."
                : "Pembuatan draf penilaian terkunci hingga seluruh data wajib mencapai 100%."}
            </p>
          </div>

          {/* Missing Fields List */}
          {missingFields.length > 0 && (
            <div className="space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-extrabold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                  {t.dash_profile_modal_required_note || (locale === "en" ? "Mandatory items to complete:" : "Dokumen dan kolom wajib yang belum dilengkapi:")}
                </span>
                <span className="text-[11px] font-bold text-rose-500 dark:text-rose-400">
                  {missingFields.length} {locale === "en" ? "pending" : "kolom"}
                </span>
              </div>
              <div className="max-h-48 overflow-y-auto pr-1 space-y-1.5 scrollbar-thin scrollbar-thumb-slate-200 dark:scrollbar-thumb-slate-700">
                {missingFields.map((field) => {
                  const label =
                    missingFieldLabels[field] ||
                    DEFAULT_LABELS[field]?.[locale === "en" ? "en" : "id"] ||
                    field.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());

                  return (
                    <div
                      key={field}
                      className="flex items-center gap-2.5 px-3 py-2 rounded-xl bg-amber-50/80 dark:bg-amber-950/30 border border-amber-200/80 dark:border-amber-800/50 text-xs font-semibold text-slate-700 dark:text-slate-200 shadow-2xs"
                    >
                      {getFieldIcon(field)}
                      <span className="flex-1 truncate">{label}</span>
                      <span className="text-[10px] uppercase font-extrabold text-amber-700 dark:text-amber-400 tracking-wide bg-amber-100 dark:bg-amber-900/60 px-2 py-0.5 rounded-md">
                        {locale === "en" ? "Required" : "Wajib"}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Modal Actions */}
          <div className="flex flex-col-reverse sm:flex-row items-center gap-2.5 pt-2 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="w-full sm:w-auto px-5 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 font-bold text-xs hover:bg-slate-50 dark:hover:bg-slate-700/80 transition-all cursor-pointer"
            >
              {t.dash_profile_modal_btn_cancel || (locale === "en" ? "Close / Later" : "Tutup / Nanti Saja")}
            </button>
            <button
              type="button"
              onClick={handleGoToProfile}
              className="w-full sm:flex-1 inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-linear-to-r from-blue-600 to-indigo-700 hover:from-blue-700 hover:to-indigo-800 text-white font-extrabold text-xs shadow-md shadow-blue-600/20 hover:shadow-lg hover:shadow-blue-600/30 transition-all cursor-pointer"
            >
              <span>{t.dash_profile_modal_btn_complete || (locale === "en" ? "Complete Profile Now" : "Lengkapi Profil Sekarang")}</span>
              <ArrowRight size={15} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
}
