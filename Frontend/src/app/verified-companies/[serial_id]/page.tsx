"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import api from "@/lib/api";
import { PublicHeader } from "@/components/layouts/PublicHeader";
import { PublicFooter } from "@/components/layouts/PublicFooter";
import { LoadingSpinner } from "@/components/ui/index";
import {
  ArrowLeft,
  CheckCircle2,
  ShieldCheck,
  AlertTriangle,
  Building2,
  Globe,
  MapPin,
  Calendar,
  Award,
  ExternalLink,
  Copy,
  Check,
  FileText,
  UserCheck,
  ChevronRight,
  ShieldAlert,
  Lock,
} from "lucide-react";
import { MdCheckCircle } from "react-icons/md";
import { useTranslation } from "@/store/lang";

interface VerifiedCompanyDetail {
  id: number;
  serial_id: string;
  is_active: boolean;
  published_at: string | null;
  valid_until: string | null;
  director: string | null;
  category: {
    name: string | null;
    label: string | null;
  };
  company: {
    name: string;
    image: string | null;
    country: string | null;
    sector: string | null;
    sector_id: string | null;
    description: string | null;
    website: string | null;
    address: string | null;
  };
  score: number;
  radar_data: Array<{
    subject: string;
    A: number;
    B: number;
    fullMark: number;
  }>;
}

export default function VerifiedCompanyDetailPage() {
  const params = useParams();
  const serialId = (params?.serial_id as string) || "";
  const { t, locale } = useTranslation();
  const [copied, setCopied] = useState(false);

  // Fetch Lookups for country name mapping
  const { data: lookupsData } = useQuery({
    queryKey: ["public-lookups"],
    queryFn: async () => {
      const res = await api.get("/public/lookups");
      return res.data.data;
    },
    staleTime: 1000 * 60 * 30, // 30 minutes
  });

  const { data: companyData, isLoading, isError, error } = useQuery({
    queryKey: ["public-verified-company", serialId],
    queryFn: async () => {
      const res = await api.get(`/public/verified-companies/${encodeURIComponent(serialId)}`);
      return res.data.data as VerifiedCompanyDetail;
    },
    enabled: Boolean(serialId),
    retry: 1,
  });

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const axiosError = error as any;
  const isLocked = axiosError?.response?.status === 403 || axiosError?.response?.data?.is_locked;

  const handleCopySerial = () => {
    if (!companyData?.serial_id) return;
    navigator.clipboard.writeText(companyData.serial_id);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const getCountryName = (iso?: string | null) => {
    if (!iso) return "International";
    const countries = lookupsData?.countries || [];
    const found = countries.find((c: { id: number; iso: string; name: string }) => c.iso === iso);
    return found ? found.name : iso;
  };

  const formatDate = (dateStr?: string | null) => {
    if (!dateStr) return "-";
    try {
      const d = new Date(dateStr);
      return new Intl.DateTimeFormat(locale === "id" ? "id-ID" : "en-US", {
        day: "numeric",
        month: "long",
        year: "numeric",
      }).format(d);
    } catch {
      return dateStr;
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-[#f8fafc] text-slate-800 antialiased">
      <PublicHeader />

      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12">
        {/* Breadcrumb & Navigation */}
        <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
          <Link
            href="/verified-companies"
            className="inline-flex items-center gap-2 text-sm font-semibold text-slate-600 hover:text-blue-600 transition-colors bg-white px-3.5 py-2 rounded-lg border border-slate-200 shadow-2xs hover:shadow-xs"
          >
            <ArrowLeft size={16} />
            <span>{t.cert_back_to_catalog || "Kembali ke Direktori Perusahaan"}</span>
          </Link>

          <nav className="hidden sm:flex items-center gap-1.5 text-xs text-slate-500">
            <Link href="/" className="hover:text-blue-600 transition-colors">
              {t.nav_home || "Home"}
            </Link>
            <ChevronRight size={13} className="text-slate-400" />
            <Link href="/verified-companies" className="hover:text-blue-600 transition-colors">
              {t.nav_verified_companies || "Certified Companies"}
            </Link>
            <ChevronRight size={13} className="text-slate-400" />
            <span className="font-mono text-slate-700 font-semibold truncate max-w-48">
              {serialId}
            </span>
          </nav>
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="flex flex-col items-center justify-center py-28 bg-white border border-slate-200 rounded-2xl shadow-2xs">
            <LoadingSpinner className="py-2" />
            <p className="mt-4 text-sm font-medium text-slate-500">
              {locale === "id"
                ? "Memverifikasi catatan sertifikasi resmi..."
                : "Verifying official certification record..."}
            </p>
          </div>
        )}

        {/* 404 / Locked / Error State */}
        {!isLoading && (isError || !companyData) && (
          <div className="bg-white border border-slate-200 rounded-2xl p-8 sm:p-12 text-center shadow-2xs max-w-2xl mx-auto my-8">
            {isLocked ? (
              <>
                <div className="w-16 h-16 bg-amber-50 text-amber-600 border border-amber-200 rounded-2xl flex items-center justify-center mx-auto mb-5 shadow-2xs">
                  <Lock size={30} />
                </div>

                <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight mb-2">
                  {locale === "id" ? "Informasi Detail Perusahaan Bersifat Privat" : "Company Detail Record is Private"}
                </h1>

                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md bg-slate-100 font-mono text-xs font-semibold text-slate-700 mb-4 border border-slate-200">
                  Serial ID: <span className="text-amber-700 font-bold">{serialId}</span>
                </div>

                <p className="text-slate-600 text-sm leading-relaxed mb-8 max-w-lg mx-auto">
                  {locale === "id"
                    ? "Sesuai ketentuan pengelola atau kebijakan internal perusahaan, lembar rincian kepatuhan indikator dan skor untuk nomor sertifikasi ini tidak dipublikasikan secara terbuka kepada umum."
                    : "Detailed indicator compliance and verification records for this certificate are private and not publicly disclosed."}
                </p>
              </>
            ) : (
              <>
                <div className="w-16 h-16 bg-rose-50 text-rose-600 border border-rose-200 rounded-2xl flex items-center justify-center mx-auto mb-5 shadow-2xs">
                  <ShieldAlert size={32} />
                </div>

                <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight mb-2">
                  {t.cert_not_found_title || "Data Sertifikat Tidak Ditemukan"}
                </h1>

                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md bg-slate-100 font-mono text-xs font-semibold text-slate-700 mb-4 border border-slate-200">
                  Serial ID: <span className="text-blue-600">{serialId}</span>
                </div>

                <p className="text-slate-600 text-sm leading-relaxed mb-8 max-w-lg mx-auto">
                  {t.cert_not_found_desc ||
                    "Nomor registrasi sertifikat tidak ditemukan atau belum diverifikasi dalam sistem resmi BECdex. Pastikan nomor seri sudah benar atau telusuri direktori perusahaan tersertifikasi."}
                </p>
              </>
            )}

            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <Link
                href="/verified-companies"
                className="w-full sm:w-auto px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm rounded-xl transition-colors shadow-2xs inline-flex items-center justify-center gap-2"
              >
                <Building2 size={16} />
                <span>{t.notfound_btn_explore || "Jelajahi Perusahaan Tersertifikasi"}</span>
              </Link>
              <Link
                href="/"
                className="w-full sm:w-auto px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-sm rounded-xl transition-colors inline-flex items-center justify-center gap-2"
              >
                <span>{t.notfound_btn_home || "Kembali ke Beranda"}</span>
              </Link>
            </div>
          </div>
        )}

        {/* Success Data Content */}
        {!isLoading && companyData && (
          <div className="space-y-6">
            {/* Header Banner: Status Validitas Sertifikat */}
            <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 shadow-xs relative overflow-hidden">
              <div className="absolute top-0 right-0 w-96 h-96 bg-blue-50/50 rounded-full blur-3xl -z-0 pointer-events-none" />

              <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                <div>
                  <div className="flex flex-wrap items-center gap-2.5 mb-2">
                    {companyData.is_active ? (
                      <span className="inline-flex items-center gap-1.5 py-1 text-xs font-bold text-green-600">
                        {t.cert_status_verified || "VERIFIED & ACTIVE"}
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-rose-50 text-rose-700 border border-rose-200 shadow-2xs">
                        <span className="w-2 h-2 rounded-full bg-rose-500" />
                        {t.cert_status_expired || "EXPIRED"}
                      </span>
                    )}

                    <span className="text-xs font-semibold text-slate-500 bg-slate-100 px-2.5 py-1 rounded-md border border-slate-200">
                      {t.cert_verification_title || "Official Blue Economy Certification"}
                    </span>
                  </div>

                  <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                    {companyData.company.name}
                  </h1>

                  <div className="mt-3 flex flex-wrap items-center gap-x-6 gap-y-2 text-xs sm:text-sm text-slate-600">
                    <div className="flex items-center gap-1.5">
                      <Calendar size={15} className="text-blue-600 shrink-0" />
                      <span>
                        <strong className="text-slate-800 font-semibold">{t.cert_validity_period || "Masa Berlaku"}:</strong>{" "}
                        {formatDate(companyData.published_at)} &mdash; {formatDate(companyData.valid_until)}
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <ShieldCheck size={15} className="text-emerald-600 shrink-0" />
                      <span>
                        <strong className="text-slate-800 font-semibold">{t.cert_signatory || "Penandatangan"}:</strong>{" "}
                        {companyData.director || "Direktur BECdex"}
                      </span>
                    </div>
                  </div>
                </div>

                {/* BICC Registration Serial Box */}
                <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 flex flex-col sm:flex-row lg:flex-col items-start sm:items-center lg:items-end justify-between gap-3 shrink-0">
                  <div className="text-left lg:text-right">
                    <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                      {t.cert_registration_no || "Nomor Registrasi BICC"}
                    </div>
                    <div className="text-base sm:text-lg font-mono font-bold text-blue-700">
                      {companyData.serial_id || serialId}
                    </div>
                  </div>

                  <button
                    onClick={handleCopySerial}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border border-slate-200 bg-white hover:bg-slate-100 text-slate-700 transition-colors cursor-pointer shadow-2xs"
                    title="Copy serial number"
                  >
                    {copied ? (
                      <>
                        <Check size={13} className="text-emerald-600" />
                        <span className="text-emerald-700 font-bold">Tersalin!</span>
                      </>
                    ) : (
                      <>
                        <Copy size={13} className="text-slate-500" />
                        <span>Salin No. BICC</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>

            {/* Grid Layout: Profil Perusahaan (Kiri) & Detail Sertifikasi (Kanan) */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              {/* Kolom Kiri: Kartu Identitas & Profil Perusahaan (7 kolom) */}
              <div className="lg:col-span-7 space-y-6">
                {/* Kartu Profil Perusahaan */}
                <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-7 shadow-xs">
                  <div className="flex items-center justify-between pb-4 mb-6 border-b border-slate-100">
                    <h2 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                      <Building2 size={18} className="text-blue-600" />
                      <span>{t.cert_company_profile || "Identitas Perusahaan"}</span>
                    </h2>
                    <span className="text-xs font-medium text-slate-400">Public Record</span>
                  </div>

                  <div className="flex flex-col sm:flex-row items-center sm:items-start gap-5 mb-6">
                    {/* Logo Perusahaan */}
                    <div className="w-24 h-24 sm:w-28 sm:h-28 shrink-0 rounded-2xl bg-slate-50 border border-slate-200 p-2.5 flex items-center justify-center overflow-hidden shadow-2xs">
                      {companyData.company.image ? (
                        /* eslint-disable-next-line @next/next/no-img-element */
                        <img
                          src={
                            companyData.company.image.startsWith("http")
                              ? companyData.company.image
                              : `${(process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000").replace(/\/api\/?$/, "")}/storage/${companyData.company.image}`
                          }
                          alt={companyData.company.name}
                          className="w-full h-full object-contain"
                        />
                      ) : (
                        <div className="w-14 h-14 rounded-full bg-blue-100 text-blue-700 font-extrabold text-2xl flex items-center justify-center">
                          {companyData.company.name.charAt(0)}
                        </div>
                      )}
                    </div>

                    {/* Informasi Utama */}
                    <div className="flex-1 min-w-0 text-center sm:text-left space-y-2">
                      <h3 className="text-xl font-bold text-slate-900 leading-snug">
                        {companyData.company.name}
                      </h3>

                      <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-blue-50 text-blue-700 text-xs font-semibold border border-blue-200/60">
                        <MdCheckCircle size={15} className="text-blue-600 shrink-0" />
                        <span>
                          Certified {companyData.category.label || companyData.category.name || "Good"} Blue Economy Company
                        </span>
                      </div>

                      <div className="pt-1 flex flex-col gap-1 text-xs text-slate-600">
                        <div className="flex items-center justify-center sm:justify-start gap-1.5">
                          <MapPin size={14} className="text-slate-400 shrink-0" />
                          <span>{getCountryName(companyData.company.country)}</span>
                        </div>
                        {companyData.company.website && (
                          <div className="flex items-center justify-center sm:justify-start gap-1.5">
                            <Globe size={14} className="text-slate-400 shrink-0" />
                            <a
                              href={
                                companyData.company.website.startsWith("http")
                                  ? companyData.company.website
                                  : `https://${companyData.company.website}`
                              }
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-blue-600 hover:text-blue-800 hover:underline inline-flex items-center gap-1 font-medium truncate max-w-xs"
                            >
                              <span>{companyData.company.website.replace(/^https?:\/\//, "")}</span>
                              <ExternalLink size={12} />
                            </a>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Detail Metadata Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-slate-100">
                    <div className="bg-slate-50/70 rounded-xl p-3.5 border border-slate-200/80">
                      <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
                        {t.cert_sector || "Sektor Usaha Maritim"}
                      </span>
                      <p className="text-xs sm:text-sm font-semibold text-slate-800">
                        {locale === "id"
                          ? companyData.company.sector_id || companyData.company.sector || "Sektor Maritim"
                          : companyData.company.sector || "Maritime Sector"}
                      </p>
                    </div>

                    <div className="bg-slate-50/70 rounded-xl p-3.5 border border-slate-200/80">
                      <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
                        {t.cert_country || "Negara Asal"}
                      </span>
                      <p className="text-xs sm:text-sm font-semibold text-slate-800">
                        {getCountryName(companyData.company.country)}
                      </p>
                    </div>

                    {companyData.company.address && (
                      <div className="sm:col-span-2 bg-slate-50/70 rounded-xl p-3.5 border border-slate-200/80">
                        <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
                          {t.cert_address || "Alamat Resmi Kantor"}
                        </span>
                        <p className="text-xs sm:text-sm text-slate-700 leading-relaxed">
                          {companyData.company.address}
                        </p>
                      </div>
                    )}

                    {companyData.company.description && (
                      <div className="sm:col-span-2 bg-slate-50/70 rounded-xl p-3.5 border border-slate-200/80">
                        <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
                          {t.cert_profile_desc || "Profile Description"}
                        </span>
                        <p className="text-xs sm:text-sm text-slate-700 leading-relaxed">
                          {companyData.company.description}
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Public Data Protection Note */}
                  <div className="mt-5 p-3 rounded-xl bg-slate-50 border border-slate-200/60 text-[11px] text-slate-500 flex items-start gap-2">
                    <ShieldCheck size={16} className="text-blue-600 shrink-0 mt-0.5" />
                    <span>
                      {locale === "id"
                        ? "Halaman ini merupakan verifikasi publik resmi BECdex. Seluruh data kontak pribadi PIC, dokumen legalitas, dan berkas internal dilindungi sesuai ketentuan privasi data."
                        : "This page is an official public verification of BECdex. All private PIC contact details and internal legal documents are protected under privacy standards."}
                    </span>
                  </div>
                </div>
              </div>

              {/* Kolom Kanan: Detail Sertifikasi (5 kolom) */}
              <div className="lg:col-span-5 space-y-6">
                {/* Ringkasan Skor & Kategori */}
                <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs">
                  <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-100">
                    <h2 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                      <Award size={18} className="text-blue-600" />
                      <span>{t.cert_score_overview || "Capaian Sertifikasi"}</span>
                    </h2>
                  </div>

                  <div className="flex items-center justify-between gap-4 p-4 rounded-xl bg-gradient-to-br from-blue-50/60 to-slate-50 border border-blue-100 mb-4">
                    <div>
                      <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 block mb-0.5">
                        Skor Validasi Akhir
                      </span>
                      <div className="text-3xl font-black text-blue-700 tracking-tight">
                        {companyData.score.toFixed(1)}
                        <span className="text-xs font-semibold text-slate-400 ml-1">/ 100</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 block mb-0.5">
                        Peringkat Mutu
                      </span>
                      <span className="inline-block px-3 py-1 rounded-full text-xs font-extrabold bg-blue-600 text-white shadow-2xs">
                        {companyData.category.label || companyData.category.name || "Good"}
                      </span>
                    </div>
                  </div>

                  <div className="space-y-2.5 text-xs text-slate-600">
                    <div className="flex items-center justify-between py-1 border-b border-slate-100">
                      <span className="text-slate-500">{t.cert_published_date || "Tanggal Terbit"}:</span>
                      <span className="font-semibold text-slate-800">{formatDate(companyData.published_at)}</span>
                    </div>
                    <div className="flex items-center justify-between py-1 border-b border-slate-100">
                      <span className="text-slate-500">{t.cert_valid_until || "Berlaku Hingga"}:</span>
                      <span className="font-semibold text-slate-800">{formatDate(companyData.valid_until)}</span>
                    </div>
                    <div className="flex items-center justify-between py-1">
                      <span className="text-slate-500">{t.cert_signatory || "Direktur BECdex"}:</span>
                      <span className="font-semibold text-slate-800">{companyData.director || "Rahmat Ihsan, S.H."}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      <PublicFooter />
    </div>
  );
}
