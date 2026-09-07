"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useParams } from "next/navigation";
import { AppLayout } from "@/components/layouts/AppLayout";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { LoadingSpinner } from "@/components/ui/index";
import api from "@/lib/api";
import { SubmissionDetail } from "@/types";
import { cn } from "@/lib/utils";
import { AssessmentTab } from "@/components/submission-tabs/AssessmentTab";
import { DocumentsTab } from "@/components/submission-tabs/DocumentsTab";
import { ScorePaymentTab } from "@/components/submission-tabs/ScorePaymentTab";
import { StatusTab } from "@/components/submission-tabs/StatusTab";
import { CertificateTab } from "@/components/submission-tabs/CertificateTab";

import {
  ArrowLeft,
  ClipboardList,
  FolderOpen,
  CreditCard,
  History,
  Award,
  Anchor,
  XCircle,
  Clock,
} from "lucide-react";
import { MdLocationOn } from "react-icons/md";
import Link from "next/link";

import { useTranslation } from "@/store/lang";

const TABS = [
  { id: "assessment", labelKey: "dash_sub_tab_assessment", defaultLabel: "Form Assessment", icon: ClipboardList },
  { id: "score", labelKey: "dash_sub_tab_score", defaultLabel: "Skor & Pembayaran", icon: CreditCard },
  { id: "status", labelKey: "dash_sub_tab_status", defaultLabel: "Riwayat Status", icon: History },
  { id: "certificate", labelKey: "dash_sub_tab_certificate", defaultLabel: "Sertifikat Resmi", icon: Award },
  { id: "documents", labelKey: "dash_sub_tab_documents", defaultLabel: "Dokumen Terunggah", icon: FolderOpen },
];

export default function SubmissionDetailPage() {
  const params = useParams();
  const id = params.id as string;
  const [activeTab, setActiveTab] = useState("assessment");
  const { t } = useTranslation();

  const { data, isLoading, error, refetch } = useQuery<{ data: SubmissionDetail }>({
    queryKey: ["submission", id],
    queryFn: async () => {
      const res = await api.get(`/submissions/${id}`);
      return res.data;
    },
    staleTime: 0,
    gcTime: 0,
  });

  const submission = data?.data;

  if (isLoading) {
    return (
      <AppLayout title={t.dash_sub_detail_title || "Detail Submission"}>
        <div className="py-24">
          <LoadingSpinner />
        </div>
      </AppLayout>
    );
  }

  if (error || !submission) {
    return (
      <AppLayout title={t.dash_sub_detail_title || "Detail Submission"}>
        <div className="rounded-2xl border border-rose-200 bg-rose-50 p-8 text-center text-rose-700 dark:border-rose-900/50 dark:bg-rose-950/30 max-w-lg mx-auto my-12 shadow-2xs">
          <h3 className="font-bold text-base mb-1">{t.dash_sub_not_found || "Submission Tidak Ditemukan"}</h3>
          <p className="text-xs text-rose-600">
            {t.dash_sub_not_found_desc || "Berkas pengajuan dengan ID tersebut tidak tersedia atau gagal dimuat dari server."}
          </p>
          <Link
            href="/dashboard"
            className="mt-4 inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 dark:bg-[#0c2340] dark:hover:bg-blue-800 text-white font-bold px-4 py-2 rounded-xl text-xs shadow-xs"
          >
            <ArrowLeft size={14} />
            {t.dash_sub_back_dashboard || "Kembali ke Dashboard"}
          </Link>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout title={t.dash_sub_detail_title || "Detail Submission"}>
      {/* Navigation & Breadcrumb */}
      <div className="flex items-center justify-between mb-4">
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-2 text-slate-500 hover:text-blue-700 dark:text-slate-400 dark:hover:text-white text-xs font-bold transition-colors bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 px-3.5 py-2 rounded-xl shadow-2xs"
        >
          <ArrowLeft size={14} />
          <span>{t.dash_sub_back_dashboard || "Kembali ke Dashboard"}</span>
        </Link>

        <div className="hidden sm:flex items-center gap-1.5 text-xs text-slate-400 font-medium">
          <span>{t.dash_sub_portal || "Portal Perusahaan"}</span>
          <span>&bull;</span>
          <span className="text-slate-600 dark:text-slate-300 font-semibold">{t.dash_sub_cert || "Sertifikasi BECdex"}</span>
        </div>
      </div>

      {/* TailAdmin Premium Header Card */}
      <div className="relative overflow-hidden rounded-2xl border border-slate-200/80 bg-white dark:border-slate-800 dark:bg-slate-900 p-6 shadow-2xs transition-colors">
        <div className="absolute right-0 top-0 w-64 h-full bg-linear-to-l from-blue-50/50 via-transparent to-transparent dark:from-blue-950/20 pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-2xl bg-linear-to-br from-blue-600 to-indigo-700 dark:from-[#0c2340] dark:to-blue-700 flex items-center justify-center text-white shadow-md shadow-blue-600/15 dark:shadow-[#0c2340]/15 shrink-0 border border-blue-400/20">
              <Anchor size={24} className="text-blue-300" strokeWidth={2.2} />
            </div>

            <div>
              <div className="flex items-center gap-2.5 flex-wrap">
                <h2 className="text-xl md:text-2xl font-extrabold text-slate-800 dark:text-white tracking-tight leading-none">
                  {t.dash_sub_heading_detail || "Pengajuan Indeks Blue Economy"}
                </h2>
                <span className="bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-mono text-[11px] font-bold px-2 py-0.5 rounded-md border border-slate-200 dark:border-slate-700">
                  #{submission.id.slice(0, 8).toUpperCase()}
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1.5 font-medium leading-relaxed">
                {t.dash_sub_doc_id || "ID Dokumen Lengkap:"} <span className="font-mono">{submission.id}</span>
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3 pt-4 border-t border-slate-100 dark:border-slate-800 lg:pt-0 lg:border-t-0 shrink-0">
            {/* Score Pill */}
            <div className="flex items-center gap-3 bg-slate-50 dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700 px-4 py-2 rounded-xl text-xs">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                  {t.dash_sub_score_initial || "Skor Mandiri"}
                </span>
                <span className="font-extrabold text-slate-800 dark:text-white text-sm">
                  {submission.initial_score.toFixed(1)}%
                </span>
              </div>
              <div className="w-px h-7 bg-slate-200 dark:bg-slate-700" />
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                  {t.dash_sub_score_valid || "Skor Validasi"}
                </span>
                <span
                  className={cn(
                    "font-extrabold text-sm",
                    submission.valid_score > 0
                      ? "text-emerald-600 dark:text-emerald-400"
                      : "text-slate-400"
                  )}
                >
                  {submission.valid_score > 0 ? `${submission.valid_score.toFixed(1)}%` : "—"}
                </span>
              </div>
            </div>

            {/* Status Badge Pill */}
            <div className="flex flex-col items-end gap-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                {t.dash_table_status || "Status Alur"}
              </span>
              <StatusBadge status={submission.status} />
            </div>
          </div>
        </div>
      </div>

      {/* Revision / Survey Alert Banner */}
      {submission.status.id === 4 && (
        <div className="rounded-2xl border-2 border-amber-400 bg-amber-50/95 dark:border-amber-700 dark:bg-amber-950/70 p-6 shadow-md text-amber-950 dark:text-amber-100 flex flex-col gap-4 animate-in fade-in slide-in-from-top-2 duration-300 mb-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-3 border-b border-amber-200/80 dark:border-amber-800/80">
            <div className="flex items-start gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-amber-500 text-white flex items-center justify-center font-black text-xl shrink-0 shadow-sm mt-0.5">
                !
              </div>
              <div>
                <h4 className="font-extrabold text-base md:text-lg tracking-tight text-amber-950 dark:text-amber-100">
                  {submission.is_post_survey_revision
                    ? "Revisi Diperlukan Pasca Survei Lapangan"
                    : (t.dash_sub_rev_title || "Pengajuan Memerlukan Perbaikan / Revisi Dokumen (Kesempatan Ke-2)")}
                </h4>
                <p className="text-xs font-semibold text-amber-800 dark:text-amber-300 mt-0.5">
                  {submission.is_post_survey_revision
                    ? "Berdasarkan hasil survei lapangan, terdapat dokumen yang perlu diperbaiki. Anda diwajibkan membayar biaya survei ulang sebelum revisi dapat diproses."
                    : "Tim verifikator auditor BECdex mengembalikan pengajuan Anda untuk dilakukan perbaikan berkas/jawaban."}
                </p>
              </div>
            </div>
            <button
              onClick={() => setActiveTab(submission.requires_payment ? "score" : "assessment")}
              className="px-4 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-extrabold text-xs shadow-md transition-all shrink-0 cursor-pointer flex items-center gap-2"
            >
              <span>{submission.requires_payment ? "Lanjut ke Pembayaran Survei" : "Buka Form Assessment & Perbaiki"}</span> &rarr;
            </button>
          </div>

          {/* General Admin Return Reason */}
          {submission.reason && (
            <div className="bg-white/80 dark:bg-slate-900/80 border border-amber-300 dark:border-amber-800/80 rounded-xl p-4 text-xs">
              <span className="font-extrabold uppercase tracking-wider text-[10px] text-amber-700 dark:text-amber-400 block mb-1">
                💬 Catatan / Alasan Utama Pengembalian dari Admin:
              </span>
              <p className="font-bold text-slate-800 dark:text-slate-200 leading-relaxed text-sm">
                &ldquo;{submission.reason}&rdquo;
              </p>
            </div>
          )}

          {/* List of Problematic Indicators needing revision */}
          {(() => {
            const revisedIndicators = (submission.per_indicators ?? []).filter(
              (pi) => pi.status?.id === 5
            );
            if (revisedIndicators.length === 0) return null;
            return (
              <div className="space-y-2">
                <span className="font-extrabold uppercase tracking-wider text-[11px] text-amber-900 dark:text-amber-300 block">
                  📋 Indikator yang Wajib Diperbaiki ({revisedIndicators.length} Indikator):
                </span>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
                  {revisedIndicators.map((pi) => (
                    <div
                      key={pi.id}
                      onClick={() => setActiveTab("assessment")}
                      className="bg-amber-100/70 hover:bg-amber-100 dark:bg-amber-900/40 dark:hover:bg-amber-900/60 border border-amber-300 dark:border-amber-700/80 rounded-xl p-3 text-xs transition-colors cursor-pointer flex flex-col justify-between"
                    >
                      <div>
                        <div className="flex items-center justify-between gap-2 mb-1">
                          <span className="font-extrabold text-amber-950 dark:text-amber-100">
                            ★ {pi.indicator.name}
                          </span>
                          <span className="bg-amber-200 dark:bg-amber-800 text-amber-900 dark:text-amber-100 font-extrabold text-[10px] px-2 py-0.5 rounded-md shrink-0">
                            Revisi
                          </span>
                        </div>
                        <p className="text-[11px] text-amber-800 dark:text-amber-300 italic font-medium">
                          {pi.comment ? `"${pi.comment}"` : "Silakan tinjau kembali berkas/jawaban indikator ini."}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })()}
        </div>
      )}

      {/* Survey Active Alert Banner */}
      {submission.status.id === 7 && (
        <div className="rounded-2xl border border-blue-300 bg-blue-50/90 dark:border-blue-800 dark:bg-blue-950/60 p-5 shadow-sm text-blue-900 dark:text-blue-200 flex items-start gap-3.5 mb-6 animate-in fade-in slide-in-from-top-2 duration-300">
          <div className="w-10 h-10 rounded-xl bg-blue-100 dark:bg-blue-900/80 text-blue-700 dark:text-blue-300 flex items-center justify-center font-extrabold shrink-0 mt-0.5">
            <MdLocationOn className="w-5 h-5" />
          </div>
          <div>
            <h4 className="font-extrabold text-sm md:text-base tracking-tight text-blue-900 dark:text-blue-200">
              {t.dash_sub_survey_title || "Jadwal Survei Lapangan & Wawancara Aktif"}
            </h4>
            <p className="text-xs text-blue-700 dark:text-blue-300 mt-1 leading-relaxed">
              {t.dash_sub_survey_desc || "Tim asesor lapangan BECdex dijadwalkan untuk melakukan verifikasi langsung ke fasilitas operasional perusahaan Anda sesuai konfirmasi yang dikirimkan. Pastikan seluruh dokumen asli tersedia untuk pengecekan."}
            </p>
          </div>
        </div>
      )}

      {/* Pending Payment Alert Banner (Status 1) */}
      {submission.status.id === 1 && (
        <div className="rounded-2xl border border-amber-300 bg-amber-50/90 dark:border-amber-800 dark:bg-amber-950/60 p-5 shadow-sm text-amber-900 dark:text-amber-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6 animate-in fade-in slide-in-from-top-2 duration-300">
          <div className="flex items-start gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-amber-100 dark:bg-amber-900/80 text-amber-700 dark:text-amber-300 flex items-center justify-center font-extrabold shrink-0 mt-0.5">
              <CreditCard className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-extrabold text-sm md:text-base tracking-tight text-amber-800 dark:text-amber-200">
                Selesaikan Pembayaran Sertifikasi Anda
              </h4>
              <p className="text-xs text-amber-700 dark:text-amber-300 mt-1 leading-relaxed">
                Anda memiliki tagihan sertifikasi yang belum dibayar. Segera selesaikan pembayaran sebelum invoice Anda kedaluwarsa agar proses dapat dilanjutkan ke tahap survei.
              </p>
            </div>
          </div>
          <button
            onClick={() => setActiveTab("score")}
            className="px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-extrabold text-xs shadow-xs transition-all shrink-0 cursor-pointer"
          >
            Buka Halaman Pembayaran &rarr;
          </button>
        </div>
      )}

      {/* Verification Approved (Status 8) */}
      {submission.status.id === 8 && (
        <div className="rounded-2xl border border-emerald-300 bg-emerald-50/90 dark:border-emerald-800 dark:bg-emerald-950/60 p-5 shadow-sm text-emerald-900 dark:text-emerald-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6 animate-in fade-in slide-in-from-top-2 duration-300">
          <div className="flex items-start gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-900/80 text-emerald-700 dark:text-emerald-300 flex items-center justify-center font-extrabold shrink-0 mt-0.5">
              <Award className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-extrabold text-sm md:text-base tracking-tight text-emerald-800 dark:text-emerald-200">
                Selamat! Pengajuan Anda Lolos Verifikasi
              </h4>
              <p className="text-xs text-emerald-700 dark:text-emerald-300 mt-1 leading-relaxed">
                Berkas dan kuesioner Anda telah dinyatakan memenuhi syarat awal oleh tim asesor. Silakan lanjutkan ke tahap pembayaran untuk mengaktifkan jadwal survei fisik.
              </p>
            </div>
          </div>
          <button
            onClick={() => setActiveTab("score")}
            className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs shadow-xs transition-all shrink-0 cursor-pointer"
          >
            Lanjut ke Pembayaran &rarr;
          </button>
        </div>
      )}

      {/* Payment Successful / Waiting for Survey (Status 6) */}
      {submission.status.id === 6 && (
        <div className="rounded-2xl border border-blue-300 bg-blue-50/90 dark:border-blue-800 dark:bg-blue-950/60 p-5 shadow-sm text-blue-900 dark:text-blue-200 flex items-start gap-3.5 mb-6 animate-in fade-in slide-in-from-top-2 duration-300">
          <div className="w-10 h-10 rounded-xl bg-blue-100 dark:bg-blue-900/80 text-blue-700 dark:text-blue-300 flex items-center justify-center font-extrabold shrink-0 mt-0.5">
            <Clock className="w-5 h-5" />
          </div>
          <div>
            <h4 className="font-extrabold text-sm md:text-base tracking-tight text-blue-900 dark:text-blue-200">
              Menunggu Jadwal Survei Lokasi
            </h4>
            <p className="text-xs text-blue-700 dark:text-blue-300 mt-1 leading-relaxed">
              Pembayaran Anda telah kami terima. Tim BECdex sedang memproses antrian dan akan segera mengatur jadwal survei fisik ke lokasi perusahaan Anda. Harap pantau terus secara berkala.
            </p>
          </div>
        </div>
      )}

      {/* Rejected Permanently (Status 9) */}
      {submission.status.id === 9 && (
        <div className="rounded-2xl border border-rose-300 bg-rose-50/90 dark:border-rose-800 dark:bg-rose-950/60 p-5 shadow-sm text-rose-900 dark:text-rose-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6 animate-in fade-in slide-in-from-top-2 duration-300">
          <div className="flex items-start gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-rose-100 dark:bg-rose-900/80 text-rose-700 dark:text-rose-300 flex items-center justify-center font-extrabold shrink-0 mt-0.5">
              <XCircle className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-extrabold text-sm md:text-base tracking-tight text-rose-800 dark:text-rose-200">
                Pengajuan Sertifikasi Ditolak
              </h4>
              <p className="text-xs text-rose-700 dark:text-rose-300 mt-1 leading-relaxed">
                Mohon maaf, pengajuan sertifikasi Anda telah ditolak secara permanen oleh tim verifikator. Silakan buka halaman Skor & Pembayaran atau Status untuk melihat alasan lengkap penolakan.
              </p>
            </div>
          </div>
          <button
            onClick={() => setActiveTab("score")}
            className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-extrabold text-xs shadow-xs transition-all shrink-0 cursor-pointer"
          >
            Lihat Alasan Penolakan &rarr;
          </button>
        </div>
      )}

      {/* Tabs Card Wrapper */}
      <div className="rounded-2xl border border-slate-200/80 bg-white dark:border-slate-800 dark:bg-slate-900 shadow-2xs overflow-hidden transition-colors">
        {/* Navigation Tab Bar */}
        <div className="border-b border-slate-200/80 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 px-2 sm:px-4">
          <nav className="flex overflow-x-auto no-scrollbar gap-1">
            {TABS.map((tab) => {
              const Icon = tab.icon;
              const active = activeTab === tab.id;

              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={cn(
                    "group relative flex items-center gap-2.5 px-5 py-4 text-xs font-bold whitespace-nowrap transition-all duration-200 cursor-pointer rounded-t-xl",
                    active
                      ? "text-blue-700 dark:text-blue-300 bg-white dark:bg-slate-900 shadow-xs border-t-2 border-t-blue-600 dark:border-t-blue-500 font-bold"
                      : "text-slate-500 hover:text-blue-700 dark:text-slate-400 dark:hover:text-slate-200 hover:bg-slate-100/60 dark:hover:bg-slate-800/50 border-t-2 border-t-transparent font-medium"
                  )}
                >
                  <Icon
                    size={16}
                    className={cn(
                      "transition-transform duration-200 group-hover:scale-110",
                      active ? "text-blue-600 dark:text-blue-400" : "text-slate-400"
                    )}
                  />
                  <span>{t[tab.labelKey as keyof typeof t] || tab.defaultLabel}</span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Tab Content Section */}
        <div className="p-5 md:p-8">
          {activeTab === "assessment" && (
            <AssessmentTab submission={submission} onUpdate={refetch} onGoToScore={() => setActiveTab("score")} />
          )}
          {activeTab === "documents" && (
            <DocumentsTab submission={submission} />
          )}
          {activeTab === "score" && (
            <ScorePaymentTab submission={submission} onUpdate={refetch} />
          )}
          {activeTab === "status" && <StatusTab submission={submission} />}
          {activeTab === "certificate" && <CertificateTab submission={submission} />}
        </div>
      </div>
    </AppLayout>
  );
}
