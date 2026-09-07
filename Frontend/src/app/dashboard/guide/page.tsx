"use client";

import React, { useState } from "react";
import { AppLayout } from "@/components/layouts/AppLayout";
import { useTranslation } from "@/store/lang";
import { 
  Building2, 
  FileCheck, 
  Search, 
  CreditCard, 
  MapPin, 
  Award,
  CheckCircle2,
  DownloadCloud,
  Lightbulb,
  Headphones,
  X,
  Loader2
} from "lucide-react";
import { toast } from "sonner";
import api from "@/lib/api";
import { cn } from "@/lib/utils";

export default function UserGuidePage() {
  const { locale, t } = useTranslation();

  const [isHelpOpen, setIsHelpOpen] = useState(false);
  const [helpForm, setHelpForm] = useState({ name: "", email: "", phone: "", category: "Feedback", detail: "" });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleHelpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!helpForm.name || !helpForm.email || !helpForm.detail) {
      toast.error(locale === "id" ? "Mohon isi semua bidang wajib!" : "Please fill in all required fields!");
      return;
    }
    setIsSubmitting(true);
    try {
      await api.post("/public/help", {
        name: helpForm.name,
        email: helpForm.email,
        whatsapp: helpForm.phone,
        issue_type: helpForm.category,
        detail: helpForm.detail,
      });
      toast.success(locale === "id" ? "Pesan bantuan Anda telah berhasil dikirim!" : "Your help request has been successfully sent!");
      setHelpForm({ name: "", email: "", phone: "", category: "Feedback", detail: "" });
      setIsHelpOpen(false);
    } catch {
      toast.error(locale === "id" ? "Gagal mengirim pesan." : "Failed to send help request.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const STEPS = [
    {
      id: 1,
      title: locale === 'id' ? "Registrasi & Profil Perusahaan" : "Registration & Company Profile",
      desc: locale === 'id' 
        ? "Sebelum dapat mengajukan sertifikasi, Anda wajib melengkapi data profil perusahaan secara menyeluruh di menu Profil Perusahaan. Data ini mencakup NIB, NPWP, alamat operasional, dan kontak PIC."
        : "Before applying for certification, you must completely fill out your company profile in the Company Profile menu. This includes business licenses, tax ID, operational address, and PIC contact.",
      icon: Building2,
      color: "blue",
    },
    {
      id: 2,
      title: locale === 'id' ? "Penilaian Mandiri & Unggah Berkas" : "Self-Assessment & Document Upload",
      desc: locale === 'id'
        ? "Buka menu Submissions dan buat pengajuan baru. Anda akan diminta untuk menjawab serangkaian kuesioner Indeks Blue Economy dan mengunggah dokumen bukti (evidence) pendukung untuk setiap jawaban."
        : "Go to the Submissions menu and create a new application. You will be asked to answer a series of Blue Economy Index questionnaires and upload supporting evidence documents for each answer.",
      icon: FileCheck,
      color: "indigo",
    },
    {
      id: 3,
      title: locale === 'id' ? "Proses Verifikasi & Revisi Dokumen" : "Verification Process & Document Revision",
      desc: locale === 'id'
        ? "Setelah diajukan, tim asesor BECdex akan memeriksa dokumen Anda (Status: Under Verification). Jika ada dokumen yang kurang valid, status akan berubah menjadi Revisi. Anda harus memperbaiki dokumen yang ditandai dan mengajukannya kembali."
        : "Once submitted, the BECdex assessor team will review your documents (Status: Under Verification). If any document is invalid, the status will change to Revision. You must correct the marked documents and resubmit.",
      icon: Search,
      color: "amber",
    },
    {
      id: 4,
      title: locale === 'id' ? "Lolos Verifikasi Awal & Pembayaran" : "Initial Verification Passed & Payment",
      desc: locale === 'id'
        ? "Jika seluruh dokumen memenuhi syarat, Anda akan dinyatakan Lolos Verifikasi Awal. Tagihan sertifikasi (Invoice) akan muncul di tab Pembayaran. Harap segera melunasi pembayaran melalui metode yang tersedia agar proses dapat dilanjutkan."
        : "If all documents meet the requirements, you will pass the Initial Verification. A certification invoice will appear in the Payment tab. Please settle the payment promptly through the available methods to continue the process.",
      icon: CreditCard,
      color: "emerald",
    },
    {
      id: 5,
      title: locale === 'id' ? "Survei Lapangan & Wawancara" : "Field Survey & Interview",
      desc: locale === 'id'
        ? "Setelah pembayaran tervalidasi, tim BECdex akan mengatur jadwal survei fisik atau daring ke fasilitas Anda untuk memvalidasi langsung kesesuaian dokumen dengan kondisi lapangan."
        : "After payment validation, the BECdex team will arrange a physical or online survey schedule to your facility to directly validate the conformity of documents with field conditions.",
      icon: MapPin,
      color: "purple",
    },
    {
      id: 6,
      title: locale === 'id' ? "Penerbitan Sertifikat BECdex" : "BECdex Certificate Issuance",
      desc: locale === 'id'
        ? "Selamat! Jika survei lapangan berhasil, dewan BECdex akan menerbitkan Sertifikat resmi untuk perusahaan Anda yang dapat diunduh langsung dari sistem beserta dengan skor akhirnya."
        : "Congratulations! If the field survey is successful, the BECdex board will issue an official Certificate for your company which can be downloaded directly from the system along with the final score.",
      icon: Award,
      color: "rose",
    }
  ];

  const getColorClasses = (color: string) => {
    switch (color) {
      case "blue": return "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-400 border-blue-200 dark:border-blue-800";
      case "indigo": return "bg-indigo-100 text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-400 border-indigo-200 dark:border-indigo-800";
      case "amber": return "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-400 border-amber-200 dark:border-amber-800";
      case "emerald": return "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800";
      case "purple": return "bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-400 border-purple-200 dark:border-purple-800";
      case "rose": return "bg-rose-100 text-rose-700 dark:bg-rose-900/40 dark:text-rose-400 border-rose-200 dark:border-rose-800";
      default: return "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-400 border-slate-200 dark:border-slate-700";
    }
  };

  return (
    <AppLayout title={locale === 'id' ? "Panduan Pengguna" : "User Guide"}>
      <div className="max-w-4xl mx-auto py-6">
        
        {/* Header Section */}
        <div className="mb-10 text-center">
          <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight mb-4">
            {locale === 'id' ? "Panduan Sertifikasi BECdex" : "BECdex Certification Guide"}
          </h1>
          <p className="text-slate-600 dark:text-slate-400 text-base max-w-2xl mx-auto leading-relaxed mb-6">
            {locale === 'id' 
              ? "Pelajari tahapan lengkap proses sertifikasi Blue Economy Company Index (BECdex) dari awal pendaftaran hingga penerbitan sertifikat." 
              : "Learn the complete steps of the Blue Economy Company Index (BECdex) certification process from initial registration to certificate issuance."}
          </p>
          <a 
            href="/proposal.pdf"
            target="_blank"
            download
            className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-full bg-[#012970] text-white font-bold text-sm shadow-sm hover:bg-[#021f54] hover:shadow-md transition-all active:scale-95 cursor-pointer"
          >
            <DownloadCloud size={18} />
            {locale === 'id' ? "Unduh Buku Panduan (PDF)" : "Download Guidebook (PDF)"}
          </a>
        </div>

        {/* Timeline Section */}
        <div className="relative">
          {/* Vertical Line */}
          <div className="absolute left-8 top-8 bottom-8 w-0.5 bg-slate-200 dark:bg-slate-800 hidden md:block"></div>

          <div className="space-y-6 md:space-y-8">
            {STEPS.map((step) => {
              const Icon = step.icon;
              return (
                <div key={step.id} className="relative flex flex-col md:flex-row items-start gap-6 group">
                  
                  {/* Step Number / Icon Badge */}
                  <div className="relative z-10 flex shrink-0 items-center justify-center">
                    <div className={cn(
                      "w-16 h-16 rounded-2xl flex items-center justify-center border-2 shadow-sm transition-transform duration-300 group-hover:scale-105",
                      getColorClasses(step.color)
                    )}>
                      <Icon size={28} strokeWidth={2.5} />
                    </div>
                  </div>

                  {/* Content Card */}
                  <div className="flex-1 w-full">
                    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow">
                      <div className="flex items-center gap-3 mb-2">
                        <span className="text-xs font-extrabold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                          {locale === 'id' ? `Langkah ${step.id}` : `Step ${step.id}`}
                        </span>
                      </div>
                      <h3 className="text-xl font-extrabold text-slate-800 dark:text-white mb-2">
                        {step.title}
                      </h3>
                      <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                        {step.desc}
                      </p>
                      
                      {/* Pro-Tips specifically for step 2 */}
                      {step.id === 2 && (
                        <div className="mt-4 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800/50 rounded-xl p-4 flex items-start gap-3">
                          <Lightbulb size={20} className="text-amber-500 shrink-0 mt-0.5" />
                          <div>
                            <h5 className="text-xs font-bold text-amber-900 dark:text-amber-200 mb-0.5">
                              {locale === 'id' ? "Tips Menghindari Revisi" : "Tips to Avoid Revision"}
                            </h5>
                            <p className="text-xs text-amber-700 dark:text-amber-300 leading-relaxed">
                              {locale === 'id' 
                                ? "Pastikan dokumen PDF yang diunggah dapat terbaca jelas (tidak buram), memiliki resolusi baik, dan ukuran tiap berkas maksimal 5MB agar memudahkan proses validasi."
                                : "Ensure that the uploaded PDF documents are clearly legible (not blurry), have good resolution, and maximum 5MB per file to facilitate the validation process."}
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Footer Note */}
        <div className="mt-12 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800/50 rounded-2xl p-6 flex items-start gap-4">
          <CheckCircle2 size={24} className="text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
          <div>
            <h4 className="font-bold text-blue-900 dark:text-blue-200 text-sm">
              {locale === 'id' ? "Butuh Bantuan Lebih Lanjut?" : "Need Further Assistance?"}
            </h4>
            <p className="text-xs text-blue-700 dark:text-blue-300 mt-1 mb-4">
              {locale === 'id' 
                ? "Jika Anda mengalami kendala teknis atau memiliki pertanyaan terkait proses sertifikasi, Anda dapat menghubungi tim dukungan BECdex dengan mengirimkan pesan aduan."
                : "If you experience technical difficulties or have questions regarding the certification process, you can contact the BECdex support team by sending an issue report."}
            </p>
            <button
              onClick={() => setIsHelpOpen(true)}
              className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold transition-colors shadow-xs active:scale-95"
            >
              <Headphones size={16} />
              {locale === 'id' ? "Hubungi Dukungan" : "Contact Support"}
            </button>
          </div>
        </div>

        {/* Help Modal */}
        {isHelpOpen && (
          <div className="fixed inset-0 z-100 flex items-center justify-center bg-black/40 px-4">
            <div className="bg-white rounded-2xl w-full max-w-md p-6 shadow-2xl relative space-y-4 animate-in fade-in zoom-in-95 duration-200">
              <button onClick={() => setIsHelpOpen(false)} className="absolute right-4 top-4 p-1 rounded-lg text-gray-400 hover:bg-gray-100 hover:text-gray-700 transition-colors">
                <X size={18} />
              </button>
              <h3 className="text-[#012970] font-black text-xl">{t.help_title || (locale === 'id' ? "Pusat Bantuan" : "Help Center")}</h3>
              <form onSubmit={handleHelpSubmit} className="space-y-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">{t.help_name || "Name"}</label>
                  <input
                    type="text"
                    required
                    value={helpForm.name}
                    onChange={(e) => setHelpForm({ ...helpForm, name: e.target.value })}
                    placeholder={t.help_placeholder || "Input here"}
                    className="w-full text-xs border border-gray-200 rounded-lg px-3 py-2 bg-gray-50 focus:bg-white outline-none focus:ring-2 focus:ring-[#4154f1]/20"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">{t.help_email || "Email"}</label>
                  <input
                    type="email"
                    required
                    value={helpForm.email}
                    onChange={(e) => setHelpForm({ ...helpForm, email: e.target.value })}
                    placeholder={t.help_placeholder || "Input here"}
                    className="w-full text-xs border border-gray-200 rounded-lg px-3 py-2 bg-gray-50 focus:bg-white outline-none focus:ring-2 focus:ring-[#4154f1]/20"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">{t.help_phone || "Phone Number"}</label>
                  <input
                    type="tel"
                    required
                    value={helpForm.phone}
                    onChange={(e) => setHelpForm({ ...helpForm, phone: e.target.value })}
                    placeholder={t.help_placeholder || "Input here"}
                    className="w-full text-xs border border-gray-200 rounded-lg px-3 py-2 bg-gray-50 focus:bg-white outline-none focus:ring-2 focus:ring-[#4154f1]/20"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">{t.help_category || "Category"}</label>
                  <select
                    value={helpForm.category}
                    onChange={(e) => setHelpForm({ ...helpForm, category: e.target.value })}
                    className="w-full text-xs border border-gray-200 rounded-lg px-3 py-2 bg-gray-50 outline-none"
                  >
                    <option value="Feedback">{t.help_feedback || "Feedback"}</option>
                    <option value="Platform">{t.help_platform || "Platform"}</option>
                    <option value="Optional">{t.help_optional || "Optional"}</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">{t.help_detail || "Detail"}</label>
                  <textarea
                    required
                    rows={3}
                    value={helpForm.detail}
                    onChange={(e) => setHelpForm({ ...helpForm, detail: e.target.value })}
                    className="w-full text-xs border border-gray-200 rounded-lg px-3 py-2 bg-gray-50 focus:bg-white outline-none focus:ring-2 focus:ring-[#4154f1]/20"
                  />
                </div>
                <div className="flex justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setIsHelpOpen(false)}
                    className="px-4 py-2 border border-gray-200 rounded-lg text-xs font-medium text-gray-600 hover:bg-gray-50 transition-colors"
                  >
                    {t.help_close || "Close"}
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="px-4 py-2 bg-[#4154f1] text-white rounded-lg text-xs font-bold hover:bg-[#2e3fe6] shadow-xs flex items-center gap-1.5 disabled:opacity-60 transition-colors"
                  >
                    {isSubmitting && <Loader2 size={12} className="animate-spin" />}
                    {t.help_save || "Save changes"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

      </div>
    </AppLayout>
  );
}
