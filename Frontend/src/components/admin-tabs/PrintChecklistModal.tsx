"use client";

import { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import { SubmissionDetail, PerIndicator } from "@/types";
import { Printer, X, ShieldCheck, CheckSquare, Building2, MapPin, Calendar, Users, FileText, Award, Star } from "lucide-react";
import Image from "next/image";
import { cn } from "@/lib/utils";

interface Props {
  submission: SubmissionDetail;
  isOpen: boolean;
  onClose: () => void;
  assignedAssessors?: { id: number; name: string; email?: string }[];
}

export default function PrintChecklistModal({
  submission,
  isOpen,
  onClose,
  assignedAssessors = [],
}: Props) {
  const [lang, setLang] = useState<"id" | "en">("id");
  const [showSelfScores, setShowSelfScores] = useState<boolean>(true);
  const [filterMandatoryOnly, setFilterMandatoryOnly] = useState<boolean>(false);
  const [mounted, setMounted] = useState<boolean>(false);
  const printAreaRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  if (!isOpen || !mounted) return null;

  const company = submission.user?.company;
  const checklistId = "BCDBICC20260002";
  const officialAssessors = [
    { id: 1, name: "Dr. Ir. Diah Pranitasari, M.M., C.Bec. (BizDev)" },
    { id: 2, name: "Dr. Gatot Prabantoro, C.Bec., (BizDev)" }
  ];

  const assessors = (assignedAssessors.length >= 2 && assignedAssessors[0].name.includes("."))
    ? assignedAssessors
    : officialAssessors;

  // Map urutan indikator 1..N berdasarkan keseluruhan indikator
  const indicatorNumberMap = new Map<number, number>();
  let counter = 0;
  for (const pi of submission.per_indicators ?? []) {
    if (!indicatorNumberMap.has(pi.indicator_id)) {
      indicatorNumberMap.set(pi.indicator_id, ++counter);
    }
  }

  // Hitung jumlah indikator wajib vs opsional
  const mandatoryCount = (submission.per_indicators ?? []).filter(
    (pi) => pi.indicator?.is_mandatory || pi.indicator?.questions?.some((q) => q.is_mandatory)
  ).length;
  const totalCount = submission.per_indicators?.length ?? 0;
  const optionalCount = Math.max(0, totalCount - mandatoryCount);

  // Filter daftar indikator jika asesor memilih 'Khusus Indikator Wajib'
  const displayedIndicators = filterMandatoryOnly
    ? (submission.per_indicators ?? []).filter(
      (pi) => pi.indicator?.is_mandatory || pi.indicator?.questions?.some((q) => q.is_mandatory)
    )
    : (submission.per_indicators ?? []);

  // Kelompokkan per_indicators berdasarkan Prinsip & Aspek
  type GroupedData = Map<string, Map<string, PerIndicator[]>>;
  const grouped: GroupedData = new Map();

  for (const pi of displayedIndicators) {
    const aspectName = (lang === "id"
      ? (pi.indicator?.principle?.outcome?.aspect?.name_id || pi.indicator?.principle?.outcome?.aspect?.name)
      : pi.indicator?.principle?.outcome?.aspect?.name) || "Standar Penilaian";

    const principleName = (lang === "id"
      ? (pi.indicator?.principle?.name_id || pi.indicator?.principle?.name)
      : pi.indicator?.principle?.name) || "Prinsip Penilaian";

    if (!grouped.has(aspectName)) grouped.set(aspectName, new Map());
    const principleMap = grouped.get(aspectName)!;
    if (!principleMap.has(principleName)) principleMap.set(principleName, []);
    principleMap.get(principleName)!.push(pi);
  }

  const handlePrint = () => {
    const printArea = document.getElementById("on-site-checklist-sheet");
    if (!printArea) {
      window.print();
      return;
    }

    // Hapus iframe print lama jika ada
    const existingIframe = document.getElementById("becdex-print-frame");
    if (existingIframe) {
      existingIframe.remove();
    }

    // Buat iframe khusus cetak agar HANYA dokumen checklist yang dicetak (terisolasi dari halaman admin)
    const iframe = document.createElement("iframe");
    iframe.id = "becdex-print-frame";
    iframe.style.position = "fixed";
    iframe.style.right = "0";
    iframe.style.bottom = "0";
    iframe.style.width = "0";
    iframe.style.height = "0";
    iframe.style.border = "none";
    iframe.style.opacity = "0";
    iframe.style.pointerEvents = "none";
    document.body.appendChild(iframe);

    const doc = iframe.contentWindow?.document;
    if (!doc) {
      window.print();
      return;
    }

    // Salin seluruh stylesheet dari aplikasi utama (Tailwind, Google Fonts, dll.)
    const styleTags = Array.from(document.querySelectorAll("link[rel='stylesheet'], style"))
      .map((el) => el.outerHTML)
      .join("\n");

    const printHtml = `
      <!DOCTYPE html>
      <html lang="${lang}">
        <head>
          <meta charset="utf-8" />
          <meta name="viewport" content="width=device-width, initial-scale=1.0" />
          <title>Checklist_Audit_Lapangan_BECDEX_${checklistId}</title>
          ${styleTags}
          <style>
            @page {
              size: A4 portrait;
              margin: 8mm 6mm;
            }
            * {
              -webkit-print-color-adjust: exact !important;
              print-color-adjust: exact !important;
              box-sizing: border-box;
            }
            html, body {
              background: #ffffff !important;
              color: #000000 !important;
              margin: 0 !important;
              padding: 0 !important;
              font-family: ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Arial, sans-serif;
            }
            #on-site-checklist-sheet {
              display: block !important;
              width: 100% !important;
              max-width: none !important;
              min-height: 0 !important;
              margin: 0 !important;
              padding: 0 !important;
              box-shadow: none !important;
              border: none !important;
            }
            table {
              table-layout: fixed !important;
              width: 100% !important;
              border-collapse: collapse !important;
            }
            tr {
              page-break-inside: avoid !important;
              break-inside: avoid !important;
            }
            .aspect-banner, .principle-banner {
              page-break-after: avoid !important;
              break-after: avoid !important;
            }
            .break-inside-avoid {
              page-break-inside: avoid !important;
              break-inside: avoid !important;
            }
          </style>
        </head>
        <body>
          ${printArea.outerHTML}
        </body>
      </html>
    `;

    doc.open();
    doc.write(printHtml);
    doc.close();

    // Berikan jeda sejenak agar iframe selesai render lalu panggil dialog cetak
    setTimeout(() => {
      try {
        iframe.contentWindow?.focus();
        iframe.contentWindow?.print();
      } catch (err) {
        console.error("Gagal print via iframe, menggunakan fallback:", err);
        window.print();
      } finally {
        setTimeout(() => {
          iframe.remove();
        }, 3000);
      }
    }, 400);
  };

  const surveyDateFormatted = submission.survey?.scheduled_at
    ? new Date(submission.survey.scheduled_at).toLocaleDateString(lang === "id" ? "id-ID" : "en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    })
    : null;

  const modalContent = (
    <div id="print-checklist-portal-root" className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-2 sm:p-4 overflow-y-auto print:p-0 print:bg-white print:static print:overflow-visible">

      {/* Modal Container */}
      <div className="bg-white dark:bg-slate-900 w-full max-w-6xl max-h-[92vh] rounded-2xl shadow-2xl flex flex-col overflow-hidden border border-slate-200 dark:border-slate-800 print:border-none print:shadow-none print:max-w-none print:max-h-none print:w-full print:rounded-none">

        {/* Top Control Bar (Hidden on Print) */}
        <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/60 flex flex-wrap items-center justify-between gap-3 print:hidden shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-100 dark:bg-blue-900/50 text-blue-600 dark:text-blue-300 flex items-center justify-center font-bold">
              <Printer size={20} />
            </div>
            <div>
              <h3 className="font-extrabold text-slate-800 dark:text-white text-base">
                Lembar Checklist Verifikasi Lapangan Asesor
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Format cetak dokumen resmi untuk audit langsung di lokasi fasilitas perusahaan
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            {/* Language toggle */}
            <div className="flex rounded-lg border border-slate-200 dark:border-slate-700 p-0.5 bg-white dark:bg-slate-900 text-xs font-bold">
              <button
                type="button"
                onClick={() => setLang("id")}
                className={`px-2.5 py-1.5 rounded-md transition-all ${lang === "id" ? "bg-blue-600 text-white shadow-xs" : "text-slate-600 dark:text-slate-400 hover:text-slate-900"}`}
              >
                🇮🇩 Indonesia
              </button>
              <button
                type="button"
                onClick={() => setLang("en")}
                className={`px-2.5 py-1.5 rounded-md transition-all ${lang === "en" ? "bg-blue-600 text-white shadow-xs" : "text-slate-600 dark:text-slate-400 hover:text-slate-900"}`}
              >
                🇬🇧 English
              </button>
            </div>

            {/* Filter Mandatory Only */}
            <button
              type="button"
              onClick={() => setFilterMandatoryOnly(!filterMandatoryOnly)}
              className={cn(
                "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold border transition-all cursor-pointer",
                filterMandatoryOnly
                  ? "bg-slate-900 text-white border-slate-900 shadow-xs"
                  : "bg-white dark:bg-slate-900 border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
              )}
              title="Tampilkan semua indikator atau saring hanya indikator wajib (mandatory)"
            >
              <Star size={13} className={filterMandatoryOnly ? "fill-white text-white" : "fill-slate-600 text-slate-600"} />
              <span>{filterMandatoryOnly ? "Tampilkan Semua" : `Hanya Wajib (${mandatoryCount})`}</span>
            </button>

            {/* Mode toggle */}
            <button
              type="button"
              onClick={() => setShowSelfScores(!showSelfScores)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-all cursor-pointer ${showSelfScores
                ? "bg-slate-100 dark:bg-slate-800 border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-200"
                : "bg-amber-50 dark:bg-amber-950/40 border-amber-300 text-amber-700 dark:text-amber-300"
                }`}
              title="Tampilkan atau kosongkan klaim nilai mandiri perusahaan"
            >
              {showSelfScores ? "Mode: Lengkap" : "Mode: Blanko Murni"}
            </button>

            {/* Print button */}
            <button
              type="button"
              onClick={handlePrint}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md shadow-blue-600/20 transition-all cursor-pointer"
            >
              <Printer size={15} />
              <span>Cetak Dokumen (Print)</span>
            </button>

            {/* Close button */}
            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Scrollable Printable Document Area */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-8 bg-slate-100 dark:bg-slate-950/50 print:p-0 print:bg-white print:overflow-visible">

          <div
            id="on-site-checklist-sheet"
            ref={printAreaRef}
            className="w-full max-w-[210mm] mx-auto bg-white text-black p-6 sm:p-8 rounded-xl shadow-lg border border-slate-200 font-sans print:shadow-none print:border-none print:p-0 print:m-0 print:max-w-none print:w-full print:rounded-none print:min-h-0"
          >
            {/* Header Surat Resmi */}
            <div className="border-b-2 border-black pb-4 mb-5">
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="relative w-12 h-12 shrink-0">
                    <Image
                      src="/logo.webp"
                      alt="BECdex Logo"
                      width={48}
                      height={48}
                      className="object-contain"
                      priority
                    />
                  </div>
                  <div>
                    <h1 className="text-xl font-black tracking-tight text-black leading-none uppercase">
                      BECDEX INTERNATIONAL CERTIFICATION CENTER
                    </h1>
                    <p className="text-[11px] font-bold text-black tracking-widest uppercase mt-1">
                      BLUE ECONOMY COMPANY INDEX &bull; STANDARD OPERATING AUDIT
                    </p>
                    <p className="text-[9px] text-gray-600 print:text-black">
                      Website: www.becdex.com &bull; E-mail: info@becdex.com
                    </p>
                  </div>
                </div>

                <div className="text-right border-l-2 border-black pl-4">
                  <span className="inline-block text-[10px] font-extrabold uppercase px-2 py-0.5 border border-black rounded bg-gray-50 mb-1">
                    FORMULIR AUDIT RESMI
                  </span>
                  <p className="text-[11px] font-mono font-bold text-gray-800">
                    NO: BECDEX-CKL-{checklistId}
                  </p>
                  <p className="text-[9px] text-gray-600">
                    Ref: ISO/IEC 25010 & BECdex-Std
                  </p>
                </div>
              </div>

              {/* Title Section */}
              <div className="mt-4 pt-3 border-t border-gray-300 text-center">
                <h2 className="text-base font-black uppercase tracking-wide text-black underline decoration-2 underline-offset-4">
                  {lang === "id"
                    ? "LEMBAR KERJA & CHECKLIST VERIFIKASI LAPANGAN (ON-SITE AUDIT)"
                    : "ON-SITE ASSESSMENT WORK SHEET & VERIFICATION CHECKLIST"}
                </h2>
                <p className="text-[10px] text-gray-700 italic mt-0.5">
                  {lang === "id"
                    ? "Dokumen pegangan tim asesor untuk verifikasi fisik, peninjauan fasilitas, dan pemeriksaan dokumen asli di lokasi perusahaan."
                    : "Official assessor field sheet for physical verification, facility inspection, and original document audit at company site."}
                </p>
              </div>
            </div>

            {/* Profile & Metadata Box */}
            <div className="border border-black rounded-sm mb-5 text-[11px] leading-tight">
              <div className="bg-gray-100 font-bold px-3 py-1.5 border-b border-black flex justify-between items-center">
                <span className="uppercase tracking-wider">
                  {lang === "id" ? "I. IDENTITAS PERUSAHAAN & PENUGASAN ASESOR" : "I. COMPANY PROFILE & AUDIT ASSIGNMENT"}
                </span>
                <span className="font-mono text-[10px]">Case ID: #{checklistId}</span>
              </div>

              <div className="grid grid-cols-2 divide-x divide-black">
                {/* Kolom Kiri: Informasi Perusahaan */}
                <div className="p-3 space-y-1.5">
                  <div className="flex">
                    <span className="w-32 text-gray-600 font-medium shrink-0">Nama Perusahaan:</span>
                    <span className="font-bold uppercase text-black">{submission.user?.name ?? "—"}</span>
                  </div>
                  <div className="flex">
                    <span className="w-32 text-gray-600 font-medium shrink-0">
                      {lang === "id" ? "Bidang / Sektor:" : "Sector / Field:"}
                    </span>
                    <span className="font-semibold text-black">
                      {lang === "id"
                        ? (company?.company_field_name_id || company?.company_field || "—")
                        : (company?.company_field || company?.company_field_name_id || "—")}
                    </span>
                  </div>
                  <div className="flex">
                    <span className="w-32 text-gray-600 font-medium shrink-0">Alamat Lokasi:</span>
                    <span className="text-black">{company?.address ?? "—"}</span>
                  </div>
                  <div className="flex">
                    <span className="w-32 text-gray-600 font-medium shrink-0">PIC & Kontak:</span>
                    <span className="text-black">
                      {company?.pic_name ? `${company.pic_name} (${company.pic_position || "PIC"}) - Telp: ${company.pic_phone || "—"}` : "—"}
                    </span>
                  </div>
                </div>

                {/* Kolom Kanan: Jadwal & Tim Asesor */}
                <div className="p-3 space-y-1.5">
                  <div className="flex">
                    <span className="w-32 text-gray-600 font-medium shrink-0">Tanggal Kunjungan:</span>
                    <span className="font-bold text-black">
                      {surveyDateFormatted || "Tanggal: _____ / _____ / 202___"}
                    </span>
                  </div>
                  <div className="flex items-start">
                    <span className="w-32 text-gray-600 font-medium shrink-0 pt-0.5">Tim Asesor Penilai:</span>
                    <div className="font-semibold text-black space-y-0.5 text-[10px] leading-tight">
                      <div>1. {assessors[0]?.name || "Dr. Ir. Diah Pranitasari, M.M., C.Bec. (BizDev)"}</div>
                      <div>2. {assessors[1]?.name || "Dr. Gatot Prabantoro, C.Bec., (BizDev)"}</div>
                    </div>
                  </div>
                  <div className="flex">
                    <span className="w-32 text-gray-600 font-medium shrink-0">Status Pengajuan:</span>
                    <span className="font-bold text-black uppercase">{submission.status?.name ?? "—"}</span>
                  </div>
                  <div className="flex">
                    <span className="w-32 text-gray-600 font-medium shrink-0">Total Indikator:</span>
                    <span className="font-semibold text-black">
                      {totalCount} {lang === "id" ? "Indikator" : "Indicators"} ({mandatoryCount} {lang === "id" ? "Wajib" : "Mandatory"}, {optionalCount} {lang === "id" ? "Pilihan" : "Optional"})
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Petunjuk Pengisian */}
            <div className="bg-white border border-black p-2.5 mb-5 text-[10px] text-black leading-relaxed">
              <span className="font-bold text-black uppercase block mb-0.5">
                {lang === "id" ? "PETUNJUK BAGI ASESOR LAPANGAN:" : "INSTRUCTIONS FOR FIELD ASSESSORS:"}
              </span>
              <p>
                {lang === "id"
                  ? "Lakukan pemeriksaan fisik dokumen asli dan kondisi operasional di lokasi perusahaan. Berikan tanda centang (✓) pada kolom hasil verifikasi: [V] Sesuai/Memenuhi, [R] Perlu Revisi, atau [X] Tidak Sesuai/Invalid. Cantumkan rincian temuan fakta lapangan dan rekomendasi tindak lanjut pada kolom Catatan."
                  : "Perform physical verification of original evidence documents and operational conditions on site. Mark (✓) on verification outcome: [V] Valid/Compliant, [R] Revision Needed, or [X] Invalid/Non-Compliant. Record on-site findings and follow-up notes in the space provided."}
              </p>

              {/* Legend Indikator Wajib */}
              <div className="mt-1.5 pt-1.5 border-t border-black flex flex-wrap items-center gap-1.5 text-[9.5px]">
                <span className="font-black text-xs text-black leading-none">*</span>
                <span className="font-semibold text-black">
                  = {lang === "id"
                    ? "Indikator Wajib. Indikator dengan tanda bintang (*) WAJIB dipenuhi dan bernilai valid sebagai syarat kelulusan penilaian BECdex."
                    : "Mandatory Indicator. Indicators marked with an asterisk (*) are strictly REQUIRED to be fulfilled and verified valid for BECdex certification."}
                </span>
              </div>
            </div>

            {/* Tabel Checklist Indikator */}
            <div className="mb-6">
              <div className="text-center font-bold text-xs uppercase tracking-wider mb-2 text-black">
                {lang === "id" ? "II. DAFTAR CHECKLIST INDIKATOR & BUKTI VERIFIKASI" : "II. INDICATOR CHECKLIST & EVIDENCE VERIFICATION"}
              </div>

              {Array.from(grouped.entries()).map(([aspectName, principleMap]) => (
                <div key={aspectName} className="mb-4">

                  {/* Aspect Title Banner */}
                  <div className="aspect-banner bg-gray-800 text-white font-extrabold text-[11px] px-3 py-1 uppercase tracking-wider border border-black flex items-center justify-between print:bg-gray-200 print:text-black">
                    <span>{aspectName}</span>
                  </div>

                  {Array.from(principleMap.entries()).map(([principleName, indicators]) => (
                    <div key={principleName} className="-mt-px">

                      {/* Principle Sub-header */}
                      <div className="principle-banner bg-gray-100 font-bold text-[10px] px-3 py-1 border-x border-b border-black text-black">
                        {principleName}
                      </div>

                      {/* Main Table for this principle */}
                      <table className="w-full text-left border-collapse border border-black text-[10px] table-fixed -mt-px mb-3">
                        <colgroup>
                          {showSelfScores ? (
                            <>
                              <col className="w-[5%]" />
                              <col className="w-[32%]" />
                              <col className="w-[27%]" />
                              <col className="w-[8%]" />
                              <col className="w-[13%]" />
                              <col className="w-[15%]" />
                            </>
                          ) : (
                            <>
                              <col className="w-[5%]" />
                              <col className="w-[36%]" />
                              <col className="w-[30%]" />
                              <col className="w-[14%]" />
                              <col className="w-[15%]" />
                            </>
                          )}
                        </colgroup>
                        <thead>
                          <tr className="bg-gray-200 text-black font-extrabold text-center uppercase tracking-tight">
                            <th className="border border-black px-1 py-1.5 text-center">No</th>
                            <th className="border border-black px-2 py-1.5 text-left">Indikator & Deskripsi</th>
                            <th className="border border-black px-2 py-1.5 text-left">Bukti Wajib & Regulasi</th>
                            {showSelfScores && (
                              <th className="border border-black px-1 py-1.5 text-center">Klaim Mandiri</th>
                            )}
                            <th className="border border-black px-1 py-1.5 text-center">Checklist Lapangan</th>
                            <th className="border border-black px-2 py-1.5 text-left">Catatan Temuan</th>
                          </tr>
                        </thead>
                        <tbody>
                          {indicators.map((pi) => {
                            const indNumber = indicatorNumberMap.get(pi.indicator_id) || counter;
                            const isMandatory = !!(
                              pi.indicator?.is_mandatory ||
                              pi.indicator?.questions?.some((q) => q.is_mandatory)
                            );
                            const indicatorName = (lang === "id" ? (pi.indicator?.name_id || pi.indicator?.name) : pi.indicator?.name) ?? "";
                            const evidenceText = (lang === "id" ? (pi.indicator?.evidence || pi.indicator?.evidence_en) : (pi.indicator?.evidence_en || pi.indicator?.evidence)) ?? "—";
                            const regulationText = (lang === "id" ? (pi.indicator?.regulation || pi.indicator?.regulation_en) : (pi.indicator?.regulation_en || pi.indicator?.regulation)) ?? "";

                            // Ambil klaim mandiri dari answers
                            const questions = pi.indicator?.questions ?? [];
                            const questionAnswers = questions.map((q) => {
                              const ans = submission.answers?.find((a) => a.question_id === q.id);
                              return {
                                question: q,
                                answer: ans,
                              };
                            });

                            const docs = (submission.documents ?? []).filter(
                              (d) => (d as unknown as { indicator_id: number }).indicator_id === pi.indicator_id
                            );

                            return (
                              <tr key={pi.id} className="border-b border-black align-top break-inside-avoid">
                                {/* Nomor Indikator */}
                                <td className="border border-black px-1 py-2 text-center font-bold font-mono break-words">
                                  <div className="font-bold text-xs">
                                    {indNumber}{isMandatory ? "*" : ""}
                                  </div>
                                </td>

                                {/* Nama Indikator & Pertanyaan */}
                                <td className="border border-black px-2 py-2 break-words overflow-hidden">
                                  <div className="flex items-start gap-1 mb-1.5">
                                    <div className="flex-1 min-w-0">
                                      <span className="font-bold text-[10.5px] block leading-tight text-black break-words">
                                        {indicatorName}{isMandatory ? "*" : ""}
                                      </span>
                                    </div>
                                  </div>

                                  {/* List pertanyaan kuesioner */}
                                  {questions.length > 0 && (
                                    <div className="mt-1 space-y-1 text-[9.5px] text-gray-800">
                                      {questions.map((q, qIdx) => {
                                        const isQuestionMandatory = !!(q.is_mandatory || pi.indicator?.is_mandatory);
                                        return (
                                          <div key={q.id} className="pl-2 border-l-2 border-gray-300 break-words">
                                            <p className="leading-snug break-words">
                                              {questions.length > 1 ? `${String.fromCharCode(97 + qIdx)}. ` : ""}{q.text}
                                              {isQuestionMandatory && (
                                                <span className="ml-0.5 font-bold text-black">*</span>
                                              )}
                                            </p>
                                          </div>
                                        );
                                      })}
                                    </div>
                                  )}
                                </td>

                                {/* Bukti Dokumen & Regulasi */}
                                <td className="border border-black px-2 py-2 text-[9px] leading-tight break-words overflow-hidden">
                                  <div className="space-y-1">
                                    <div>
                                      <span className="font-bold block text-[8.5px] text-black">
                                        {isMandatory ? (lang === "id" ? "Bukti Wajib Lapangan:" : "Required Evidence:") : (lang === "id" ? "Bukti Verifikasi:" : "Verification Evidence:")}
                                      </span>
                                      <p className="text-black italic break-words">{evidenceText}</p>
                                    </div>
                                    {regulationText && (
                                      <div>
                                        <span className="font-bold text-gray-700 block">Dasar Regulasi:</span>
                                        <p className="text-gray-900 break-words">{regulationText}</p>
                                      </div>
                                    )}
                                    {docs.length > 0 && (
                                      <div className="pt-0.5 border-t border-gray-300">
                                        <span className="font-bold text-black block text-[8.5px]">
                                          Dokumen Diunggah ({docs.length}):
                                        </span>
                                        <p className="text-gray-800 font-mono text-[8px] break-all">
                                          {docs.map((d) => d.original_name).join(", ")}
                                        </p>
                                      </div>
                                    )}
                                  </div>
                                </td>

                                {/* Klaim Mandiri */}
                                {showSelfScores && (
                                  <td className="border border-black px-1 py-2 text-center text-[9px] break-words">
                                    {questionAnswers.map((qa, idx) => {
                                      const val = qa.answer?.value;
                                      return (
                                        <div key={idx} className="font-bold text-black">
                                          {val !== null && val !== undefined ? (
                                            Number(val) > 0 ? (
                                              <span>Ya ({val})</span>
                                            ) : (
                                              <span>Tidak (0)</span>
                                            )
                                          ) : (
                                            <span className="text-gray-400">—</span>
                                          )}
                                        </div>
                                      );
                                    })}
                                    {questionAnswers.length === 0 && (
                                      <span className="text-gray-400">—</span>
                                    )}
                                  </td>
                                )}

                                {/* Checklist Manual Lapangan */}
                                <td className="border border-black px-1.5 py-2 text-[9px]">
                                  <div className="space-y-1.5 font-mono">
                                    <div className="flex items-center gap-1.5">
                                      <span className="w-3.5 h-3.5 border border-black inline-block shrink-0" />
                                      <span className="font-bold">SESUAI</span>
                                    </div>
                                    <div className="flex items-center gap-1.5">
                                      <span className="w-3.5 h-3.5 border border-black inline-block shrink-0" />
                                      <span className="font-bold text-gray-800">REVISI</span>
                                    </div>
                                    <div className="flex items-center gap-1.5">
                                      <span className="w-3.5 h-3.5 border border-black inline-block shrink-0" />
                                      <span className="font-bold text-gray-800">TIDAK</span>
                                    </div>
                                  </div>
                                </td>

                                {/* Catatan Temuan Lapangan */}
                                <td className="border border-black px-2 py-2">
                                  <div className="h-14 w-full flex flex-col justify-between">
                                    <div className="border-b border-dotted border-gray-400 h-4" />
                                    <div className="border-b border-dotted border-gray-400 h-4" />
                                    <div className="border-b border-dotted border-gray-400 h-4" />
                                  </div>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  ))}
                </div>
              ))}

              {/* Keterangan Indikator Wajib di bawah tabel */}
              <div className="mt-2 text-[10.5px] text-black font-semibold italic">
                <span>* {lang === "id" ? "Indikator Wajib" : "Mandatory Indicator"}</span>
              </div>
            </div>

            {/* Catatan Ringkasan Umum Lapangan */}
            <div className="border border-black rounded-sm mb-6 p-3 text-[10px] break-inside-avoid">
              <span className="font-bold text-black uppercase block mb-1">
                {lang === "id" ? "III. KESIMPULAN & REKOMENDASI UMUM ASESOR LAPANGAN:" : "III. OVERALL SUMMARY & ASSESSOR RECOMMENDATIONS:"}
              </span>
              <div className="space-y-3 pt-1">
                <div className="border-b border-gray-400 h-5" />
                <div className="border-b border-gray-400 h-5" />
                <div className="border-b border-gray-400 h-5" />
                <div className="border-b border-gray-400 h-5" />
              </div>
            </div>

            {/* Berita Acara & Lembar Tanda Tangan */}
            <div className="border border-black rounded-sm p-4 text-[10.5px] break-inside-avoid">
              <div className="text-center font-bold uppercase tracking-wider mb-2 border-b border-black pb-1">
                {lang === "id" ? "IV. BERITA ACARA & PENGESAHAN HASIL VERIFIKASI" : "IV. AUDIT ACKNOWLEDGMENT & SIGN-OFF"}
              </div>
              <p className="text-justify text-[10px] text-gray-800 leading-normal mb-6">
                {lang === "id"
                  ? "Demikian lembar kerja dan checklist verifikasi lapangan ini diisi dengan sebenarnya berdasarkan hasil pengamatan langsung, pemeriksaan fisik dokumen asli, serta wawancara dengan manajemen perusahaan di lokasi fasilitas operasional. Hasil temuan ini menjadi rujukan resmi dalam penerbitan sertifikat BECdex."
                  : "This on-site verification worksheet has been completed truthfully based on direct physical inspection, original evidence document audit, and management interviews at the operational facility. The findings herein serve as official reference for BECdex certification."}
              </p>

              <div className="text-right text-[10px] font-semibold mb-3">
                Lokasi & Tanggal: _____________________________________, _____ / _____ / 202___
              </div>

              {/* 3 Kolom Tanda Tangan: 2 Asesor BECDEX + 1 Perwakilan Perusahaan */}
              <div className="grid grid-cols-3 gap-4 text-center pt-2">

                {/* Asesor 1 */}
                <div className="space-y-1">
                  <p className="font-bold text-black uppercase text-[10px]">TIM ASESOR PENILAI I</p>
                  <p className="text-[8.5px] text-gray-600">Lead Assessor / Asesor Lapangan</p>

                  <div className="h-20 flex items-end justify-center pb-1">
                    <div className="w-40 border-b-2 border-black" />
                  </div>

                  <p className="font-bold text-black text-[9.5px] leading-tight">
                    ( {assessors[0]?.name || "Dr. Ir. Diah Pranitasari, M.M., C.Bec. (BizDev)"} )
                  </p>
                  <p className="text-[8.5px] text-gray-500">Tanda Tangan & Nama Terang</p>
                </div>

                {/* Asesor 2 */}
                <div className="space-y-1">
                  <p className="font-bold text-black uppercase text-[10px]">TIM ASESOR PENILAI II</p>
                  <p className="text-[8.5px] text-gray-600">Assessor / Asesor Lapangan</p>

                  <div className="h-20 flex items-end justify-center pb-1">
                    <div className="w-40 border-b-2 border-black" />
                  </div>

                  <p className="font-bold text-black text-[9.5px] leading-tight">
                    ( {assessors[1]?.name || "Dr. Gatot Prabantoro, C.Bec., (BizDev)"} )
                  </p>
                  <p className="text-[8.5px] text-gray-500">Tanda Tangan & Nama Terang</p>
                </div>

                {/* Perwakilan Perusahaan */}
                <div className="space-y-1">
                  <p className="font-bold text-black uppercase text-[10px]">PERWAKILAN PERUSAHAAN</p>
                  <p className="text-[8.5px] text-gray-600">Pimpinan / PIC / Manajemen Fasilitas</p>

                  <div className="h-20 flex items-end justify-center pb-1">
                    <div className="w-40 border-b-2 border-black" />
                  </div>

                  <p className="font-bold text-black text-[9.5px] leading-tight">
                    ( {company?.pic_name || "___________________________________"} )
                  </p>
                  <p className="text-[8.5px] text-gray-500">Nama, Jabatan, & Cap Perusahaan</p>
                </div>

              </div>
            </div>

            {/* Footer Halaman Resmi */}
            <div className="mt-6 pt-2 border-t border-gray-400 flex justify-between items-center text-[8.5px] text-gray-500 print:text-black">
              <span>BECDEX Official Form &bull; Document ID: #{checklistId}</span>
              <span>Halaman Verifikasi Asesor Lapangan</span>
              <span>Hak Cipta Terpelihara &copy; 2026 BECDEX Indonesia</span>
            </div>

          </div>

        </div>

      </div>

    </div>
  );

  return createPortal(modalContent, document.body);
}
